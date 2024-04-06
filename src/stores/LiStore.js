import { defineStore } from 'pinia';
import { useAddressStore } from '@/stores/AddressStore.js'

export const useLiStore = defineStore('LiStore', {
  state: () => {
    return {
      liInspections: {},
      liPermits: {},
    };
  },
  actions: {
    async fillLiInspections() {
      const AddressStore = useAddressStore();
      const feature = AddressStore.addressData.features[0];
      let baseUrl = 'https://phl.carto.com/api/v2/sql?q=';
      const eclipse_location_id = feature.properties.eclipse_location_id.replace(/\|/g, "', '");
      const streetaddress = feature.properties.street_address;
      const opaQuery = feature.properties.opa_account_num ? ` AND opa_account_num IN ('${ feature.properties.opa_account_num}')` : ``;
      const pwd_parcel_id = feature.properties.pwd_parcel_id;
      const addressId = feature.properties.li_address_key.replace(/\|/g, "', '");

      const url = baseUrl += `SELECT * FROM case_investigations WHERE (address = '${ streetaddress }' or addressobjectid IN ('${ addressId }')) \
          AND systemofrecord IN ('HANSEN') ${ opaQuery } UNION SELECT * FROM case_investigations WHERE \
          addressobjectid IN ('${ eclipse_location_id }') OR parcel_id_num IN ( '${ pwd_parcel_id }' ) \
          AND systemofrecord IN ('ECLIPSE') ${ opaQuery }`;

      const response = await fetch(url);
      this.liInspections = await response.json()
    },

    async fillLiPermits() {
      const AddressStore = useAddressStore();
      const feature = AddressStore.addressData.features[0];
      let baseUrl = 'https://phl.carto.com/api/v2/sql?q=';
      const eclipse_location_id = feature.properties.eclipse_location_id.replace(/\|/g, "', '");
      const streetaddress = feature.properties.street_address;
      const opaQuery = feature.properties.opa_account_num ? ` AND opa_account_num IN ('${ feature.properties.opa_account_num}')` : ``;
      const pwd_parcel_id = feature.properties.pwd_parcel_id;
      const addressId = feature.properties.li_address_key.replace(/\|/g, "', '");

      const url = baseUrl += `SELECT * FROM PERMITS WHERE address = '${ streetaddress }' or addressobjectid IN ('${ addressId }') \
      AND systemofrecord IN ('HANSEN') ${ opaQuery } \
      UNION SELECT * FROM PERMITS WHERE addressobjectid IN ('${ eclipse_location_id }') OR parcel_id_num IN ( '${ pwd_parcel_id }' ) \
      AND systemofrecord IN ('ECLIPSE')${ opaQuery }\
      ORDER BY permittype`;

      const response = await fetch(url);
      this.liPermits = await response.json()
    }


  },
})