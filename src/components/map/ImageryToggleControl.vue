<script setup>
import { computed } from 'vue';
import { useMapStore } from '@/stores/MapStore.js';
const MapStore = useMapStore();

defineEmits(['toggleImagery']);

const imgSrc = computed(() => {
  if (MapStore.imageryOn) {
    return import.meta.env.VITE_PUBLICPATH + 'images/basemap_small.png';
  } else {
    return import.meta.env.VITE_PUBLICPATH + 'images/imagery_small.png';
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
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1000;
}

.img-src {
  max-width: 100%; 
  border-radius: 5px;
}

</style>