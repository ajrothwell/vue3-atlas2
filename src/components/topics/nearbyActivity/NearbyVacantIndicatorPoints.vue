<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { point, featureCollection } from '@turf/helpers';

import { useNearbyActivityStore } from '@/stores/NearbyActivityStore';
const NearbyActivityStore = useNearbyActivityStore();
import { useMainStore } from '@/stores/MainStore';
const MainStore = useMainStore();
import { useMapStore } from '@/stores/MapStore';
const MapStore = useMapStore();
const map = MapStore.map;

import SortbyDropdown from '@/components/topics/nearbyActivity/SortbyDropdown.vue';
import useScrolling from '@/composables/useScrolling';
const { handleRowMouseover, handleRowMouseleave } = useScrolling();

const loadingData = computed(() => NearbyActivityStore.loadingData );

const sortby = ref('distance');
const setSortby = (e) => sortby.value = e;

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
  if (!nearbyVacantIndicatorPoints.value) return [point([0,0])];
  return nearbyVacantIndicatorPoints.value.map(item => point(item.geometry.coordinates, { id: item.id, type: 'nearbyVacantIndicatorPoints' }));
})
watch (() => nearbyVacantIndicatorPointsGeojson.value, (newGeojson) => { map.getSource('nearby').setData(featureCollection(newGeojson)) });

const hoveredStateId = computed(() => { return MainStore.hoveredStateId; });

onMounted(() => { if (!NearbyActivityStore.loadingData && nearbyVacantIndicatorPointsGeojson.value.length > 0) { map.getSource('nearby').setData(featureCollection(nearbyVacantIndicatorPointsGeojson.value)) }});
onBeforeUnmount(() => { if (map.getSource('nearby')) { map.getSource('nearby').setData(featureCollection([point([0,0])])) }});

</script>

<template>
  
  <SortbyDropdown
    @setSortby="setSortby"
  ></SortbyDropdown>
  <div class='mt-5'>
      <h5 class="subtitle is-5">Likely Vacant Properties</h5>
      <div v-if="loadingData">Loading...</div>
      <div class="horizontal-table">
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
    </div>
</template>

<style scoped>

@media 
only screen and (max-width: 760px),
(min-device-width: 768px) and (max-device-width: 1024px)  {

  td:nth-of-type(2) { min-height: 60px; }

	/*Label the data*/
	td:nth-of-type(1):before { content: "Address"; }
	td:nth-of-type(2):before { content: "Property Type"; }
	td:nth-of-type(3):before { content: "Distance"; }
}

</style>