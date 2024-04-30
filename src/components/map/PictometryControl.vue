<script setup>
import { computed } from 'vue';
// import { useMapStore } from '@/stores/MapStore.js';
// const MapStore = useMapStore();

defineEmits(['togglePictometry']);

const imgSrc = computed(() => {
  return import.meta.env.VITE_PUBLICPATH + 'images/pictometry.png';
});

</script>

<template>
  <div class="pictometry-toggle">
    <button type="button" @click="$emit('togglePictometry')">
      <img class='img-src' :src="imgSrc" />
    </button>
  </div>
</template>

<style scoped>

.pictometry-toggle {
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
  padding-left: 3px;
  padding-top: 2px;
  /* border-radius: 5px; */
}

</style>