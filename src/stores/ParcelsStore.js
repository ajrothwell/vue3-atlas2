
import { defineStore } from 'pinia';
import { useAddressStore } from '@/stores/AddressStore.js'

export const useParcelsStore = defineStore('ParcelsStore', {
  state: () => {
    return {
      pwdParcelData: {},
      dorParcelData: {},
    };
  },
  actions: {
    async fillPwdParcelData() {
      const AddressStore = useAddressStore();
      const pwdParcelNumber = AddressStore.addressData.features[0].properties.pwd_parcel_id;
      const response = await fetch(`https://services.arcgis.com/fLeGjb7u4uXqeF9q/ArcGIS/rest/services/PWD_PARCELS/FeatureServer/0/query?where=PARCELID=%27${pwdParcelNumber}%27&outSR=4326&f=geojson&outFields=*&returnGeometry=true`);
      this.pwdParcelData = await response.json()
    },

    async fillDorParcelData() {
      const AddressStore = useAddressStore();
      const dorParcelId = AddressStore.addressData.features[0].properties.dor_parcel_id;
      const response = await fetch(`https://services.arcgis.com/fLeGjb7u4uXqeF9q/ArcGIS/rest/services/DOR_Parcel/FeatureServer/0/query?where=MAPREG=%27${dorParcelId}%27&outSR=4326&f=geojson&outFields=*&returnGeometry=true`);
      this.dorParcelData = await response.json()
    },

  },
  getters: {
    getDorParcelData(state) {
      return state.dorParcelData;
    }
  }
})