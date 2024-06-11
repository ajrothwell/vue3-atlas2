<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { point, featureCollection } from '@turf/helpers';

import { useNearbyActivityStore } from '@/stores/NearbyActivityStore';
const NearbyActivityStore = useNearbyActivityStore();
import { useMainStore } from '@/stores/MainStore';
const MainStore = useMainStore();
import { useMapStore } from '@/stores/MapStore';
const MapStore = useMapStore();

import TextFilter from '@/components/topics/nearbyActivity/TextFilter.vue';

import useScrolling from '@/composables/useScrolling';
const { handleRowClick, handleRowMouseover, handleRowMouseleave } = useScrolling();

const loadingData = computed(() => NearbyActivityStore.loadingData );

const textSearch = ref('');

const nearbyVacantIndicatorPoints = computed(() => {
  if (NearbyActivityStore.nearbyVacantIndicatorPoints.rows) {
    let data = [ ...NearbyActivityStore.nearbyVacantIndicatorPoints.rows].filter(item => {
      // console.log('item.properties.ADDRESS:', item.properties.ADDRESS, 'textSearch.value:', textSearch.value);
      return item.properties.ADDRESS.toLowerCase().includes(textSearch.value.toLowerCase()) || item.properties.VACANT_FLAG.toLowerCase().includes(textSearch.value.toLowerCase());
    });
    data.sort((a, b) => a.distance_ft - b.distance_ft)
    return data;
  }
});
const nearbyVacantIndicatorPointsGeojson = computed(() => {
  if (!nearbyVacantIndicatorPoints.value) return [point([0,0])];
  return nearbyVacantIndicatorPoints.value.map(item => point(item.geometry.coordinates, { id: item.id, type: 'nearbyVacantIndicatorPoints' }));
})
watch (() => nearbyVacantIndicatorPointsGeojson.value, (newGeojson) => {
  const map = MapStore.map;
  map.getSource('nearby').setData(featureCollection(newGeojson));
});

const hoveredStateId = computed(() => { return MainStore.hoveredStateId; });

onMounted(() => {
  const map = MapStore.map;
  if (!NearbyActivityStore.loadingData && nearbyVacantIndicatorPointsGeojson.value.length > 0) { map.getSource('nearby').setData(featureCollection(nearbyVacantIndicatorPointsGeojson.value)) };
});
onBeforeUnmount(() => {
  const map = MapStore.map;
  if (map.getSource('nearby')) { map.getSource('nearby').setData(featureCollection([point([0,0])])) };
});

const nearbyVacantIndicatorsTableData = computed(() => {
  return {
    columns: [
      {
        label: 'Address',
        field: 'properties.ADDRESS',
      },
      {
        label: 'Property',
        field: 'properties.VACANT_FLAG',
      },
      {
        label: 'Distance',
        field: 'properties.distance_ft',
      }
    ],
    rows: nearbyVacantIndicatorPoints.value || [],
  }
});

</script>

<template>

  <TextFilter
    v-model="textSearch"
  ></TextFilter>

  <div class='mt-5'>
      <h5 class="subtitle is-5">Likely Vacant Properties ({{ nearbyVacantIndicatorsTableData.rows.length }})</h5>
      <!-- <div v-if="loadingData">Loading...</div> -->
      <div class="horizontal-table">
        <vue-good-table
        id="nearbyVacantIndicators"
        :columns="nearbyVacantIndicatorsTableData.columns"
        :rows="nearbyVacantIndicatorsTableData.rows"
        :row-style-class="row => hoveredStateId === row.id ? 'active-hover ' + row.id : 'inactive ' + row.id"
        style-class="table"
        @row-mouseenter="handleRowMouseover($event, 'id')"
        @row-mouseleave="handleRowMouseleave"
        @row-click="handleRowClick($event, 'id', 'nearbyVacantIndicatorPoints')"
      >
        <template #emptystate>
          <div v-if="loadingData">
            Loading nearby vacant indicators... <font-awesome-icon icon='fa-solid fa-spinner' spin></font-awesome-icon>
          </div>
          <div v-else>
            No nearby vacant indicators found
          </div>
        </template>
      </vue-good-table>
      </div>
    </div>
</template>

<style>

@media 
only screen and (max-width: 760px),
(min-device-width: 768px) and (max-device-width: 1024px)  {

  #nearbyVacantIndicators {
    td:nth-of-type(2) { min-height: 60px; }

    /*Label the data*/
    td:nth-of-type(1):before { content: "Address"; }
    td:nth-of-type(2):before { content: "Property Type"; }
    td:nth-of-type(3):before { content: "Distance"; }
  }
}

</style>