<script setup>

import { ref, watch } from 'vue';

const $emit = defineEmits(['setTimeInterval']);

const props = defineProps({
  timeIntervals: {
    type: Object,
    default: () => ({}),
  },
})

const currentTimeInterval = ref(Object.keys(props.timeIntervals)[0]);

watch (() => currentTimeInterval.value, (newTimeInterval) => {
  $emit('setTimeInterval', newTimeInterval);
})

</script>

<template>
  <div class="filter-div columns is-mobile">
    <!-- <div class="filter-label column is-3 small-is-4">Select time inverval:</div> -->
    <div class="dropdown column is-10 small-is-9 pt-0 pb-0">
      <dropdown
        id="time-interval-dropdown"
        v-model="currentTimeInterval"
        label="Select time interval"
        :options="timeIntervals"
      />
    </div>
  </div>
</template>

<style scoped>

</style>