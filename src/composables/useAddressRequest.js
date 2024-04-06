
import { ref } from "vue"

export default function useAddressRequest() {

  const addressRetrieved = ref([]);
  // const baseURL = 'https://api.phila.gov/ais/v1/search/';

  const fetchAddress = async (address) => {
    console.log('fetchAddress is running');
    // const response = await fetch(`${baseURL}/${address}`)
    const response = await fetch(`https://api.phila.gov/ais/v1/search/${address}?include_units=false`);
    addressRetrieved.value = await response.json();
    // return addressRetrieved;
  }

  return {
    addressRetrieved,
    fetchAddress
  }

}