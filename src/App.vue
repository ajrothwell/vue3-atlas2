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
  <!-- <header>Atlas</header> -->
  <app-header
    class="header"
    app-title="Atlas"
    app-link="https://phila.gov"
  ></app-header>

  <!-- MAIN CONTENT -->
  <main class="main invisible-scrollbar">

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
  <!-- <footer>Footer</footer> -->
  <app-footer></app-footer>
</template>

<style>

body, html {
  min-height: 100vh;
  overflow-y: hidden !important;
}

#app {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow-y: hidden;
  justify-content: space-evenly;
}

header {
  display: flex;
  height: 68px;
  width: 100%;
  /* background-color: red; */
}

.main {
  /* flex-grow: 1; */
  height: calc(100vh - 38px);
  display: flex;
  flex-direction: row;
  padding-top: 0px !important;
  padding-bottom: 40px !important;
  margin-bottom: 10px !important;
  /* padding-left: 0px !important;
  padding-right: 0px !important;
  margin: 0px !important; */
  /* background-color: purple; */
}

.topics-holder {
  display: flex;
  flex-direction: column;
  width: 50% !important;
  padding: 0;
  margin: 0;
  /* margin-bottom: 40px; */
  /* background-color: orange; */
}

.address-holder {
  width: 100%;
  padding-left: 12px;
  padding-right: 12px;
  /* background-color: yellow; */
}

.topic-panel-content {
  flex-grow: 1;
  overflow-y: scroll;
  height: 250px;
  padding-left: 12px;
  padding-right: 12px;
  /* background-color: pink; */
}

.map-panel-holder {
  width: 50%;
  flex-grow: 1;
  margin-bottom: 0px;
  /* margin-top: 68px; */
  /* height: 200px; */
  /* background-color: green; */
}

footer {
  display: flex;
  width: 100%;
  height: 46px;
  /* background-color: blue; */
}

.invisible-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.invisible-scrollbar::-webkit-scrollbar {
  display: none;
}

/* main {
  padding-top: 0px !important;
}

.topic-panel-holder {
  min-height: 0px;
  padding: 0px !important;
  overflow-y: scroll;
  flex-grow: 1;
  position: relative;
}

.map-panel-holder {
  flex-grow: 1;
  padding: 0px !important;
}

.locations-and-map-panels-holder {
  flex-direction: row-reverse;
  flex-grow: 1;
  overflow-y: scroll;
  min-height: 0px;
  margin-left: 0px !important;
  margin-right: 0px !important;
  margin-bottom: 0px !important;
  margin-top: 0px !important;
}

.invisible-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.invisible-scrollbar::-webkit-scrollbar {
  display: none;
}


@media screen and (max-width: 760px){

.columns {
   flex-direction: row-reverse;  
 }
} */

</style>