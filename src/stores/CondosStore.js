import { defineStore } from 'pinia';
import { useAddressStore } from '@/stores/AddressStore.js'
import axios from 'axios';

export const useCondosStore = defineStore('CondosStore', {
  state: () => {
    return {
      condosData: {},
    };
  },
  actions: {
    async fillCondoData(address) {
      // console.log('fillCondoData is runnning, address', address);
      const AddressStore = useAddressStore();
      const AddressData = AddressStore.addressData.features[0];
      let params = {
        include_units: true,
        opa_only: true,
        page: 1,
      };
      const response = await axios(`//api.phila.gov/ais/v1/search/${address}`, { params });
      if (response.data.features.length > 0) {
        let dataFeatures = [];
        // console.log('in condo-list, data:', data, 'state:', state);
        for (let feature of response.data.features) {
          // console.log('low frac:', feature.properties.address_low_frac);
          if (feature.properties.address_low_frac !== AddressData.properties.address_low_frac || feature.properties.street_address === AddressData.properties.street_address) {
            // return;
            response.data.total_size = response.data.total_size - 1;
          } else {
            dataFeatures.push(feature);
          }
        }
        this.condosData = dataFeatures;
      }
    },
  }
})