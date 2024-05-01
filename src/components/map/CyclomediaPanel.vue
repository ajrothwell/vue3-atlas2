<script setup>
console.log('CyclomediaPanel.vue setup');
import { ref, computed, onMounted, watch } from 'vue';
import { useMapStore } from '@/stores/MapStore';
const MapStore = useMapStore();
import { useAddressStore } from '@/stores/AddressStore';
const AddressStore = useAddressStore();
// import CyclomediaRecordingsClient from '@/components/map/recordings-client.js';

import proj4 from 'proj4';

const projection4326 = "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs";
const projection2272 = "+proj=lcc +lat_1=40.96666666666667 +lat_2=39.93333333333333 +lat_0=39.33333333333334 +lon_0=-77.75 +x_0=600000 +y_0=0 +ellps=GRS80 +datum=NAD83 +to_meter=0.3048006096012192 +no_defs";

const cyclomediaInitialized = ref(false);

const setNewLocation = (coords) => {
  console.log('CyclomediaPanel.vue setNewLocation, coords:', coords);
  console.log(coords);
  const coords2272 = proj4(projection4326, projection2272, coords);
  StreetSmartApi.open(coords2272[0] + ',' + coords2272[1], {
    viewerType: StreetSmartApi.ViewerType.PANORAMA,
    srs: 'EPSG:2272',
    panoramaViewer: {
      closable: false,
      maximizable: false,
    },
  })
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

// let cyclomediaRecordingsClient = null;
// let cyclomediaRecordings = [];

// const updateCyclomediaRecordings = () =>{
//   // console.log('updateCyclomediaRecordings is running');
//   const map = MapStore.map;
//   const zoom = map.getZoom();
//   // console.log('updateCyclomediaRecordings is running, zoom:', zoom);
//   if (!MapStore.cyclomediaOn || zoom < 17.99) {
//     cyclomediaRecordings = [];
//     return;
//   }
//   const bounds = map.getBounds();
//   cyclomediaRecordingsClient.getRecordings(
//     bounds,
//     recordings => {
//       cyclomediaRecordings = recordings;
//     },
//   );
// }

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

  // cyclomediaRecordingsClient = new CyclomediaRecordingsClient(
  //   'https://atlasapi.cyclomedia.com/api/recording/wfs',
  //   import.meta.env.VITE_CYCLOMEDIA_USERNAME,
  //   import.meta.env.VITE_CYCLOMEDIA_PASSWORD,
  //   4326,
  // );
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