<script setup>
import { ref, onMounted, watch } from 'vue';
import { useMapStore } from '@/stores/MapStore';
const MapStore = useMapStore();
import { useGeocodeStore } from '@/stores/GeocodeStore';
const GeocodeStore = useGeocodeStore();

import proj4 from 'proj4';
const projection4326 = "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs";
const projection2272 = "+proj=lcc +lat_1=40.96666666666667 +lat_2=39.93333333333333 +lat_0=39.33333333333334 +lon_0=-77.75 +x_0=600000 +y_0=0 +ellps=GRS80 +datum=NAD83 +to_meter=0.3048006096012192 +no_defs";

const cyclomediaInitialized = ref(false);

const $emit = defineEmits(['updateCameraYaw', 'updateCameraLngLat', 'updateCameraHFov']);

watch(
  () => MapStore.currentAddressCoords,
  newLngLat => {
    console.log('CyclomediaPanel.vue watch cyclomediaLngLat, newLngLat:', newLngLat);
      setNewLocation(newLngLat);
  }
)

watch(
  () => MapStore.cyclomediaOn,
  newCyclomediaOn => {
    console.log('CyclomediaPanel.vue watch cyclomediaOn, newCyclomediaOn:', newCyclomediaOn);
    if (newCyclomediaOn) {
      setNewLocation(MapStore.currentAddressCoords);
    }
  }
)

const navBarExpanded = ref(false);

const setNewLocation = async (coords) => {
  console.log('CyclomediaPanel.vue setNewLocation, coords:', coords);
  console.log(coords);
  const coords2272 = proj4(projection4326, projection2272, coords);
  const response = await StreetSmartApi.open(coords2272[0] + ',' + coords2272[1], {
    viewerType: StreetSmartApi.ViewerType.PANORAMA,
    srs: 'EPSG:2272',
    panoramaViewer: {
      closable: false,
      maximizable: false,
    },
  })
  let viewer = response[0];
  viewer.toggleNavbarExpanded(navBarExpanded.value);
  viewer.toggleButtonEnabled('panorama.elevation', false);
  viewer.toggleButtonEnabled('panorama.reportBlurring', false);

  for (let overlay of viewer.props.overlays) {
    if (overlay.id === 'surfaceCursorLayer') {
      if (overlay.visible === true) {
        viewer.toggleOverlay(overlay);
      }
    }
  }

  // if (!this.$config.cyclomedia.measurementAllowed || this.$config.cyclomedia.measurementAllowed === 'false') {
  //   StreetSmartApi.removeOverlay('measurementLayer');
  //   viewer.toggleButtonEnabled('panorama.measure', false);
  // }

  viewer.on('VIEW_CHANGE', function(e) {
    console.log('on VIEW_CHANGE fired, type:', e.type, 'detail:', e.detail, 'viewer.props.orientation.xyz:', viewer.props.orientation.xyz, 'MapStore.cyclomediaCameraXyz:', MapStore.cyclomediaCameraXyz);
    if (MapStore.cyclomediaOn) {
      MapStore.cyclomediaCameraYaw = e.detail.yaw;
      MapStore.cyclomediaCameraHFov = e.detail.hFov;
      $emit('updateCameraYaw', e.detail.yaw);
      $emit('updateCameraHFov', e.detail.hFov, e.detail.yaw);
      if (viewer.props.orientation.xyz !== MapStore.cyclomediaCameraXyz) {
        const lngLat = proj4(projection2272, projection4326, [ viewer.props.orientation.xyz[0], viewer.props.orientation.xyz[1] ]);
        MapStore.setCyclomediaCameraLngLat(lngLat, viewer.props.orientation.xyz);
        $emit('updateCameraLngLat', lngLat);
      }
    }
  });

  viewer.on('VIEW_LOAD_END', function(e) {
    console.log('on VIEW_LOAD_END fired, type:', e.type, 'e:', e, 'viewer.props.orientation:', viewer.props.orientation);
    const orientation = viewer.getOrientation();
    console.log('orientation:', orientation);
    if (viewer.props.orientation.xyz !== MapStore.cyclomediaCameraXyz) {
      const lngLat = proj4(projection2272, projection4326, [ viewer.props.orientation.xyz[0], viewer.props.orientation.xyz[1] ]);
      MapStore.setCyclomediaCameraLngLat(lngLat, viewer.props.orientation.xyz);
      $emit('updateCameraLngLat', lngLat);
      const orientation = viewer.getOrientation();
      console.log('orientation:', orientation);
      $emit('updateCameraYaw', orientation.yaw);
      $emit('updateCameraHFov', orientation.hFov, orientation.yaw);
    }
  });
}

watch(
  () => MapStore.clickedCyclomediaRecordingCoords,
  newClickedCyclomediaRecordingCoords => {
    console.log('CyclomediaPanel.vue watch clickedCyclomediaRecordingCoords, newClickedCyclomediaRecordingCoords:', newClickedCyclomediaRecordingCoords);
    if (newClickedCyclomediaRecordingCoords) {
      setNewLocation(newClickedCyclomediaRecordingCoords);
    }
  }
)

onMounted( async() => {
  if (!cyclomediaInitialized.value) {
    await StreetSmartApi.init({
      targetElement: cycloviewer,
      username: import.meta.env.VITE_CYCLOMEDIA_USERNAME,
      password: import.meta.env.VITE_CYCLOMEDIA_PASSWORD,
      apiKey: import.meta.env.VITE_CYCLOMEDIA_API_KEY,
      srs: 'EPSG:2272',
      locale: 'en-us',
      addressSettings: {
        locale: 'en-us',
        database: 'CMDatabase',
      },
    })
    cyclomediaInitialized.value = true;
  }
  if (GeocodeStore.aisData.features) {
    setNewLocation(GeocodeStore.aisData.features[0].geometry.coordinates);
  } else {
    setNewLocation([ -75.163471, 39.953338 ]);
  }
})

</script>

<template>
  <div class="cyclomedia-panel">
    <div
      id="cycloviewer"
      ref="cycloviewer"
      class="panoramaViewerWindow"
    />
  </div>
</template>

<style scoped>

.cyclomedia-panel {
  height: 100%;
  width: 100%;
}

.panoramaViewerWindow {
  display: block;
  width: 100%;
  height:100%;
}

</style>