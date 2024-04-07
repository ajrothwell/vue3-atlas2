<script setup>


import { useRouter, useRoute } from 'vue-router';
const route = useRoute();
const router = useRouter();

import { ref, watch } from 'vue';

import useAddressSearch from '@/composables/useAddressSearch';
const { addressSearch } = useAddressSearch();

const address = ref('');

const handleAddressSearch = () => {
  // console.log('route.params:', route.params);
  if (address.value && route.params.topic) {
    router.push({ name: 'address-and-topic', params: { address: address.value, topic: route.params.topic } });
  } else if (address.value) {
    router.push({ name: 'address-and-topic', params: { address: address.value, topic: 'Property' } });
  }
}

// Use the router's navigation guard to track route changes
router.beforeEach(async (to, from) => {
  console.log('to:', to, 'from:', from);
  if (to.params.address !== from.params.address) {
    addressSearch(to.params.address);
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
          @click="handleAddressSearch"
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