<script setup>
// import { getCurrentInstance } from 'vue'
// const app = getCurrentInstance()
// const $config = app.appContext.config.globalProperties.$config;
// import $config from '@/config';

// STORES
import { useMainStore } from '@/stores/MainStore.js'
const MainStore = useMainStore();

// ROUTER
import { useRouter, useRoute } from 'vue-router';
const route = useRoute();
const router = useRouter();

import { ref, onMounted, provide, computed } from 'vue';

// COMPONENTS
import TopicPanel from '@/components/TopicPanel.vue';
import MapPanel from '@/components/MapPanel.vue';

const inputAddress = ref('');

onMounted(async () => {
  if (route.name === 'not-found') {
    router.push({ name: 'home' });
  }
  if (route.params.address) {
    inputAddress.value = route.params.address;
  }
});

</script>

<template>
  <main>
    <!-- APP HEADER -->
    <div class="container">
      <h1 class="title is-1">Vue3 Atlas</h1>
    </div>
    <div class="container">
      <div class="columns">
        <div class="column is-10">
          <input
            class="input"
            type="text"
            placeholder="Search an address"
            v-model="inputAddress"
            @keydown.enter="router.replace({ name: 'search', query: { address: inputAddress }})"
          />
        </div>
        <button
          class="button"
          @click="router.replace({ name: 'search', query: { address: inputAddress }})"
        >
          Search
        </button>
      </div>
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
          <map-panel></map-panel>
        </div>
        
      </div>
    </div>
    <!-- FOOTER -->
  </main>
</template>

<style scoped>

</style>