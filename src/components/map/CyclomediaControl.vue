<script setup>
import { useMainStore } from '@/stores/MainStore.js'
const MainStore = useMainStore();

import { computed } from 'vue';

defineEmits(['toggleCyclomedia']);

const imgSrc = computed(() => {
  return MainStore.publicPath + 'images/cyclomedia.png';
  // return import.meta.env.VITE_PUBLICPATH + 'images/cyclomedia.png';
  // return 'images/cyclomedia.png';
});

</script>

<template>
  <div class="cyclomedia-toggle">
    <button type="button" @click="$emit('toggleCyclomedia')">
      <img class='img-src' :src="imgSrc" />
    </button>
  </div>
</template>

<style scoped>

.cyclomedia-toggle {
  height: 36px;
  width: 36px;
  position: absolute;
  top: 94px;
  right: 10px;
  z-index: 1000;
  background-color: white;
  border-radius: 5px;
  border-style: solid;
  border-width: 2px;
  border-color: rgb(167, 166, 166)
}

.img-src {
  max-width: 100%;
  padding-left: 4px;
  /* border-radius: 5px; */
}

</style>