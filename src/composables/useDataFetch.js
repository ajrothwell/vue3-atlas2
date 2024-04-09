import { useAddressStore } from '@/stores/AddressStore.js'
import { useParcelsStore } from '@/stores/ParcelsStore.js'
import { useOpaStore } from '@/stores/OpaStore.js'
import { useLiStore } from '@/stores/LiStore.js'

export default function useDataFetch() {

  const addressDataFetch = async (address) => {
    console.log('addressDataFetch is running');
    const AddressStore = useAddressStore();
    await AddressStore.fillAddressData(address);
  }
  
  const parcelsDataFetch = async () => {
    const ParcelsStore = useParcelsStore();
    await ParcelsStore.fillPwdParcelData();
    await ParcelsStore.fillDorParcelData();   
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

  }

  return {
    addressDataFetch,
    parcelsDataFetch,
    topicDataFetch,
  }

}