import { defineStore } from 'pinia';
import { useMainStore } from '@/stores/MainStore.js'

export const useAddressStore = defineStore("AddressStore", {
  state: () => {
    return {
      addressData: {},
    };
  },

  actions: {
    async fillAddressData(address) {
      // const MainStore = useMainStore();
      try {
        console.log('Address - fillAddressData is running, address:', address)
        // const addressDataLoadedFlag = false;
        // on a new address search, clear all of the loaded data sources
        // const dataSourcesLoadedArray.value = [];
        const response = await fetch(`https://api.phila.gov/ais/v1/search/${encodeURIComponent(address)}?include_units=false`)
        if (response.ok) {
          console.log('Address - await resolved and HTTP status is successful')
          this.addressData = await response.json()
          // if (!addressData.features) {
          //   router.push({ name: 'not-found' });
          //   return;
          // }
          // if there is a value, add the value for the street_address in the MainStore
          // const currentAddress = addressData.features[0].properties.street_address;
          // MainStore.setCurrentAddress(currentAddress);
          // set the addressDataLoadedFlag value to true
          // addressDataLoadedFlag = true;
        } else {
          console.log('Address - await resolved but HTTP status was not successful')
          this.addressData = {}
          const MainStore = useMainStore();
          MainStore.currentAddress = "";
        }
      } catch {
        console.error('Address - await never resolved, failed to fetch address data')
      }
    },
  },
  getters: {
    getOpaOwners: (state) => state.addressData.features[0].properties.opa_owners.join(', '),
  },

});