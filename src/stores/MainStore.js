import { defineStore } from 'pinia';

export const useMainStore = defineStore("MainStore", {
  state: () => {
    return {
      publicPath: null,
      lastSearchMethod: 'address',
      currentAddress: '',
      currentTopic: 'Property',
      currentNearbyDataType: 'nearby311',
      dataSourcesLoadedArray: [],
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