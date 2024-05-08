<script setup>

import { ref, reactive, computed, watch, onMounted } from 'vue';

const $emit = defineEmits(['setTimeInterval']);

const props = defineProps({
  timeIntervals: Object,
})

const timeDropdownOpen = ref(false);
const toggleTimeDropdown = () => timeDropdownOpen.value = !timeDropdownOpen.value;
const currentTimeInterval = ref(props.timeIntervals.values[0]);

const setTimeInterval = (interval) => {
  currentTimeInterval.value = interval;
  $emit('setTimeInterval', interval);
}

const timeIntervalLabel = computed(() => props.timeIntervals.labels[props.timeIntervals.values.indexOf(currentTimeInterval.value)]);


</script>

<template>

<div
  :class="timeDropdownOpen ? 'dropdown is-active' : 'dropdown'"
  @click="toggleTimeDropdown"
>
  <div class="dropdown-trigger">
    <button class="button" aria-haspopup="true" aria-controls="dropdown-menu">
      <span>From</span>
      <span class="icon is-small">
        <i class="fas fa-angle-down" aria-hidden="true"></i>
      </span>
    </button>
  </div>
  <div class="dropdown-menu" id="dropdown-menu" role="menu">
    <div class="dropdown-content">
      <a
        v-for="(item, index) of timeIntervals.values"
        class="dropdown-item"
        @click="setTimeInterval(item)"
      >
        {{ timeIntervals.labels[index] }}
      </a>
    </div>
  </div>
</div>
<span>{{ timeIntervalLabel }}</span>


</template>