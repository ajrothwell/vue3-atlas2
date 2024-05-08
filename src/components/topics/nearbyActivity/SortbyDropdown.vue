<script setup>

import { ref, reactive, computed, watch, onMounted } from 'vue';

const $emit = defineEmits(['setSortby']);

const sortbyDropdownOpen = ref(false);
const toggleSortbyDropdown = () => sortbyDropdownOpen.value = !sortbyDropdownOpen.value;
const sortby = ref('distance');
const setSortby = (newSortby) => {
  sortby.value = newSortby;
  $emit('setSortby', sortby.value);
}

</script>

<template>

  <div
    :class="sortbyDropdownOpen ? 'dropdown is-active' : 'dropdown'"
    @click="toggleSortbyDropdown"
  >
    <div class="dropdown-trigger">
      <button class="button" aria-haspopup="true" aria-controls="dropdown-menu">
        <span>Sort by</span>
        <span class="icon is-small">
          <i class="fas fa-angle-down" aria-hidden="true"></i>
        </span>
      </button>
    </div>
    <div class="dropdown-menu" id="dropdown-menu" role="menu">
      <div class="dropdown-content">
        <a class="dropdown-item" @click="setSortby('distance')">distance</a>
        <a class="dropdown-item" @click="setSortby('time')">time</a>
      </div>
    </div>
  </div>
  <span>{{ sortby }}</span>
  <br></br>

</template>
