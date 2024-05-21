<script setup>

import { ref, watch } from 'vue';

const $emit = defineEmits(['setSortby']);

const sortby = ref('distance');

watch(() => sortby.value, (newSortby) => {
  $emit('setSortby', sortby.value);
})

</script>

<template>
  <span>Sort by</span>
  <div class="dropdown">
    <dropdown
      v-model="sortby"
      :options="['distance', 'time']"
    >
    </dropdown>
  </div>

</template>
