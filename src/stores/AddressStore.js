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
          console.log('Address - await resolved and HTTP status is successful')
          this.addressData = await response.json()
        } else {
          console.log('Address - await resolved but HTTP status was not successful')
          this.addressData = {}
        }
      } catch {
        console.error('Address - await never resolved, failed to fetch address data')
      }
    },
  },

  getters: {
    getOpaOwners: (state) => state.addressData.features[0].properties.opa_owners.join(', '),
  },

});