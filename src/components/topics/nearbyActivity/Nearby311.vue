<script setup>
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { point, featureCollection } from '@turf/helpers';

import { useNearbyActivityStore } from '@/stores/NearbyActivityStore';
const NearbyActivityStore = useNearbyActivityStore();
import { useMainStore } from '@/stores/MainStore';
const MainStore = useMainStore();
import { useMapStore } from '@/stores/MapStore';
const MapStore = useMapStore();

import TextFilter from '@/components/topics/nearbyActivity/TextFilter.vue';
import IntervalDropdown from '@/components/topics/nearbyActivity/IntervalDropdown.vue';
import useTransforms from '@/composables/useTransforms';
const { timeReverseFn } = useTransforms();
import useScrolling from '@/composables/useScrolling';
const { handleRowClick, handleRowMouseover, handleRowMouseleave } = useScrolling();

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

const textSearch = ref('');

const nearby311 = computed(() => {
  if (NearbyActivityStore.nearby311.rows) {
    let data = [ ...NearbyActivityStore.nearby311.rows]
      .filter(item => {
      let timeDiff = new Date() - new Date(item.requested_datetime);
      let daysDiff = timeDiff / (1000 * 60 * 60 * 24);
      return daysDiff <= timeIntervalSelected.value;
    }).filter(item => {
      // if (import.meta.env.VITE_DEBUG == 'true') console.log('item.address:', item.address, 'textSearch.value:', textSearch.value);
      return item.address.toLowerCase().includes(textSearch.value.toLowerCase()) || item.service_name.toLowerCase().includes(textSearch.value.toLowerCase());
    });
    data.sort((a, b) => timeReverseFn(a, b, 'requested_datetime'))
    return data;
  }
});
const nearby311Geojson = computed(() => {
  if (!nearby311.value) return [point([0,0])];
  return nearby311.value.map(item => point([item.lng, item.lat], { id: item.service_request_id, type: 'nearby311' }));
})
watch (() => nearby311Geojson.value, async(newGeojson) => {
  const map = MapStore.map;
  if (map.getSource) map.getSource('nearby').setData(featureCollection(newGeojson));
});

const hoveredStateId = computed(() => { return MainStore.hoveredStateId; });

onMounted(() => {
  const map = MapStore.map;
  if (!NearbyActivityStore.loadingData && nearby311Geojson.value.length > 0) { map.getSource('nearby').setData(featureCollection(nearby311Geojson.value)) }
});
onBeforeUnmount(() => {
  const map = MapStore.map;
  if (map.getSource('nearby')) { map.getSource('nearby').setData(featureCollection([point([0,0])])) }
});

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
        field: 'link',
        html: true,
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
  <div class="columns">
    <div class="column is-6 is-12-small">
      <IntervalDropdown
        :time-intervals="timeIntervals"
        @set-time-interval="setTimeInterval"
      />
    </div>
    <div class="column is-6 is-12-small">
        <TextFilter
        v-model="textSearch"
      />
    </div>

  </div>

  

  <div class="mt-5">
    <h5 class="subtitle is-5">
      311 Requests
      <font-awesome-icon
        v-if="loadingData"
        icon="fa-solid fa-spinner"
        spin
      />
      <span v-else>({{ nearby311TableData.rows.length }})</span>
    </h5>
    <div class="horizontal-table">
      <vue-good-table
        id="nearby311"
        :columns="nearby311TableData.columns"
        :rows="nearby311TableData.rows"
        :row-style-class="row => hoveredStateId === row.service_request_id ? 'active-hover ' + row.service_request_id : 'inactive ' + row.service_request_id"
        style-class="table nearby-table"
        @row-mouseenter="handleRowMouseover($event, 'service_request_id')"
        @row-mouseleave="handleRowMouseleave"
        @row-click="handleRowClick($event, 'service_request_id', 'nearby311')"
      >
        <template #emptystate>
          <div v-if="loadingData">
            Loading nearby 311... <font-awesome-icon
              icon="fa-solid fa-spinner"
              spin
            />
          </div>
          <div v-else-if="NearbyActivityStore.dataError">
            Data loading error - try refreshing the page
          </div>
          <div v-else>
            No nearby 311 service requests found for the selected time interval
          </div>
        </template>
      </vue-good-table>
    </div>
  </div>
</template>

<style>

@media
only screen and (max-width: 760px) {

	/*Label the data*/

  #nearby311 {
    td:nth-of-type(1):before { content: "Date"; }
    td:nth-of-type(2):before { content: "Location"; }
    td:nth-of-type(3):before { content: "Type"; }
    td:nth-of-type(4):before { content: "Distance"; }
  }
}

</style>