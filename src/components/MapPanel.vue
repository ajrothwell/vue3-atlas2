<script setup>
import $config from '@/config';
// PACKAGE IMPORTS
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

// STORES
import { useMapStore } from '@/stores/MapStore.js';
const MapStore = useMapStore();
import { useMainStore } from '@/stores/MainStore.js'
const MainStore = useMainStore();
import { useAddressStore } from '@/stores/AddressStore.js'
const AddressStore = useAddressStore();
import { useCondosStore } from '@/stores/CondosStore.js'
const CondosStore = useCondosStore();
import { useRouter, useRoute } from 'vue-router';
import { useParcelsStore } from '@/stores/ParcelsStore';
const ParcelsStore = useParcelsStore();

// ROUTER
const route = useRoute();
const router = useRouter();

import { onMounted, computed, watch, watchEffect } from 'vue';
// const emit = defineEmits(['mapLoaded', 'mapClicked']);

let map;

const currentMarkersForTopic = computed(() => MapStore.currentMarkersForTopic);
const addressMarker = computed(() => MapStore.addressMarker);

const currentAddress = computed(() => MainStore.currentAddress);
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

const toggleImagery = () => {
  console.log('toggleImagery, map.getStyle:', map.getStyle());
  const style = map.getStyle();
  if (style.name === 'imageryMap') {
    map.setStyle(MapStore.currentTopicMapStyle);
  } else {
    map.setStyle(imageryMapStyle);
  }
}

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

  MapStore.setMap(map);
  // emit('mapLoaded', map);
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