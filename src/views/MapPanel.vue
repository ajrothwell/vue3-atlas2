<script setup>
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

import { ref, onMounted, provide, computed } from 'vue';

const emit = defineEmits(['mapLoaded', 'mapClicked']);

// COMPOSABLES
import useMapStyle from '@/composables/useMapStyle';
const {
  noMapStyle,
  pwdDrawnMapStyle,
  dorDrawnMapStyle,
  zoningDrawnMapStyle,
  imageryMapStyle,
  parcelLayerForTopic,
  topicStyles
} = useMapStyle();

let map;
const currentMarkers = [];
const currentMarkersForTopic = [];

onMounted(async () => {

  let currentTopicMapStyle;
  route.params.topic ? currentTopicMapStyle = MapStore.topicStyles[route.params.topic] : currentTopicMapStyle = pwdDrawnMapStyle;
  MapStore.currentTopicMapStyle = currentTopicMapStyle;

  let zoom;
  route.params.address ? zoom = 17 : zoom = 12;

  map = new maplibregl.Map({
    container: 'map',
    style: currentTopicMapStyle,
    center: [-75.163471, 39.953338],
    zoom: zoom,
    minZoom: 6,
    maxZoom: 22,
  });

  map.on('click', async(e) => {
    console.log('map click event:', e.lngLat, 'route.params.topic:', route.params.topic);
    let currentAddress;
    const parcelLayer = MapStore.parcelLayerForTopic[route.params.topic];
    await ParcelsStore.fillParcelDataByLngLat(e.lngLat.lng, e.lngLat.lat, parcelLayer);
    const addressField = parcelLayer === 'PWD' ? 'ADDRESS' : 'ADDR_SOURCE';
    console.log('parcelLayer:', parcelLayer, 'ParcelsStore[parcelLayer].features[0].properties[addressField]:', ParcelsStore[parcelLayer].features[0].properties[addressField]);
    currentAddress = ParcelsStore[parcelLayer].features[0].properties[addressField];
    console.log('currentAddress:', currentAddress);
    MainStore.setCurrentAddress(currentAddress);
    MainStore.setLastSearchMethod('mapClick');
    emit('mapClicked');
  });

  MapStore.setMap(map);
  emit('mapLoaded', map);
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