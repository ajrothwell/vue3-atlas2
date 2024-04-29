import { createRouter, createWebHashHistory } from 'vue-router';
import App from '@/App.vue';
import $config from '@/config';
// const $config = config.$config;

import { useAddressStore } from '@/stores/AddressStore.js'
import { useCondosStore } from '@/stores/CondosStore.js'
import { useParcelsStore } from '@/stores/ParcelsStore.js'
import { useOpaStore } from '@/stores/OpaStore.js'
import { useLiStore } from '@/stores/LiStore.js'
import { useDorStore } from '@/stores/DorStore.js'
import { useNearbyActivityStore } from '@/stores/NearbyActivityStore.js'
import { useMapStore } from '@/stores/MapStore.js'
import { useMainStore } from '@/stores/MainStore.js'

import useRouting from '@/composables/useRouting';
const { routeApp } = useRouting();

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

const getParcelAndPutInStore = async(lng, lat) => {
  let currentAddress;
  const MainStore = useMainStore();
  MainStore.selectedParcelId = null;
  let currentTopic = MainStore.currentTopic;
  const parcelLayer = $config.parcelLayerForTopic[currentTopic];
  const ParcelsStore = useParcelsStore();
  await ParcelsStore.fillParcelDataByLngLat(lng, lat, parcelLayer);
  if (!ParcelsStore[parcelLayer].features[0]) {
    router.push({ name: 'not-found' });
    return;
  }
  const addressField = parcelLayer === 'pwd' ? 'ADDRESS' : 'ADDR_SOURCE';
  currentAddress = ParcelsStore[parcelLayer].features[0].properties[addressField];
  console.log('getParcelAndPutInStore, currentAddress:', currentAddress, 'parcelLayer:', parcelLayer, 'addressField', addressField, 'ParcelsStore[parcelLayer].features[0].properties:', ParcelsStore[parcelLayer].features[0].properties, 'ParcelsStore[parcelLayer].features[0].properties[addressField]:', ParcelsStore[parcelLayer].features[0].properties[addressField]);
  MainStore.setCurrentAddress(currentAddress);
}

const dataFetch = async(to, from) => {
  const MainStore = useMainStore();
  const AddressStore = useAddressStore();
  const dataSourcesLoadedArray = MainStore.dataSourcesLoadedArray;
  if (to.name === 'not-found') {
    return;
  }
  // GET PARAMS
  let address, topic;
  if (to.params.address) { address = to.params.address } else if (to.query.address) { address = to.query.address }
  if (to.params.topic) { topic = to.params.topic }

  if (address !== AddressStore.addressData.normalized) {
    await getAddressAndPutInStore(address);
  } else if (dataSourcesLoadedArray.includes(topic)) {
    return;
  }

  // GET PARCELS AND DATA FOR TOPIC
  const ParcelsStore = useParcelsStore();
  await ParcelsStore.fillPwdParcelData();
  await ParcelsStore.fillDorParcelData(); 
  const CondosStore = useCondosStore();
  await CondosStore.fillCondoData(address);  
  if (to.params.topic == "Condominiums" && !CondosStore.condosData.length) {
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
    await LiStore.fillLiInspections();
    await LiStore.fillLiPermits();
  }

  if (topic === 'Deeds') {
    const DorStore = useDorStore();
    await DorStore.fillDorDocuments();
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
  history: createWebHashHistory(import.meta.env.BASE_URL),
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
          await getParcelAndPutInStore(lng, lat);
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
  }
});

export default router
