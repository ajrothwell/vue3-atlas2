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

  const main = document.getElementById('main');
  main.scrollTop = -main.scrollHeight;
});

const links = [
  {
    type: 'native',
    href: 'https://phila.formstack.com/forms/atlas_feedback_form',
    text: 'Feedback',
    attrs: {
      target: '_blank',
    },
  },
];

</script>

<template>
  <!-- class="header" -->
  <app-header
    app-title="Atlas"
    app-link="https://phila.gov"
    :is-sticky="true"
    :is-fluid="true"
  >
    <template #mobile-nav>
      <mobile-nav :links="links"></mobile-nav>
    </template>
      
  </app-header>

  <!-- MAIN CONTENT -->
  <main id="main" class="main invisible-scrollbar">

    <!-- TOPIC PANEL ON LEFT -->
    <div class="topics-holder">
      <topic-panel></topic-panel>
    </div>

    <!-- MAP PANEL ON RIGHT - right now only contains the address input -->
    <div class="map-panel-holder">
      <map-panel></map-panel>
    </div>
      
  </main>

  <!-- FOOTER -->
  <app-footer
    class="is-hidden-mobile"
    :is-sticky="true"
    :is-hidden-mobile="true"
    :links="links"
  ></app-footer>
</template>

<style>

</style>