<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue';

import { useNearbyActivityStore } from '@/stores/NearbyActivityStore';
const NearbyActivityStore = useNearbyActivityStore();
import { useMainStore } from '@/stores/MainStore';
const MainStore = useMainStore();

// import useTransforms from '@/composables/useTransforms';
// const { date } = useTransforms();

import { useRouter, useRoute } from 'vue-router';
const route = useRoute();
const router = useRouter();

import Nearby311 from '@/components/topics/nearbyActivity/Nearby311.vue';
import NearbyCrimeIncidents from './NearbyCrimeIncidents.vue';
import NearbyZoningAppeals from './NearbyZoningAppeals.vue';

const dataTypes = {
  nearby311: '311 Requests',
  nearbyCrimeIncidents: 'Crime Incidents',
  nearbyZoningAppeals: 'Zoning Appeals',
  nearbyVacantIndicatorPoints: 'Vacant Properties',
  nearbyConstructionPermits: 'Construction Permits',
  nearbyDemolitionPermits: 'Demolition Permits',
  nearbyImminentlyDangerous: 'Imminently Dangerous',
}

const dataDropdownOpen = ref(false);
const toggleDataDropdown = () => dataDropdownOpen.value = !dataDropdownOpen.value;
const currentNearbyDataType = computed(() => {
  return MainStore.currentNearbyDataType;
});
const setDataTypeInRouter = (newDataType) => {
  router.push({ name: 'address-topic-and-data', params: { address: MainStore.currentAddress, topic: route.params.topic, data: newDataType } });
}

watch(() => route.params.data, async (newDataType) => {
  console.log('watch route.params.data, newDataType:', newDataType, 'currentNearbyDataType.value:', currentNearbyDataType.value);
  if (newDataType) {
    await setDataType(newDataType);
  }
})

const setDataType = async (newDataType) => {
  console.log('setDataType, newDataType:', newDataType);
  MainStore.currentNearbyDataType = newDataType;
  if (NearbyActivityStore[newDataType] === null) {
    await NearbyActivityStore.fetchData(newDataType);
  }
}

onMounted( () => {
  console.log('NearbyActivity.vue onMounted is running, route.params.data:', route.params.data);
  setDataType(route.params.data);
})

// const timeIntervalLabel = computed(() => timeIntervals[currentNearbyDataType.value].labels[timeIntervals[currentNearbyDataType.value].values.indexOf(timeInterval.value)]);
// const setTimeInterval = (dataType, newTimeInterval) => {
//   console.log('setTimeInterval, dataType.value:', dataType.value, 'newTimeInterval:', newTimeInterval);
//   timeIntervals[dataType.value].selected = newTimeInterval;
// }

// const timeIntervals = reactive({
//   nearby311: {
//     labels: ['the last 30 days', 'the last 90 days', '1 year'],
//     values: [30, 90, 365],
//     selected: 30,
//   },
//   nearbyCrimeIncidents: {
//     labels: ['the last 30 days', 'the last 90 days'],
//     values: [30, 90],
//     selected: 30,
//   },
//   nearbyZoningAppeals: {
//     labels: ['any time', 'the last 90 days', 'the next 90 days'],
//     values: [0, -90, 90],
//     selected: 0,
//   },
//   nearbyVacantIndicatorPoints: {
//     labels: [],
//     values: [],
//   },
//   nearbyConstructionPermits: {
//     labels: ['the last 30 days', 'the last 90 days', '1 year'],
//     values: [30, 90, 365],
//     selected: 30,
//   },
//   nearbyDemolitionPermits: {
//     labels: ['the last 30 days', 'the last 90 days', '1 year'],
//     values: [30, 90, 365],
//     selected: 30,
//   },
//   nearbyImminentlyDangerous: {
//     labels: ['the last 30 days', 'the last 90 days', '1 year'],
//     values: [30, 90, 365],
//     selected: 30,
//   },
// });

// nearbyVacantIndicatorPoints computed
const nearbyVacantIndicatorPoints = computed(() => {
  if (NearbyActivityStore.nearbyVacantIndicatorPoints) {
    let data = [ ...NearbyActivityStore.nearbyVacantIndicatorPoints]
    if (sortby.value === 'distance') {
      data.sort((a, b) => a._distance - b._distance)
    } else if (sortby.value === 'type') {
      data.sort((a, b) => a.distance - b.distance)
    }
    return data;
  }
});
const nearbyVacantIndicatorPointsGeojson = computed(() => {
  let features = [];
  if (!nearbyVacantIndicatorPoints.value) return features;
  for (let item of nearbyVacantIndicatorPoints.value) {
    console.log('item:', item);
    features.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: item.geometry.coordinates },
      properties: { id: item.id, type: 'nearbyVacantIndicatorPoints' }
    })
  }
  return features;
})
// watch (() => nearbyVacantIndicatorPointsGeojson.value, async (newGeojson) => {
//   console.log('nearbyVacantIndicatorPoints watch, newGeojson:', newGeojson);
//   if (newGeojson.length > 0) {
//     let geojson = { 'type': 'FeatureCollection', 'features': newGeojson };
//     await map.getSource('nearby').setData(geojson);
//   }
// })

</script>

<template>
  <section>
    <div class="box">
      See recent activity near your search address including 311 service requests, crimes, zoning appeals, and more. Hover over a record below to highlight it on the map.
    </div>

    <!-- DATA DROPDOWN-->
    <div
      :class="dataDropdownOpen ? 'dropdown is-active' : 'dropdown'"
      @click="toggleDataDropdown"
    >
      <div class="dropdown-trigger">
        <button class="button" aria-haspopup="true" aria-controls="dropdown-menu">
          <span>What nearby activity would you like to see?</span>
          <span class="icon is-small">
            <i class="fas fa-angle-down" aria-hidden="true"></i>
          </span>
        </button>
      </div>
      <div class="dropdown-menu" id="dropdown-menu" role="menu">
        <div class="dropdown-content">
          <a class="dropdown-item" @click="setDataTypeInRouter('nearby311')">311 Requests</a>
          <a class="dropdown-item" @click="setDataTypeInRouter('nearbyCrimeIncidents')">Crime Incidents</a>
          <a class="dropdown-item" @click="setDataTypeInRouter('nearbyZoningAppeals')">Zoning Appeals</a>
          <a class="dropdown-item" @click="setDataTypeInRouter('nearbyVacantIndicatorPoints')">Vacant Properties</a>
          <a class="dropdown-item" @click="setDataTypeInRouter('nearbyConstructionPermits')">Construction Permits</a>
          <a class="dropdown-item" @click="setDataTypeInRouter('nearbyDemolitionPermits')">Demolition Permits</a>
          <a class="dropdown-item" @click="setDataTypeInRouter('nearbyImminentlyDangerous')">Imminently Dangerous</a>
        </div>
      </div>
    </div>
    <span>{{ dataTypes[currentNearbyDataType] }}</span>
    <br>

    <Nearby311 v-if="currentNearbyDataType == 'nearby311'"></Nearby311>
    <NearbyCrimeIncidents v-if="currentNearbyDataType == 'nearbyCrimeIncidents'"></NearbyCrimeIncidents>
    <NearbyZoningAppeals v-if="currentNearbyDataType == 'nearbyZoningAppeals'"></NearbyZoningAppeals>

    <!-- nearbyVacantIndicatorPoints -->
    <!-- <div class='mt-5' v-if="currentNearbyDataType == 'nearbyVacantIndicatorPoints'">
      <h5 class="subtitle is-5">Likely Vacant Properties</h5>
      <div v-if="loadingData">Loading...</div>
      <table class="table is-fullwidth is-striped">
        <thead>
          <tr>
            <th>Address</th>
            <th>Property Type</th>
            <th>Distance</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in nearbyVacantIndicatorPoints"
            :key="item.id"
            :id="item.id"
            @mouseover="handleRowMouseover"
            @mouseleave="handleRowMouseleave"
            :class="hoveredStateId == item.id ? 'active' : 'inactive'"
          >
            <td>{{ item.properties.ADDRESS }}</td>
            <td>{{ item.properties.VACANT_FLAG }}</td>
            <td>{{ (item._distance * 3.28084).toFixed(0) }} ft</td>
          </tr>
        </tbody>
      </table>
    </div> -->
  </section>
</template>

<style scoped>

.active {
  background-color: #FFFF00 !important;
}

</style>