<script setup>

import $config from '@/config';
console.log('Map.vue $config:', $config);

import { ref, onMounted, watch, computed } from 'vue';

// PACKAGE IMPORTS
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import MapboxDraw from '@mapbox/mapbox-gl-draw'
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'
import destination from '@turf/destination';

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

// COMPONENTS
import AddressSearchControl from '@/components/map/AddressSearchControl.vue';
import DistanceMeasureControl from '@/components/map/DistanceMeasureControl.vue';
import ImageryToggleControl from '@/components/map/ImageryToggleControl.vue';
import ImageryDropdownControl from '@/components/map/ImageryDropdownControl.vue';
import CyclomediaControl from '@/components/map/CyclomediaControl.vue';
import PictometryControl from '@/components/map/PictometryControl.vue';
import OpacitySlider from '@/components/map/OpacitySlider.vue';
import PictometryPanel from '@/components/map/PictometryPanel.vue';
import CyclomediaPanel from '@/components/map/CyclomediaPanel.vue';
import CyclomediaRecordingsClient from '@/components/map/recordings-client.js';

let map;

// keep image sources as computed props so that the publicPath can used, for pushing the app to different environments
const markerSrc = computed(() => {
  return MainStore.publicPath + 'images/marker_blue.png';
})
const cameraSrc = computed(() => {
  return MainStore.publicPath + 'images/camera.png';
})

onMounted(async () => {
  // console.log('Map.vue onMounted route.params.topic:', route.params.topic, 'route.params.address:', route.params.address);
  
  // create the maplibre map
  let currentTopicMapStyle = route.params.topic ? $config.topicStyles[route.params.topic] : 'pwdDrawnMapStyle';
  let zoom = route.params.address ? 17 : 12;

  map = new maplibregl.Map({
    container: 'map',
    style: $config[currentTopicMapStyle],
    center: [-75.163471, 39.953338],
    zoom: zoom,
    minZoom: 6,
    maxZoom: 22,
    attributionControl: false,
  });

  // add the address marker and camera icon sources
  const markerImage = await map.loadImage(markerSrc.value)
  map.addImage('marker-blue', markerImage.data);
  const cameraImage = await map.loadImage(cameraSrc.value)
  map.addImage('camera-icon', cameraImage.data);

  // add the unchanged maplibre controls
  map.addControl(new maplibregl.NavigationControl(), 'bottom-left');
  map.addControl(new maplibregl.GeolocateControl(), 'bottom-left');

  // whenever the map moves, check whether the cyclomedia recording circles are on and update them if so
  map.on('moveend', (e) => {
    // console.log('map moveend event, e:', e, 'map.getZoom()', map.getZoom(), 'map.getStyle().layers:', map.getStyle().layers, 'map.getStyle().sources:', map.getStyle().sources);
    if (MapStore.cyclomediaOn) {
      map.getZoom() > 16.5 ? MapStore.cyclomediaRecordingsOn = true : MapStore.cyclomediaRecordingsOn = false;
      if (MapStore.cyclomediaRecordingsOn) {
        updateCyclomediaRecordings();
      } else {
        let geojson = { type: 'FeatureCollection', features: [] };
        map.getSource('cyclomediaRecordings').setData(geojson);
        $config.dorDrawnMapStyle.sources.cyclomediaRecordings.data.features = [];
      }
    }
    if (MapStore.cyclomediaOn) {
      updateCyclomediaCameraViewcone(MapStore.cyclomediaCameraHFov, MapStore.cyclomediaCameraYaw);
    }
  });

  // if the L&I topic is selected, and a building footrprint is clicked, set the selected building number in the LiStore
  map.on('click', 'liBuildingFootprints', (e) => {
    // console.log('liBuildingFootprints click, e:', e);
    e.clickOnLayer = true;
    LiStore.selectedLiBuildingNumber = e.features[0].properties.id;
  });

  // if a cyclomedia recording circle is clicked, set its coordinates in the MapStore
  map.on('click', 'cyclomediaRecordings', (e) => {
    // console.log('cyclomediaRecordings click, e:', e, 'e.features[0]:', e.features[0]);
    e.clickOnLayer = true;
    MapStore.clickedCyclomediaRecordingCoords = [ e.lngLat.lng, e.lngLat.lat ];
  });

  // if a nearby circle marker is clicked, set its id in the MainStore as the hoveredStateId
  map.on('click', 'nearby', (e) => {
    // console.log('nearby click, e:', e);
    e.clickOnLayer = true;
    MainStore.hoveredStateId = e.features[0].properties.id;
  });

  map.on('mouseenter', 'nearby', (e) => {
    if (e.features.length > 0) {
      // console.log('map.getSource(nearby):', map.getSource('nearby'), 'map.getStyle().sources:', map.getStyle().sources);
      map.getCanvas().style.cursor = 'pointer'
      MainStore.hoveredStateId = e.features[0].properties.id;
    }
  });

  map.on('mouseleave', 'nearby', () => {
    if (hoveredStateId) {
      map.getCanvas().style.cursor = ''
      MainStore.hoveredStateId = null;
    }
  });

  // if the map is clicked (not on the layers above), if in draw mode, a polygon is drawn, otherwise, the lngLat is pushed to the app route
  map.on('click', (e, data) => {
    if (e.clickOnLayer) {
      return;
    }
    let drawLayers = map.queryRenderedFeatures(e.point).filter(feature => [ 'mapbox-gl-draw-cold', 'mapbox-gl-draw-hot' ].includes(feature.source));
    // console.log('Map.vue handleMapClick, e:', e, 'drawLayers:', drawLayers, 'drawMode:', drawMode, 'e:', e, 'map.getStyle():', map.getStyle(), 'MapStore.drawStart:', MapStore.drawStart);
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

// watch address for moving map center and setting zoom
watch(
  () => AddressStore.addressData,
  async newAddress => {
    // console.log('MapStore route.params.address watch, newAddress:', newAddress);
    const newCoords = newAddress.features[0].geometry.coordinates;
    if (MainStore.lastSearchMethod === 'address') {
      map.setCenter(newCoords);
      map.setZoom(17);
    }
    MapStore.currentAddressCoords = newCoords;
  }
)

// watch address pwd coordinates for moving address marker
const pwdCoordinates = computed(() => {
  if (AddressStore.addressData.features) {
    return AddressStore.addressData.features[0].geometry.coordinates;
  } else {
    return [];
  }
});

watch(
  () => pwdCoordinates.value,
  newCoords => {
  // console.log('Map pwdCoordinates watch, newCoords:', newCoords, 'MapStore.addressMarker:', MapStore.addressMarker);
  const address = {'type': 'Feature','geometry': {'type': 'Point','coordinates': newCoords}};
  map.getSource('addressMarker').setData(address);
});

const selectedParcelId = computed(() => { return MainStore.selectedParcelId; });
const dorCoordinates = computed(() => {
  if (selectedParcelId.value && ParcelsStore.dor.features) {
    // console.log('selectedParcelId.value:', selectedParcelId.value, 'ParcelsStore.dor.features.filter(parcel => parcel.id === selectedParcelId.value)[0]:', ParcelsStore.dor.features.filter(parcel => parcel.id === selectedParcelId.value)[0]);
    return ParcelsStore.dor.features.filter(parcel => parcel.id === selectedParcelId.value)[0].geometry.coordinates[0];
  } else {
    return [];
  }
});

// watch dor parcel coordinates for moving dor parcel
watch(
  () => dorCoordinates.value,
  newCoords => {
  // console.log('Map dorCoordinates watch, newCoords:', newCoords);
  const newParcel = {'type': 'Feature','geometry': {'type': 'Polygon','coordinates': [ newCoords ]}};
  map.getSource('dorParcel').setData(newParcel);
});

// watch topic for changing map style
watch(
  () => route.params.topic,
  async newTopic => {
    // console.log('Map route.params.topic watch, newTopic:', newTopic);
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
      if (MapStore.cyclomediaOn) {
        updateCyclomediaCameraAngle();
      }
    }
  }
)

// allow the imagery to be toggled on and off, and set to different images
const imagerySelected = computed(() => {
  return MapStore.imagerySelected;
})

const toggleImagery = () => {
  // console.log('toggleImagery, map.getStyle:', map.getStyle());
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
  // console.log('setImagery, newImagery:', newImagery, 'oldLayer:', oldLayer, 'imagerySelected.value:', imagerySelected.value);
  MapStore.imagerySelected = newImagery;
  await map.addLayer($config.mapLayers[imagerySelected.value], 'cyclomediaRecordings')
  map.removeLayer(oldLayer);
}

// for Deeds topic, watch selectedRegmap for adding and changing regmap layer
const selectedRegmap = computed(() => { return MapStore.selectedRegmap; });
watch(
  () => selectedRegmap.value,
  (newRegmap, oldRegmap) => {
    console.log('addRegmapLayer, newRegmap:', newRegmap, 'oldRegmap:', oldRegmap);
    if (newRegmap == null) {
      // console.log('remove old regmap');
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

// for zoning topic, change opacity of zoning layer
const handleZoningOpacityChange = (opacity) => {
  MapStore.zoningOpacity = opacity/100;
  map.setPaintProperty(
    'zoning',
    'raster-opacity',
    opacity/100,
  );
}

// for L&I topic, watch selected building for changing building footprint color
const selectedLiBuildingNumber = computed(() => { return LiStore.selectedLiBuildingNumber; });
watch(
  () => selectedLiBuildingNumber.value,
  newSelectedLiBuildingNumber => {
    // console.log('Map.vue watch selectedLiBuildingNumber.value:', selectedLiBuildingNumber.value);
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

// for Nearby topic, watch the id of the circle marker that is hovered on to change the color of the circle
const hoveredStateId = computed(() => { return MainStore.hoveredStateId; })
watch(
  () => hoveredStateId.value,
  newHoveredStateId => {
    // console.log('Map.vue hoveredStateId watch, newHoveredStateId:', newHoveredStateId);
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


// the distance measure control is added in the template with a ref, so that functions within the component can be called from this file
const distanceMeasureControlRef = ref(null)

const drawInfo = ref({
  mode: null,
  selection: null,
  currentShape: null,
  labelLayers: [],
  currentArea: null,
})

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
  if (e.mode === 'draw_polygon') {
    map.getCanvas().style.cursor = 'crosshair';
  } else {
    map.getCanvas().style.cursor = ''
  }
  drawInfo.mode = e.mode;
  distanceMeasureControlRef.value.handleDrawModeChange(e);
}

// toggle cyclomedia on and off
const toggleCyclomedia = async() => {
  console.log('toggleCyclomedia, map.getStyle().sources:', map.getStyle().sources, 'map.getStyle().layers:', map.getStyle().layers);
  MapStore.cyclomediaOn = !MapStore.cyclomediaOn;
  if (MapStore.cyclomediaOn) {
    const zoom = map.getZoom();
    if (zoom > 16.5) {
      await updateCyclomediaRecordings();
      if (MapStore.cyclomediaCameraLngLat) {
        console.log('in toggleCyclomedia, calling updateCyclomediaCameraLngLat, MapStore.cyclomediaCameraLngLat:', MapStore.cyclomediaCameraLngLat);
        updateCyclomediaCameraLngLat(MapStore.cyclomediaCameraLngLat);
      }
      if (MapStore.cyclomediaCameraHFov && MapStore.cyclomediaCameraYaw) {
        console.log('calling updateCyclomediaCameraViewcone');
        updateCyclomediaCameraViewcone(MapStore.cyclomediaCameraHFov, MapStore.cyclomediaCameraYaw);
      }
    }
  } else {
    let recordingsGeojson = {
      type: 'FeatureCollection',
      features: []
    }
    map.getSource('cyclomediaRecordings').setData(recordingsGeojson);
    $config.dorDrawnMapStyle.sources.cyclomediaRecordings.data.features = [];

    let cameraGeojson = {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [],
      }
    }
    map.getSource('cyclomediaCamera').setData(cameraGeojson);
    $config.dorDrawnMapStyle.sources.cyclomediaCamera.data = cameraGeojson;
    let viewConeGeojson = {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [],
      }
    }
    map.getSource('cyclomediaViewcone').setData(viewConeGeojson);
    $config.dorDrawnMapStyle.sources.cyclomediaViewcone.data = viewConeGeojson;
    MapStore.setCyclomediaCameraLngLat(MapStore.cyclomediaCameraLngLat, null);
  }
}

// an object class called CyclomediaRecordingsClient is used for adding the cyclomedia recordings circles to the map 
let cyclomediaRecordingsClient = new CyclomediaRecordingsClient(
  'https://atlasapi.cyclomedia.com/api/recording/wfs',
  import.meta.env.VITE_CYCLOMEDIA_USERNAME,
  import.meta.env.VITE_CYCLOMEDIA_PASSWORD,
  4326,
);

const updateCyclomediaRecordings = async () => {
  // console.log('updateCyclomediaRecordings is running');
  const bounds = map.getBounds();
  cyclomediaRecordingsClient.getRecordings(
    bounds,
    recordings => {
      let geojson = {
        type: 'FeatureCollection',
        features: []
      }
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
      // console.log("map.getSource('cyclomediaRecordings'):", 'map.getStyle().layers:', map.getStyle().layers);
      map.getSource('cyclomediaRecordings').setData(geojson);
      // I don't know why this works - maybe because the mergeDeep is still running
      $config.dorDrawnMapStyle.sources.cyclomediaRecordings.data.features = features;
    },
  );
}

// everything for adding, moving, and orienting the cyclomedia camera icon and viewcone
const updateCyclomediaCameraLngLat = (lngLat) => {
  console.log('updateCyclomediaCameraLngLat is running, lngLat:', lngLat);
  const zoom = map.getZoom();
  if (!MapStore.cyclomediaOn) {
    return;
  } else {
    const theData = {'type': 'Feature','geometry': {'type': 'Point','coordinates': lngLat }};
    map.getSource('cyclomediaCamera').setData(theData);
    $config.dorDrawnMapStyle.sources.cyclomediaCamera.data = theData;
  }
}

const updateCyclomediaCameraAngle = (newOrientation) => {
  // console.log('updateCyclomediaCameraAngle is running, newOrientation:', newOrientation);
  if (!newOrientation) {
    newOrientation = MapStore.cyclomediaCameraYaw;
  }
  const layer = map.getLayer('cyclomediaCamera');
  map.setLayoutProperty('cyclomediaCamera', 'icon-rotate', newOrientation);
}

const updateCyclomediaCameraViewcone = (cycloHFov, cycloYaw) => {
  const halfAngle = cycloHFov / 2.0;
  let angle1 = cycloYaw - halfAngle;
  let angle2 = cycloYaw + halfAngle;
  console.log('updateCyclomediaCameraViewcone, cycloHFov:', cycloHFov, 'halfAngle:', halfAngle, 'angle1:', angle1, 'cycloYaw:', cycloYaw, 'angle2:', angle2);
  const watchedZoom = map.getZoom();
  let distance;
  if (watchedZoom < 9) {
    distance = 2000 * (21 - watchedZoom);
  } else if (watchedZoom < 10) {
    distance = 1000 * (21 - watchedZoom);
  } else if (watchedZoom < 11) {
    distance = 670 * (21 - watchedZoom);
  } else if (watchedZoom < 12) {
    distance = 420 * (21 - watchedZoom);
  } else if (watchedZoom < 13) {
    distance = 270 * (21 - watchedZoom);
  } else if (watchedZoom < 14) {
    distance = 150 * (21 - watchedZoom);
  } else if (watchedZoom < 15) {
    distance = 100 * (21 - watchedZoom);
  } else if (watchedZoom < 16) {
    distance = 55 * (21 - watchedZoom);
  } else if (watchedZoom < 17) {
    distance = 30 * (21 - watchedZoom);
  } else if (watchedZoom < 18) {
    distance = 25 * (21 - watchedZoom);
  } else if (watchedZoom < 20.4) {
    distance = 15 * (21 - watchedZoom);
  } else {
    distance = 10;
  }

  const cyclomediaCameraLngLat = MapStore.cyclomediaCameraLngLat;
  let options = { units: 'feet' };
  if (!cyclomediaCameraLngLat) {
    console.log('no cyclomediaCameraLngLat');
    return;
  }
  console.log('cyclomediaCameraLngLat:', cyclomediaCameraLngLat);

  var destination1 = destination([ cyclomediaCameraLngLat[0], cyclomediaCameraLngLat[1] ], distance, angle1, options);
  var destination2 = destination([ cyclomediaCameraLngLat[0], cyclomediaCameraLngLat[1] ], distance, angle2, options);
  let data = {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [ cyclomediaCameraLngLat[0], cyclomediaCameraLngLat[1] ],
        [ destination1.geometry.coordinates[0], destination1.geometry.coordinates[1] ],
        [ destination2.geometry.coordinates[0], destination2.geometry.coordinates[1] ],
        [ cyclomediaCameraLngLat[0], cyclomediaCameraLngLat[1] ],
      ]],
    }
  }

  map.getSource('cyclomediaViewcone').setData(data);
  $config.dorDrawnMapStyle.sources.cyclomediaViewcone.data = data;
}

// pictometry
const togglePictometry = () => {
  console.log('togglePictometry');
  MapStore.pictometryOn = !MapStore.pictometryOn;
}

</script>

<template>
  <div id="map" class="map-class">
    <AddressSearchControl></AddressSearchControl>
    <ImageryToggleControl @toggleImagery="toggleImagery"></ImageryToggleControl>
    <ImageryDropdownControl v-if="MapStore.imageryOn" @setImagery="setImagery"></ImageryDropdownControl>
    <CyclomediaControl @toggleCyclomedia="toggleCyclomedia"></CyclomediaControl>
    <PictometryControl @togglePictometry="togglePictometry"></PictometryControl>
    <OpacitySlider v-if="selectedRegmap" :initialOpacity="MapStore.regmapOpacity"@opacityChange="handleRegmapOpacityChange"></OpacitySlider>
    <OpacitySlider v-if="MainStore.currentTopic == 'Zoning'" :initialOpacity="MapStore.zoningOpacity"@opacityChange="handleZoningOpacityChange"></OpacitySlider>
    <!-- the distance measure control uses a ref, so that functions within the component can be called from this file -->
    <DistanceMeasureControl ref="distanceMeasureControlRef"></DistanceMeasureControl>
  </div>
  <KeepAlive>
    <CyclomediaPanel
      v-if="MapStore.cyclomediaOn"
      @updateCameraYaw="updateCyclomediaCameraAngle"
      @updateCameraHFov="updateCyclomediaCameraViewcone"
      @updateCameraLngLat="updateCyclomediaCameraLngLat"
    ></CyclomediaPanel>
  </KeepAlive>
  <KeepAlive>
    <PictometryPanel
      v-if="MapStore.pictometryOn"
    ></PictometryPanel>
  </KeepAlive>
</template>

<style scoped>

#map {
  position: relative;
}

.map-class {
  height: 100%;
}
</style>