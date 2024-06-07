import { useMainStore } from '@/stores/MainStore';
import { useCondosStore } from '@/stores/CondosStore';

export default function useRouting() {
  const routeApp = (router) => {
    const MainStore = useMainStore();
    if (MainStore.currentAddress && MainStore.currentTopic == 'Nearby Activity') {
      router.push({ name: 'address-topic-and-data', params: { address: MainStore.currentAddress, topic: "Nearby Activity", data: MainStore.currentNearbyDataType || 'nearby311' } });
    // } else if (MainStore.currentAddress && MainStore.currentTopic == 'Condominiums') {
    //   const CondosStore = useCondosStore();
    //   router.push({ name: 'address-topic-and-data', params: { address: MainStore.currentAddress, topic: "Condominiums", data: CondosStore.lastPageUsed } });
    } else if (MainStore.currentAddress && MainStore.currentTopic) {
      router.push({ name: 'address-and-topic', params: { address: MainStore.currentAddress, topic: MainStore.currentTopic } });
    } else if (MainStore.currentAddress) {
      router.push({ name: 'address', params: { address: MainStore.currentAddress } });
    }
  }
  return {
    routeApp
  }
}