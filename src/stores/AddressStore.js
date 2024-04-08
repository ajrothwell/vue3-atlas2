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

// actions in your store are synonymous
// with methods for your component
// except that they are meant to mutate
// your store's data instead of a component's
// local data

//getters

// })