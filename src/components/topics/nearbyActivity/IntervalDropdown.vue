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

<span>From</span>
<div class="dropdown">
  <dropdown
    v-model="currentTimeInterval"
    :options="timeIntervals"
  >
  </dropdown>
</div>

</template>