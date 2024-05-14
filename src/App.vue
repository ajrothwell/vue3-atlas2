<script setup>

import isMobileDevice from './util/is-mobile-device';

// STORES
import { useMainStore } from '@/stores/MainStore.js'
const MainStore = useMainStore();

if (!import.meta.env.VITE_PUBLICPATH) {
  MainStore.publicPath = '/';
} else {
  MainStore.publicPath = import.meta.env.VITE_PUBLICPATH;
}
console.log('import.meta.env.VITE_PUBLICPATH:', import.meta.env.VITE_PUBLICPATH, 'MainStore.publicPath:', MainStore.publicPath);
// import { getCurrentInstance } from 'vue'
// const app = getCurrentInstance()
// const $config = app.appContext.config.globalProperties.$config;
// import $config from '@/config';

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
  MainStore.isMobileDevice = isMobileDevice();
  await router.isReady()
  console.log('App onMounted, route.params.topic:', route.params.topic, 'route.params.address:', route.params.address);
  if (route.name === 'not-found') {
    router.push({ name: 'home' });
  }
  if (route.params.topic) {
    MainStore.currentTopic = route.params.topic;
  }
});

</script>

<template>
  <main>
    <!-- APP HEADER -->
    <div class="container mb-2">
      <h1 class="title is-1">Vue3 Atlas</h1>
    </div>

    <!-- MAIN CONTENT -->
    <div class="small-container">
      <div class="columns">

        <!-- TOPIC PANEL ON LEFT -->
        <div class="column is-6 pr-0 pb-0">
          <topic-panel></topic-panel>
        </div>

        <!-- MAP PANEL ON RIGHT - right now only contains the address input -->
        <div class="column is-6 p-0 p-0">
          <map-panel></map-panel>
        </div>
        
      </div>
    </div>
    <!-- FOOTER -->
  </main>
</template>

<style scoped>

.columns {
  display: flex;
}

@media screen and (max-width: 760px){

.columns {
   flex-direction: column-reverse;  
 }
}

</style>