<script setup>
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { point, featureCollection } from '@turf/helpers';

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
const { date, timeReverseFn } = useTransforms();
import useScrolling from '@/composables/useScrolling';
const { handleRowMouseover, handleRowMouseleave } = useScrolling();

const loadingData = computed(() => NearbyActivityStore.loadingData );

const sortby = ref('distance');
const setSortby = (e) => sortby.value = e;

const timeIntervalSelected = ref(30);

const timeIntervals = reactive(
  {
    30: 'the last 30 days',
    90: 'the last 90 days',
    365: '1 year',
  }
)

const setTimeInterval = (e) => timeIntervalSelected.value = e;

const nearbyDemolitionPermits = computed(() => {
  if (NearbyActivityStore.nearbyDemolitionPermits) {
    let data = [ ...NearbyActivityStore.nearbyDemolitionPermits.data.rows]
      .filter(item => {
      let itemDate = new Date(item.permitissuedate);
      let now = new Date();
      let timeDiff = now - itemDate;
      let daysDiff = timeDiff / (1000 * 60 * 60 * 24);
      return daysDiff <= timeIntervalSelected.value;
    })
    if (sortby.value === 'distance') {
      data.sort((a, b) => a.distance - b.distance)
    } else if (sortby.value === 'time') {
      data.sort((a, b) => timeReverseFn(a, b, 'permitissuedate'))
    }
    return data;
  }
});
const nearbyDemolitionPermitsGeojson = computed(() => {
  if (!nearbyDemolitionPermits.value) return [point([0,0])];
  return nearbyDemolitionPermits.value.map(item => point([item.lng, item.lat], { id: item.objectid, type: 'nearbyDemolitionPermits' }));
})
watch (() => nearbyDemolitionPermitsGeojson.value, (newGeojson) => { map.getSource('nearby').setData(featureCollection(newGeojson)) });

const hoveredStateId = computed(() => { return MainStore.hoveredStateId; });

onMounted(() => { if (!NearbyActivityStore.loadingData && nearbyDemolitionPermitsGeojson.value.length > 0) { map.getSource('nearby').setData(featureCollection(nearbyDemolitionPermitsGeojson.value)) }});
onBeforeUnmount(() => { if (map.getSource('nearby')) { map.getSource('nearby').setData(featureCollection([point([0,0])])) }});


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
    <h5 class="subtitle is-5">Demolition Permits</h5>
    <div v-if="loadingData">Loading...</div>
    <div class="horizontal-table">
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
            v-for="item in nearbyDemolitionPermits"
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
    <div class='mobile-no-data' v-if="!nearbyDemolitionPermits.length">No nearby demolition permits found for this time interval</div>
  </div>
</template>

<style scoped>

@media 
only screen and (max-width: 760px),
(min-device-width: 768px) and (max-device-width: 1024px)  {
	/*Label the data*/

	td:nth-of-type(1):before { content: "Date"; }
	td:nth-of-type(2):before { content: "Location"; }
	td:nth-of-type(3):before { content: "Type"; }
	td:nth-of-type(4):before { content: "Distance"; }
}

</style>