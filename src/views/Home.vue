<script setup>
// PACKAGE IMPORTS
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

// STORES
import { useMapStore } from '@/stores/MapStore.js';
const MapStore = useMapStore();
import { useMainStore } from '@/stores/MainStore.js'
const MainStore = useMainStore();
import { useAddressStore } from '@/stores/AddressStore.js'
const AddressStore = useAddressStore();
import { useCondosStore } from '@/stores/CondosStore.js'
const CondosStore = useCondosStore();
import { useRouter, useRoute } from 'vue-router';
import { useParcelsStore } from '@/stores/ParcelsStore';
const ParcelsStore = useParcelsStore();

// ROUTER
const route = useRoute();
const router = useRouter();

import { ref, onMounted, provide, computed } from 'vue';

// COMPOSABLES
import useMapStyle from '@/composables/useMapStyle';
const {
  noMapStyle,
  pwdDrawnMapStyle,
  dorDrawnMapStyle,
  zoningDrawnMapStyle,
  imageryMapStyle,
} = useMapStyle();

// the useDataFetch composable contains the fetch calls to the various data sources
import useDataFetch from '@/composables/useDataFetch';
const { addressDataFetch, parcelsDataFetch, condosDataFetch, topicDataFetch } = useDataFetch();

// COMPONENTS
import TopicPanel from '@/views/TopicPanel.vue';
import Condos from './topics/Condos.vue';

// use provide/inject for the addressDataLoaded and dataSourcesLoaded refs to the children
// these are used to allow loading symbols to be displayed before the stores are loaded
// while data is being fetched
const addressDataLoadedFlag = ref(false);
provide('addressDataLoadedFlagKey', addressDataLoadedFlag);
const dataSourcesLoadedArray = ref([]);
provide('dataSourcesLoadedArrayKey', dataSourcesLoadedArray);

const inputAddress = ref('');

let map;
const currentMarkers = [];
const currentMarkersForTopic = [];

const parcelLayerForTopic = {
  undefined: 'PWD',
  Property: 'PWD',
  Condos: 'PWD',
  Deeds: 'DOR',
  'Licenses & Inspections': 'PWD',
  Zoning: 'DOR',
  Voting: 'PWD',
  'Nearby Activity': 'PWD',
}

const topicStyles = {
  Property: pwdDrawnMapStyle,
  Condos: pwdDrawnMapStyle,
  Deeds: dorDrawnMapStyle,
  'Licenses & Inspections': pwdDrawnMapStyle,
  Zoning: zoningDrawnMapStyle,
  Voting: pwdDrawnMapStyle,
  'Nearby Activity': pwdDrawnMapStyle,
}

const toggleImagery = () => {
  console.log('toggleImagery, map.getStyle:', map.getStyle());
  const style = map.getStyle();
  if (style.name === 'imageryMap') {
    map.setStyle(MapStore.currentTopicMapStyle);
  } else {
    map.setStyle(imageryMapStyle);
  }
}

const currentNearbyDataType = computed(() => {
  return MainStore.currentNearbyDataType;
});

const routeToAddress = (currentAddress) => {
  console.log('routeToAddress is running, currentAddress:', currentAddress);
  if (MainStore.currentAddress && route.params.topic == 'Nearby Activity') {
    router.push({ name: 'address-topic-and-data', params: { address: MainStore.currentAddress, topic: "Nearby Activity", data: currentNearbyDataType.value } });
  } else if (MainStore.currentAddress && route.params.topic) {
    router.push({ name: 'address-and-topic', params: { address: MainStore.currentAddress, topic: route.params.topic } });
  } else if (MainStore.currentAddress) {
    router.push({ name: 'address-and-topic', params: { address: MainStore.currentAddress, topic: 'Property' } });
  }
}

onMounted(async () => {
  if (route.name === 'not-found') {
    router.push({ name: 'home' });
  }
  if (route.params.address) {
    inputAddress.value = route.params.address;
    handleAddressSearch();
  }

  let currentTopicMapStyle;
  route.params.topic ? currentTopicMapStyle = topicStyles[route.params.topic] : currentTopicMapStyle = pwdDrawnMapStyle;
  MapStore.currentTopicMapStyle = currentTopicMapStyle;

  let zoom;
  route.params.address ? zoom = 17 : zoom = 12;

  map = new maplibregl.Map({
    container: 'map',
    style: currentTopicMapStyle,
    center: [-75.163471, 39.953338],
    zoom: zoom,
    minZoom: 6,
    maxZoom: 22,
  });

  map.on('click', async(e) => {
    console.log('map click event:', e.lngLat, 'route.params.topic:', route.params.topic);
    let currentAddress;
    const parcelLayer = parcelLayerForTopic[route.params.topic];
    await ParcelsStore.fillParcelDataByLngLat(e.lngLat.lng, e.lngLat.lat, parcelLayer);
    const addressField = parcelLayer === 'PWD' ? 'ADDRESS' : 'ADDR_SOURCE';
    console.log('parcelLayer:', parcelLayer, 'ParcelsStore[parcelLayer].features[0].properties[addressField]:', ParcelsStore[parcelLayer].features[0].properties[addressField]);
    currentAddress = ParcelsStore[parcelLayer].features[0].properties[addressField];
    console.log('currentAddress:', currentAddress);
    MainStore.setCurrentAddress(currentAddress);
    MainStore.setLastSearchMethod('mapClick');
    routeToAddress(currentAddress);
  });
});

const getAddressAndPutInStore = async(address) => {
  console.log('getAddressAndPutInStore is running, address:', address);
  // set address loaded to false
  addressDataLoadedFlag.value = false;
  // on a new address search, clear all of the loaded data sources
  dataSourcesLoadedArray.value = [];
  // on submit, immediately call AIS and put the full value in the AddressStore
  await addressDataFetch(address);
  if (!AddressStore.addressData.features) {
    router.push({ name: 'not-found' });
    // inputAddress.value = '';
    return;
  }
  // if there is a value, add the value for the street_address in the MainStore
  const currentAddress = AddressStore.addressData.features[0].properties.street_address;
  MainStore.setCurrentAddress(currentAddress);
  // set the addressDataLoadedFlag value to true
  addressDataLoadedFlag.value = true;
}

const handleAddressSearch = async () => {
  // it does a first AIS call to make sure the address is good, and to correct it for the url
  // for instance from '1234 mkt' to '1234 MARKET ST'
  await getAddressAndPutInStore(inputAddress.value); 
  // set the last search method to address (the alternative will eventually be 'mapClick')
  MainStore.setLastSearchMethod('address');
  const currentAddress = MainStore.currentAddress;
  console.log('currentAddress:', currentAddress);
  // if the address is found, push the address to the router
  if (currentAddress) {
    routeToAddress(currentAddress);
  }
}

// I don't know whether this is a best practice
// Use the router's navigation guard to track route changes
router.afterEach(async (to, from) => {
  console.log('router.afterEach to:', to, 'from:', from, 'to.name:', to.name);
  if (to.name === 'not-found') {
    currentMarkers.forEach((marker) => marker.remove());
    currentMarkersForTopic.forEach((marker) => marker.remove());
    return;
  }

  // MAP STYLE CHANGE (NOT RELATED TO ADDRESS)
  const style = map.getStyle();
  if (style && style.name !== 'imageryMap') {
    if (to.params.topic) {
      map.setStyle(topicStyles[to.params.topic]);
      MapStore.currentTopicMapStyle = topicStyles[to.params.topic];
    } else {
      map.setStyle(pwdDrawnMapStyle);
      MapStore.currentTopicMapStyle = pwdDrawnMapStyle;
    }
  }

  // this makes a repetitive and wasteful api call to AIS, but it is necessary for
  // the back button to work
  // this might become a problem if it resets the address from a DOR parcel address
  // that was actually clicked
  if (to.params.address !== from.params.address) {
    await getAddressAndPutInStore(to.params.address);
  } else if (dataSourcesLoadedArray.value.includes(to.params.topic)) {
    return;
  }

  // ADDRESS MARKER MOVES
  if (to.params.topic == from.params.topic && to.params.address || from.params.topic == null && to.params.address) {
    const coordinates = AddressStore.addressData.features[0].geometry.coordinates;
    currentMarkers.forEach((marker) => marker.remove());
    const addressMarker = new maplibregl.Marker()
      .setLngLat(coordinates)
      .addTo(map);
    currentMarkers.push(addressMarker);
    if (MainStore.lastSearchMethod === 'address') {
      map.setCenter(coordinates);
      map.setZoom(17);
    }
  }

  // GET PARCELS AND DATA FOR TOPIC
  await parcelsDataFetch();
  await condosDataFetch(to.params.address);
  if (to.params.topic == "Condominiums" && !CondosStore.condosData.length) {
    router.push({ name: 'address-and-topic', params: { address: to.params.address, topic: 'Property' } });
    return
  }

  await topicDataFetch(to.params.topic);
  dataSourcesLoadedArray.value.push(to.params.topic);

  // currentMarkersForTopic.push
});

</script>

<template>
  <main>

    <!-- APP HEADER -->
    <div class="container">
      <h1 class="title is-1">Vue3 Atlas</h1>
    </div>
    <div class="container">
      <div class="columns">
        <div class="column is-10">
          <input
            class="input"
            type="text"
            placeholder="Search an address"
            v-model="inputAddress"
            @keydown.enter="handleAddressSearch"
          />
        </div>
        <!-- I could not use a router-link here because the address is null at the start,
          and it would throw an error for a missing param
        -->
        <button
          class="button"
          @click="handleAddressSearch"
        >
          Search
        </button>
        <button class="button" @click="toggleImagery">Toggle Imagery</button>
      </div>
    </div>

    <!-- MAIN CONTENT -->
    <div class="small-container">
      <div class="columns">

        <!-- TOPIC PANEL ON LEFT -->
        <div class="column is-6">
          <topic-panel></topic-panel>
        </div>

        <!-- MAP PANEL ON RIGHT - right now only contains the address input -->
        <div id="map-panel" class="column is-6">
          <div id="map" class="map-class" />
        </div>
        
      </div>
    </div>
  </main>
</template>

<style scoped>

.map-class {
  height: 100vh;
}

</style>