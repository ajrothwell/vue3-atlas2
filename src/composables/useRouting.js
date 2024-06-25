import { useMainStore } from '@/stores/MainStore';
import { useParcelsStore } from '@/stores/ParcelsStore';

export default function useRouting() {
  const routeApp = (router) => {
    console.log('routeApp')
    const MainStore = useMainStore();
    const ParcelsStore = useParcelsStore();
    if (MainStore.currentAddress && MainStore.currentTopic == 'Nearby Activity') {
      if (import.meta.env.VITE_DEBUG) console.log('routeApp routing to address-topic-and-data');
      router.push({ name: 'address-topic-and-data', params: { address: MainStore.currentAddress, topic: "Nearby Activity", data: MainStore.currentNearbyDataType || 'nearby311' } });
    } else if (MainStore.currentAddress && MainStore.currentTopic) {
      if (import.meta.env.VITE_DEBUG) console.log('routeApp routing to address-and-topic because MainStore has address and topic');
      router.push({ name: 'address-and-topic', params: { address: MainStore.currentAddress, topic: MainStore.currentTopic } });
    } else if (MainStore.currentAddress) {
      if (import.meta.env.VITE_DEBUG) console.log('routeApp routing to address because MainStore has address');
      router.push({ name: 'address', params: { address: MainStore.currentAddress } });
    } else if (MainStore.lastClickCoords == 'mapClick' && ParcelsStore.pwd.features && ParcelsStore.pwd.features.length > 0) {
      if (import.meta.env.VITE_DEBUG) console.log('routeApp routing to address-and-topic because ParcelsStore has pwd features');
      router.push({ name: 'address-and-topic', params: { address: ParcelsStore.pwd.features[0].properties.ADDRESS, topic: MainStore.currentTopic } })
    } else {
      router.push({ name: 'not-found' });
    }
  }
  return {
    routeApp
  }
}