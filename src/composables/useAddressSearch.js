import { useAddressStore } from '@/stores/AddressStore.js'
import { useParcelsStore } from '@/stores/ParcelsStore.js'
import { useOpaStore } from '@/stores/OpaStore.js'
import { useLiStore } from '@/stores/LiStore.js'

export default function useAddressSearch() {

  const addressSearch = async (address) => {
    console.log('addressSearch is running');
    const AddressStore = useAddressStore();
    await AddressStore.fillAddressData(address);

    const ParcelsStore = useParcelsStore();
    await ParcelsStore.fillPwdParcelData();
    await ParcelsStore.fillDorParcelData();

    const OpaStore = useOpaStore();
    await OpaStore.fillOpaData();

    const LiStore = useLiStore();
    await LiStore.fillLiInspections();
    await LiStore.fillLiPermits();
  }

  return {
    addressSearch,
  }

}