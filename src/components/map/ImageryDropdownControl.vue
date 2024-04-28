<script setup>
import { ref, computed } from 'vue';
// import $config from '@/config';
import { useMapStore } from '@/stores/MapStore.js';
const MapStore = useMapStore();

const $emit = defineEmits(['setImagery']);
const dropdownValue = ref('2023');

const imageryDropdownOpen = ref(false);
const toggleImageryDropdown = () => imageryDropdownOpen.value = !imageryDropdownOpen.value;

const emitValue = (value) => {
  dropdownValue.value = value;
  $emit('setImagery', value);
  imageryDropdownOpen.value = false;
}

</script>

<template>
  <div
    :class="imageryDropdownOpen ? 'is-active' : ''"
    class="imagery-dropdown dropdown"
    @click="toggleImageryDropdown"
  >
    <div class="dropdown-trigger">
      <button class="button" aria-haspopup="true" aria-controls="dropdown-menu">
        <span>{{ dropdownValue }}</span>
        <span class="icon is-small">
          <i class="fas fa-angle-down" aria-hidden="true"></i>
        </span>
      </button>
    </div>
    <div class="dropdown-menu" id="dropdown-menu" role="menu">
      <div class="dropdown-content">
        <a class="dropdown-item" @click="emitValue('2023')">2023</a>
        <a class="dropdown-item" @click="emitValue('2022')">2022</a>
        <a class="dropdown-item" @click="emitValue('2020')">2020</a>
        <a class="dropdown-item" @click="emitValue('2019')">2019</a>
        <a class="dropdown-item" @click="emitValue('2018')">2018</a>
        <a class="dropdown-item" @click="emitValue('2017')">2017</a>
        <a class="dropdown-item" @click="emitValue('2016')">2016</a>
        <a class="dropdown-item" @click="emitValue('2015')">2015</a>
        <a class="dropdown-item" @click="emitValue('2012')">2012</a>
        <a class="dropdown-item" @click="emitValue('2010')">2010</a>
        <a class="dropdown-item" @click="emitValue('2008')">2008</a>
        <a class="dropdown-item" @click="emitValue('2004')">2004</a>
        <a class="dropdown-item" @click="emitValue('1996')">1996</a>
        <a class="dropdown-item" @click="emitValue('1962')">1962</a>
        <a class="dropdown-item" @click="emitValue('1942')">1942</a>
        <a class="dropdown-item" @click="emitValue('1910')">1910</a>
        <a class="dropdown-item" @click="emitValue('1895')">1895</a>
        <a class="dropdown-item" @click="emitValue('1875')">1875</a>
        <a class="dropdown-item" @click="emitValue('1860')">1860</a>
      </div>
    </div>
  </div>
</template>

<style>

.imagery-dropdown {
  position: absolute;
  top: 10px;
  right: 70px;
  z-index: 1000;
}

.img-src {
  max-width: 100%; 
  border-radius: 5px;
}

/* .imagery-dropdown .dropdown-menu {
  width: 100px !important;
} */

.imagery-dropdown .dropdown-menu .dropdown-content {
  width: 100px !important;
  height: 300px;
  overflow-y: auto;
}

</style>