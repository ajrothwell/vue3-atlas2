import { defineStore } from 'pinia';
import { useAddressStore } from '@/stores/AddressStore.js'

export const useOpaStore = defineStore('OpaStore', {
  state: () => {
    return {
      opaData: {},
    };
  },
  actions: {
    async fillOpaData() {
      const AddressStore = useAddressStore();
      const OpaNum = AddressStore.addressData.features[0].properties.opa_account_num;
      const response = await fetch(`https://phl.carto.com/api/v2/sql?q=select+*+from+opa_properties_public+where+parcel_number+%3D+%27${OpaNum}%27`);
      this.opaData = await response.json()
    },
  },
})