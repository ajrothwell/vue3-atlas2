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
import useScrolling from '@/composables/useScrolling';
const { isElementInViewport, handleRowMouseover, handleRowMouseleave } = useScrolling();

const loadingData = computed(() => NearbyActivityStore.loadingData );

const sortby = ref('distance');
const setSortby = (e) => {
  console.log('setSortby', e);
  sortby.value = e;
}

const nearbyVacantIndicatorPoints = computed(() => {
  if (NearbyActivityStore.nearbyVacantIndicatorPoints) {
    let data = [ ...NearbyActivityStore.nearbyVacantIndicatorPoints]
    if (sortby.value === 'distance') {
      data.sort((a, b) => a._distance - b._distance)
    } else if (sortby.value === 'type') {
      data.sort((a, b) => a.distance - b.distance)
    }
    return data;
  }
});
const nearbyVacantIndicatorPointsGeojson = computed(() => {
  let features = [];
  if (!nearbyVacantIndicatorPoints.value) return features;
  for (let item of nearbyVacantIndicatorPoints.value) {
    console.log('item:', item);
    features.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: item.geometry.coordinates },
      properties: { id: item.id, type: 'nearbyVacantIndicatorPoints' }
    })
  }
  return features;
})
watch (() => nearbyVacantIndicatorPointsGeojson.value, async (newGeojson) => {
  // console.log('nearbyVacantIndicatorPoints watch, newGeojson:', newGeojson);
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
  console.log('NearbyVacantIndicatorPoints.vue onMounted, nearbyVacantIndicatorPointsGeojson.value:', nearbyVacantIndicatorPointsGeojson.value);
  if (nearbyVacantIndicatorPointsGeojson.value.length > 0) {
    let geojson = { 'type': 'FeatureCollection', 'features': nearbyVacantIndicatorPointsGeojson.value }
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
  
  <SortbyDropdown
    @setSortby="setSortby"
  ></SortbyDropdown>
  <div class='mt-5'>
      <h5 class="subtitle is-5">Likely Vacant Properties</h5>
      <div v-if="loadingData">Loading...</div>
      <table class="table is-fullwidth is-striped">
        <thead>
          <tr>
            <th>Address</th>
            <th>Property Type</th>
            <th>Distance</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in nearbyVacantIndicatorPoints"
            :key="item.id"
            :id="item.id"
            @mouseover="handleRowMouseover"
            @mouseleave="handleRowMouseleave"
            :class="hoveredStateId == item.id ? 'active-hover' : 'inactive'"
          >
            <td>{{ item.properties.ADDRESS }}</td>
            <td>{{ item.properties.VACANT_FLAG }}</td>
            <td>{{ (item._distance * 3.28084).toFixed(0) }} ft</td>
          </tr>
        </tbody>
      </table>
    </div>
</template>