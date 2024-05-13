import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router';
import App from '@/App.vue';
import $config from '@/config';
// const $config = config.$config;

import { useAddressStore } from '@/stores/AddressStore.js'
import { useCondosStore } from '@/stores/CondosStore.js'
import { useParcelsStore } from '@/stores/ParcelsStore.js'
import { useOpaStore } from '@/stores/OpaStore.js'
import { useLiStore } from '@/stores/LiStore.js'
import { useDorStore } from '@/stores/DorStore.js'
import { useZoningStore } from '@/stores/ZoningStore.js'
import { useVotingStore } from '@/stores/VotingStore.js'
import { useNearbyActivityStore } from '@/stores/NearbyActivityStore.js'
import { useMapStore } from '@/stores/MapStore.js'
import { useMainStore } from '@/stores/MainStore.js'

import useRouting from '@/composables/useRouting';
const { routeApp } = useRouting();
// import useParcels from '@/composables/useParcels';
// const { processParcels } = useParcels();

const getAddressAndPutInStore = async(address) => {
  console.log('getAddressAndPutInStore is running, address:', address);
  const MainStore = useMainStore();
  MainStore.clearDataSourcesLoadedArray();
  const AddressStore = useAddressStore();
  await AddressStore.fillAddressData(address);
  if (!AddressStore.addressData.features) {
    router.push({ name: 'not-found' });
    return;
  }
  // if there is a value, add the value for the street_address in the MainStore
  const currentAddress = AddressStore.addressData.features[0].properties.street_address;
  MainStore.setCurrentAddress(currentAddress);
}

const getParcelsAndPutInStore = async(lng, lat) => {
  let currentAddress;
  const MainStore = useMainStore();
  MainStore.selectedParcelId = null;
  let currentTopic = MainStore.currentTopic;
  const parcelLayer = $config.parcelLayerForTopic[currentTopic];
  const ParcelsStore = useParcelsStore();
  await ParcelsStore.fillParcelDataByLngLat(lng, lat, 'pwd');
  await ParcelsStore.fillParcelDataByLngLat(lng, lat, 'dor');
  if (!ParcelsStore.pwd.features[0] && !ParcelsStore.dor.features[0]) {
    router.push({ name: 'not-found' });
    return;
  }
  const addressField = parcelLayer === 'pwd' ? 'ADDRESS' : 'ADDR_SOURCE';
  currentAddress = ParcelsStore[parcelLayer].features[0].properties[addressField];
  console.log('getParcelAndPutInStore, currentAddress:', currentAddress, 'parcelLayer:', parcelLayer, 'addressField', addressField, 'ParcelsStore[parcelLayer].features[0].properties:', ParcelsStore[parcelLayer].features[0].properties, 'ParcelsStore[parcelLayer].features[0].properties[addressField]:', ParcelsStore[parcelLayer].features[0].properties[addressField]);
  MainStore.setCurrentAddress(currentAddress);
}

const dataFetch = async(to, from) => {
  console.log('dataFetch is starting');
  const MainStore = useMainStore();
  const AddressStore = useAddressStore();
  const ParcelsStore = useParcelsStore();
  const dataSourcesLoadedArray = MainStore.dataSourcesLoadedArray;
  if (to.name === 'not-found') {
    return;
  }
  // GET PARAMS
  let address, topic;
  if (to.params.address) { address = to.params.address } else if (to.query.address) { address = to.query.address }
  if (to.params.topic) { topic = to.params.topic }

  if (address !== AddressStore.addressData.normalized) {
    console.log('address:', address, 'typeof address:', typeof address);
    // if (!address.length || address == '' || address == null) {
      if (ParcelsStore.dor.features) {
        console.log('ParcelsStore.dor.features[0].properties.BASEREG:', ParcelsStore.dor.features[0].properties.BASEREG);
        await ParcelsStore.fillParcelDataByLngLat(MainStore.lastClickCoords.lng, MainStore.lastClickCoords.lat, 'pwd')
        await getAddressAndPutInStore(ParcelsStore.pwd.features[0].properties.PARCELID);
      } else {
      await getAddressAndPutInStore(address);
    }
  } else if (dataSourcesLoadedArray.includes(topic)) {
    return;
  }

  console.log('dataFetch is still going after address');
  // GET PARCELS AND DATA FOR TOPIC
  if (MainStore.lastSearchMethod === 'address') { 
    await ParcelsStore.fillPwdParcelData();
    await ParcelsStore.fillDorParcelData();
  } 
  const CondosStore = useCondosStore();
  await CondosStore.fillCondoData(address);  
  if (to.params.topic == "Condominiums" && !CondosStore.condosData.features.length) {
    MainStore.currentTopic = "Property";
    router.push({ name: 'address-and-topic', params: { address: to.params.address, topic: 'Property' } });
    return
  }
  await topicDataFetch(to.params.topic);
  MainStore.addToDataSourcesLoadedArray(to.params.topic);
}

const topicDataFetch = async (topic) => {
  console.log('topicDataFetch is running, topic:', topic);
  
  if (topic === 'Property') {
    const OpaStore = useOpaStore();
    await OpaStore.fillOpaData();
  }

  if (topic === 'Licenses & Inspections') {
    const LiStore = useLiStore();
    await LiStore.fillLiBuildingFootprints();
    await LiStore.fillLiBuildingCertSummary();
    await LiStore.fillLiBuildingCerts();
    await LiStore.fillLiInspections();
    await LiStore.fillLiAisZoningDocs();
    await LiStore.fillLiEclipseZoningDocs();
    await LiStore.fillLiPermits();
    await LiStore.fillLiViolations();
    await LiStore.fillLiBusinessLicenses();
  }

  if (topic === 'Deeds') {
    const DorStore = useDorStore();
    await DorStore.fillDorDocuments();
    await DorStore.fillRegmaps();
    await DorStore.fillDorCondos();
  }

  if (topic === 'Zoning') {
    const ZoningStore = useZoningStore();
    await ZoningStore.fillZoningBase();
    await ZoningStore.fillZoningOverlays();
    await ZoningStore.fillPendingBills();
    await ZoningStore.fillZoningAppeals();
    await ZoningStore.fillRcos();
  }

  if (topic === 'Voting') {
    const VotingStore = useVotingStore();
    await VotingStore.fillDivisions();
    await VotingStore.fillPollingPlaces();
    await VotingStore.fillElectedOfficials();
    await VotingStore.fillNextElection();
  }

  if (topic === 'Nearby Activity') {
    const MainStore = useMainStore();
    const currentNearbyDataType = MainStore.currentNearbyDataType;
    const NearbyActivityStore = useNearbyActivityStore();
    await NearbyActivityStore.fetchData(currentNearbyDataType);
    const AddressStore = useAddressStore();
    const coordinates = AddressStore.addressData.features[0].geometry.coordinates;
    const MapStore = useMapStore();
    await MapStore.fillBufferForAddress(coordinates[0], coordinates[1]);
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
        console.log('search route beforeEnter, to.query:', to.query, 'from:', from);
        const { address, lat, lng } = to.query;
        const MainStore = useMainStore();
        if (address) {
          MainStore.setLastSearchMethod('address');
          await getAddressAndPutInStore(address);
        } else if (lat && lng) {
          MainStore.setLastSearchMethod('mapClick');
          await getParcelsAndPutInStore(lng, lat);
        }
        routeApp(router);
      },
    }
  ]
})

router.afterEach(async (to, from) => {
  console.log('router afterEach to:', to, 'from:', from);
  if (to.name !== 'not-found' && to.name !== 'search') {
    await dataFetch(to, from);
  } else if (to.name == 'not-found') {
    const MainStore = useMainStore();
    MainStore.currentTopic = "Property"
  }
});

export default router
