<script setup>

import $config from '@/config';
console.log('Map.vue $config:', $config);
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
import { useParcelsStore } from '@/stores/ParcelsStore.js'
const ParcelsStore = useParcelsStore();

// ROUTER
import { useRouter, useRoute } from 'vue-router';
const route = useRoute();
const router = useRouter();

import { ref, onMounted, watch, computed } from 'vue';

import AddressSearchControl from '@/components/map/AddressSearchControl.vue';
import DistanceMeasureControl from '@/components/map/DistanceMeasureControl.vue';
import ImageryToggleControl from '@/components/map/ImageryToggleControl.vue';
import ImageryDropdownControl from '@/components/map/ImageryDropdownControl.vue';

let map;

const pwdCoordinates = computed(() => {
  if (AddressStore.addressData.features) {
    return AddressStore.addressData.features[0].geometry.coordinates;
  } else {
    return [];
  }
});

const dorCoordinates = computed(() => {
  if (ParcelsStore.dor.features) {
    return ParcelsStore.dor.features[0].geometry.coordinates[0];
  } else {
    return [];
  }
});

watch(
  () => pwdCoordinates.value,
  newCoords => {
  console.log('Map pwdCoordinates watch, newCoords:', newCoords, 'MapStore.addressMarker:', MapStore.addressMarker);
  const address = {'type': 'Feature','geometry': {'type': 'Point','coordinates': newCoords}};
  map.getSource('addressMarker').setData(address);
});

watch(
  () => dorCoordinates.value,
  newCoords => {
  console.log('Map dorCoordinates watch, newCoords:', newCoords);
  const newParcel = {'type': 'Feature','geometry': {'type': 'Polygon','coordinates': [ newCoords ]}};
  map.getSource('dorParcel').setData(newParcel);
});

watch(
  () => route.params.topic,
  async newTopic => {
    console.log('Map route.params.topic watch, newTopic:', newTopic);
    if (newTopic) {
      map.setStyle($config[$config.topicStyles[newTopic]]);
      const addressMarker = map.getSource('addressMarker');
      const dorParcel = map.getSource('dorParcel');
      if (addressMarker && dorParcel) {
        // console.log('1 map.layers:', map.getStyle().layers, map.getStyle().sources);
        addressMarker.setData({'type': 'Feature','geometry': {'type': 'Point','coordinates': pwdCoordinates.value }});
        dorParcel.setData({'type': 'Feature','geometry': {'type': 'Polygon','coordinates': [ dorCoordinates.value ]}});
        // console.log('2 map.layers:', map.getStyle().layers, map.getStyle().sources);
      }
    }
  }
)

watch(
  () => AddressStore.addressData,
  async newAddress => {
    console.log('MapStore route.params.address watch, newAddress:', newAddress);
    const newCoords = newAddress.features[0].geometry.coordinates;
    if (MainStore.lastSearchMethod === 'address') {
      map.setCenter(newCoords);
      map.setZoom(17);
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

onMounted(async () => {
  console.log('Map.vue onMounted route.params.topic:', route.params.topic, 'route.params.address:', route.params.address);
  let currentTopicMapStyle;
  route.params.topic ? currentTopicMapStyle = $config.topicStyles[route.params.topic] : currentTopicMapStyle = 'pwdDrawnMapStyle';

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
    console.log('e:', e, 'data:', data, 'drawInfo.mode:', drawInfo.mode, draw.getMode());
    let drawMode = drawInfo.mode;
    let drawLayers = MapStore.map.queryRenderedFeatures(e.point).filter(feature => [ 'mapbox-gl-draw-cold', 'mapbox-gl-draw-hot' ].includes(feature.source));
    console.log('Map.vue handleMapClick, e:', e, 'drawLayers:', drawLayers, 'drawMode:', drawMode, 'e:', e, 'MapStore.map.getStyle():', MapStore.map.getStyle(), 'MapStore.drawStart:', MapStore.drawStart);

    if (!drawLayers.length && draw.getMode() !== 'draw_polygon') {
      router.push({ name: 'search', query: { lng: e.lngLat.lng, lat: e.lngLat.lat }})
    }
    if (draw.getMode() === 'draw_polygon') {
      distanceMeasureControlRef.value.getDrawDistances(e);
    }
  });

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
  map.on('draw.selectionchange', drawSelectionChange);
  map.on('draw.finish', drawFinish);
  map.on('draw.modechange', drawModeChange);

  MapStore.setMap(map);
});
const drawCreate = (e) => {
  console.log('drawCreate is running, e', e);
  distanceMeasureControlRef.value.getDrawDistances(e);
}
const drawSelectionChange = (e) => {
  console.log('drawSelectionChange is running, e:', e);
  distanceMeasureControlRef.value.handleDrawSelectionChange(e);
}
const drawFinish = () => {
  console.log('drawFinish is running');
  drawInfo.mode = 'simple_select';
}
const drawModeChange = (e) => {
  console.log('drawModeChange is running, e', e);
  drawInfo.mode = e.mode;
  distanceMeasureControlRef.value.handleDrawModeChange(e);
}

const imagerySelected = computed(() => {
  return MapStore.imagerySelected;
})

const toggleImagery = () => {
  console.log('toggleImagery, map.getStyle:', map.getStyle());
  const style = map.getStyle();
  if (!MapStore.imageryOn) {
    MapStore.imageryOn = true;
    map.addLayer($config.mapLayers[imagerySelected.value], 'addressMarker')
    map.addLayer($config.mapLayers.imageryLabels, 'addressMarker')
  } else {
    console.log('map.getStyle().layers:', map.getStyle().layers);
    MapStore.imageryOn = false;
    map.removeLayer(imagerySelected.value);
    map.removeLayer('imageryLabels');
  }
}

const setImagery = async (newImagery) => {
  const oldLayer = imagerySelected.value;
  console.log('setImagery, newImagery:', newImagery, 'oldLayer:', oldLayer, 'imagerySelected.value:', imagerySelected.value);
  MapStore.imagerySelected = newImagery;
  await map.addLayer($config.mapLayers[imagerySelected.value], 'addressMarker')
  map.removeLayer(oldLayer);
}

</script>

<template>
  <div id="map" class="map-class">
    <AddressSearchControl></AddressSearchControl>
    <ImageryToggleControl @toggleImagery="toggleImagery"></ImageryToggleControl>
    <ImageryDropdownControl v-if="MapStore.imageryOn" @setImagery="setImagery"></ImageryDropdownControl>
    <DistanceMeasureControl ref="distanceMeasureControlRef"></DistanceMeasureControl>
  </div>
</template>

<style scoped>

#map {
  position: relative;
}

.map-class {
  height: 89vh;
}
</style>