<script setup>
import { ref, computed, watch, onMounted } from 'vue';

import { useMainStore } from '@/stores/MainStore';
const MainStore = useMainStore();

import useScrolling from '@/composables/useScrolling';
const { isElementInViewport } = useScrolling();

import { useRouter, useRoute } from 'vue-router';
const route = useRoute();
const router = useRouter();

import Nearby311 from '@/components/topics/nearbyActivity/Nearby311.vue';
import NearbyCrimeIncidents from './NearbyCrimeIncidents.vue';
import NearbyZoningAppeals from './NearbyZoningAppeals.vue';
import NearbyVacantIndicatorPoints from './NearbyVacantIndicatorPoints.vue';
import NearbyConstructionPermits from './NearbyConstructionPermits.vue';
import NearbyDemolitionPermits from './NearbyDemolitionPermits.vue';
import NearbyImminentlyDangerous from './NearbyImminentlyDangerous.vue';

const dataTypes = {
  nearby311: '311 Requests',
  nearbyCrimeIncidents: 'Crime Incidents',
  nearbyZoningAppeals: 'Zoning Appeals',
  nearbyVacantIndicatorPoints: 'Vacant Properties',
  nearbyConstructionPermits: 'Construction Permits',
  nearbyDemolitionPermits: 'Demolition Permits',
  nearbyImminentlyDangerous: 'Imminently Dangerous',
}

const currentNearbyDataType = computed(() => {
  return MainStore.currentNearbyDataType;
});

const setDataTypeInRouter = (newDataType) => {
  router.push({ name: 'address-topic-and-data', params: { address: MainStore.currentAddress, topic: route.params.topic, data: newDataType } });
}

const selectedDataType = ref('nearby311');

watch(() => selectedDataType.value, (newDataType) => {
  if (import.meta.env.VITE_DEBUG == 'true') console.log('watch selectedDataType.value, newDataType:', newDataType);
  setDataTypeInRouter(newDataType);
  MainStore.currentNearbyDataType = newDataType;
  const popup = document.getElementsByClassName('maplibregl-popup');
  if (popup.length) {
    popup[0].remove();
  }
})

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

onMounted( () => {
  // if (import.meta.env.VITE_DEBUG == 'true') console.log('NearbyActivity.vue onMounted is running, route.params.data:', route.params.data);
  selectedDataType.value = route.params.data;
  if (!currentNearbyDataType.value) {
    MainStore.currentNearbyDataType = selectedDataType.value;
  }
  // const topic = document.getElementById('Property-topic');
  // topic.scrollIntoView();
  // const main = document.getElementById('main');
  // const mainScrollTop = main.scrollTop;
  // main.scrollTo(0, mainScrollTop - 80);
})

</script>

<template>
  <section>
    <div
      id="Nearby Activity-description"
      class="box"
    >
      See recent activity near your search address including 311 service requests, crimes, zoning appeals, and more. Hover over a record below to highlight it on the map.
    </div>

    <!-- DATA DROPDOWN-->

    <div class="filter-div columns is-mobile">
      <!-- <div class="column is-3 small-is-4 pt-0 pb-0">
        <label class="filter-label" for="data-dropdown">Select activity:</label>
      </div> -->
      <div class="dropdown column is-10 small-is-9 pt-0 pb-0"> 
        <dropdown
          id="data-dropdown"
          v-model="selectedDataType"
          label="Select activity"
          :options="dataTypes"
        />
      </div>
    </div>

    <Nearby311 v-if="currentNearbyDataType == 'nearby311'" />
    <NearbyCrimeIncidents v-if="currentNearbyDataType == 'nearbyCrimeIncidents'" />
    <NearbyZoningAppeals v-if="currentNearbyDataType == 'nearbyZoningAppeals'" />
    <NearbyVacantIndicatorPoints v-if="currentNearbyDataType == 'nearbyVacantIndicatorPoints'" />
    <NearbyConstructionPermits v-if="currentNearbyDataType == 'nearbyConstructionPermits'" />
    <NearbyDemolitionPermits v-if="currentNearbyDataType == 'nearbyDemolitionPermits'" />
    <NearbyImminentlyDangerous v-if="currentNearbyDataType == 'nearbyImminentlyDangerous'" />
  </section>
</template>

<style scoped>

</style>