<script setup>

import { useAddressStore } from '@/stores/AddressStore.js'
const AddressStore = useAddressStore();

import { useParcelsStore } from '@/stores/ParcelsStore.js'
const ParcelsStore = useParcelsStore();

import { useRouter, useRoute } from 'vue-router';
const route = useRoute();
const router = useRouter();

import { ref, watch } from 'vue';

import useAddressRequest from '../composables/useAddressRequest.js';
const { addressRetrieved, fetchAddress } = useAddressRequest();

const address = ref('');

const handleSearch = () => {
  if (address.value) {
    router.push({ name: 'address', params: { address: address.value } });
  }
}

// Create a ref to store the previous route path
const previousRoutePath = ref('');

// Use the router's navigation guard to track route changes
router.beforeEach((to, from, next) => {
  previousRoutePath.value = from.fullPath;
  next();
});

// watch the route to know when to geocode
watch(route, (newValue, oldValue) => {
  if (newValue.params.address !== previousRoutePath.value) {
    fetchAddress(newValue.params.address)
      .then(console.log(addressRetrieved.features))
      // .then(console.log(address))
    // AddressStore.fillAddressData(newValue.params.address)
      // .then(getPwdParcel())
      // .then(ParcelsStore.fillPwdParcelData())
  }
});

// watch the geocode result to know when to get pwd parcels
watch(addressRetrieved, (newValue, oldValue) => {
  console.log('newValue.features:', newValue.features);
  // console.log('watch address data is firing, newValue.features[0].properties.pwd_parcel_nums[0]:', newValue.features[0].properties.pwd_parcel_nums[0]);
})

const getPwdParcel = () => {
  // console.log('AddressStore.addressData.value:', AddressStore.addressData.value);
  // const pwdParcelNumber = AddressStore.addressData.value.features[0].properties.pwd_account_nums[0];
  const pwdParcelNumber = newValue.features[0].properties.pwd_parcel_nums[0]
  console.log('in getPwdParcel, pwdParcelNumber:', pwdParcelNumber);
  ParcelsStore.fillPwdParcelData(pwdParcelNumber);
}

// const fetchAISData = async (address: string) => {
//   const baseURL = `https://api.phila.gov/ais/v1/search/${encodeURIComponent(address)}`;
//   const response = await fetch(baseURL)
//   const data = await response.json()
//   console.log('fetchAISData, address:', address, 'data:', data);
// }

</script>

<template>
  <main>
    <div class="container">
      <div class="columns">
        <input
          class="input column is-6"
          type="text"
          placeholder="Search an address"
          v-model="address"
        />
        <!-- I could not use a router-link here because the address is null at the start,
          and it would throw an error for a missing param
        -->
        <button
          class="button"
          @click="handleSearch"
        >
          Search
        </button>
      </div>

      <router-view v-slot="{ Component }">
        <component
          :is="Component"
        />
        <!-- :address="address" -->
      </router-view>

    </div>
  </main>
</template>