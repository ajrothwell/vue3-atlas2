import { defineStore } from 'pinia';

export const useMainStore = defineStore("MainStore", {
  state: () => {
    return {
      lastSearchMethod: '',
      currentAddress: '',
      currentNearbyDataType: 'nearby311',
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
  },
});