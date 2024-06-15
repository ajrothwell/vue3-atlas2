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
  }
)
const setTimeInterval = (e) => timeIntervalSelected.value = e;

const textSearch = ref('');

const nearbyCrimeIncidents = computed(() => {
  if (NearbyActivityStore.nearbyCrimeIncidents && NearbyActivityStore.nearbyCrimeIncidents.rows) {
    let data = [ ...NearbyActivityStore.nearbyCrimeIncidents.rows]
      .filter(item => {
      let timeDiff = new Date() - new Date(item.dispatch_date);
      let daysDiff = timeDiff / (1000 * 60 * 60 * 24);
      return daysDiff <= timeIntervalSelected.value;
    }).filter(item => {
      // console.log('item.address:', item.address, 'textSearch.value:', textSearch.value);
      return item.location_block.toLowerCase().includes(textSearch.value.toLowerCase()) || item.text_general_code.toLowerCase().includes(textSearch.value.toLowerCase());
    })
    data.sort((a, b) => timeReverseFn(a, b, 'dispatch_date'))
    return data;
  }
});
const nearbyCrimeIncidentsGeojson = computed(() => {
  if (!nearbyCrimeIncidents.value) return [point([0,0])];
  return nearbyCrimeIncidents.value.map(item => point([item.lng, item.lat], { id: item.objectid, type: 'nearbyCrimeIncidents' }));
})
watch (() => nearbyCrimeIncidentsGeojson.value, (newGeojson) => {
  const map = MapStore.map;
  map.getSource('nearby').setData(featureCollection(newGeojson))
});

const hoveredStateId = computed(() => { return MainStore.hoveredStateId; });

onMounted(() => {
  const map = MapStore.map;
  if (!NearbyActivityStore.loadingData && nearbyCrimeIncidentsGeojson.value.length > 0) { map.getSource('nearby').setData(featureCollection(nearbyCrimeIncidentsGeojson.value)) }
});
onBeforeUnmount(() => {
  const map = MapStore.map;
  if (map.getSource('nearby')) { map.getSource('nearby').setData(featureCollection([point([0,0])])) }
});

const nearbyCrimeIncidentsTableData = computed(() => {
  return {
    columns: [
      {
        label: 'Date',
        field: 'dispatch_date',
        type: 'date',
        dateInputFormat: "yyyy-MM-dd",
        dateOutputFormat: 'MM/dd/yyyy',
      },
      {
        label: 'Location',
        field: 'location_block',
      },
      {
        label: 'Description',
        field: 'text_general_code',
      },
      {
        label: 'Distance',
        field: 'distance_ft',
      }
    ],
    rows: nearbyCrimeIncidents.value || [],
  }
});

</script>

<template>
  <IntervalDropdown
    :time-intervals="timeIntervals"
    @set-time-interval="setTimeInterval"
  />

  <TextFilter
    v-model="textSearch"
  />

  <div class="mt-5">
    <h5 class="subtitle is-5">
      Crime Incidents ({{ nearbyCrimeIncidentsTableData.rows.length }})
    </h5>
    <div class="horizontal-table">
      <vue-good-table
        id="nearbyCrimeIncidents"
        :columns="nearbyCrimeIncidentsTableData.columns"
        :rows="nearbyCrimeIncidentsTableData.rows"
        :row-style-class="row => hoveredStateId === row.objectid ? 'active-hover ' + row.objectid : 'inactive ' + row.objectid"
        style-class="table"
        @row-mouseenter="handleRowMouseover($event, 'objectid')"
        @row-mouseleave="handleRowMouseleave"
        @row-click="handleRowClick($event, 'objectid', 'nearbyCrimeIncidents')"
      >
        <template #emptystate>
          <div v-if="loadingData">
            Loading nearby crime incidents... <font-awesome-icon
              icon="fa-solid fa-spinner"
              spin
            />
          </div>
          <div v-else>
            No nearby crime incidents found for the selected time interval
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

  #nearbyCrimeIncidents {
    td:nth-of-type(1):before { content: "Date"; }
    td:nth-of-type(2):before { content: "Location"; }
    td:nth-of-type(3):before { content: "Description"; }
    td:nth-of-type(4):before { content: "Distance"; }
  }
}

</style>