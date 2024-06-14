
<script setup>

import { ref, computed, onMounted, watch } from 'vue';

import { useMainStore } from '@/stores/MainStore';
const MainStore = useMainStore();
import { useMapStore } from '@/stores/MapStore';
const MapStore = useMapStore();

onMounted(() => {
  setYPosition(MainStore.windowDimensions.height);
  setXPosition(MainStore.windowDimensions.width);
});

const buttonY = ref(0);
const buttonX = ref(0);

watch(
  () => MainStore.windowDimensions,
  newWindowDimensions => {
    // console.log('newWindowDimensions.height:', newWindowDimensions.height);
    setYPosition(newWindowDimensions.height);
    setXPosition(newWindowDimensions.width);
  }
)

const fullScreenMapEnabled = computed(() => {
  return MainStore.fullScreenMapEnabled;
});

const fullScreenTopicsEnabled = computed(() => {
  // console.log('this.$store.state.fullScreenTopicsEnabled:', this.$store.state.fullScreenTopicsEnabled);
  return MainStore.fullScreenTopicsEnabled;
});

const isMobileOrTablet = computed(() =>{
  return MainStore.isMobileDevice;
});

const cyclomediaActive = computed(() => {
  return MapStore.cyclomediaOn;
});

const eagleviewActive = computed(() => {
  return MapStore.eagleviewOn;
});

const picOrCycloActive = computed(() => {
  // console.log('cyclomediaActive:', cyclomediaActive, 'eagleviewActive:', eagleviewActive);
  if (cyclomediaActive.value || eagleviewActive.value) {
    return true;
  }
  return false;
});

watch (
  () => picOrCycloActive.value,
  newPicOrCycloActive => {
    // console.log('newPicOrCycloActive:', newPicOrCycloActive);
    setYPosition(MainStore.windowDimensions.height);
    setXPosition(MainStore.windowDimensions.width);
  }
)

const currentIcon = computed(() => {
  if (fullScreenMapEnabled.value) {
    return 'caret-right';
  }
  return 'caret-left';
});
  
const setYPosition = (dim) => {
  // console.log('setYPosition dim:', dim, typeof dim);
  if (!picOrCycloActive.value) {
    buttonY.value = (dim-48)/2 + 'px';
  } else {
    buttonY.value = (dim-48)/4 + 'px';
  }
}

const setXPosition = async (dim) => {
  // console.log('setXPosition dim:', dim, typeof dim);
  if (fullScreenMapEnabled.value) {
    buttonX.value = '0px';
  } else {
    buttonX.value = dim/2 + 'px';
  }
}

const handleFullScreenMapToggleButtonClick = (e) => {
  const prevFullScreenMapEnabled = MainStore.fullScreenMapEnabled;
  const nextFullScreenMapEnabled = !prevFullScreenMapEnabled;
  MainStore.fullScreenMapEnabled = nextFullScreenMapEnabled;
  if (nextFullScreenMapEnabled) {
    buttonX.value = '0px';
  } else {
    buttonX.value = MainStore.windowDimensions.width/2 + 'px';
  }
}

</script>

<template>
  <div
    v-if="!isMobileOrTablet"
    id="toggle-tab"
    :title="fullScreenMapEnabled ? 'Reduce Map Panel' : 'Expand Map Panel'"
    :style="{ top: buttonY, left: buttonX }"
    class="toggle-tab"
    @click="handleFullScreenMapToggleButtonClick"
    @keydown.enter="handleFullScreenMapToggleButtonClick"
    tabindex="0"
  >
    <span class="align-span">
      <font-awesome-icon
        :icon="currentIcon"
        class="fa-2x"
      />
    </span>
  </div>
</template>

<style scoped>

  .toggle-tab {
    display: none;
    padding-top: 9px;
  }

  .align-span {
    margin-left: 6px;
  }

  @media screen and (min-width: 761px) {
    .toggle-tab {
      position: absolute;
      left: 0px;
      border-width: 1.3px;
      border-style: solid;
      border-color: #CAC9C9;
      height: 48px;
      /* line-height: 56px; */
      width:24px;
      background-color: white;
      display: inline-block;
      z-index: 500;
      opacity: 0.7;
    }
  }

</style>
