import { createRouter, createWebHistory } from 'vue-router';
import App from '@/App.vue';
import $config from '@/config';

import { useGeocodeStore } from '@/stores/GeocodeStore.js'
import { useCondosStore } from '@/stores/CondosStore.js'
import { useParcelsStore } from '@/stores/ParcelsStore.js'
import { useOpaStore } from '@/stores/OpaStore.js'
import { useLiStore } from '@/stores/LiStore.js'
import { useDorStore } from '@/stores/DorStore.js'
import { useZoningStore } from '@/stores/ZoningStore.js'
import { useVotingStore } from '@/stores/VotingStore.js'
import { use311Store } from '@/stores/311Store.js'
import { useStormwaterStore } from '@/stores/StormwaterStore.js'
import { useNearbyActivityStore } from '@/stores/NearbyActivityStore.js'
import { useMainStore } from '@/stores/MainStore.js'

import useRouting from '@/composables/useRouting';
// import Condos from '@/components/topics/Condos.vue';
const { routeApp } = useRouting();

const getGeocodeAndPutInStore = async(address) => {
  if (import.meta.env.VITE_DEBUG == 'true') console.log('getGeocodeAndPutInStore is running, address:', address);
  const MainStore = useMainStore();
  MainStore.clearDataSourcesLoadedArray();

  const OpaStore = useOpaStore();
  OpaStore.clearAllOpaData();
  const DorStore = useDorStore();
  DorStore.clearAllDorData();
  const LiStore = useLiStore();
  LiStore.clearAllLiData();
  const ZoningStore = useZoningStore();
  ZoningStore.clearAllZoningData();
  const VotingStore = useVotingStore();
  VotingStore.clearAllVotingData();
  const StormwaterStore = useStormwaterStore();
  StormwaterStore.clearAllStormwaterData();
  const NearbyActivityStore = useNearbyActivityStore();
  NearbyActivityStore.clearAllNearbyActivityData();

  const CondosStore = useCondosStore();
  CondosStore.lastPageUsed = 1;
  CondosStore.condosData.pages = { page_1: { features: [] } };
  const GeocodeStore = useGeocodeStore();
  await GeocodeStore.fillaisData(address);
  if (MainStore.lastSearchMethod == 'address' && !GeocodeStore.aisData.features) {
    MainStore.currentAddress = null;
    if (import.meta.env.VITE_DEBUG == 'true') console.log('getGeocodeAndPutInStore, calling not-found');
    router.push({ name: 'not-found' });
    return;
  } else if (!GeocodeStore.aisData.features) {
    return;
  }
  // if there is a value, add the value for the street_address in the MainStore
  const currentAddress = GeocodeStore.aisData.features[0].properties.street_address;
  MainStore.setCurrentAddress(currentAddress);
}

const getParcelsAndPutInStore = async(lng, lat) => {
  if (import.meta.env.VITE_DEBUG == 'true') console.log('getParcelsAndPutInStore is running');
  let currentAddress;
  const MainStore = useMainStore();
  let currentTopic = MainStore.currentTopic;
  const parcelLayer = $config.parcelLayerForTopic[currentTopic] || 'pwd';
  const ParcelsStore = useParcelsStore();
  await ParcelsStore.fillParcelDataByLngLat(lng, lat, 'pwd');
  await ParcelsStore.fillParcelDataByLngLat(lng, lat, 'dor');
  if (!ParcelsStore.pwd.features[0] && !ParcelsStore.dor.features[0]) {
    MainStore.selectedParcelId = null;
    if (import.meta.env.VITE_DEBUG == 'true') console.log('getParcelsAndPutInStore, calling not-found');
    router.push({ name: 'not-found' });
    return;
  }
  const addressField = parcelLayer === 'pwd' ? 'ADDRESS' : 'ADDR_SOURCE';
  if (import.meta.env.VITE_DEBUG == 'true') console.log('parcelLayer:', parcelLayer);
  // if (import.meta.env.VITE_DEBUG == 'true') console.log('ParcelsStore[parcelLayer].features:', ParcelsStore[parcelLayer].features);
  if (ParcelsStore[parcelLayer].features) {
    for (let i = 0; i < ParcelsStore[parcelLayer].features.length; i++) {
      if (ParcelsStore[parcelLayer].features[i].properties[addressField] !== ' ') {
        currentAddress = ParcelsStore[parcelLayer].features[i].properties[addressField];
        break;
      }
    }
  }
  if (import.meta.env.VITE_DEBUG == 'true') console.log('end of getParcelAndPutInStore, currentAddress:', currentAddress, 'parcelLayer:', parcelLayer, 'addressField', addressField, 'ParcelsStore[parcelLayer].features[0].properties:', ParcelsStore[parcelLayer].features[0].properties, 'ParcelsStore[parcelLayer].features[0].properties[addressField]:', ParcelsStore[parcelLayer].features[0].properties[addressField]);
  if (currentAddress) MainStore.setCurrentAddress(currentAddress);
}

const dataFetch = async(to, from) => {
  if (import.meta.env.VITE_DEBUG == 'true') console.log('dataFetch is starting, to:', to, 'from:', from, 'to.params.address:', to.params.address, 'from.params.address:', from.params.address, 'to.params.topic:', to.params.topic, 'from.params.topic:', from.params.topic);
  const MainStore = useMainStore();
  const GeocodeStore = useGeocodeStore();
  const ParcelsStore = useParcelsStore();
  const dataSourcesLoadedArray = MainStore.dataSourcesLoadedArray;
  if (to.name === 'not-found') {
    return;
  }

  if (to.name === 'address') {
    MainStore.currentTopic = '';
  } else {
    if (!MainStore.currentTopic) {
      MainStore.currentTopic = to.params.topic;
    }
  }
  
  // GET PARAMS
  let address, topic;
  if (to.params.address) { address = to.params.address } else if (to.query.address) { address = to.query.address }
  if (to.params.topic) { topic = to.params.topic }

  if (import.meta.env.VITE_DEBUG == 'true') console.log('address:', address, 'to.params.address:', to.params.address, 'from.params.address:', from.params.address, 'GeocodeStore.aisData.normalized:', GeocodeStore.aisData.normalized);
  
  let aisNeeded = to.params.address !== from.params.address;
  if (aisNeeded && !address) {
    if (import.meta.env.VITE_DEBUG == 'true') console.log('aisNeeded:', aisNeeded, 'address:', address, 'typeof address:', typeof address);
    if (ParcelsStore.dor.features) {
      // if (import.meta.env.VITE_DEBUG == 'true') console.log('ParcelsStore.dor.features[0].properties.BASEREG:', ParcelsStore.dor.features[0].properties.BASEREG);
      await ParcelsStore.fillParcelDataByLngLat(MainStore.lastClickCoords.lng, MainStore.lastClickCoords.lat, 'pwd')
      await getGeocodeAndPutInStore(ParcelsStore.pwd.features[0].properties.PARCELID);
    }
  } else if (aisNeeded) {
    await getGeocodeAndPutInStore(address);
  } else if (to.params.topic !== 'Nearby Activity' && dataSourcesLoadedArray.includes(topic)) {
    return;
  } else if (to.params.topic === 'Nearby Activity' && dataSourcesLoadedArray.includes(to.params.data)) {
    MainStore.currentNearbyDataType = to.params.data;
    if (import.meta.env.VITE_DEBUG == 'true') console.log('dataFetch is still going, MainStore.currentNearbyDataType:', MainStore.currentNearbyDataType, 'to.params.data:', to.params.data);
    return;
  }
  
  if (import.meta.env.VITE_DEBUG == 'true') console.log('dataFetch is still going after address, aisNeeded:', aisNeeded);
  if (!MainStore.initialDatafetchComplete && aisNeeded || to.params.data === from.params.data && aisNeeded || to.params.topic === 'Condominiums' && aisNeeded) {
    // GET PARCELS AND DATA FOR TOPIC
    if (MainStore.lastSearchMethod === 'address') { 
      await ParcelsStore.fillPwdParcelData();
      await ParcelsStore.fillDorParcelData();
    } 
    const CondosStore = useCondosStore();
    CondosStore.loadingCondosData = true;
    await CondosStore.fillCondoData(address);
    CondosStore.loadingCondosData = false;
    if (to.params.topic == "Condominiums" && !CondosStore.condosData.pages.page_1.features.length) {
      MainStore.currentTopic = "Property";
      router.push({ name: 'address-and-topic', params: { address: to.params.address, topic: 'Property' } });
      return
    }
  }
  await topicDataFetch(to.params.topic, to.params.data);
  if (to.params.topic !== 'Nearby Activity') {
    MainStore.addToDataSourcesLoadedArray(to.params.topic);
  } else {
    if (!MainStore.dataSourcesLoadedArray.includes('Nearby Activity')) {
      MainStore.addToDataSourcesLoadedArray('Nearby Activity');
    }
    MainStore.addToDataSourcesLoadedArray(MainStore.currentNearbyDataType);
  }
  MainStore.initialDatafetchComplete = true;
}

const topicDataFetch = async (topic, data) => {
  if (import.meta.env.VITE_DEBUG == 'true') console.log('topicDataFetch is running, topic:', topic);
  
  if (topic === 'Property') {
    const OpaStore = useOpaStore();
    await OpaStore.fillOpaData();
    await OpaStore.fillAssessmentHistory();
    OpaStore.loadingOpaData = false;
  }

  if (topic === 'Licenses & Inspections') {
    const LiStore = useLiStore();
    await LiStore.fillAllLiData();
    LiStore.loadingLiData = false;
  }

  if (topic === 'Deeds') {
    const DorStore = useDorStore();
    // await DorStore.fillAllDorData();
    await Promise.all([DorStore.fillDorDocuments(),
      DorStore.fillRegmaps(),
      DorStore.fillDorCondos()
    ]);
    DorStore.loadingDorData = false;
  }

  if (topic === 'Zoning') {
    const ZoningStore = useZoningStore();
    await ZoningStore.fillAllZoningData();
    ZoningStore.loadingZoningData = false;
  }

  if (topic === 'Voting') {
    const VotingStore = useVotingStore();
    await VotingStore.fillAllVotingData();
    VotingStore.loadingVotingData = false;
  }

  if (topic === '311') {
    const Nearby311Store = use311Store();
    await Nearby311Store.getAgoToken();
    await Nearby311Store.fillNearby311(data);
  }

  if (topic === 'Stormwater') {
    const StormwaterStore = useStormwaterStore();
    await StormwaterStore.fillStormwaterData();
    await StormwaterStore.fillStormwaterCapData();
    StormwaterStore.loadingStormwaterData = false;
  }

  if (topic === 'Nearby Activity') {
    const NearbyActivityStore = useNearbyActivityStore();
    await NearbyActivityStore.fetchData(data);
  }
}

const router = createRouter({
  // history: createWebHashHistory(import.meta.env.BASE_URL),
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/components/NotFound.vue')
    },
    {
      path: '/',
      name: 'home',
      component: App,
      props: true,
    },
    {
      path: '/:address',
      name: 'address',
      component: App,
    },
    {
      path: '/:address/:topic',
      name: 'address-and-topic',
      component: App,
    },
    {
      path: '/:address/:topic/:data',
      name: 'address-topic-and-data',
      component: App,
    },
    {
      path: '/not-found',
      name: 'not-found',
      component: App,
    },
    {
      path: '/search',
      name: 'search',
      component: App,
      beforeEnter: async (to, from) => {
        const { address, lat, lng } = to.query;
        if (import.meta.env.VITE_DEBUG == 'true') console.log('search route beforeEnter, to.query:', to.query, 'from:', from, 'address:', address);
        const MainStore = useMainStore();
        if (address && address !== '') {
          if (import.meta.env.VITE_DEBUG == 'true') console.log('search route beforeEnter, address:', address);
          MainStore.setLastSearchMethod('address');
          await getGeocodeAndPutInStore(address);
          routeApp(router);
        } else if (lat && lng) {
          MainStore.setLastSearchMethod('mapClick');
          await getParcelsAndPutInStore(lng, lat);
          routeApp(router);
        } else {
          return false;
        }
      },
    }
  ]
})

router.afterEach(async (to, from) => {
  if (import.meta.env.VITE_DEBUG == 'true') console.log('router afterEach to:', to, 'from:', from);
  if (to.name !== 'not-found' && to.name !== 'search') {
    await dataFetch(to, from);
  } else if (to.name == 'not-found') {
    const MainStore = useMainStore();
    MainStore.currentTopic = "Property"
  }
});

export default router
