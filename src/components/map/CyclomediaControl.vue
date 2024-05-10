<script setup>
import { useMainStore } from '@/stores/MainStore.js'
const MainStore = useMainStore();
import { useMapStore } from '@/stores/MapStore.js'
const MapStore = useMapStore();

import { computed } from 'vue';

defineEmits(['toggleCyclomedia']);

const imgSrc = computed(() => {
  return MainStore.publicPath + 'images/cyclomedia.png';
});

</script>

<template>
  <div class="cyclomedia-toggle" :class="MapStore.cyclomediaOn ? 'active' : 'inactive'">
    <button type="button" @click="$emit('toggleCyclomedia')">
      <img class='img-src' :src="imgSrc" />
    </button>
  </div>
</template>

<style scoped>

.active {
  background-color: rgb(243, 198, 19) !important;
}

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
}

</style>