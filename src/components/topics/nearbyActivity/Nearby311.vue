<script setup>
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount } from 'vue';

import { useNearbyActivityStore } from '@/stores/NearbyActivityStore';
const NearbyActivityStore = useNearbyActivityStore();
import { useMainStore } from '@/stores/MainStore';
const MainStore = useMainStore();
import { useMapStore } from '@/stores/MapStore';
const MapStore = useMapStore();
const map = MapStore.map;

import SortbyDropdown from '@/components/topics/nearbyActivity/SortbyDropdown.vue';
import IntervalDropdown from '@/components/topics/nearbyActivity/IntervalDropdown.vue';
import useTransforms from '@/composables/useTransforms';
const { date, timeReverseFn, timeFn } = useTransforms();
import useScrolling from '@/composables/useScrolling';
const { isElementInViewport, handleRowMouseover, handleRowMouseleave } = useScrolling();

const loadingData = computed(() => NearbyActivityStore.loadingData );

const sortby = ref('distance');
const setSortby = (e) => {
  console.log('setSortby', e);
  sortby.value = e;
}
const timeIntervals = reactive(
  {
    labels: ['the last 30 days', 'the last 90 days', '1 year'],
    values: [30, 90, 365],
    selected: 30,
  }
)
const setTimeInterval = (e) => {
  console.log('setTimeInterval', e);
  timeIntervals.selected = e;
}

const nearby311 = computed(() => {
  if (NearbyActivityStore.nearby311.data) {
    let data = [ ...NearbyActivityStore.nearby311.data.rows]
      .filter(item => {
      let itemDate = new Date(item.requested_datetime);
      let now = new Date();
      let timeDiff = now - itemDate;
      let daysDiff = timeDiff / (1000 * 60 * 60 * 24);
      return daysDiff <= timeIntervals.selected;
    })
    if (sortby.value === 'distance') {
      data.sort((a, b) => a.distance - b.distance)
    } else if (sortby.value === 'time') {
      data.sort((a, b) => timeReverseFn(a, b, 'requested_datetime'))
    }
    return data;
  }
});
const nearby311Geojson = computed(() => {
  let features = [];
  if (!nearby311.value) return features;
  for (let item of nearby311.value) {
    features.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [item.lng, item.lat] },
      properties: { id: item.service_request_id, type: 'nearby311' }
    })
  }
  return features;
})
watch (() => nearby311Geojson.value, async (newGeojson) => {
  if (newGeojson.length > 0) {
    // console.log('watch nearby311Geojson, $config:', $config, 'map.getStyle().sources:', map.getStyle().sources, 'map.getStyle().layers:', map.getStyle().layers);
    let geojson = { 'type': 'FeatureCollection', 'features': newGeojson };
    map.getSource('nearby').setData(geojson);
  } else {
    let geojson = { 'type': 'FeatureCollection', 'features': [ {'type': 'Feature', geometry: { 'type': 'Point', 'coordinates': [0,0]}}] };
    await map.getSource('nearby').setData(geojson);
  }
})

const hoveredStateId = computed(() => { return MainStore.hoveredStateId; });

watch(() => hoveredStateId.value, (newHoveredStateId) => {
  // console.log('hoveredStateId watch, newHoveredStateId:', newHoveredStateId);
  if (newHoveredStateId) {
    const el = document.getElementById(newHoveredStateId);
    const visible = isElementInViewport(el);
    if (!visible && !MainStore.isMobileDevice) {
      console.log('scrolling into view');
      el.scrollIntoView({ block: 'center' });
    }
  }
});

onMounted(() => {
  console.log('Nearby311.vue onMounted, nearby311Geojson.value:', nearby311Geojson.value);
  if (nearby311Geojson.value.length > 0) {
    let geojson = { 'type': 'FeatureCollection', 'features': nearby311Geojson.value }
    map.getSource('nearby').setData(geojson);
  }
});

onBeforeUnmount(() => {
  console.log('Nearby311.vue onBeforeUnmount');
  if (map.getSource('nearby')) {
    map.getSource('nearby').setData({ 'type': 'FeatureCollection', 'features': [ {'type': 'Feature', geometry: { 'type': 'Point', 'coordinates': [0,0]}}] });
  }
})

</script>

<template>
  
  <IntervalDropdown
    :timeIntervals="timeIntervals"
    @setTimeInterval="setTimeInterval"
  ></IntervalDropdown>
  <SortbyDropdown
    @setSortby="setSortby"
  ></SortbyDropdown>
  <div class="mt-5">
    <h5 class="subtitle is-5">311 Requests</h5>
    <div v-if="loadingData">Loading...</div>
    <table class="table is-fullwidth is-striped">
      <thead>
        <tr>
          <th>Date</th>
          <th>Location</th>
          <th>Type</th>
          <th>Distance</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="item in nearby311"
          :key="item.service_request_id"
          :id="item.service_request_id"
          @mouseover="handleRowMouseover"
          @mouseleave="handleRowMouseleave"
          :class="hoveredStateId == item.service_request_id ? 'active-hover' : 'inactive'"
        >
          <td>{{ date(item.requested_datetime) }}</td>
          <td>{{ item.address }}</td>
          <td>{{ item.service_name }}</td>
          <td>{{ (item.distance * 3.28084).toFixed(0) }} ft</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>