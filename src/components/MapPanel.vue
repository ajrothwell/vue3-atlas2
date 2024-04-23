<script setup>
import $config from '@/config';
// PACKAGE IMPORTS
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { ControlPosition, IControl } from 'maplibre-gl';

// STORES
import { useMapStore } from '@/stores/MapStore.js';
const MapStore = useMapStore();
import { useMainStore } from '@/stores/MainStore.js'
const MainStore = useMainStore();
import { useAddressStore } from '@/stores/AddressStore.js'
const AddressStore = useAddressStore();

// ROUTER
import { useRouter, useRoute } from 'vue-router';
const route = useRoute();
const router = useRouter();

import { ref, onMounted, computed, watch, watchEffect } from 'vue';

import useImageryToggleControl from '@/composables/useImageryToggleControl.js';
const { imageryToggleControl } = useImageryToggleControl();

let map;

watch(
  () => AddressStore.addressData,
  newAddress => {
  console.log('MapStore address watch, newAddress:', newAddress, 'MapStore.addressMarker:', MapStore.addressMarker);
  const oldAddressMarker = MapStore.addressMarker;
  if (oldAddressMarker) {
    oldAddressMarker.remove();
  }
  const coordinates = AddressStore.addressData.features[0].geometry.coordinates;
  const newAddressMarker = new maplibregl.Marker()
    .setLngLat(coordinates)
    .addTo(map);
  MapStore.addressMarker = newAddressMarker;
  if (MainStore.lastSearchMethod === 'address') {
    map.setCenter(coordinates);
    map.setZoom(17);
  }
});

watch(
  () => route.params.topic,
  async newTopic => {
    console.log('MapStore watch topic, newTopic:', newTopic);
    if (newTopic) {
      MapStore.currentTopicMapStyle = $config.topicStyles[newTopic];
      map.setStyle($config[MapStore.currentTopicMapStyle]);
    }
  }
)

onMounted(async () => {
  let currentTopicMapStyle;
  route.params.topic ? currentTopicMapStyle = $config.topicStyles[route.params.topic] : currentTopicMapStyle = 'pwdDrawnMapStyle';
  MapStore.currentTopicMapStyle = currentTopicMapStyle;

  let zoom;
  route.params.address ? zoom = 17 : zoom = 12;

  map = new maplibregl.Map({
    container: 'map',
    style: $config[currentTopicMapStyle],
    center: [-75.163471, 39.953338],
    zoom: zoom,
    minZoom: 6,
    maxZoom: 22,
  });

  map.on('click', async(e) => {
    console.log('map click event:', e.lngLat, 'route.params.topic:', route.params.topic);
    MainStore.setLastSearchMethod('mapClick');
    router.push({ name: 'search', query: { lng: e.lngLat.lng, lat: e.lngLat.lat }})
  });

  map.addControl(imageryToggleControl, 'top-right');

  MapStore.setMap(map);
});

</script>

<template>
  <div id="map-panel">
    <div id="map" class="map-class" />
  </div>
</template>

<style scoped>
.map-class {
  height: 100vh;
}
</style>