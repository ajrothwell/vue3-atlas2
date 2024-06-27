import { defineStore } from 'pinia';
import { useMainStore } from '@/stores/MainStore.js'

export const useGeocodeStore = defineStore("GeocodeStore", {
  state: () => {
    return {
      aisData: {},
    };
  },

  actions: {
    async fillaisData(address) {
      // const MainStore = useMainStore();
      try {
        if (import.meta.env.VITE_DEBUG == 'true') console.log('Address - fillaisData is running, address:', address)
        // const aisDataLoadedFlag = false;
        // on a new address search, clear all of the loaded data sources
        // const dataSourcesLoadedArray.value = [];
        const response = await fetch(`https://api.phila.gov/ais/v1/search/${encodeURIComponent(address)}?include_units=false`)
        if (response.ok) {
          if (import.meta.env.VITE_DEBUG == 'true') console.log('Address - await resolved and HTTP status is successful')
          this.aisData = await response.json()
          // if (!aisData.features) {
          //   router.push({ name: 'not-found' });
          //   return;
          // }
          // if there is a value, add the value for the street_address in the MainStore
          // const currentAddress = aisData.features[0].properties.street_address;
          // MainStore.setCurrentAddress(currentAddress);
          // set the aisDataLoadedFlag value to true
          // aisDataLoadedFlag = true;
        } else {
          if (import.meta.env.VITE_DEBUG == 'true') console.log('Address - await resolved but HTTP status was not successful')
          this.aisData = {}
          // const MainStore = useMainStore();
          // MainStore.currentAddress = "";
        }
      } catch {
        if (import.meta.env.VITE_DEBUG == 'true') console.error('Address - await never resolved, failed to fetch address data')
      }
    },
  },
  getters: {
    getOpaOwners: (state) => state.aisData.features[0].properties.opa_owners.join(', '),
  },

});