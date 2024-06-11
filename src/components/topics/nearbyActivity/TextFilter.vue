
<script setup>

import { useMainStore } from '@/stores/MainStore';
const MainStore = useMainStore();

const $emit = defineEmits(['setTextFilter', 'clearTextFilter']);

const model = defineModel();
const clearText = () => model.value = '';

</script>

<template>
  <div class="filter-div columns is-mobile">
    <!-- <div class="filter-label column is-3 small-is-4 pt-0 pb-0">Search by text:</div> -->
    <div class="column is-10 small-is-9 pr-0 pt-0 pb-0">
      <textbox
        placeholder="text"
        label="Search by text"
        :innerLabel="false"
        v-model="model"
        class="search-box"
        id="searchBar"
      >
      </textbox>
    </div>
    <div class="column is-2 small-is-2 pl-0">
      <button
        v-if="model !== null && model !== ''"
        type="submit"
        class="button clear-button"
        @click="clearText"
      >
        <span class="clear-span pl-0" v-if="!MainStore.isMobileDevice">CLEAR</span>
        <i class="fas fa-times-circle"></i>
      </button>
    </div>
  </div>
</template>

<style scoped>
  
.clear-span {
  padding-left: 0px !important;
}

button.button.clear-button {
  /* position: relative;
  right: -240px;
  top: -50px; */
  width: 86px;
  font-size: 12px !important;
  border: none;
  background: #96c9ff;
  color: #444444;
  border-radius: 40px !important;
  padding: 3px;
  padding-left: 0px;
  margin-top: 30px;
  height: 15px;
  i {
    margin-left: 5px;
  }
  &:focus {
    box-shadow: none !important;
  }
}

@media 
only screen and (max-width: 760px)
{

  button.button.clear-button {
    width: 40px;
    padding: 8px;
  }
}


</style>