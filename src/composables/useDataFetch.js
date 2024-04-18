import { useAddressStore } from '@/stores/AddressStore.js'
import { useCondosStore } from '@/stores/CondosStore.js'
import { useParcelsStore } from '@/stores/ParcelsStore.js'
import { useOpaStore } from '@/stores/OpaStore.js'
import { useLiStore } from '@/stores/LiStore.js'
import { useDorStore } from '@/stores/DorStore.js'
import { useNearbyActivityStore } from '@/stores/NearbyActivityStore.js'

export default function useDataFetch() {

  const addressDataFetch = async (address) => {
    console.log('addressDataFetch is running');
    const AddressStore = useAddressStore();
    await AddressStore.fillAddressData(address);
  }

  const condosDataFetch = async (address) => {
    console.log('condosDataFetch is running');
    const CondosStore = useCondosStore();
    await CondosStore.fillCondoData(address);
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

    if (topic === 'Deeds') {
      const DorStore = useDorStore();
      await DorStore.initializeDorDocuments();
    }

    if (topic === 'Nearby Activity') {
      const NearbyActivityStore = useNearbyActivityStore();
      await NearbyActivityStore.fillNearby311();
    }

  }

  return {
    addressDataFetch,
    parcelsDataFetch,
    condosDataFetch,
    topicDataFetch,
  }

}