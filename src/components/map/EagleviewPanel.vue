<script setup>

import $config from '@/config';
import { onMounted, computed, watch } from 'vue';
import { point } from '@turf/helpers';
import axios from 'axios';

import { useMapStore } from '@/stores/MapStore';
// import { config } from 'maplibre-gl';
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
  if (MapStore.currentAddressCoords.length) {
    return { lat: MapStore.currentAddressCoords[1], lon: MapStore.currentAddressCoords[0] }
  } else {
    return { lat: $config.cityCenterCoords[1], lon: $config.cityCenterCoords[0] };
  }
});

let map;

const eagleviewProperties = {
  "eagleview": {
    "subType": "Marker",
    "icon": "FaMapMarkerAlt",
    "style": {
      "color": "#2c63c7",
      "size": 34,
    }
  }
};

watch(
  () => currentAddressCoords.value,
  newValue => {
    if (newValue) {
      console.log('currentAddressCoords changed:', newValue);
      map.setView({ lonLat: newValue });
      map.removeFeatures();
      map.addFeatures({
        geoJson: [
          point(
            [newValue.lon, newValue.lat],
            eagleviewProperties
          )
        ]
      });
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
    console.log('eagleview view has been set, value:', value)
  });
  if (MapStore.currentAddressCoords.length) {
    map.addFeatures({
      geoJson: [
        point(
          [currentAddressCoords.value.lon, currentAddressCoords.value.lat],
          eagleviewProperties
        )
      ]
    });
  }

  // map.on('onViewUpdate', (value) => {
    // console.log('eagleview view has been updated, value:', value);
    // if (value.zoom < 18) {
      // map.setView({ zoom: 18, lonLat: value.lonLat, pitch: value.pitch, rotation: value.rotation });
    // }
  // });
});

</script>

<template>
  <div
    id="eagleview"
    class="eagleview-div"
  />
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