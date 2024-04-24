<script setup>

  import { useMapStore } from '@/stores/MapStore.js'
  const MapStore = useMapStore();
  import Map from '@/components/Map.vue';
  import AddressSearchControl from '@/components/map/AddressSearchControl.vue';
</script>

<template>
  <div id="map-panel">
    <Map>
      <AddressSearchControl></AddressSearchControl>
    </Map>
  </div>
</template>