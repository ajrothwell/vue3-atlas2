<script setup>

import { useMainStore } from '@/stores/MainStore.js'
const MainStore = useMainStore();
import { useAddressStore } from '@/stores/AddressStore.js'
const AddressStore = useAddressStore();
import { useRouter, useRoute } from 'vue-router';
const route = useRoute();
const router = useRouter();

import { ref, onMounted, provide } from 'vue';

// the useDataFetch composable contains the fetch calls to the various data sources
import useDataFetch from '@/composables/useDataFetch';
const { addressDataFetch, parcelsDataFetch, topicDataFetch } = useDataFetch();


import TopicPanel from '@/views/TopicPanel.vue';
// eventually there would be a map panel
//import MapPanel from '@/views/MapPanel.vue';


// use provide/inject for the addressDataLoaded and dataSourcesLoaded refs to the children
// these are used to allow loading symbols to be displayed before the stores are loaded
// while data is being fetched
const addressDataLoadedFlag = ref(false);
provide('addressDataLoadedFlagKey', addressDataLoadedFlag);
const dataSourcesLoadedArray = ref([]);
provide('dataSourcesLoadedArrayKey', dataSourcesLoadedArray);

const inputAddress = ref('');

onMounted(async () => {
  if (route.params.address) {
    inputAddress.value = route.params.address;
    handleAddressSearch();
  }
});

const handleAddressSearch = async () => {
  // it does a first AIS call to make sure the address is good, and to correct it for the url
  // for instance from '1234 mkt' to '1234 MARKET ST'

  // set address loaded to false
  addressDataLoadedFlag.value = false;
  // on a new address search, clear all of the loaded data sources
  dataSourcesLoadedArray.value = [];

  // on submit, immediately call AIS and put the full value in the AddressStore
  await addressDataFetch(inputAddress.value);

  if (!AddressStore.addressData.features) {
    // if the address is not found, return
    router.push({ name: 'not-found' });
    inputAddress.value = '';
    return;
  }

  // if there is a value, add the value for the street_address in the MainStore
  const currentAddress = AddressStore.addressData.features[0].properties.street_address;
  MainStore.setCurrentAddress(currentAddress);

  // set the addressDataLoadedFlag value to true
  addressDataLoadedFlag.value = true;

  // set the last search method to address (the alternative will eventually be 'mapClick')
  MainStore.setLastSearchMethod('address');

  // TODO - handle the case where the address is not found
  // (I think this comes to some incredibly convoluted thing involving using DOR parcels)

  // if the address is found, push the address to the router
  if (currentAddress && route.params.topic) {
    router.push({ name: 'address-and-topic', params: { address: currentAddress, topic: route.params.topic } });
  } else if (currentAddress) {
    router.push({ name: 'address-and-topic', params: { address: currentAddress, topic: 'Property' } });
  }
}

// I don't know whether this is a best practice
// Use the router's navigation guard to track route changes
router.afterEach(async (to, from) => {
  console.log('router.afterEach to:', to, 'from:', from);

  // this makes a repetitive and wasteful api call to AIS, but it is necessary for
  // the back button to work
  if (to.params.address !== from.params.address) {
    addressDataLoadedFlag.value = false;
    // on a new address search, clear all of the loaded data sources
    dataSourcesLoadedArray.value = [];

    // on submit, immediately call AIS and put the full value in the AddressStore
    await addressDataFetch(to.params.address);
    const currentAddress = AddressStore.addressData.features[0].properties.street_address;
    MainStore.setCurrentAddress(currentAddress);
    
    // set the addressDataLoadedFlag value to true
    addressDataLoadedFlag.value = true;
  } else if (dataSourcesLoadedArray.value.includes(to.params.topic)) {
    console.log('data source already loaded, quitting router.afterEach');
    return;
  }
  await parcelsDataFetch();
  // dataSourcesLoadedArray.value.push('pwdParcel', 'dorParcel');
  await topicDataFetch(to.params.topic);
  dataSourcesLoadedArray.value.push(to.params.topic);
});

</script>

<template>
  <main>

    <!-- APP HEADER -->
    <div class="container">
      <h1 class="title is-1">Vue3 Atlas</h1>
    </div>

    <!-- MAIN CONTENT -->
    <div class="small-container">
      <div class="columns">

        <!-- TOPIC PANEL ON LEFT -->
        <div class="column is-6">
          <topic-panel></topic-panel>
        </div>

        <!-- MAP PANEL ON RIGHT - right now only contains the address input -->
        <div class="column is-6">
          <div class="columns">
            <div class="column is-10">
              <input
                class="input"
                type="text"
                placeholder="Search an address"
                v-model="inputAddress"
                @keydown.enter="handleAddressSearch"
              />
            </div>
            <!-- I could not use a router-link here because the address is null at the start,
              and it would throw an error for a missing param
            -->
            <button
              class="button"
              @click="handleAddressSearch"
            >
              Search
            </button>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>