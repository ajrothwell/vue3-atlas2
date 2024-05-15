<script setup>

import { useMapStore } from '@/stores/MapStore.js'
const MapStore = useMapStore();
import Map from '@/components/map/Map.vue';

import { computed } from 'vue';

const mapPanelClass = computed(() => {
  if (MapStore.cyclomediaOn || MapStore.pictometryOn) {
    return 'map-panel cyclomedia-pictometry';
  } else {
    return 'map-panel';
  }
  return 
});

</script>

<template>
  <div id="map-panel" :class="mapPanelClass">
    <Map></Map>
  </div>
</template>

<style>

</style>