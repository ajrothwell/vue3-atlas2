import { defineStore } from 'pinia';

export const useMainStore = defineStore("MainStore", {
  state: () => {
    return {
      lastSearchMethod: '',
      currentAddress: '',
    };
  },

  actions: {
    setCurrentAddress(address) {
      this.currentAddress = address;
    },
    setLastSearchMethod(searchMethod) {
      this.lastSearchMethod = searchMethod;
    },
  },
});