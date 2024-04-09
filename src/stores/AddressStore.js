import { defineStore } from 'pinia';

export const useAddressStore = defineStore("AddressStore", {
  state: () => {
    return {
      addressData: {},
    };
  },

  actions: {
    async fillAddressData(address) {
      const response = await fetch(`https://api.phila.gov/ais/v1/search/${address}?include_units=false`);
      this.addressData = await response.json()
    },
  },
});