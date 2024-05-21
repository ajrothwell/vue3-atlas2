import { defineStore } from 'pinia';
import { useGeocodeStore } from '@/stores/GeocodeStore.js'

import useTransforms from '@/composables/useTransforms';
const { currency, date } = useTransforms();

export const useOpaStore = defineStore('OpaStore', {
  state: () => {
    return {
      opaData: {},
    };
  },
  actions: {
    async fillOpaData() {
      const GeocodeStore = useGeocodeStore();
      const OpaNum = GeocodeStore.aisData.features[0].properties.opa_account_num;
      const response = await fetch(`https://phl.carto.com/api/v2/sql?q=select+*+from+opa_properties_public+where+parcel_number+%3D+%27${OpaNum}%27`);
      this.opaData = await response.json()
    },
  },
  // keeping formatting getters here in the store only works if the data is not looped
  // through for a horizontal table
  getters: {
    getMarketValue: (state) => {
      if (!state.opaData.rows[0]) return null;
      return currency(state.opaData.rows[0].market_value || null);
    },
    getSaleDate: (state) =>  {
      if (!state.opaData.rows[0]) return null;
      date(state.opaData.rows[0].sale_date);
    },
    getSalePrice: (state) => {
      if (!state.opaData.rows[0]) return null;
      currency(state.opaData.rows[0].sale_price);
    }
  },
})