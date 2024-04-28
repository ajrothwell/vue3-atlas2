<script setup>

import { useMapStore } from '@/stores/MapStore.js'
const MapStore = useMapStore();
import Map from '@/components/Map.vue';

</script>

<template>
  <div id="map-panel">
    <Map></Map>
  </div>
</template>