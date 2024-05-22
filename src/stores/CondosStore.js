import { defineStore } from 'pinia';
import { useGeocodeStore } from '@/stores/GeocodeStore.js'
import axios from 'axios';

export const useCondosStore = defineStore('CondosStore', {
  state: () => {
    return {
      condosData: {},
      dataPageFilled: null,
      lastPageUsed: 1,
    };
  },
  actions: {
    async fillCondoData(address, page = 1) {
      console.log('fillCondoData is runnning, address', address);
      try {
        const GeocodeStore = useGeocodeStore();
        const AddressLoaded = GeocodeStore.aisData.features
        if (!AddressLoaded) { return }
        const aisData = AddressLoaded[0];
        let params = {
          include_units: true,
          opa_only: true,
          page: page,
        };
        const response = await axios(`https://api.phila.gov/ais/v1/search/${address}`, { params });
        // console.log('condos response:', response);
        if (response.status === 200) {
          console.log('Condos - await resolved and HTTP status is successful')
          this.dataPageFilled = page;
          if (response.data.features.length > 0) {
            let newData = {
              page_count: response.data.page_count,
              total_size: response.data.total_size,
              features: [],
            }
            // console.log('in condo-list, data:', data, 'state:', state);
            for (let feature of response.data.features) {
              // console.log('low frac:', feature.properties.address_low_frac);
              if (feature.properties.address_low_frac !== aisData.properties.address_low_frac || feature.properties.street_address === aisData.properties.street_address) {
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