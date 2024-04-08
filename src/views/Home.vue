<script setup>

import { useMainStore } from '@/stores/MainStore.js'
const MainStore = useMainStore();
import { useAddressStore } from '@/stores/AddressStore.js'
const AddressStore = useAddressStore();
import { useRouter, useRoute } from 'vue-router';
const route = useRoute();
const router = useRouter();

import { ref, onMounted, provide } from 'vue';

import useAddressDataFetch from '@/composables/useAddressDataFetch';
const { addressDataFetch, topicDataFetch } = useAddressDataFetch();

import TopicPanel from '@/views/TopicPanel.vue';

const inputAddress = ref('');

const handleAddressSearch = async () => {
  dataLoaded.value = [];

  // on submit, immediately call AIS and put the full value in the AddressStore
  await addressDataFetch(inputAddress.value);
  // and the value for the street_address in the MainStore
  const currentAddress = AddressStore.addressData.features[0].properties.street_address;
  MainStore.setCurrentAddress(currentAddress);

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

const dataLoaded = ref([]);
provide('dataLoadedKey', dataLoaded);

// I don't know whether this is a best practice
// Use the router's navigation guard to track route changes
router.beforeEach(async (to, from) => {
  console.log('to:', to, 'from:', from);
  if (dataLoaded.value.includes(to.params.topic)) {
    return;
  }
  await topicDataFetch(to.params.topic);
  dataLoaded.value.push(to.params.topic);
  // if (to.params.address !== from.params.address) {
  //   // await addressDataFetch(to.params.address);
  //   await topicDataFetch(to.params.topic);
  //   console.log('to.params.topic:', to.params.topic, 'dataLoaded:', dataLoaded);
  //   dataLoaded.value.push(to.params.topic);
  // } else if (to.params.topic !== from.params.topic) {
  //   await topicDataFetch(to.params.topic);
  //   dataLoaded.value.push(to.params.topic);
  // }
});

const loadedAddress = ref('');
onMounted(async () => {
  console.log('route.params:', route.params);
  if (route.params.address) {
    loadedAddress.value = route.params.address;
    await addressDataFetch(route.params.address);
    await topicDataFetch(route.params.topic);
    dataLoaded.value.push(route.params.topic);
    // do the rest of the loading the Main Store
    const currentAddress = AddressStore.addressData.features[0].properties.street_address;
    MainStore.setCurrentAddress(currentAddress);
    MainStore.setLastSearchMethod('address');
  }
});


</script>

<template>
  <main>
    <div class="container">
      <h1 class="title is-1">Atlas</h1>
    </div>
    <div class="small-container">
      <div class="columns">

        <div class="column is-6">
          <topic-panel
          >
          <!-- :data-loaded="dataLoaded" -->
          </topic-panel>
        </div>

        <div class="column is-6">
          <div class="columns">
            <div class="column is-10">
              <input
                class="input"
                type="text"
                placeholder="Search an address"
                v-model="inputAddress"
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

      

      <!-- <router-view v-slot="{ Component }">
        <component
          :is="Component"
        />
      </router-view> -->

    </div>
  </main>
</template>

<!-- <style scoped>

.small-container {
  padding: 1em;
}

</style> -->