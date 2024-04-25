<script setup>

import $config from '@/config';
// PACKAGE IMPORTS
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import MapboxDraw from '@mapbox/mapbox-gl-draw'
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'

// STORES
import { useMapStore } from '@/stores/MapStore.js';
const MapStore = useMapStore();
import { useMainStore } from '@/stores/MainStore.js'
const MainStore = useMainStore();
import { useAddressStore } from '@/stores/AddressStore.js'
const AddressStore = useAddressStore();

// ROUTER
import { useRouter, useRoute } from 'vue-router';
const route = useRoute();
const router = useRouter();

import { ref, onMounted, watch } from 'vue';

import useImageryToggleControl from '@/composables/useImageryToggleControl.js';
const { imageryToggleControl } = useImageryToggleControl();

import AddressSearchControl from '@/components/map/AddressSearchControl.vue';
import DistanceMeasureControl from '@/components/map/DistanceMeasureControl.vue';

let map;

watch(
  () => AddressStore.addressData,
  newAddress => {
  console.log('MapStore address watch, newAddress:', newAddress, 'MapStore.addressMarker:', MapStore.addressMarker);
  const oldAddressMarker = MapStore.addressMarker;
  if (oldAddressMarker) {
    oldAddressMarker.remove();
  }
  const coordinates = AddressStore.addressData.features[0].geometry.coordinates;
  const newAddressMarker = new maplibregl.Marker()
    .setLngLat(coordinates)
    .addTo(map);
  MapStore.addressMarker = newAddressMarker;
  if (MainStore.lastSearchMethod === 'address') {
    map.setCenter(coordinates);
    map.setZoom(17);
  }
});

watch(
  () => route.params.topic,
  async newTopic => {
    console.log('MapStore watch topic, newTopic:', newTopic);
    if (newTopic) {
      MapStore.currentTopicMapStyle = $config.topicStyles[newTopic];
      map.setStyle($config[MapStore.currentTopicMapStyle]);
    }
  }
)

const drawInfo = ref({
  mode: null,
  selection: null,
  currentShape: null,
  labelLayers: [],
  currentArea: null,
})

const distanceMeasureControlRef = ref(null)

const $click = defineEmits(['click']);

onMounted(async () => {
  let currentTopicMapStyle;
  route.params.topic ? currentTopicMapStyle = $config.topicStyles[route.params.topic] : currentTopicMapStyle = 'pwdDrawnMapStyle';
  MapStore.currentTopicMapStyle = currentTopicMapStyle;

  let zoom;
  route.params.address ? zoom = 17 : zoom = 12;

  map = new maplibregl.Map({
    container: 'map',
    style: $config[currentTopicMapStyle],
    center: [-75.163471, 39.953338],
    zoom: zoom,
    minZoom: 6,
    maxZoom: 22,
    attributionControl: false,
  });
  
  map.on('click', (e, data) => {
    console.log('e:', e, 'data:', data, 'drawInfo.mode:', drawInfo.mode);
    let drawMode = drawInfo.mode;
    let drawLayers = MapStore.map.queryRenderedFeatures(e.point).filter(feature => [ 'mapbox-gl-draw-cold', 'mapbox-gl-draw-hot' ].includes(feature.source));
    console.log('Map.vue handleMapClick, e:', e, 'drawLayers:', drawLayers, 'drawMode:', drawMode, 'e:', e, 'MapStore.map.getStyle():', MapStore.map.getStyle(), 'MapStore.drawStart:', MapStore.drawStart);

    if (!drawLayers.length && drawMode !== 'draw_polygon') {
      router.push({ name: 'search', query: { lng: e.lngLat.lng, lat: e.lngLat.lat }})
    }
    if (drawMode === 'draw_polygon') {
      distanceMeasureControlRef.value.getDrawDistances(e);
    }
  });

  map.addControl(imageryToggleControl, 'top-right');
  // MapStore.initialized = true;

  MapboxDraw.constants.classes.CONTROL_BASE  = 'maplibregl-ctrl';
  MapboxDraw.constants.classes.CONTROL_PREFIX = 'maplibregl-ctrl-';
  MapboxDraw.constants.classes.CONTROL_GROUP = 'maplibregl-ctrl-group';

  const draw = new MapboxDraw({
    displayControlsDefault: false,
    controls: {
      polygon: true,
    }
  });

  MapStore.draw = draw;
  map.addControl(draw, 'bottom-right');

  map.on('draw.create', drawCreate);
  map.on('draw.delete', drawDelete);
  map.on('draw.update', drawUpdate);
  map.on('draw.selectionchange', e => {
    console.log('draw.selectionchange, e:', e);
    drawSelectionChange(e);
  });
  map.on('draw.cancel', drawCancel);
  map.on('draw.finish', drawFinish);
  // map.on('draw.modechange', drawModeChange(e));
  map.on('draw.modechange', e => {
    console.log('draw.modechange, e:', e);
    drawModeChange(e);
  });

  MapStore.setMap(map);
});
const drawCreate = (e) => {
  console.log('drawCreate is running, e', e);
  distanceMeasureControlRef.value.getDrawDistances(e);
}

const drawDelete = () => {
  console.log('drawDelete is running');
}
const drawUpdate = () => {
  console.log('drawUpdate is running');
}
const drawSelectionChange = (e) => {
  console.log('drawSelectionChange is running, e:', e);
  distanceMeasureControlRef.value.handleDrawSelectionChange(e);
  // if (e.features[0]) {
  //   console.log('there are features');
  //   // $this.$data.selected = e.features[0].id;
  // } else {
  //   console.log('there are no features');
  //   // $this.$data.selected = null;
  // }
}
const drawCancel = () => {
  console.log('drawCancel is running');
}
const drawFinish = () => {
  console.log('drawFinish is running');
}
const drawModeChange = (e) => {
  console.log('drawModeChange is running, e', e);
  drawInfo.mode = e.mode;
  distanceMeasureControlRef.value.handleDrawModeChange(e);
}

</script>

<template>
  <div id="map" class="map-class">
    <AddressSearchControl></AddressSearchControl>
    <DistanceMeasureControl
      ref="distanceMeasureControlRef"
      position="bottom-right"
    >
    </DistanceMeasureControl>
  </div>
</template>

<style scoped>

#map-panel {
  position: relative;
}

.map-class {
  height: 89vh;
}
</style>