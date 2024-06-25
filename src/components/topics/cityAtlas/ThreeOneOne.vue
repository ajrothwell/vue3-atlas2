<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { point, featureCollection } from '@turf/helpers';

import { use311Store } from '@/stores/311Store';
const Nearby311Store = use311Store();
import { useMainStore } from '@/stores/MainStore';
const MainStore = useMainStore();
import { useMapStore } from '@/stores/MapStore';
const MapStore = useMapStore();


import useTransforms from '@/composables/useTransforms';
const { timeReverseFn } = useTransforms();
import useScrolling from '@/composables/useScrolling';
const { isElementInViewport, handleRowClick, handleRowMouseover, handleRowMouseleave } = useScrolling();

import TextFilter from '@/components/TextFilter.vue';
const textSearch = ref('');

const loadingNearby311 = computed(() => Nearby311Store.loadingNearby311 );

const timeIntervalSelected = ref('30');
const timeIntervals = computed(() => {
  return {
    30: 'last 30 days',
    90: 'last 90 days',
    365: 'last 1 year',
  };
})

const nearby311 = computed(() => {
  let data;
  if (Nearby311Store.nearby311.rows) {
    data = [ ...Nearby311Store.nearby311.rows]
      .filter(item => {
      // if (import.meta.env.VITE_DEBUG == 'true') console.log('in filter, item:', item);
      let timeDiff = new Date() - new Date(item.properties.REQUESTED_DATETIME);
      let daysDiff = timeDiff / (1000 * 60 * 60 * 24);
      return daysDiff <= timeIntervalSelected.value;
    })//.filter(item => {
      // if (import.meta.env.VITE_DEBUG == 'true') console.log('item.address:', item.address, 'textSearch.value:', textSearch.value);
    //   return item.address.toLowerCase().includes(textSearch.value.toLowerCase())
    //   || item.service_name.toLowerCase().includes(textSearch.value.toLowerCase());
    // });
    data.sort((a, b) => timeReverseFn(a, b, 'properties.REQUESTED_DATETIME'))
  }
  return data;
});
const nearby311Geojson = computed(() => {
  if (!nearby311.value) return [point([0,0])];
  return nearby311.value.map(item => point([item.geometry.coordinates[0], item.geometry.coordinates[1]], { id: item.id, type: 'nearby311' }));
})
watch (() => nearby311Geojson.value, async(newGeojson) => {
  const map = MapStore.map;
  if (map.getSource) map.getSource('nearby').setData(featureCollection(newGeojson));
});

const hoveredStateId = computed(() => { return MainStore.hoveredStateId; });

const clickedMarkerId = computed(() => { return MainStore.clickedMarkerId; });

watch(() => clickedMarkerId.value, (newClickedMarkerId) => {
  if (newClickedMarkerId) {
    const el = document.getElementsByClassName(newClickedMarkerId)[0];
    const visible = isElementInViewport(el);
    if (!visible && !MainStore.isMobileDevice) {
      el.scrollIntoView({ block: 'center' });
    }
  }
});

onMounted(() => {
  const map = MapStore.map;
  if (!Nearby311Store.loadingNearby311 && nearby311Geojson.value.length > 0) { map.getSource('nearby').setData(featureCollection(nearby311Geojson.value)) }
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
        field: 'properties.date',
      },
      {
        label: 'Location',
        field: 'properties.ADDRESS',
      },
      {
        label: 'Type',
        field: 'properties.link',
        html: true,
      },
      {
        label: 'Distance',
        field: 'properties.distance_ft',
      }
    ],
    rows: nearby311.value || [],
  }
});

</script>

<template>

  <div
    class="dropdown nearby-dropdown column is-3 is-12-mobile pt-0 pb-0"
  >
    <dropdown
      id="time-interval-dropdown"
      v-model="timeIntervalSelected"
      label="When?"
      :options="timeIntervals"
    />
  </div>
  <div class="column is-4 is-12-mobile">
    <TextFilter
      v-model="textSearch"
    />
  </div>

  <div class="mt-5">
    <h5 class="subtitle is-5">
      311 Requests
      <font-awesome-icon
        v-if="loadingNearby311"
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
        :row-style-class="row => hoveredStateId === row.id ? 'active-hover ' + row.id : 'inactive ' + row.id"
        style-class="table nearby-table"
        @row-mouseenter="handleRowMouseover($event, 'id')"
        @row-mouseleave="handleRowMouseleave"
        @row-click="handleRowClick($event, 'id', 'nearby311')"
      >
        <template #emptystate>
          <div v-if="loadingNearby311">
            Loading nearby 311... <font-awesome-icon
              icon="fa-solid fa-spinner"
              spin
            />
          </div>
          <div v-else-if="Nearby311Store.dataError">
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