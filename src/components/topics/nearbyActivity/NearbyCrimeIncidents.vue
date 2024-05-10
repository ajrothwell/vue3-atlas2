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
const timeIntervals = reactive(
  {
    labels: ['the last 30 days', 'the last 90 days'],
    values: [30, 90],
    selected: 30,
  }
)
const setTimeInterval = (e) => timeIntervals.selected = e;

const nearbyCrimeIncidents = computed(() => {
  if (NearbyActivityStore.nearbyCrimeIncidents) {
    let data = [ ...NearbyActivityStore.nearbyCrimeIncidents.data.rows]
      .filter(item => {
      let timeDiff = new Date() - new Date(item.dispatch_date);
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
  if (!nearbyCrimeIncidents.value) return [point([0,0])];
  return nearbyCrimeIncidents.value.map(item => point([item.lng, item.lat], { id: item.objectid, type: 'nearbyCrimeIncidents' }));
})
watch (() => nearbyCrimeIncidentsGeojson.value, (newGeojson) => { map.getSource('nearby').setData(featureCollection(newGeojson)) });

const hoveredStateId = computed(() => { return MainStore.hoveredStateId; });

onMounted(() => { if (nearbyCrimeIncidentsGeojson.value.length > 0) { map.getSource('nearby').setData(featureCollection(nearbyCrimeIncidentsGeojson.value)) }});
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
          <td>{{ date(item.dispatch_date) }}</td>
          <td>{{ item.location_block }}</td>
          <td>{{ item.text_general_code }}</td>
          <td>{{ (item.distance * 3.28084).toFixed(0) }} ft</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>