<script setup>
import { ref, computed, reactive, watch, onMounted } from 'vue';

import { useNearbyActivityStore } from '@/stores/NearbyActivityStore';
const NearbyActivityStore = useNearbyActivityStore();
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
  console.log('watch selectedDataType.value, newDataType:', newDataType);
  setDataTypeInRouter(newDataType);
  MainStore.currentNearbyDataType = newDataType;
  const popup = document.getElementsByClassName('maplibregl-popup');
  if (popup.length) {
    popup[0].remove();
  }
})

const hoveredStateId = computed(() => { return MainStore.hoveredStateId; });

watch(() => hoveredStateId.value, (newHoveredStateId) => {
  if (newHoveredStateId) {
    const el = document.getElementsByClassName(newHoveredStateId)[0];
    // const el = document.getElementById(newHoveredStateId);
    const visible = isElementInViewport(el);
    if (!visible && !MainStore.isMobileDevice) {
      el.scrollIntoView({ block: 'center' });
    }
  }
});

onMounted( () => {
  // console.log('NearbyActivity.vue onMounted is running, route.params.data:', route.params.data);
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
    <div id="Nearby Activity-description" class="box">
      See recent activity near your search address including 311 service requests, crimes, zoning appeals, and more. Hover over a record below to highlight it on the map.
    </div>

    <!-- DATA DROPDOWN-->

    <div class="filter-div columns is-mobile">
      <div class="filter-label column is-3 small-is-4">Select activity:</div>
      <div class="dropdown column is-9 small-is-8"> 
        <dropdown
          v-model="selectedDataType"
          :options="dataTypes"
        >
        </dropdown>
      </div>
    </div>

    <Nearby311 v-if="currentNearbyDataType == 'nearby311'"></Nearby311>
    <NearbyCrimeIncidents v-if="currentNearbyDataType == 'nearbyCrimeIncidents'"></NearbyCrimeIncidents>
    <NearbyZoningAppeals v-if="currentNearbyDataType == 'nearbyZoningAppeals'"></NearbyZoningAppeals>
    <NearbyVacantIndicatorPoints v-if="currentNearbyDataType == 'nearbyVacantIndicatorPoints'"></NearbyVacantIndicatorPoints>
    <NearbyConstructionPermits v-if="currentNearbyDataType == 'nearbyConstructionPermits'"></NearbyConstructionPermits>
    <NearbyDemolitionPermits v-if="currentNearbyDataType == 'nearbyDemolitionPermits'"></NearbyDemolitionPermits>
    <NearbyImminentlyDangerous v-if="currentNearbyDataType == 'nearbyImminentlyDangerous'"></NearbyImminentlyDangerous>
    
  </section>
</template>

<style scoped>

.active {
  background-color: #FFFF00 !important;
}

/* .filter-div {
  display: flex;
  align-items: center;
} */

</style>