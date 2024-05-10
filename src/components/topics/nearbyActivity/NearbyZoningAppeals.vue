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
const { timeReverseFn } = useTransforms();
import useScrolling from '@/composables/useScrolling';
const { handleRowMouseover, handleRowMouseleave } = useScrolling();

const loadingData = computed(() => NearbyActivityStore.loadingData );

const sortby = ref('distance');
const setSortby = (e) => sortby.value = e;
const timeIntervals = reactive(
  {
    labels: ['any time', 'the last 90 days', 'the next 90 days'],
    values: [0, -90, 90],
    selected: 0,
  }
)
const setTimeInterval = (e) => timeIntervals.selected = e;

const nearbyZoningAppeals = computed(() => {
  if (NearbyActivityStore.nearbyZoningAppeals) {
    let data = [ ...NearbyActivityStore.nearbyZoningAppeals.data.rows]
    // console.log(new Date(data[0].scheduleddate));
    if (timeIntervals.selected < 0) {
      data = data.filter(item => {
        let timeDiff = new Date() - new Date(item.scheduleddate);
        let daysDiff = timeDiff / (1000 * 60 * 60 * 24);
        return daysDiff >= timeIntervals.selected;
      })
    } else if (timeIntervals.selected > 0) {
      data = data.filter(item => {
        let timeDiff = new Date() - new Date(item.scheduleddate);
        let daysDiff = timeDiff / (1000 * 60 * 60 * 24);
        return daysDiff <= timeIntervals.selected;
      })
    }
    if (sortby.value === 'distance') {
      data.sort((a, b) => a.distance - b.distance)
    } else if (sortby.value === 'time') {
      data.sort((a, b) => timeReverseFn(a, b, 'dispatch_date'))
    }
    return data;
  }
});
const nearbyZoningAppealsGeojson = computed(() => {
  if (!nearbyZoningAppeals.value) return [point([0,0])];
  return nearbyZoningAppeals.value.map(item => point([item.lng, item.lat], { id: item.objectid, type: 'nearbyZoningAppeals' }));
})
watch (() => nearbyZoningAppealsGeojson.value, (newGeojson) => { map.getSource('nearby').setData(featureCollection(newGeojson)) });

const hoveredStateId = computed(() => { return MainStore.hoveredStateId; });

onMounted(() => { if (nearbyZoningAppealsGeojson.value.length > 0) { map.getSource('nearby').setData(featureCollection(nearbyZoningAppealsGeojson.value)) }});
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
    <h5 class="subtitle is-5">Zoning Appeals</h5>
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
          v-for="item in nearbyZoningAppeals"
          :key=item.objectid
          :id="item.objectid"
          @mouseover="handleRowMouseover"
          @mouseleave="handleRowMouseleave"
          :class="hoveredStateId == item.objectid ? 'active-hover' : 'inactive'"
        >
          <td>{{ item.scheduleddate }}</td>
          <td>{{ item.address }}</td>
          <td>{{ item.appealgrounds }}</td>
          <td>{{ (item.distance * 3.28084).toFixed(0) }} ft</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>