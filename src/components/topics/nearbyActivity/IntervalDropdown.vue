<script setup>

import { ref, watch } from 'vue';

const $emit = defineEmits(['setTimeInterval']);

const props = defineProps({
  timeIntervals: Object,
})

const currentTimeInterval = ref(Object.keys(props.timeIntervals)[0]);

watch (() => currentTimeInterval.value, (newTimeInterval) => {
  $emit('setTimeInterval', newTimeInterval);
})

</script>

<template>

<div class="filter-div columns is-mobile">
  <div class="filter-label column is-3 small-is-4">Select time inverval:</div>
  <div class="dropdown column is-9 small-is-8">
    <dropdown
      v-model="currentTimeInterval"
      :options="timeIntervals"
    >
    </dropdown>
  </div>
</div>

</template>

<style scoped>

/* .filter-div {
  display: flex;
  align-items: center;
} */

</style>