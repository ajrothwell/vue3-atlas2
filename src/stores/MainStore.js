import { defineStore } from 'pinia';

export const useMainStore = defineStore("MainStore", {
  state: () => {
    return {
      initialDatafetchComplete: false,
      publicPath: null,
      isMobileDevice: null,
      isMac: null,
      lastSearchMethod: 'address',
      lastClickCoords: [0,0],
      currentAddress: '',
      currentTopic: 'Property',
      // currentNearbyDataType: null,
      currentNearbyDataType: null,
      dataSourcesLoadedArray: [],
      clickedRow: [],
      clickedMarkerId: null,
      hoveredStateId: null,
      selectedParcelId: null,
    };
  },

  actions: {
    setCurrentAddress(address) {
      this.currentAddress = address;
    },
    setLastSearchMethod(searchMethod) {
      this.lastSearchMethod = searchMethod;
    },
    setCurrentNearbyDataType(data) {
      this.currentNearbyDataType = data;
    },
    clearDataSourcesLoadedArray() {
      this.dataSourcesLoadedArray = [];
    },
    addToDataSourcesLoadedArray(data) {
      this.dataSourcesLoadedArray.push(data);
    },
  },
});