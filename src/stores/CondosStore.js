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
      try {
        const AddressStore = useAddressStore();
        const AddressLoaded = AddressStore.addressData.features
        if (!AddressLoaded) { return }
        const AddressData = AddressLoaded[0];
        let params = {
          include_units: true,
          opa_only: true,
          page: 1,
        };
        const response = await axios(`//api.phila.gov/ais/v1/search/${address}`, { params });
        // console.log('condos response:', response);
        if (response.status === 200) {
          console.log('Condos - await resolved and HTTP status is successful')
          if (response.data.features.length > 0) {
            let newData = {
              page_count: response.data.page_count,
              total_size: response.data.total_size,
              features: [],
            }
            // console.log('in condo-list, data:', data, 'state:', state);
            for (let feature of response.data.features) {
              // console.log('low frac:', feature.properties.address_low_frac);
              if (feature.properties.address_low_frac !== AddressData.properties.address_low_frac || feature.properties.street_address === AddressData.properties.street_address) {
                // return;
                response.data.total_size = response.data.total_size - 1;
              } else {
                newData.features.push(feature);
              }
            }
            this.condosData = newData;
            // this.condosData = dataFeatures;
          }
        } else {
          console.log('Condos - await resolved but no data features')
        }
      } catch {
        console.error('Condos - await never resolved, failed to fetch condo data')
      }
    },
  }
})