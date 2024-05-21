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

const nearbyImminentlyDangerous = computed(() => {
  if (NearbyActivityStore.nearbyImminentlyDangerous) {
    let data = [ ...NearbyActivityStore.nearbyImminentlyDangerous.data.rows]
      .filter(item => {
      let itemDate = new Date(item.casecreateddate);
      let now = new Date();
      let timeDiff = now - itemDate;
      let daysDiff = timeDiff / (1000 * 60 * 60 * 24);
      return daysDiff <= timeIntervalSelected.value;
    })
    if (sortby.value === 'distance') {
      data.sort((a, b) => a.distance - b.distance)
    } else if (sortby.value === 'time') {
      data.sort((a, b) => timeReverseFn(a, b, 'casecreateddate'))
    }
    return data;
  }
});
const nearbyImminentlyDangerousGeojson = computed(() => {
  if (!nearbyImminentlyDangerous.value) return [point([0,0])];
  return nearbyImminentlyDangerous.value.map(item => point([item.lng, item.lat], { id: item.casenumber, type: 'nearbyImminentlyDangerous' }));
})
watch (() => nearbyImminentlyDangerousGeojson.value, (newGeojson) => { map.getSource('nearby').setData(featureCollection(newGeojson)) });

const hoveredStateId = computed(() => { return MainStore.hoveredStateId; });

onMounted(() => { if (!NearbyActivityStore.loadingData && nearbyImminentlyDangerousGeojson.value.length > 0) { map.getSource('nearby').setData(featureCollection(nearbyImminentlyDangerousGeojson.value)) }});
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
    <h5 class="subtitle is-5">Imminently Dangerous</h5>
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
            v-for="item in nearbyImminentlyDangerous"
            :key="item.casenumber"
            :id="item.casenumber"
            @mouseover="handleRowMouseover"
            @mouseleave="handleRowMouseleave"
            :class="hoveredStateId == item.casenumber ? 'active-hover' : 'inactive'"
          >
            <td>{{ date(item.casecreateddate) }}</td>
            <td>{{ item.address }}</td>
            <td v-html="`<a target='_blank' href='https://li.phila.gov/property-history/search/violation-detail?address=${item.address}&Id=${item.casenumber}'>${item.casestatus}</a>`"></td>
            <td>{{ (item.distance * 3.28084).toFixed(0) }} ft</td>
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
	/*Label the data*/

	td:nth-of-type(1):before { content: "Date"; }
	td:nth-of-type(2):before { content: "Location"; }
	td:nth-of-type(3):before { content: "Status"; }
	td:nth-of-type(4):before { content: "Distance"; }
}

</style>