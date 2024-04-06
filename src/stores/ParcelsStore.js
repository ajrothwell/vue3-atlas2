
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
      console.log('fillPwdParcelData');
      // const response = await fetch(`https://services.arcgis.com/fLeGjb7u4uXqeF9q/ArcGIS/rest/services/PWD_PARCELS/FeatureServer/0/query?where=${pwdParcelNumber}=%27542611%27&outSR=4326&f=geojson&outFields=*&returnGeometry=true`);
      const response = await fetch(`https://services.arcgis.com/fLeGjb7u4uXqeF9q/ArcGIS/rest/services/PWD_PARCELS/FeatureServer/0/query?where=PARCELID=%27${pwdParcelNumber}%27&outSR=4326&f=geojson&outFields=*&returnGeometry=true`);
      this.pwdParcelData = await response.json()
    },
  },
})