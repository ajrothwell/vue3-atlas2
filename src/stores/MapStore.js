import { defineStore } from 'pinia';

export const useMapStore = defineStore("MapStore", {
  state: () => {
    return {
      map: {},
      currentTopicMapStyle: {},
    };
  },

});