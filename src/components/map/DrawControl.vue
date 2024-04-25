<script setup>
// import MapboxDraw from '@mapbox/mapbox-gl-draw'
// import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'
import { ref, computed } from 'vue';
import { useMapStore } from '@/stores/MapStore.js';
const MapStore = useMapStore();
const map = MapStore.map;

const mode = ref('simple_select');
const selected = ref(null);
const toggledOn = ref(false);

const shouldShowDistanceBox = computed(() => {
  let booleanMode = mode !== 'simple_select';
  let booleanSelected = selected !== null;
  let booleanToggledOn = toggledOn;
  let booleanTotal;
  if (booleanMode && booleanToggledOn || booleanSelected && booleanToggledOn) {
    booleanTotal = true;
  } else {
    booleanTotal = false;
  }
  // console.log('booleanMode:', booleanMode, 'booleanSelected:', booleanSelected, 'booleanToggledOn:', booleanToggledOn, 'booleanTotal:', booleanTotal);
  return booleanTotal;
})

const currentDistances = computed(() => {
  let shape = this.$props.labelLayers.filter(layer => layer.id === this.currentOrSelectedShape);
  let set;
  if (shape[0]) {
    set = shape[0].distances;
  }
  return set;
});

const handleDeleteClick = (e) => {
  console.log('handleDeleteClick is running');
  this.$mapboxElement.delete(this.$data.selected);
  this.$emit('drawDelete', this.$data.selected);
  this.selected = null;
}

const handleCancelClick = (e) => {
  console.log('handleCancelClick is running');
  this.$data.toggledOn = false;
  this.$emit('drawCancel', e);
}

const handleFinishClick = (e) => {
  // console.log('handleFinishClick is running e:', e, 'this.$mapboxElement.getSelectedPoints():', this.$mapboxElement.getSelectedPoints());
  this.$emit('drawFinish', e);
  this.$data.mode = 'simple_select';
}

</script>

<template>
  <div>
    <div
      v-if="shouldShowDistanceBox"
      class="measure-tool-popup"
    >
      <div
        v-if="!currentDistances"
      >
        <div class="measure-tool-header">
          Measure distances and areas
        </div>
        <div class="measure-tool-description">
          Start creating a measurement by adding points to the map.
        </div>
        <hr class="popup-line">
        <div>
          <img
            :src="'@assets/images/cancel.png'"
            class="img-class"
            alt="cancel"
            @click="handleCancelClick"
          >
          <div
            class="inline-block-div"
            @click="handleCancelClick"
          >
            Cancel
          </div>
        </div>
      </div>

      <div
        v-if="currentDistances"
      >
        <table>
          <tr>
            <th>lat</th>
            <th>lng</th>
            <th>distance (ft)</th>
          </tr>
          <tr
            v-for="(entry, index) of currentDistances"
            :key="index"
          >
            <td>{{ entry.firstPoint[1] }}</td>
            <td>{{ entry.firstPoint[0] }}</td>
            <td>{{ entry.distance }}</td>
          </tr>
        </table>
        <hr class="popup-line">

        <div
          v-if="currentDistances.length >= 2"
        >
          Total Length: {{ currentTotalLength }}
          <hr class="popup-line">
        </div>

        <div
          v-if="currentDistances.length >= 3"
        >
          Total Area: {{ currentArea }}
          <hr class="popup-line">
        </div>

        <div
          v-if="mode === 'simple_select'"
          class="drawn-shape-actions"
        >
          <img
            :src="'@/assets/images/trash.png'"
            class="img-class"
            alt="cancel"
            @click="handleDeleteClick"
          >
          <div
            class="inline-block-div"
            @click="handleDeleteClick"
          >
            Delete
          </div>
        </div>

        <div
          v-if="mode !== 'simple_select'"
          class="draw-actions"
        >
          <img
            :src="'@/assets/images/cancel.png'"
            class="img-class"
            alt="cancel"
            @click="handleCancelClick"
          >
          <div
            class="inline-block-div"
            @click="handleCancelClick"
          >
            Cancel
          </div>
          <img
            :src="'@/assets/images/check.png'"
            class="img-class"
            alt="finish"
            @click="handleFinishClick"
          >
          <div
            class="inline-block-div"
            @click="handleFinishClick"
          >
            Finish Measurement
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

.measure-tool-popup {
  font-family: Montserrat, sans-serif;
  font-size: 12px;
  position: absolute;
  width: 300px;
  min-width: 200px;
  bottom: 0;
  right: 0;
  padding: 10px;
  background-color: #fff;
  margin-bottom: 24px;
  margin-right: 50px;
  border-radius: 10px;
  z-index: 12;
}

</style>