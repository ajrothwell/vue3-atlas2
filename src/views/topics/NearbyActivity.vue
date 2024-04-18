<script setup>
console.log('Nearby.vue setup');
import { ref, computed } from 'vue';

import { useNearbyActivityStore } from '@/stores/NearbyActivityStore';
const NearbyActivityStore = useNearbyActivityStore();

import useTransforms from '@/composables/useTransforms';
const { currency, date } = useTransforms();

// 311
const nearby311CompareFn = (a, b) => new Date(b.requested_datetime) - new Date(a.requested_datetime);
const nearby311 = computed(() => NearbyActivityStore.nearby311.data.rows.sort(nearby311CompareFn));//.slice(0, 5));

// Crime
const nearbyCrimeIncidentsCompareFn = (a, b) => new Date(b.requested_datetime) - new Date(a.requested_datetime);
const nearbyCrimeIncidents = computed(() => NearbyActivityStore.nearbyCrimeIncidents.data.rows.sort(nearbyCrimeIncidentsCompareFn));//.slice(0, 5));


const dataType = ref('nearby311');

const setDataType = async (newDataType) => {
  console.log('setDataType:', newDataType);
  dataType.value = newDataType;

  console.log(NearbyActivityStore[newDataType]);
  if (NearbyActivityStore[newDataType] === null) {
    console.log('fetching new data')
    await NearbyActivityStore.fetchData(newDataType);
  }
}

const dropdownOpen = ref(false);

const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value;
}

</script>

<template>
  <section>
    <div class="box">
      See recent activity near your search address including 311 service requests, crimes, zoning appeals, and more. Hover over a record below to highlight it on the map.
    </div>

    <div
      :class="dropdownOpen ? 'dropdown is-active' : 'dropdown'"
      @click="toggleDropdown"
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
          <a class="dropdown-item" @click="setDataType('nearby311')">311 Requests</a>
          <a class="dropdown-item" @click="setDataType('nearbyCrimeIncidents')">Crime Incidents</a>
          <a class="dropdown-item" @click="setDataType('nearbyZoningAppeals')">Zoning Appeals</a>
          <a class="dropdown-item" @click="setDataType('nearbyVacantIndicatorPoints')">Vacant Properties</a>
          <a class="dropdown-item" @click="setDataType('nearbyConstructionPermits')">Construction Permits</a>
          <a class="dropdown-item" @click="setDataType('nearbyDemolitionPermits')">Demolition Permits</a>
          <a class="dropdown-item" @click="setDataType('nearbyImminentlyDangerous')">Imminently Dangerous</a>
        </div>
      </div>
    </div>

    <!-- 311 -->
    <div v-if="dataType == 'nearby311'">
      <h5 class="subtitle is-5">Service Requests</h5>
      <table class="table is-fullwidth is-striped">
        <thead>
          <tr>
            <th>Date</th>
            <th>Location</th>
            <th>Type</th>
            <th>Distance</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in nearby311">
            <td>{{ date(item.requested_datetime) }}</td>
            <td>{{ item.address }}</td>
            <td>{{ item.service_name }}</td>
            <td></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Crime -->
    <div v-if="dataType == 'nearbyCrimeIncidents'">
      <h5 class="subtitle is-5">Crime Incidents</h5>
      <table class="table is-fullwidth is-striped">
        <thead>
          <tr>
            <th>Date</th>
            <th>Location</th>
            <th>Description</th>
            <th>Distance</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in nearbyCrimeIncidents">
            <td>{{ item.dispatch_date }}</td>
            <td>{{ item.location_block }}</td>
            <td>{{ item.text_general_code }}</td>
            <td></td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>