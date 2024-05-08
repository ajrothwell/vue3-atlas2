<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue';

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

const nearbyConstructionPermits = computed(() => {
  if (NearbyActivityStore.nearbyConstructionPermits) {
    let data = [ ...NearbyActivityStore.nearbyConstructionPermits.data.rows]
      .filter(item => {
      let itemDate = new Date(item.permitissuedate);
      let now = new Date();
      let timeDiff = now - itemDate;
      let daysDiff = timeDiff / (1000 * 60 * 60 * 24);
      return daysDiff <= timeIntervals.selected;
    })
    if (sortby.value === 'distance') {
      data.sort((a, b) => a.distance - b.distance)
    } else if (sortby.value === 'time') {
      data.sort((a, b) => timeReverseFn(a, b, 'permitissuedate'))
    }
    return data;
  }
});
const nearbyConstructionPermitsGeojson = computed(() => {
  let features = [];
  if (!nearbyConstructionPermits.value) return features;
  for (let item of nearbyConstructionPermits.value) {
    features.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [item.lng, item.lat] },
      properties: { id: item.objectid, type: 'nearbyConstructionPermits' }
    })
  }
  return features;
})
watch (() => nearbyConstructionPermitsGeojson.value, async (newGeojson) => {
  if (newGeojson.length > 0) {
    console.log('watch nearbyConstructionPermitsGeojson, map.getStyle().sources:', map.getStyle().sources, 'map.getStyle().layers:', map.getStyle().layers);
    let geojson = { 'type': 'FeatureCollection', 'features': newGeojson };
    map.getSource('nearby').setData(geojson);
  } else {
    let geojson = { 'type': 'FeatureCollection', 'features': [ {'type': 'Feature', geometry: { 'type': 'Point', 'coordinates': [0,0]}}] };
    await map.getSource('nearby').setData(geojson);
  }
})

const hoveredStateId = computed(() => { return MainStore.hoveredStateId; });

watch(() => hoveredStateId.value, (newHoveredStateId) => {
  console.log('hoveredStateId watch, newHoveredStateId:', newHoveredStateId);
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
  console.log('NearbyConstructionPermits.vue onMounted, nearbyConstructionPermitsGeojson.value:', nearbyConstructionPermitsGeojson.value);
  if (nearbyConstructionPermitsGeojson.value.length > 0) {
    let geojson = { 'type': 'FeatureCollection', 'features': nearbyConstructionPermitsGeojson.value }
    map.getSource('nearby').setData(geojson);
  }
});

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
    <h5 class="subtitle is-5">Construction Permits</h5>
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
          v-for="item in nearbyConstructionPermits"
          :key="item.objectid"
          :id="item.objectid"
          @mouseover="handleRowMouseover"
          @mouseleave="handleRowMouseleave"
          :class="hoveredStateId == item.objectid ? 'active-hover' : 'inactive'"
        >
          <td>{{ date(item.permitissuedate) }}</td>
          <td>{{ item.address }}</td>
          <td>{{ item.typeofwork }}</td>
          <td>{{ (item.distance * 3.28084).toFixed(0) }} ft</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>