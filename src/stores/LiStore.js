import { defineStore } from 'pinia';
import { useAddressStore } from '@/stores/AddressStore.js'

import useTransforms from '@/composables/useTransforms';
const { currency, date } = useTransforms();
import axios from 'axios';

export const useLiStore = defineStore('LiStore', {
  state: () => {
    return {
      selectedLiBuildingNumber: null,
      liInspections: {},
      liPermits: {},
      liBuildingFootprints: {},
      liBuildingCertSummary: {},
      liBuildingCerts: {},
    };
  },
  // each of these functions was originally a single data-source file in atlas
  actions: {
    async fillLiBuildingFootprints() {
      console.log('fillLiBuildingFootprints is running');
      const AddressStore = useAddressStore();
      const feature = AddressStore.addressData.features[0].properties.bin.split('|');
      const baseUrl = 'https://services.arcgis.com/fLeGjb7u4uXqeF9q/ArcGIS/rest/services/LI_BUILDING_FOOTPRINTS/FeatureServer/0/query';
      let data;
      let where;
      let bin = "";
      if (feature.length) {
        for (let i=0;i<feature.length;i++) {
          bin += feature[i];
          if (i < feature.length-1) {
            bin += "', '";
          }
        }
        where = "BIN IN ('" + bin + "')";
        // console.log('after loop, bin:', bin);
      } else {
        data = feature.properties.li_parcel_id;
        where = "PARCEL_ID_NUM = '" + data + "'";
      }
      console.log('where:', where);
      const params = {
        where: where,
        outFields: '*',
        outSR: 4326,
        f: 'pjson',
      };
      const response = await axios.get(baseUrl, { params });
      this.liBuildingFootprints = await response.data;
    },
    async fillLiBuildingCertSummary() {
      console.log('fillLiBuildingCertSummary is running');
      const AddressStore = useAddressStore();
      const feature = AddressStore.addressData.features[0].properties.bin.split('|');
      let baseUrl = 'https://phl.carto.com/api/v2/sql?q=';
      let bin = "";
      // console.log('li-building-cert-summary, feature:', feature);
      if (feature.length) {
        for (let i=0;i<feature.length;i++) {
          bin += feature[i];
          if (i < feature.length-1) {
            bin += "', '";
          }
        }
        // console.log('after loop, bin:', bin);
      } else if (this.liBuildingFootprints.data.features.length) {
        bin = this.liBuildingFootprints.data.features[0].attributes.BIN;//.replace(/\|/g, "', '");
      } else {
        bin = '';
      }
      const url = baseUrl += `SELECT * FROM building_cert_summary WHERE structure_id IN ('${bin}')`;
      const response = await fetch(url);
      this.liBuildingCertSummary = await response.json()
    },
    async fillLiBuildingCerts() {
      console.log('fillLiBuildingCerts is running');
      const AddressStore = useAddressStore();
      const feature = AddressStore.addressData.features[0].properties.bin.split('|');
      let baseUrl = 'https://phl.carto.com/api/v2/sql?q=';
      let bin = "";
      if (feature.length) {
        for (let i=0;i<feature.length;i++) {
          bin += feature[i];
          if (i < feature.length-1) {
            bin += "', '";
          }
        }
      } else if (this.liBuildingFootprints.data.features.length) {
        bin = this.liBuildingFootprints.data.features[0].attributes.BIN;//.replace(/\|/g, "', '");
      } else {
        bin = '';
      }
      const url = baseUrl += `SELECT * FROM building_certs WHERE bin IN ('${bin}')`;
      const response = await fetch(url);
      this.liBuildingCerts = await response.json()
    },
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
  // keeping formatting getters here in the store only works if the data is not looped
  // through for a horizontal table
  getters: {

  }
})