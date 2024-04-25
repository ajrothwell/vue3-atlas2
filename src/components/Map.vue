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
import { useParcelsStore } from '@/stores/ParcelsStore.js'
const ParcelsStore = useParcelsStore();

// ROUTER
import { useRouter, useRoute } from 'vue-router';
const route = useRoute();
const router = useRouter();

import { ref, onMounted, watch, computed } from 'vue';

import useImageryToggleControl from '@/composables/useImageryToggleControl.js';
const { imageryToggleControl } = useImageryToggleControl();

import AddressSearchControl from '@/components/map/AddressSearchControl.vue';
import DistanceMeasureControl from '@/components/map/DistanceMeasureControl.vue';

let map;

const pwdCoordinates = computed(() => {
  if (AddressStore.addressData.features) {
    return AddressStore.addressData.features[0].geometry.coordinates;
  } else {
    return [];
  }
});

const dorCoordinates = computed(() => {
  if (ParcelsStore.DOR.features) {
    return ParcelsStore.DOR.features[0].geometry.coordinates[0];
  } else {
    return [];
  }
});

watch(
  () => pwdCoordinates.value,
  newCoords => {
  console.log('Map address watch, newCoords:', newCoords, 'MapStore.addressMarker:', MapStore.addressMarker);
  // let currentTopicMapStyle = 'pwdDrawnMapStyle';
  // if (route.params.topic) {
  //   currentTopicMapStyle = $config.topicStyles[route.params.topic];
  // }
  // console.log('Map.vue watch currentTopicMapStyle:', currentTopicMapStyle, 'route.params.topic:', route.params.topic, 'AddressStore.addressData:', AddressStore.addressData, 'ParcelsStore.DOR:', ParcelsStore.DOR);
  // let pwdCoordinates = [];
  // if (currentTopicMapStyle === 'pwdDrawnMapStyle') {
  // pwdCoordinates = AddressStore.addressData.features[0].geometry.coordinates;
  const address = {'type': 'Feature','geometry': {'type': 'Point','coordinates': newCoords}};
  map.getSource('addressMarker').setData(address);

  // } else {
  // dorCoordinates = ParcelsStore.DOR.features[0].geometry.coordinates[0];
  // console.log('dorCoordinates:', dorCoordinates);
  // const newParcel = {'type': 'Feature','geometry': {'type': 'Polygon','coordinates': [ dorCoordinates ],}};
  // console.log('map.getSource("dorParcel"):', map.getSource('dorParcel'));
  // map.getSource('dorParcel').setData(newParcel);
  // }

  if (MainStore.lastSearchMethod === 'address') {
    map.setCenter(newCoords);
    map.setZoom(17);
  }
});

watch(
  () => dorCoordinates.value,
  newCoords => {
  console.log('Map Parcels watch, newCoords:', newCoords);
  // let currentTopicMapStyle = 'pwdDrawnMapStyle';
  // if (route.params.topic) {
  //   currentTopicMapStyle = $config.topicStyles[route.params.topic];
  // }
  // console.log('Map.vue watch currentTopicMapStyle:', currentTopicMapStyle, 'route.params.topic:', route.params.topic, 'AddressStore.addressData:', AddressStore.addressData, 'ParcelsStore.DOR:', ParcelsStore.DOR);
  // let dorCoordinates = [];
  // if (currentTopicMapStyle === 'pwdDrawnMapStyle') {
  // pwdCoordinates = AddressStore.addressData.features[0].geometry.coordinates;
  // const address = {'type': 'Feature','geometry': {'type': 'Point','coordinates': pwdCoordinates,}};
  // map.getSource('addressMarker').setData(address);

  // } else {
  // dorCoordinates = ParcelsStore.DOR.features[0].geometry.coordinates[0];
  // console.log('dorCoordinates:', dorCoordinates);
  const newParcel = {'type': 'Feature','geometry': {'type': 'Polygon','coordinates': [ newCoords ]}};
  // console.log('map.getSource("dorParcel"):', map.getSource('dorParcel'));
  map.getSource('dorParcel').setData(newParcel);
  // }

  // if (MainStore.lastSearchMethod === 'address') {
  //   map.setCenter(pwdCoordinates);
  //   map.setZoom(17);
  // }
});

watch(
  () => route.params.topic,
  async newTopic => {
    console.log('MapStore watch topic, newTopic:', newTopic);
    if (newTopic) {
      // MapStore.currentTopicMapStyle = $config.topicStyles[newTopic];
      map.setStyle($config[$config.topicStyles[newTopic]]);
      // map.on('style.load', () => {
      console.log('1 map.layers:', map.getStyle().layers, map.getStyle().sources);
      map.getSource('addressMarker').setData({'type': 'Feature','geometry': {'type': 'Point','coordinates': pwdCoordinates.value }});
      map.getSource('dorParcel').setData({'type': 'Feature','geometry': {'type': 'Polygon','coordinates': [ dorCoordinates.value ]}});
      console.log('2 map.layers:', map.getStyle().layers, map.getStyle().sources);
      // });
      // if (style === 'pwdDrawnMapStyle') {
        // map.removeLayer('dorBasemap');
        // map.removeLayer('dorLabels');
        // map.removeLayer('dorParcel');
        // map.addLayer($config.mapLayers.filter((map) => map.id == 'pwdBasemap')[0]);
        // map.addLayer($config.mapLayers.filter((map) => map.id == 'pwdLabels')[0]);
        // map.addLayer($config.mapLayers.filter((map) => map.id == 'addressMarker')[0]);
      // } else {
        // map.removeLayer('pwdBasemap');
        // map.removeLayer('pwdLabels');
        // map.removeLayer('addressMarker');
        // console.log(`"$config.mapLayers.filter((map) => map.id = 'dorBasemap'))[0]"`, $config.mapLayers.filter((map) => map.id == 'dorBasemap')[0])
        // map.addLayer($config.mapLayers.filter((map) => map.id == 'dorBasemap')[0]);
        // map.addLayer($config.mapLayers.filter((map) => map.id == 'dorLabels')[0]);
        // map.addLayer($config.mapLayers.filter((map) => map.id == 'dorParcel')[0]);
      // }
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
// const $click = defineEmits(['click']);

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

  // map.on('style-load', () => {
  //   map.addSource('dorParcel', {
  //     'type': 'geojson',
  //     'data': {
  //       'type': 'Feature',
  //       'geometry': {
  //         'type': 'Polygon',
  //         'coordinates': [[[]]],
  //       }
  //     }
  //   })
  //   map.addLayer({
  //     'id': 'dorParcel',
  //     'type': 'fill',
  //     'source': 'dorParcel',
  //     'layout': {},
  //     'paint': {
  //         'fill-color': '#088',
  //         'fill-opacity': 0.4
  //     }
  //   });
  // })

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
}
const drawCancel = () => {
  console.log('drawCancel is running');
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