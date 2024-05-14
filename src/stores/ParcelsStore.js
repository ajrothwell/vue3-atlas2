
import { defineStore } from 'pinia';
import { useGeocodeStore } from '@/stores/GeocodeStore.js'
import { useMainStore } from '@/stores/MainStore.js'
import axios from 'axios';
import useParcels from '@/composables/useParcels';
const { processParcels } = useParcels();

export const useParcelsStore = defineStore('ParcelsStore', {
  state: () => {
    return {
      pwd: {},
      dor: {},
    };
  },
  actions: {
    async fillPwdParcelData() {
      const GeocodeStore = useGeocodeStore();
      const AddressLoaded = GeocodeStore.aisData.features
      if (!AddressLoaded) { return }
      const aisData = AddressLoaded[0];
      const pwdParcelNumber = aisData.properties.pwd_parcel_id;
      if (!pwdParcelNumber) {
        console.log('no pwd parcel in AIS')
        await this.fillParcelDataByLngLat(aisData.geometry.coordinates[0], aisData.geometry.coordinates[1], 'pwd');
        return;
      }
      try {
        const response = await fetch(`https://services.arcgis.com/fLeGjb7u4uXqeF9q/ArcGIS/rest/services/PWD_PARCELS/FeatureServer/0/query?where=PARCELID=%27${pwdParcelNumber}%27&outSR=4326&f=geojson&outFields=*&returnGeometry=true`);
        if (response.ok) {
          this.pwd = await response.json()
        } else {
          console.error('Failed to fetch pwd parcel data')
        }
      } catch {
        console.error('Failed to fetch pwd parcel data')
      }
    },

    async fillDorParcelData() {
      const GeocodeStore = useGeocodeStore();
      const AddressLoaded = GeocodeStore.aisData.features
      if (!AddressLoaded) { return }
      const aisData = AddressLoaded[0];
      const dorParcelId = aisData.properties.dor_parcel_id;
      if (!dorParcelId) {
        console.log('no dor parcel in AIS')
        await this.fillParcelDataByLngLat(aisData.geometry.coordinates[0], aisData.geometry.coordinates[1], 'dor');
        return;
      }

      const url = 'https://services.arcgis.com/fLeGjb7u4uXqeF9q/ArcGIS/rest/services/DOR_Parcel/FeatureServer/0/query';
      // const configForParcelLayer = this.config.parcels[parcelLayer];
      // const geocodeField = configForParcelLayer.geocodeField;
      // console.log('url:', url);
      let parcelQuery;

      if (dorParcelId.includes('|')) {
        const idSplit = dorParcelId.split('|');
        let queryString = "MAPREG = '";
        let i;
        for (i=0; i<idSplit.length; i++) {
          queryString = queryString + idSplit[i] + "'";
          if (i < idSplit.length - 1) {
            queryString = queryString + " or MAPREG = '";
          }
        }

        parcelQuery = url + '?where=' + queryString;

      } else if (Array.isArray(dorParcelId)) {
        parcelQuery = url + '?where=MAPREG IN (' + dorParcelId + ')';
      } else {
        parcelQuery = url + "?where=MAPREG='" + dorParcelId + "'";
      }

      let params = {
        'outSR': 4326,
        'f': 'geojson',
        'outFields': '*',
        'returnGeometry': true,
      };

      try {
        const response = await axios(parcelQuery, { params });
        if (response.status === 200) {
          console.log('response', response);
          const originalJson = await response.data;
          const processedData = await processParcels(originalJson);
          const MainStore = useMainStore();
          MainStore.selectedParcelId = processedData.features[0].properties.OBJECTID;
          this.dor = processedData;
        } else {
          console.error('Failed to fetch dor parcel data 1')
        }
      } catch {
        console.error('Failed to fetch dor parcel data 2')
      }
    },

    async fillParcelDataByLngLat(lng, lat, parcelLayer) {
      console.log('fillParcelDataByLngLat, lng:', lng, 'lat:', lat, 'parcelLayer:', parcelLayer);
      let ESRILayer = parcelLayer === 'pwd' ? 'PWD_PARCELS' : 'DOR_Parcel';
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
        let data = await response.data;
        let processedData;
        if (parcelLayer === 'dor') {
          processedData = await processParcels(data);
        } else {
          processedData = data;
        }
        console.log('processedData:', processedData);
        const MainStore = useMainStore();
        MainStore.selectedParcelId = processedData.features[0].properties.OBJECTID;
        this[parcelLayer] = processedData;
      } else {
        this[parcelLayer] = {};
      }
    },

  }
})