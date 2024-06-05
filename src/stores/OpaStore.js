import { defineStore } from 'pinia';
import { useGeocodeStore } from '@/stores/GeocodeStore.js'

import useTransforms from '@/composables/useTransforms';
const { currency, date } = useTransforms();

export const useOpaStore = defineStore('OpaStore', {
  state: () => {
    return {
      opaData: {},
      loadingOpaData: true,
    };
  },
  actions: {
    async clearAllOpaData() {
      this.loadingOpaData = true;
      this.opaData = {};
    },
    async fillOpaData() {
      try {
        const GeocodeStore = useGeocodeStore();
        const OpaNum = GeocodeStore.aisData.features[0].properties.opa_account_num;
        const response = await fetch(`https://phl.carto.com/api/v2/sql?q=select+*+from+opa_properties_public+where+parcel_number+%3D+%27${OpaNum}%27`);
        if (response.ok) {
          this.opaData = await response.json()
        } else {
          console.warn('opaData - await resolved but HTTP status was not successful')
        }
      } catch {
        console.error('opaData - await never resolved, failed to fetch address data')
      }
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
      return date(state.opaData.rows[0].sale_date);
    },
    getSalePrice: (state) => {
      if (!state.opaData.rows[0]) return null;
      return currency(state.opaData.rows[0].sale_price);
    }
  },
})