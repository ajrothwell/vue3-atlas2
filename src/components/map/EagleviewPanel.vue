<script setup>

import { onMounted, computed, watch } from 'vue';
import axios from 'axios';

import { useMainStore } from '@/stores/MainStore';
const MainStore = useMainStore();
import { useMapStore } from '@/stores/MapStore';
const MapStore = useMapStore();

const clientId = import.meta.env.VITE_EAGLEVIEW_CLIENT_ID;
const clientSecret = import.meta.env.VITE_EAGLEVIEW_CLIENT_SECRET;
const options = {
  method: 'POST',
  headers: {
    'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret),
    'Accept': 'application/json',
    'content-type': 'application/x-www-form-urlencoded'
  },
  data: 'grant_type=client_credentials',
  url: 'https://api.eagleview.com/auth-service/v1/token',
};

const currentAddressCoords = computed(() => {
  if (MapStore.currentAddressCoords) {
    return { lat: MapStore.currentAddressCoords[1], lon: MapStore.currentAddressCoords[0] }
  } else {
    return { lat: 39.926305, lon: -75.162278 };
  }
});

let map;

watch(
  () => currentAddressCoords.value,
  newValue => {
    if (newValue) {
      console.log('currentAddressCoords changed:', newValue);
      map.setView({ lonLat: currentAddressCoords.value });
    }
  }
);

onMounted( async() => {
  const response = await axios(options);
  localStorage.clear();
  map = new window.ev.EmbeddedExplorer().mount('eagleview', { authToken: response.data.access_token });
  map.enableMeasurementPanel(false);
  map.enableSearchBar(false);
  map.setView({ lonLat: currentAddressCoords.value, zoom: 17, pitch: 0, rotation: 0 }, (value) => {
    console.log('View has been set, value:', value)
  });
  // map.setView({ lonLat: {lat: 39.926305, lon: -75.162278}, zoom: 16, pitch: 0, rotation: 0 }, (value) => console.log('View has been set, value:', value));
  map.on('onViewUpdate', (value) => {
    console.log('View has been updated, value:', value);
    // if (value.zoom < 18) {
      // map.setView({ zoom: 18, lonLat: value.lonLat, pitch: value.pitch, rotation: value.rotation });
    // }
  });
});
</script>

<template>
  <div id='eagleview' class="eagleview-div"></div>
</template>

<style>

.eagleview-div {
  position: relative;
  height: 100%;
  width: 100%;
}

.ev-embedded-explorer_container {
  height: 100%;
  width: 100%;
}

</style>