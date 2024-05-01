<script setup>
import { computed } from 'vue';
import { useMainStore } from '@/stores/MainStore.js'
const MainStore = useMainStore();
import { useMapStore } from '@/stores/MapStore.js';
const MapStore = useMapStore();

defineEmits(['toggleImagery']);

const imgSrc = computed(() => {
  if (MapStore.imageryOn) {
    return MainStore.publicPath + 'images/basemap_small.png';
    // return import.meta.env.VITE_PUBLICPATH + 'images/basemap_small.png';
    // return 'images/basemap_small.png';
  } else {
    return MainStore.publicPath + 'images/imagery_small.png';
    // return import.meta.env.VITE_PUBLICPATH + 'images/imagery_small.png';
    // return 'images/imagery_small.png';
  }
});

</script>

<template>
  <div class="imagery-toggle">
    <button type="button" @click="$emit('toggleImagery')">
      <img class='img-src' :src="imgSrc" />
    </button>
  </div>
</template>

<style scoped>

.imagery-toggle {
  height: 36px;
  width: 36px;
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1000;
  border-radius: 5px;
  border-style: solid;
  border-width: 2px;
  border-color: rgb(167, 166, 166)
}

.img-src {
  max-width: 100%; 
  /* border-radius: 5px; */
}

</style>