<script setup>
import $config from '@/config';
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
    labels: ['the last 30 days', 'the last 90 days'],
    values: [30, 90],
    selected: 30,
  }
)
const setTimeInterval = (e) => {
  console.log('setTimeInterval', e);
  timeIntervals.selected = e;
}

const nearbyCrimeIncidents = computed(() => {
  if (NearbyActivityStore.nearbyCrimeIncidents) {
    let data = [ ...NearbyActivityStore.nearbyCrimeIncidents.data.rows]
      .filter(item => {
      let itemDate = new Date(item.dispatch_date);
      let now = new Date();
      let timeDiff = now - itemDate;
      let daysDiff = timeDiff / (1000 * 60 * 60 * 24);
      return daysDiff <= timeIntervals.selected;
    })
    if (sortby.value === 'distance') {
      data.sort((a, b) => a.distance - b.distance)
    } else if (sortby.value === 'time') {
      data.sort((a, b) => timeReverseFn(a, b, 'dispatch_date'))
    }
    return data;
  }
});
const nearbyCrimeIncidentsGeojson = computed(() => {
  let features = [];
  if (!nearbyCrimeIncidents.value) return features;
  for (let item of nearbyCrimeIncidents.value) {
    features.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [item.lng, item.lat] },
      properties: { id: item.objectid, type: 'nearbyCrimeIncidents' }
    })
  }
  return features;
})
watch (() => nearbyCrimeIncidentsGeojson.value, async (newGeojson) => {
  console.log('nearbyCrimeIncidents watch, newGeojson:', newGeojson);
  if (newGeojson.length > 0) {
    let geojson = { 'type': 'FeatureCollection', 'features': newGeojson };
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
  console.log('NearbyCrimeIncidents.vue onMounted, nearbyCrimeIncidentsGeojson.value:', nearbyCrimeIncidentsGeojson.value);
  if (nearbyCrimeIncidentsGeojson.value.length > 0) {
    let geojson = { 'type': 'FeatureCollection', 'features': nearbyCrimeIncidentsGeojson.value }
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
  <div class='mt-5'>
    <h5 class="subtitle is-5">Crime Incidents</h5>
    <div v-if="loadingData">Loading...</div>
    <table class="table is-fullwidth is-striped">
      <thead>
        <tr>
          <th>Date</th>
          <th>Location</th>
          <th>Description</th>
          <th>Distance</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="item in nearbyCrimeIncidents"
          :key=item.objectid
          :id="item.objectid"
          @mouseover="handleRowMouseover"
          @mouseleave="handleRowMouseleave"
          :class="hoveredStateId == item.objectid ? 'active-hover' : 'inactive'"
        >
          <td>{{ item.dispatch_date }}</td>
          <td>{{ item.location_block }}</td>
          <td>{{ item.text_general_code }}</td>
          <td>{{ (item.distance * 3.28084).toFixed(0) }} ft</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>