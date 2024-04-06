<script setup>

import { useAddressStore } from '@/stores/AddressStore.js'
const AddressStore = useAddressStore();
import { useParcelsStore } from '@/stores/ParcelsStore.js'
const ParcelsStore = useParcelsStore();
import { useOpaStore } from '@/stores/OpaStore.js'
const OpaStore = useOpaStore();

import { useRouter, useRoute } from 'vue-router';
const route = useRoute();
const router = useRouter();

import { ref, watch } from 'vue';

// import useAddressRequest from '../composables/useAddressRequest.js';
// const { addressRetrieved, fetchAddress } = useAddressRequest();

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
watch(route, async (newValue, oldValue) => {
  if (newValue.params.address !== previousRoutePath.value) {
    await AddressStore.fillAddressData(newValue.params.address);
    await ParcelsStore.fillPwdParcelData();
    await OpaStore.fillOpaData();
  }
});

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
      </router-view>

    </div>
  </main>
</template>