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

import IntervalDropdown from '@/components/topics/nearbyActivity/IntervalDropdown.vue';
import useTransforms from '@/composables/useTransforms';
const { timeReverseFn } = useTransforms();
import useScrolling from '@/composables/useScrolling';
const { handleRowMouseover, handleRowMouseleave } = useScrolling();

const loadingData = computed(() => NearbyActivityStore.loadingData );

const timeIntervalSelected = ref(30);

const timeIntervals = reactive(
  {
    30: 'the last 30 days',
    90: 'the last 90 days',
    365: '1 year',
  }
)

const setTimeInterval = (e) => timeIntervalSelected.value = e;

const nearby311 = computed(() => {
  if (NearbyActivityStore.nearby311.rows) {
    let data = [ ...NearbyActivityStore.nearby311.rows]
      .filter(item => {
      let timeDiff = new Date() - new Date(item.requested_datetime);
      let daysDiff = timeDiff / (1000 * 60 * 60 * 24);
      return daysDiff <= timeIntervalSelected.value;
    })
    data.sort((a, b) => timeReverseFn(a, b, 'requested_datetime'))
    return data;
  }
});
const nearby311Geojson = computed(() => {
  if (!nearby311.value) return [point([0,0])];
  return nearby311.value.map(item => point([item.lng, item.lat], { id: item.service_request_id, type: 'nearby311' }));
})
watch (() => nearby311Geojson.value, (newGeojson) => { map.getSource('nearby').setData(featureCollection(newGeojson)) });

const hoveredStateId = computed(() => { return MainStore.hoveredStateId; });

onMounted(() => { if (!NearbyActivityStore.loadingData && nearby311Geojson.value.length > 0) { map.getSource('nearby').setData(featureCollection(nearby311Geojson.value)) }});
onBeforeUnmount(() => { if (map.getSource('nearby')) { map.getSource('nearby').setData(featureCollection([point([0,0])])) }});

const nearby311TableData = computed(() => {
  return {
    columns: [
      {
        label: 'Date',
        field: 'requested_datetime',
        type: 'date',
        dateInputFormat: "yyyy-MM-dd'T'HH:mm:ssX",
        dateOutputFormat: 'MM/dd/yyyy',
      },
      {
        label: 'Location',
        field: 'address',
      },
      {
        label: 'Type',
        field: 'service_name',
      },
      {
        label: 'Distance',
        field: 'distance_ft',
      }
    ],
    rows: nearby311.value || [],
  }
});

</script>

<template>
  
  <IntervalDropdown
    :timeIntervals="timeIntervals"
    @setTimeInterval="setTimeInterval"
  ></IntervalDropdown>
  <div class="mt-5">
    <h5 class="subtitle is-5">311 Requests ({{ nearby311TableData.rows.length }})</h5>
    <div v-if="loadingData">Loading...</div>
    <div class="horizontal-table">
      <vue-good-table
        id="nearby311"
        :columns="nearby311TableData.columns"
        :rows="nearby311TableData.rows"
        :row-style-class="row => hoveredStateId === row.service_request_id ? 'active-hover ' + row.service_request_id : 'inactive ' + row.service_request_id"
        style-class="table"
        @row-mouseenter="handleRowMouseover($event, 'service_request_id')"
        @row-mouseleave="handleRowMouseleave"
      >
        <template #emptystate>
          <div v-if="NearbyActivityStore.loadingData">
            Loading nearby 311... <font-awesome-icon icon='fa-solid fa-spinner fa-spin'></font-awesome-icon>
          </div>
          <div v-else>
            No nearby 311 found
          </div>
        </template>
      </vue-good-table>
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
	td:nth-of-type(3):before { content: "Type"; }
	td:nth-of-type(4):before { content: "Distance"; }
}

</style>