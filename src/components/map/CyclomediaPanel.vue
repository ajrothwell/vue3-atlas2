<script setup>
console.log('CyclomediaPanel.vue setup');
import { ref, onMounted } from 'vue';

onMounted( () => {
  console.log('CyclomediaPanel.vue onMounted');
})

</script>

<template>
  <div class="cyclomedia-panel">
    <div
      id="cycloviewer"
      ref="cycloviewer"
      class="panoramaViewerWindow"
    />
  </div>
</template>

<style scoped>

.cyclomedia-panel {
  height: 100%;
  width: 100%;
  /* display: none; */
}

.panoramaViewerWindow {
  display: block;
  width: 100%;
  height:100%;
}

</style>