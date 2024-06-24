<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

import { useMainStore } from '@/stores/MainStore.js'
const MainStore = useMainStore();

const router = useRouter();

defineProps({
  inputId: {
    type: String,
    default: 'address-search-input',
  },
});

const inputAddress = ref('');

const clearAddress = () => {
  if (import.meta.env.VITE_DEBUG == 'true') console.log('clearAddress is running');
  inputAddress.value = '';
}

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
    <div class="field has-addons" :style="{ width: '100%' }">
      <div class="control has-icons-right" :style="{ width: '100%' }">
        <label
          :for="inputId"
          class="search-label"
        >Search an address or OPA number</label>
        <input
          :id="inputId"
          v-model="inputAddress"
          class="input address-input"
          type="text"
          placeholder="Search an address or OPA number"
          @keydown.enter="router.replace({ name: 'search', query: { address: inputAddress }})"
        >
        <button
          v-if="inputAddress != ''"
          class="clear-button icon is-small is-right"
          @click="clearAddress"
        >
          <font-awesome-icon
            :icon="['fas', 'times']"
            size="xl"
          />
        </button>
      </div>
    <!-- </div> -->
      <div class="control">
          <button
            class="button is-info address-input-button"
            type="submit"
            title="Address Search Button"
            @click="router.replace({ name: 'search', query: { address: inputAddress }})"
          >
            <i class="fas fa-search"></i>
            <!-- <font-awesome-icon
              :icon="['fas', 'search']"
              size="l"
            /> -->
          </button>
        <!-- </p> -->
      </div>
    </div>
  </div>
</template>

<style scoped>

.clear-button {
  background-color: transparent;
  border-style: none;
  z-index: 1000000;
}

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

.address-input-button {
  height: 2.5em !important;
  border-top-right-radius: 4px !important;
  border-bottom-right-radius: 4px !important;
  z-index: 2;
}

.address-input:hover {
  border-color: #0f4d90;
}

/* .address-input-button {
  height: 40px !important;
  width: 40px;
  z-index: 2;
  background-color: #0f4d90;
  color: white;
  padding-left: 6px;
  padding-top: 10px;
} */

.address-input-button:hover {
  color: white;
}


</style>