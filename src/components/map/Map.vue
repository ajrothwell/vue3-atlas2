<script setup>

// import markerColorChange from '../../public/images/marker_color_change.png';
// console.log('markerColorChange:', markerColorChange);

import CyclomediaRecordingsClient from '@/components/map/recordings-client.js';

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
import { useLiStore } from '@/stores/LiStore.js'
const LiStore = useLiStore();

// ROUTER
import { useRouter, useRoute } from 'vue-router';
const route = useRoute();
const router = useRouter();

import { ref, onMounted, watch, computed } from 'vue';

import AddressSearchControl from '@/components/map/AddressSearchControl.vue';
import DistanceMeasureControl from '@/components/map/DistanceMeasureControl.vue';
import ImageryToggleControl from '@/components/map/ImageryToggleControl.vue';
import ImageryDropdownControl from '@/components/map/ImageryDropdownControl.vue';
import CyclomediaControl from '@/components/map/CyclomediaControl.vue';
import PictometryControl from '@/components/map/PictometryControl.vue';
import OpacitySlider from '@/components/map/OpacitySlider.vue';

let map;

const pwdCoordinates = computed(() => {
  if (AddressStore.addressData.features) {
    return AddressStore.addressData.features[0].geometry.coordinates;
  } else {
    return [];
  }
});

const selectedParcelId = computed(() => { return MainStore.selectedParcelId; });

const dorCoordinates = computed(() => {
  if (selectedParcelId.value && ParcelsStore.dor.features) {
    console.log('selectedParcelId.value:', selectedParcelId.value, 'ParcelsStore.dor.features.filter(parcel => parcel.id === selectedParcelId.value)[0]:', ParcelsStore.dor.features.filter(parcel => parcel.id === selectedParcelId.value)[0]);
    return ParcelsStore.dor.features.filter(parcel => parcel.id === selectedParcelId.value)[0].geometry.coordinates[0];
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
      MapStore.selectedRegmap = null;
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
    // const marker = new maplibregl.Marker()
    //   .setLngLat(newCoords)
    //   .addTo(map);
  }
)

const selectedRegmap = computed(() => { return MapStore.selectedRegmap; });

watch(
  () => selectedRegmap.value,
  (newRegmap, oldRegmap) => {
    console.log('addRegmapLayer, newRegmap:', newRegmap, 'oldRegmap:', oldRegmap);
    if (newRegmap == null) {
      console.log('remove old regmap');
      if (map.getLayer('regmap')) {
        map.removeLayer('regmap');
        map.removeSource('regmap');
      }
      MapStore.selectedRegmap = null;
    } else if (oldRegmap == null) {
      if (map.getSource('regmap')) {
        map.removeSource('regmap');
      }
      console.log('add newRegmap:', newRegmap);
      const tiles =  `https://ags-regmaps.phila.gov/arcgis/rest/services/RegMaps/MapServer/export?dpi=96&layerDefs=0:NAME=\'g${newRegmap.toLowerCase()}.tif\'&transparent=true&format=png24&bbox={bbox-epsg-3857}&bboxSR=3857&imageSR=3857&size=700,700&f=image&layers=show%3A0`;
      $config.dorDrawnMapStyle.sources.regmap = {
        type: 'raster',
        tiles: [tiles],
        tileSize: 256,
      }
      map.addLayer({
        id: 'regmap',
        type: 'raster',
        source: $config.dorDrawnMapStyle.sources.regmap,
        paint: {
          'raster-opacity': MapStore.regmapOpacity,
        },
      }, 'dorParcel');
    } else {
      map.removeLayer('regmap');
      map.removeSource('regmap');
      const tiles =  `https://ags-regmaps.phila.gov/arcgis/rest/services/RegMaps/MapServer/export?dpi=96&layerDefs=0:NAME=\'g${newRegmap.toLowerCase()}.tif\'&transparent=true&format=png24&bbox={bbox-epsg-3857}&bboxSR=3857&imageSR=3857&size=700,700&f=image&layers=show%3A0`;
      $config.dorDrawnMapStyle.sources.regmap = {
        type: 'raster',
        tiles: [tiles],
        tileSize: 256,
      }
      map.addLayer({
        id: 'regmap',
        type: 'raster',
        source: $config.dorDrawnMapStyle.sources.regmap,
        paint: {
          'raster-opacity': MapStore.regmapOpacity,
        },
      }, 'dorParcel');
    }
  }
);

const handleRegmapOpacityChange = (opacity) => {
  MapStore.regmapOpacity = opacity/100;
  map.setPaintProperty(
    'regmap',
    'raster-opacity',
    parseFloat(opacity/100),
  );
}

const selectedLiBuildingNumber = computed(() => { return LiStore.selectedLiBuildingNumber; });

watch(
  () => selectedLiBuildingNumber.value,
  newSelectedLiBuildingNumber => {
    console.log('Map.vue watch selectedLiBuildingNumber.value:', selectedLiBuildingNumber.value);
    map.setPaintProperty(
      'liBuildingFootprints',
      'fill-color',
      ['match',
      ['get', 'id'],
      newSelectedLiBuildingNumber,
      '#FFFA80',
      /* other */ '#C2B7FF'
      ],
    )
  }
)

const hoveredStateId = computed(() => { return MainStore.hoveredStateId; })

watch(
  () => hoveredStateId.value,
  newHoveredStateId => {
    console.log('Map.vue hoveredStateId watch, newHoveredStateId:', newHoveredStateId);
    if (newHoveredStateId) {
      const feature = map.getStyle().sources.nearby.data.features.filter(feature => feature.properties.id === newHoveredStateId)[0];
      const index = map.getStyle().sources.nearby.data.features.indexOf(feature);
      console.log('index:', index, 'map.getStyle().sources.nearby.data.features:', map.getStyle().sources.nearby.data.features.filter(feature => feature.properties.id === newHoveredStateId)[0]);
      map.getStyle().sources.nearby.data.features.splice(index, 1);
      map.getStyle().sources.nearby.data.features.push(feature);
      map.getSource('nearby').setData(map.getStyle().sources.nearby.data);
      // console.log('map.getStyle().sources:', map.getStyle().sources.filter(source => source.id === 'nearby')[0]);
      console.log('there is a new hoveredStateId, setting paint property');
      map.setPaintProperty(
        'nearby', 
        'circle-color', 
        ['match',
        ['get', 'id'],
        newHoveredStateId,
        "#FFFF00",
        ['match',
        ['get', 'type'],
        'nearby311',
        '#FF0000',
        'nearbyCrimeIncidents',
        '#0096FF',
        /* other */ '#000000'
        ]
      ]
      );
    } else {
      map.setPaintProperty(
        'nearby', 
        'circle-color', 
        ['match',
        ['get', 'type'],
        'nearby311',
        '#FF0000',
        'nearbyCrimeIncidents',
        '#0096FF',
        /* other */ '#000000'
        ]
      );
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

const markerSrc = computed(() => {
  return MainStore.publicPath + 'images/marker_blue.png';
})
const cameraSrc = computed(() => {
  return MainStore.publicPath + 'images/camera2.png';
})

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

  map.addControl(new maplibregl.NavigationControl(), 'bottom-left');
  map.addControl(new maplibregl.GeolocateControl(), 'bottom-left');

  map.on('moveend', (e) => {
    // console.log('map moveend event, e:', e, 'map.getZoom()', map.getZoom());

    if (MapStore.cyclomediaOn) {
      map.getZoom() > 16.5 ? MapStore.cyclomediaRecordingsOn = true : MapStore.cyclomediaRecordingsOn = false;
      if (MapStore.cyclomediaRecordingsOn) {
        updateCyclomediaRecordings();
      } else {
        let geojson = {
          type: 'FeatureCollection',
          features: []
        }
        map.getSource('cyclomediaRecordings').setData(geojson);
        $config.dorDrawnMapStyle.sources.cyclomediaRecordings.data.features = [];
      }
    }

  });

  const markerImage = await map.loadImage(markerSrc.value)
  map.addImage('marker-blue', markerImage.data);
  const cameraImage = await map.loadImage(cameraSrc.value)
  map.addImage('camera-icon', cameraImage.data);

  map.on('click', 'liBuildingFootprints', (e) => {
    console.log('liBuildingFootprints click, e:', e);
    e.clickOnLayer = true;
    LiStore.selectedLiBuildingNumber = e.features[0].properties.id;
  });

  map.on('click', 'cyclomediaRecordings', (e) => {
    console.log('cyclomediaRecordings click, e:', e, 'e.features[0]:', e.features[0]);
    // MapStore.clickedCyclomediaRecording = e.features[0];
    MapStore.clickedCyclomediaRecordingCoords = [ e.lngLat.lng, e.lngLat.lat ];
    e.clickOnLayer = true;
  });

  map.on('click', (e, data) => {
    if (e.clickOnLayer) {
      return;
    }
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

  map.on('mouseenter', 'nearby', (e) => {
    if (e.features.length > 0) {
      console.log('map.getSource(nearby):', map.getSource('nearby'), 'map.getStyle().sources:', map.getStyle().sources);
      MainStore.hoveredStateId = e.features[0].properties.id;
    }
  });

  map.on('mouseleave', 'nearby', () => {
    if (hoveredStateId) {
      MainStore.hoveredStateId = null;
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
    map.addLayer($config.mapLayers[imagerySelected.value], 'cyclomediaRecordings')
    map.addLayer($config.mapLayers.imageryLabels, 'cyclomediaRecordings')
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
  await map.addLayer($config.mapLayers[imagerySelected.value], 'cyclomediaRecordings')
  map.removeLayer(oldLayer);
}

let cyclomediaRecordingsClient = new CyclomediaRecordingsClient(
  'https://atlasapi.cyclomedia.com/api/recording/wfs',
  import.meta.env.VITE_CYCLOMEDIA_USERNAME,
  import.meta.env.VITE_CYCLOMEDIA_PASSWORD,
  4326,
);

const updateCyclomediaRecordings = async () =>{
  console.log('updateCyclomediaRecordings is running');
  const bounds = map.getBounds();
  console.log('bounds:', bounds);
  cyclomediaRecordingsClient.getRecordings(
    bounds,
    recordings => {
      console.log('recordings:', recordings);
      let geojson = {
        type: 'FeatureCollection',
        features: []
      }
      console.log('map:', map);
      let features = [];
      for (let item of recordings) {
        features.push({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [item.lng, item.lat]
          },
          properties: {
            id: item.imageId,
            type: 'cyclomediaRecording',
          }
        })
      }
      geojson.features = features;
      console.log("map.getSource('cyclomediaRecordings'):", 'map.getStyle().layers:', map.getStyle().layers);
      map.getSource('cyclomediaRecordings').setData(geojson);
      // I don't know why this works - maybe because the mergeDeep is still running
      $config.dorDrawnMapStyle.sources.cyclomediaRecordings.data.features = features;
    },
  );
}

watch(
  () => MapStore.cyclomediaOrientation.yaw,
  newOrientation => {
    // console.log('Map.vue watch cyclomediaOrientation.yaw, newOrientation:', newOrientation);
    // if (newOrientation) {
    updateCyclomediaCameraAngle(newOrientation);
    // }
  }
)

watch(
  () => MapStore.cyclomediaOrientation.lngLat,
  newOrientation => {
    // console.log('Map.vue watch cyclomediaOrientation.xyz, newOrientation:', newOrientation);
    // if (newOrientation) {
    updateCyclomediaCamera(newOrientation);
    // }
  }
)

const updateCyclomediaCameraAngle = (newOrientation) => {
  console.log('updateCyclomediaCameraAngle is running, newOrientation:', newOrientation);
  const layer = map.getLayer('cyclomediaCamera');
  console.log('layer:', layer);
  map.setLayoutProperty('cyclomediaCamera', 'icon-rotate', newOrientation);
  // map.removeLayer('cyclomediaCamera');
  // const newLayer = {
  //   id: 'cyclomediaCamera',
  //   source: 'cyclomediaCamera',
  //   type: 'symbol',
  //   layout: {
  //     'icon-image': 'camera-icon',
  //     'icon-anchor' : 'center',
  //     'icon-size': 0.09,
  //     'icon-rotate': newOrientation,
  //     'icon-rotation-alignment': 'map',
  //   }
  // }
  // map.addLayer(newLayer);
}

const updateCyclomediaCamera = (orientation) => {
  console.log('updateCyclomediaCamera is running, orientation:', orientation);
  const map = MapStore.map;
  const zoom = map.getZoom();
  if (!MapStore.cyclomediaOn || zoom < 16.5) {
    return;
  } else {
    const theData = {'type': 'Feature','geometry': {'type': 'Point','coordinates': orientation }};
    // console.log('$config.pwdDrawnMapStyle.sources.cyclomediaCamera.data.geometry.coordinates:', $config.pwdDrawnMapStyle.sources.cyclomediaCamera.data.geometry.coordinates);
    // $config.pwdDrawnMapStyle.sources.cyclomediaCamera.data.geometry.coordinates = [[ map.getCenter().lng, map.getCenter().lat ]];
    map.getSource('cyclomediaCamera').setData(theData);
    // console.log('$config.pwdDrawnMapStyle.sources.cyclomediaCamera.data.geometry.coordinates:', $config.pwdDrawnMapStyle.sources.cyclomediaCamera.data.geometry.coordinates);
  }
}

const toggleCyclomedia = async() => {
  console.log('map.getStyle().sources:', map.getStyle().sources, 'map.getStyle().layers:', map.getStyle().layers);
  console.log('toggleCyclomedia');
  MapStore.cyclomediaOn = !MapStore.cyclomediaOn;
  if (MapStore.cyclomediaOn) {
    await updateCyclomediaRecordings();
    // updateCyclomediaCamera();
  } else {
    let geojson = {
      type: 'FeatureCollection',
      features: []
    }
    map.getSource('cyclomediaRecordings').setData(geojson);
    $config.dorDrawnMapStyle.sources.cyclomediaRecordings.data.features = [];
    // $config.liDrawnMapStyle.sources.cyclomediaRecordings.data.features = [];
    // $config.pwdDrawnMapStyle.sources.cyclomediaRecordings.data.features = [];
  }
}

const togglePictometry = () => {
  console.log('togglePictometry');
  MapStore.pictometryOn = !MapStore.pictometryOn;
}

const handleZoningOpacityChange = (opacity) => {
  MapStore.zoningOpacity = opacity/100;
  map.setPaintProperty(
    'zoning',
    'raster-opacity',
    opacity/100,
  );
}

// const handleCycloChanges = () => {
//   const halfAngle = this.cycloHFov / 2.0;
//   let angle1 = this.cycloRotationAngle - halfAngle;
//   let angle2 = this.cycloRotationAngle + halfAngle;
//   // console.log('handleCycloChanges, halfAngle:', halfAngle, 'angle1:', angle1, 'this.cycloRotationAngle:', this.cycloRotationAngle, 'angle2:', angle2);

//   let distance;
//   if (this.$data.watchedZoom < 9) {
//     distance = 2000 * (21 - this.$data.watchedZoom);
//   } else if (this.$data.watchedZoom < 10) {
//     distance = 1000 * (21 - this.$data.watchedZoom);
//   } else if (this.$data.watchedZoom < 11) {
//     distance = 670 * (21 - this.$data.watchedZoom);
//   } else if (this.$data.watchedZoom < 12) {
//     distance = 420 * (21 - this.$data.watchedZoom);
//   } else if (this.$data.watchedZoom < 13) {
//     distance = 270 * (21 - this.$data.watchedZoom);
//   } else if (this.$data.watchedZoom < 14) {
//     distance = 150 * (21 - this.$data.watchedZoom);
//   } else if (this.$data.watchedZoom < 15) {
//     distance = 100 * (21 - this.$data.watchedZoom);
//   } else if (this.$data.watchedZoom < 16) {
//     distance = 55 * (21 - this.$data.watchedZoom);
//   } else if (this.$data.watchedZoom < 17) {
//     distance = 30 * (21 - this.$data.watchedZoom);
//   } else if (this.$data.watchedZoom < 18) {
//     distance = 25 * (21 - this.$data.watchedZoom);
//   } else if (this.$data.watchedZoom < 20.4) {
//     distance = 15 * (21 - this.$data.watchedZoom);
//   } else {
//     distance = 10;
//   }

//   console.log('handleCycloChanges is running, this.$data.watchedZoom:', this.$data.watchedZoom, 'distance:', distance, 'this.cycloLatlng:', this.cycloLatlng);
//   let options = { units: 'feet' };

//   if (!this.cycloLatlng) {
//     return;
//   }

//   var destination1 = destination([ this.cycloLatlng[1], this.cycloLatlng[0] ], distance, angle1, options);
//   var destination2 = destination([ this.cycloLatlng[1], this.cycloLatlng[0] ], distance, angle2, options);
//   // console.log('cyclocenter:', [this.cycloLatlng[1], this.cycloLatlng[0]], 'destination1:', destination1.geometry.coordinates, 'destination2:', destination2.geometry.coordinates);
//   // console.log('destination1:', destination1.geometry.coordinates, 'destination2:', destination2.geometry.coordinates);

//   this.$data.geojsonViewconeSource.data.geometry.coordinates = [
//     [
//       [ this.cycloLatlng[1], this.cycloLatlng[0] ],
//       [ destination1.geometry.coordinates[0], destination1.geometry.coordinates[1] ],
//       [ destination2.geometry.coordinates[0], destination2.geometry.coordinates[1] ],
//       [ this.cycloLatlng[1], this.cycloLatlng[0] ],
//     ],
//   ];
// }

</script>

<template>
  <div id="map" class="map-class">
    <AddressSearchControl></AddressSearchControl>
    <ImageryToggleControl @toggleImagery="toggleImagery"></ImageryToggleControl>
    <ImageryDropdownControl v-if="MapStore.imageryOn" @setImagery="setImagery"></ImageryDropdownControl>
    <CyclomediaControl @toggleCyclomedia="toggleCyclomedia"></CyclomediaControl>
    <PictometryControl @togglePictometry="togglePictometry"></PictometryControl>
    <DistanceMeasureControl ref="distanceMeasureControlRef"></DistanceMeasureControl>
    <OpacitySlider v-if="selectedRegmap" :initialOpacity="MapStore.regmapOpacity"@opacityChange="handleRegmapOpacityChange"></OpacitySlider>
    <OpacitySlider v-if="MainStore.currentTopic == 'Zoning'" :initialOpacity="MapStore.zoningOpacity"@opacityChange="handleZoningOpacityChange"></OpacitySlider>
  </div>
</template>

<style scoped>

#map {
  position: relative;
}

.map-class {
  height: 100%;
}
</style>