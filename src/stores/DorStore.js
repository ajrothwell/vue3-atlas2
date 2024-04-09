import { defineStore } from 'pinia';
import { useParcelsStore } from './ParcelsStore';

export const useDorStore = defineStore("DorStore", {
  state: () => {
    return {
      dorDocuments: {},
    };
  },

  actions: {
    async initializeDorDocuments() {
      this.dorDocuments = {};
      const ParcelsStore = useParcelsStore();
      const feature = ParcelsStore.dorParcelData.features[0];
      console.log('DorStore, feature.properties:', feature.properties);
      const url = `//services.arcgis.com/fLeGjb7u4uXqeF9q/ArcGIS/rest/services/RTT_SUMMARY/FeatureServer/0/query`;
      // const response = await fetch(url);
      // this.dorDocuments = await response.json()
      for (let feature of ParcelsStore.dorParcelData.features) {
        this.dorDocuments[feature.properties.MAPREG] = feature.properties;
      }
    },
  },
})