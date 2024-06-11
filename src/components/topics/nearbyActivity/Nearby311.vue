<script setup>
import { nextTick, ref, reactive, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { point, featureCollection } from '@turf/helpers';

import { useNearbyActivityStore } from '@/stores/NearbyActivityStore';
const NearbyActivityStore = useNearbyActivityStore();
import { useMainStore } from '@/stores/MainStore';
const MainStore = useMainStore();
import { useMapStore } from '@/stores/MapStore';
const MapStore = useMapStore();

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
      // console.log('item.address:', item.address, 'textSearch.value:', textSearch.value);
      return item.address.toLowerCase().includes(textSearch.value.toLowerCase()) || item.service_name.toLowerCase().includes(textSearch.value.toLowerCase());
    })
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
  map.getSource('nearby').setData(featureCollection(newGeojson));
});

const hoveredStateId = computed(() => { return MainStore.hoveredStateId; });

onMounted(() => {
  const map = MapStore.map;
  if (!NearbyActivityStore.loadingData && nearby311Geojson.value.length > 0) { map.getSource('nearby').setData(featureCollection(nearby311Geojson.value)) };
});
onBeforeUnmount(() => {
  const map = MapStore.map;
  if (map.getSource('nearby')) { map.getSource('nearby').setData(featureCollection([point([0,0])])) };
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

const clearText = () => textSearch.value = '';

</script>

<template>
  
  <IntervalDropdown
    :timeIntervals="timeIntervals"
    @setTimeInterval="setTimeInterval"
  ></IntervalDropdown>
  
  <div class="filter-div columns is-mobile">
    <div class="filter-label column is-3 small-is-4 pt-0 pb-0">Search by text:</div>
    <div class="column is-7 small-is-6 pr-0 pt-0 pb-0">
      <textbox
        placeholder="text"
        v-model="textSearch"
        class="search-box"
        id="searchBar"
      >
      </textbox>
    </div>
    <div class="column is-2 small-is-2 pl-0">
      <button
        v-if="textSearch !== null && textSearch !== ''"
        type="submit"
        class="button clear-button"
        @click="clearText"
      >
        <span class="clear-span pl-0" v-if="!MainStore.isMobileDevice">CLEAR</span>
        <i class="fas fa-times-circle"></i>
      </button>
    </div>
  </div>

  <div class="mt-5">
    <h5 class="subtitle is-5">311 Requests ({{ nearby311TableData.rows.length }})</h5>
    <div class="horizontal-table">
      <vue-good-table
        id="nearby311"
        :columns="nearby311TableData.columns"
        :rows="nearby311TableData.rows"
        :row-style-class="row => hoveredStateId === row.service_request_id ? 'active-hover ' + row.service_request_id : 'inactive ' + row.service_request_id"
        style-class="table"
        @row-mouseenter="handleRowMouseover($event, 'service_request_id')"
        @row-mouseleave="handleRowMouseleave"
        @row-click="handleRowClick($event, 'service_request_id', 'nearby311')"
      >
        <template #emptystate>
          <div v-if="loadingData">
            Loading nearby 311... <font-awesome-icon icon='fa-solid fa-spinner' spin></font-awesome-icon>
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

.clear-span {
  padding-left: 0px !important;
}

button.button.clear-button {
  /* position: relative;
  right: -240px;
  top: -50px; */
  width: 86px;
  font-size: 12px !important;
  border: none;
  background: #96c9ff;
  color: #444444;
  border-radius: 40px !important;
  padding: 3px;
  padding-left: 0px;
  height: 15px;
  i {
    margin-left: 5px;
  }
  &:focus {
    box-shadow: none !important;
  }
}

@media 
only screen and (max-width: 760px),
(min-device-width: 768px) and (max-device-width: 1024px)  {

  button.button.clear-button {
    width: 40px;
    padding: 8px;
  }

	/*Label the data*/

  #nearby311 {
    td:nth-of-type(1):before { content: "Date"; }
    td:nth-of-type(2):before { content: "Location"; }
    td:nth-of-type(3):before { content: "Type"; }
    td:nth-of-type(4):before { content: "Distance"; }
  }
}

</style>