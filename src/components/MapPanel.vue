<script setup>

import { useMapStore } from '@/stores/MapStore.js'
const MapStore = useMapStore();
import Map from '@/components/Map.vue';
import CyclomediaPanel from '@/components/map/CyclomediaPanel.vue';

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
    <keep-alive><CyclomediaPanel v-if="MapStore.cyclomediaOn"></CyclomediaPanel></keep-alive>
  </div>
</template>

<style scoped>

.map-panel {
  height: 89vh;
}

.map-panel.cyclomedia-pictometry {
  height: 45vh;
}

</style>