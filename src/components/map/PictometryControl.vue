<script setup>
import { computed } from 'vue';
import { useMainStore } from '@/stores/MainStore.js'
const MainStore = useMainStore();
import { useMapStore } from '@/stores/MapStore.js';
const MapStore = useMapStore();

defineEmits(['togglePictometry']);

const imgSrc = computed(() => {
  return MainStore.publicPath + 'images/pictometry.png';
  // return import.meta.env.VITE_PUBLICPATH + 'images/pictometry.png';
  // return 'images/pictometry.png';
});

</script>

<template>
  <div class="pictometry-toggle" :class="MapStore.pictometryOn ? 'active' : 'inactive'">
    <button type="button" @click="$emit('togglePictometry')">
      <img class='img-src' :src="imgSrc" />
    </button>
  </div>
</template>

<style scoped>

.active {
  background-color: rgb(243, 198, 19) !important;
}

button {
  background-color: transparent;
  border: none;
}

.pictometry-toggle {
  height: 36px;
  width: 36px;
  position: absolute;
  top: 52px;
  right: 10px;
  z-index: 2;
  background-color: white;
  border-radius: 5px;
  border-style: solid;
  border-width: 2px;
  border-color: rgb(167, 166, 166)
}

.img-src {
  max-width: 300%;
  width: 25px;
  height: 29px;
  margin-left: -2px;
}

</style>