<script setup>

  import { useMapStore } from '@/stores/MapStore.js'
  const MapStore = useMapStore();
  import Map from '@/components/Map.vue';
  import AddressSearchControl from '@/components/map/AddressSearchControl.vue';
</script>

<template>
  <Map>
    <!-- <AddressSearchControl v-if="MapStore.initialized"></AddressSearchControl> -->
    <AddressSearchControl></AddressSearchControl>
  </Map>
</template>