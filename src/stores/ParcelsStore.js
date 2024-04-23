
import { defineStore } from 'pinia';
import { useAddressStore } from '@/stores/AddressStore.js'
import axios from 'axios';

export const useParcelsStore = defineStore('ParcelsStore', {
  state: () => {
    return {
      PWD: {},
      DOR: {},
    };
  },
  actions: {
    async fillPwdParcelData() {
      const AddressStore = useAddressStore();
      const AddressLoaded = AddressStore.addressData.features
      if (!AddressLoaded) { return }
      const AddressData = AddressLoaded[0];
      const pwdParcelNumber = AddressData.properties.pwd_parcel_id;
      if (!pwdParcelNumber) {
        console.log('no PWD parcel in AIS')
        await this.fillParcelDataByLngLat(AddressData.geometry.coordinates[0], AddressData.geometry.coordinates[1], 'PWD');
        return;
      }
      try {
        const response = await fetch(`https://services.arcgis.com/fLeGjb7u4uXqeF9q/ArcGIS/rest/services/PWD_PARCELS/FeatureServer/0/query?where=PARCELID=%27${pwdParcelNumber}%27&outSR=4326&f=geojson&outFields=*&returnGeometry=true`);
        if (response.ok) {
          this.PWD = await response.json()
        } else {
          console.error('Failed to fetch PWD parcel data')
        }
      } catch {
        console.error('Failed to fetch PWD parcel data')
      }
    },

    async fillDorParcelData() {
      const AddressStore = useAddressStore();
      const AddressLoaded = AddressStore.addressData.features
      if (!AddressLoaded) { return }
      const AddressData = AddressLoaded[0];
      const dorParcelId = AddressData.properties.dor_parcel_id;
      if (!dorParcelId) {
        console.log('no DOR parcel in AIS')
        await this.fillParcelDataByLngLat(AddressData.geometry.coordinates[0], AddressData.geometry.coordinates[1], 'DOR');
        return;
      }
      try {
        const response = await fetch(`https://services.arcgis.com/fLeGjb7u4uXqeF9q/ArcGIS/rest/services/DOR_Parcel/FeatureServer/0/query?where=MAPREG=%27${dorParcelId}%27&outSR=4326&f=geojson&outFields=*&returnGeometry=true`);
        if (response.ok) {
          this.DOR = await response.json()
        } else {
          console.error('Failed to fetch DOR parcel data')
        }
      } catch {
        console.error('Failed to fetch DOR parcel data')
      }
    },

    async fillParcelDataByLngLat(lng, lat, parcelLayer) {
      console.log('fillParcelDataByLngLat, lng:', lng, 'lat:', lat, 'parcelLayer:', parcelLayer);
      let ESRILayer = parcelLayer === 'PWD' ? 'PWD_PARCELS' : 'DOR_Parcel';
      let params = {
        'where': '1=1',
        'outSR': 4326,
        'f': 'geojson',
        'outFields': '*',
        'returnGeometry': true,
        'geometry': `{ "x": ${lng}, "y": ${lat}, "spatialReference":{ "wkid":4326 }}`,
        'geometryType': 'esriGeometryPoint',
        'spatialRel': 'esriSpatialRelWithin',
      };
      const response = await axios(`https://services.arcgis.com/fLeGjb7u4uXqeF9q/ArcGIS/rest/services/${ESRILayer}/FeatureServer/0/query`, { params });
      console.log('response', response);
      if (response.data.features.length > 0) {
        this[parcelLayer] = await response.data;
      }
    },

  }
})