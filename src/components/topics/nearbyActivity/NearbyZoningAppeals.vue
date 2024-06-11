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

const timeIntervalSelected = ref(0);
const timeIntervals = reactive(
  {
    '0': 'any time',
    '-90': 'the last 90 days',
    '90': 'the next 90 days',
  }
)
const setTimeInterval = (e) => timeIntervalSelected.value = e;

const textSearch = ref('');

const nearbyZoningAppeals = computed(() => {
  if (NearbyActivityStore.nearbyZoningAppeals) {
    let data = [ ...NearbyActivityStore.nearbyZoningAppeals.rows]
    // console.log(new Date(data[0].scheduleddate));
    if (timeIntervalSelected.value < 0) {
      data = data.filter(item => {
        let timeDiff = new Date() - new Date(item.scheduleddate);
        let daysDiff = timeDiff / (1000 * 60 * 60 * 24);
        return daysDiff >= timeIntervalSelected.value;
      }).filter(item => {
      return item.address.toLowerCase().includes(textSearch.value.toLowerCase()) || item.appealgrounds.toLowerCase().includes(textSearch.value.toLowerCase());
    })
    } else if (timeIntervalSelected.value > 0) {
      data = data.filter(item => {
        let timeDiff = new Date() - new Date(item.scheduleddate);
        let daysDiff = timeDiff / (1000 * 60 * 60 * 24);
        return daysDiff <= timeIntervalSelected.value;
      }).filter(item => {
      return item.address.toLowerCase().includes(textSearch.value.toLowerCase()) || item.appealgrounds.toLowerCase().includes(textSearch.value.toLowerCase());
    })
    }
    data.sort((a, b) => timeReverseFn(a, b, 'dispatch_date'))
    return data;
  }
});
const nearbyZoningAppealsGeojson = computed(() => {
  if (!nearbyZoningAppeals.value) return [point([0,0])];
  return nearbyZoningAppeals.value.map(item => point([item.lng, item.lat], { id: item.objectid, type: 'nearbyZoningAppeals' }));
})
watch (() => nearbyZoningAppealsGeojson.value, (newGeojson) => {
  const map = MapStore.map;
  map.getSource('nearby').setData(featureCollection(newGeojson));
});

const hoveredStateId = computed(() => { return MainStore.hoveredStateId; });

onMounted(() => {
  const map = MapStore.map;
  if (!NearbyActivityStore.loadingData && nearbyZoningAppealsGeojson.value.length > 0) { map.getSource('nearby').setData(featureCollection(nearbyZoningAppealsGeojson.value)) };
});
onBeforeUnmount(() => {
  const map = MapStore.map;
  if (map.getSource('nearby')) { map.getSource('nearby').setData(featureCollection([point([0,0])])) };
});

const nearbyZoningAppealsTableData = computed(() => {
  return {
    columns: [
      {
        label: 'Date',
        field: 'scheduleddate',
        type: 'date',
        dateInputFormat: "yyyy-MM-dd'T'HH:mm:ssX",
        dateOutputFormat: 'MM/dd/yyyy',
      },
      {
        label: 'Location',
        field: 'address',
      },
      {
        label: 'Description',
        field: 'appealgrounds',
      },
      {
        label: 'Distance',
        field: 'distance_ft',
      }
    ],
    rows: nearbyZoningAppeals.value || [],
  }
});

</script>

<template>
  
  <IntervalDropdown
    :timeIntervals="timeIntervals"
    @setTimeInterval="setTimeInterval"
  ></IntervalDropdown>

  <TextFilter
    v-model="textSearch"
  ></TextFilter>

  <div class='mt-5'>
    <h5 class="subtitle is-5">Zoning Appeals ({{ nearbyZoningAppealsTableData.rows.length }})</h5>
    <div class="horizontal-table">
      <vue-good-table
        id="nearbyZoningAppeals"
        :columns="nearbyZoningAppealsTableData.columns"
        :rows="nearbyZoningAppealsTableData.rows"
        :row-style-class="row => hoveredStateId === row.objectid ? 'active-hover ' + row.objectid : 'inactive ' + row.objectid"
        style-class="table"
        @row-mouseenter="handleRowMouseover($event, 'objectid')"
        @row-mouseleave="handleRowMouseleave"
        @row-click="handleRowClick($event, 'objectid', 'nearbyZoningAppeals')"
      >
        <template #emptystate>
          <div v-if="loadingData">
            Loading nearby zoning appeals... <font-awesome-icon icon='fa-solid fa-spinner' spin></font-awesome-icon>
          </div>
          <div v-else>
            No nearby zoning appeals found for the selected time interval
          </div>
        </template>
      </vue-good-table>
    </div>
  </div>
</template>

<style>

@media 
only screen and (max-width: 760px){
	/*Label the data*/

  #nearbyZoningAppeals {
    td:nth-of-type(1):before { content: "Date"; }
    td:nth-of-type(2):before { content: "Location"; }
    td:nth-of-type(3):before { content: "Description"; }
    td:nth-of-type(4):before { content: "Distance"; }
  }
}

</style>