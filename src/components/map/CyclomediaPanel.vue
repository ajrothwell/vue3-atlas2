<script setup>
console.log('CyclomediaPanel.vue setup');
import { ref, computed, onMounted, watch } from 'vue';
import { useMapStore } from '@/stores/MapStore';
const MapStore = useMapStore();
import { useAddressStore } from '@/stores/AddressStore';
const AddressStore = useAddressStore();
// import CyclomediaRecordingsClient from '@/components/map/recordings-client.js';

import { getCurrentInstance } from 'vue';

const app = getCurrentInstance();

import proj4 from 'proj4';

const projection4326 = "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs";
const projection2272 = "+proj=lcc +lat_1=40.96666666666667 +lat_2=39.93333333333333 +lat_0=39.33333333333334 +lon_0=-77.75 +x_0=600000 +y_0=0 +ellps=GRS80 +datum=NAD83 +to_meter=0.3048006096012192 +no_defs";

const cyclomediaInitialized = ref(false);

console.log('app:', app, 'app.cyclomediaInitialized:', app.cyclomediaInitialized);

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
  console.log('viewer:', viewer);
  const expanded = viewer.getNavbarExpanded();
  // console.log('expanded:', expanded);
  // viewer.toggleNavbarExpanded(widget.navBarOpen);
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
  console.log('app:', app);

  viewer.on('VIEW_CHANGE', function(e) {
    console.log('on VIEW_CHANGE fired, type:', e.type, 'detail:', e.detail, 'viewer:', viewer);
    if (e.detail.yaw !== MapStore.cyclomediaOrientation.yaw) {
      console.log('if');
      // console.log('VIEW_CHANGE first if, widget.$store.state.cyclomedia.orientation.xyz:', widget.$store.state.cyclomedia.orientation.xyz);
      // console.log('on VIEW_CHANGE fired with yaw change, viewer.props.orientation:', viewer.props.orientation);
      sendYawToStore(e.detail);
    } else if (viewer.props.orientation.xyz !== MapStore.cyclomediaOrientation.xyz) {
      console.log('else if');
      sendOrientationToStore(viewer.props.orientation.xyz);
    }
    // } else if (viewer.getNavbarExpanded() !== this.navBarOpen) {
    //   // console.log('VIEW_CHANGE second if');
    //   // widget.$store.commit('setCyclomediaNavBarOpen', viewer.getNavbarExpanded());
    // }
  });

  viewer.on('VIEW_LOAD_END', function(e) {
    console.log('on VIEW_LOAD_END fired, type:', e.type, 'e:', e, 'viewer.props.orientation:', viewer.props.orientation, 'MapStore.cyclomediaOrientation.xyz:', MapStore.cyclomediaOrientation.xyz);
    
    if (e.detail.yaw !== MapStore.cyclomediaOrientation.yaw) {
      console.log('if');
      // console.log('VIEW_CHANGE first if, widget.$store.state.cyclomedia.orientation.xyz:', widget.$store.state.cyclomedia.orientation.xyz);
      // console.log('on VIEW_CHANGE fired with yaw change, viewer.props.orientation:', viewer.props.orientation);
      sendYawToStore(e.detail);
    } else if (viewer.props.orientation.xyz !== MapStore.cyclomediaOrientation.xyz) {
      console.log('else if');
      sendOrientationToStore(viewer.props.orientation.xyz);
    }
    
    // if (viewer.props.orientation.xyz !== MapStore.cyclomediaOrientation.xyz) {
    //   // console.log('VIEW_LOAD_END first if');
    //   // sendOrientationToStore(e, viewer.props.orientation.xyz);
    // } else if (viewer.getNavbarExpanded() !== this.navBarOpen) {
      // console.log('VIEW_LOAD_END second if');
      // widget.$store.commit('setCyclomediaNavBarOpen', viewer.getNavbarExpanded());
    // }
  });
}

const sendYawToStore = (e) => {
  // const xy = [ xyz[0], xyz[1] ];
  // const lnglat = proj4(projection2272, projection4326, xy);
  MapStore.setCyclomediaYaw(e.yaw);
}

const sendOrientationToStore = (xyz) => {
  const xy = [ xyz[0], xyz[1] ];
  // const lnglat = xyz;
  const lnglat = proj4(projection2272, projection4326, xy);
  MapStore.setCyclomediaOrientation(lnglat, xyz);
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

// const viewer = ref(null);

onMounted( async() => {

  console.log('CyclomediaPanel.vue onMounted');
  // const MapStore = MapStore();
  if (!cyclomediaInitialized.value) {
    await StreetSmartApi.init({
      targetElement: cycloviewer,
      username: import.meta.env.VITE_CYCLOMEDIA_USERNAME,
      password: import.meta.env.VITE_CYCLOMEDIA_PASSWORD,
      apiKey: import.meta.env.VITE_CYCLOMEDIA_API_KEY,
      // srs: 'EPSG:4326',
      srs: 'EPSG:2272',
      locale: 'en-us',
      addressSettings: {
        locale: 'en-us',
        database: 'CMDatabase',
      },
    })

    cyclomediaInitialized.value = true;
  }

  // const coords2272 = proj4(projection4326, projection2272, [ -75.163471, 39.953338 ]);
  if (AddressStore.addressData.features.length > 0) {
    const coords = AddressStore.addressData.features[0].geometry.coordinates;
    setNewLocation(coords);
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
  /* display: none; */
}

.panoramaViewerWindow {
  display: block;
  width: 100%;
  height:100%;
}

</style>