import { defineStore } from 'pinia';

export const useMainStore = defineStore("MainStore", {
  state: () => {
    return {
      appVersion: 'atlas',
      initialDatafetchComplete: false,
      publicPath: null,
      isMobileDevice: null,
      isMac: null,
      lastSearchMethod: 'address',
      addressSearchValue: '',
      lastClickCoords: [0,0],
      currentAddress: '',
      currentTopic: 'Property',
      currentNearbyDataType: null,
      currentNearbyTimeInterval: {},
      dataSourcesLoadedArray: [],
      clickedRow: [],
      clickedMarkerId: null,
      hoveredStateId: null,
      selectedParcelId: null,
      fullScreenMapEnabled: false,
      fullScreenTopicsEnabled: false,
      windowDimensions: {},
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