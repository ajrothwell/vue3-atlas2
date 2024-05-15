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
  <app-header
    class="header"
    app-title="Atlas"
    app-link="https://phila.gov"
    :is-fluid="true"
    :is-sticky="false"
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
  <app-footer
    :is-sticky="true"
    :is-hidden-mobile="true"
    :links="[{
      text: 'City of Philadelphia',
      url: 'https://www.phila.gov'
    }]"
  ></app-footer>
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
  /* height: 68px; */
  width: 100%;
  /* background-color: red; */
}

.main {
  /* flex-grow: 1; */
  height: calc(100vh - 38px);
  display: flex;
  flex-direction: row;
  padding-top: 0px !important;
  /* padding-bottom: 40px !important; */
  /* margin-bottom: 10px !important; */
  margin-top: 0px !important;
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
  height: calc(100vh - 238px);
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
  padding-left: 12px;
  padding-right: 12px;
  min-height: calc(100vh - 183px);
  /* padding-bottom: 30px; */
  /* margin-bottom: 40px; */
  /* height: 250px; */
  /* background-color: pink; */
}

/* .topics {
  overflow-y: scroll;
  height: 100%;
  flex-grow: 1;
  height: 250px;
  padding-bottom: 50px;
} */

.map-panel-holder {
  width: 50%;
  flex-grow: 1;
  margin-bottom: 0px;
  /* margin-top: 68px; */
  /* height: 200px; */
  /* background-color: green; */
}

#app-footer {
  /* height: 46px !important; */
}

footer .container {
  /* display: flex;
  width: 100%; */
  /* height: 46px; */
  /* background-color: blue; */
}

.topic {
  height: 2em;
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  font-size: 2em;
}

.address-holder {
  color: #0f4d90 !important;
  background-color: #DAEDFe;
  display: flex;
  flex-direction: column;
  padding-left: 2.25em;
  padding-bottom: .5em;
  padding-top: .5em;

  h3 {
    color: #0f4d90 !important;
  }
}

.address {
  display: inline-block;
  padding-left: .25em;
}

/* .topic-panel-content {
  padding-left: 1.25em;
  padding-right: 1em;
  flex-grow: 1;
} */

.invisible-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.invisible-scrollbar::-webkit-scrollbar {
  display: none;
}

.map-panel {
  /* height: 85vh; */
  height: calc(100vh - 103px);
}

.map-panel.cyclomedia-pictometry {
  height: 45vh;
}

#map {
  /* position: relative; */
  /* padding-bottom: 40px; */
}

.map-class {
  height: 100%;
  /* height: 80%; */
}




@media screen and (max-width: 760px){

  body, html {
    min-height: 100vh;
    overflow-y: scroll;
  }

  #app {
    height: 100vh;
    display: flex;
    flex-direction: column;
    overflow-y: scroll;
    justify-content: space-evenly;
  }

  header {
    display: flex;
    /* height: 68px; */
    width: 100%;
    /* background-color: red; */
  }

  .main {
    height: 180%;
    display: flex;
    flex-direction: column-reverse;
    padding-top: 0px !important;
    padding-bottom: 40px !important;
    margin-bottom: 10px !important;
    margin-top: 0px !important;
  }

  .topics-holder {
    display: flex;
    flex-direction: column;
    width: 100% !important;
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
    overflow-y: hidden;
    padding-left: 12px;
    padding-right: 12px;
    min-height: calc(100vh - 38px);
    /* height: 250px; */
    /* background-color: pink; */
  }

  /* .topics {
    overflow-y: scroll;
    height: 100%;
    flex-grow: 1;
    height: 250px;
    padding-bottom: 50px;
  } */

  .map-panel-holder {
    width: 100%;
    flex-grow: 1;
    margin-bottom: 0px;
    /* margin-top: 68px; */
    /* height: 200px; */
    /* background-color: green; */
  }

  /* footer {
    position: relative;
    display: flex;
    width: 100%;
    height: 46px; */
    /* background-color: blue;
  } */

  .topic {
    height: 2em;
    background-color: #f0f0f0;
    border: 1px solid #ccc;
    font-size: 2em;
  }

  .address-holder {
    color: #0f4d90 !important;
    background-color: #DAEDFe;
    display: flex;
    flex-direction: column;
    padding-left: 2.25em;
    padding-bottom: .5em;
    padding-top: .5em;

    h3 {
      color: #0f4d90 !important;
    }
  }

  .address {
    display: inline-block;
    padding-left: .25em;
  }

  /* .topic-panel-content {
    padding-left: 1.25em;
    padding-right: 1em;
    flex-grow: 1;
  } */

  .map-panel {
    height: 300px;
  }

  .map-class {
    height: 300px;
  }

}

</style>