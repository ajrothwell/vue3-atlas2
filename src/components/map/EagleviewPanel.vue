<script setup>

import { ref, onMounted } from 'vue';
import axios from 'axios';
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

onMounted( async() => {
  const response = await axios(options);
  const map = new window.ev.EmbeddedExplorer().mount('eagleview', { authToken: response.data.access_token });
  map.enableMeasurementPanel(false);
  map.enableSearchBar(false);
  map.setView({ lonLat: {lat: 39.953338, lon: -75.163471}, zoom: 16, pitch: 0, rotation: 0 }, (value) => {
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