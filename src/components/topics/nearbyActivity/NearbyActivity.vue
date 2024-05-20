<script setup>
import { ref, computed, watch, onMounted } from 'vue';

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

const dataDropdownOpen = ref(false);
const toggleDataDropdown = () => dataDropdownOpen.value = !dataDropdownOpen.value;
const currentNearbyDataType = computed(() => {
  return MainStore.currentNearbyDataType;
});
const setDataTypeInRouter = (newDataType) => {
  router.push({ name: 'address-topic-and-data', params: { address: MainStore.currentAddress, topic: route.params.topic, data: newDataType } });
}

watch(() => route.params.data, (newDataType) => {
  // console.log('watch route.params.data, newDataType:', newDataType, 'currentNearbyDataType.value:', currentNearbyDataType.value);
  if (newDataType) {
    setDataType(newDataType);
  }
})

const setDataType = async (newDataType) => {
  // console.log('setDataType, newDataType:', newDataType);
  MainStore.currentNearbyDataType = newDataType;
  if (NearbyActivityStore[newDataType] === null) {
    await NearbyActivityStore.fetchData(newDataType);
  }
}

const hoveredStateId = computed(() => { return MainStore.hoveredStateId; });

watch(() => hoveredStateId.value, (newHoveredStateId) => {
  if (newHoveredStateId) {
    const el = document.getElementById(newHoveredStateId);
    const visible = isElementInViewport(el);
    if (!visible && !MainStore.isMobileDevice) {
      el.scrollIntoView({ block: 'center' });
    }
  }
});

onMounted( () => {
  // console.log('NearbyActivity.vue onMounted is running, route.params.data:', route.params.data);
  setDataType(route.params.data);
  // const topic = document.getElementById('Nearby Activity-topic');
  // console.log('topic:', topic);
  // topic.scrollIntoView();
})

</script>

<template>
  <section>
    <div id="Nearby Activity-description" class="box">
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
            <font-awesome-icon icon="fa-solid fa-angle-down" aria-hidden="true"></font-awesome-icon>
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

</style>