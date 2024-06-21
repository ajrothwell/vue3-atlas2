import { useMainStore } from '@/stores/MainStore';
import { useParcelsStore } from '@/stores/ParcelsStore';

export default function useRouting() {
  const routeApp = (router) => {
    console.log('routeApp')
    const MainStore = useMainStore();
    const ParcelsStore = useParcelsStore();
    if (MainStore.currentAddress && MainStore.currentTopic == 'Nearby Activity') {
      router.push({ name: 'address-topic-and-data', params: { address: MainStore.currentAddress, topic: "Nearby Activity", data: MainStore.currentNearbyDataType || 'nearby311' } });
    } else if (MainStore.currentAddress && MainStore.currentTopic) {
      router.push({ name: 'address-and-topic', params: { address: MainStore.currentAddress, topic: MainStore.currentTopic } });
    } else if (MainStore.currentAddress) {
      router.push({ name: 'address', params: { address: MainStore.currentAddress } });
    } else if (ParcelsStore.pwd.features && ParcelsStore.pwd.features.length > 0) {
      router.push({ name: 'address-and-topic', params: { address: ParcelsStore.pwd.features[0].properties.ADDRESS, topic: MainStore.currentTopic } })
    } else {
      
    }
  }
  return {
    routeApp
  }
}