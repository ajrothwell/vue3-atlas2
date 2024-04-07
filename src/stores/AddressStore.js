import { defineStore } from 'pinia';

export const useAddressStore = defineStore("AddressStore", {
  state: () => {
    return {
      addressData: {},
      // products,
      // products:[]
    };
  },

  actions: {
    async fillAddressData(address) {
      // console.log('fillAddressData');
      const response = await fetch(`https://api.phila.gov/ais/v1/search/${address}?include_units=false`);
      this.addressData = await response.json()
    },
  },
});
//     // actions in your store are synonymous
//     // with methods for your component
//     // except that they are meant to mutate
//     // your store's data instead of a component's
//     // local data

//     // addAddress(data) {
//     //   this.address = data;
//     // },

//     // I want to set the products in our state to the products from the json file
//     // fill() {
//     //   this.products = products;
//     // },
//     // async fill() {
//     //   this.products = (await import('@/data/products.json')).default;
//     //   // here we are using a dynamic import instead of something like fetch or axios
//     //   // this.products = (await axios.get('some/end/point')).data
//     // },
//   },

//   //getters
// })