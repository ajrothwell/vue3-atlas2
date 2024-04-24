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


</style>