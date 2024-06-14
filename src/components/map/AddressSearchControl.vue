<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

import { useMainStore } from '@/stores/MainStore.js'
const MainStore = useMainStore();

const router = useRouter();

const props = defineProps({
  inputId: String,
});

const inputAddress = ref('');

const fullScreenTopicsEnabled = computed(() => {
  return MainStore.fullScreenTopicsEnabled;
});
  
const fullScreenMapEnabled = computed(() => {
  return MainStore.fullScreenMapEnabled;
});
    
const holderWidth = computed(() => {
  if (fullScreenTopicsEnabled.value || fullScreenMapEnabled.value) {
    return '40%';
  } else {
    return '70%';
  }
});

const yPosition = computed(() => {
  if (fullScreenTopicsEnabled.value) {
    return '88px';
  } else {
    return '10px';
  }
});

</script>

<template>
  <div
    :class="fullScreenTopicsEnabled ? 'holder holder-topics' : 'holder holder-map'"
    :style="{ top: yPosition, width: holderWidth }"
  >
    <label :for="inputId" class="search-label">Search an address or OPA number</label>
    <input
      :id="inputId"
      class="input address-input"
      type="text"
      placeholder="Search an address or OPA number"
      v-model="inputAddress"
      @keydown.enter="router.replace({ name: 'search', query: { address: inputAddress }})"
    />
    <button
      class="button address-input-button"
      title="Address Search Button"
      @click="router.replace({ name: 'search', query: { address: inputAddress }})"
    >
      <font-awesome-icon :icon="['fas', 'search']" size="xl"/>
    </button>
  </div>

</template>

<style scoped>

.search-label {
  /* display: none !important */
  position: absolute;
  top: -9999px;
  left: -9999px;
}

.holder {
  position: absolute;
  display: flex;
  flex-direction: row;
}

.holder-map {
  left: 10px;
}

.holder-topics {
  right: 10px;
}

.address-input {
  border-style: solid;
  border-width: 1px;
  border-color: #0f4d90;
  background-color: white;
  border-radius: 3px;
  z-index: 2;
}

.address-input:hover {
  border-color: #0f4d90;
}

.address-input-button {
  height: 40px !important;
  width: 40px;
  z-index: 2;
  background-color: #0f4d90;
  color: white;
  padding-left: 6px;
  padding-top: 10px;
}

.address-input-button:hover {
  color: white;
}


</style>