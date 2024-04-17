import { defineStore } from 'pinia';

export const useAddressStore = defineStore("AddressStore", {
  state: () => {
    return {
      addressData: {},
    };
  },

  actions: {
    async fillAddressData(address) {
      try {
        const response = await fetch(`https://api.phila.gov/ais/v1/search/${address}?include_units=false`)
        if (response.ok) {
          console.log('Promise resolved and HTTP status is successful')
          this.addressData = await response.json()
        } else {
          console.log('Promise resolved and HTTP status is not successful')
          this.addressData = {}
        }
      } catch {
        console.error('Failed to fetch address data')
      }
    },
  },

  getters: {
    getOpaOwners: (state) => state.addressData.features[0].properties.opa_owners.join(', '),
  },

});