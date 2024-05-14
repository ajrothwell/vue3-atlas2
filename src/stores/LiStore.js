import { defineStore } from 'pinia';
import { useGeocodeStore } from '@/stores/GeocodeStore.js'

import useTransforms from '@/composables/useTransforms';
const { currency, date } = useTransforms();
import axios from 'axios';

export const useLiStore = defineStore('LiStore', {
  state: () => {
    return {
      selectedLiBuildingNumber: null,
      liBuildingFootprints: {},
      liBuildingCertSummary: {},
      liBuildingCerts: {},
      liPermits: {},
      liAisZoningDocs: {},
      liEclipseZoningDocs: {},
      liInspections: {},
      liViolations: {},
      liBusinessLicenses: {},
    };
  },
  // each of these functions was originally a single data-source file in atlas
  actions: {
    async fillLiBuildingFootprints() {
      console.log('fillLiBuildingFootprints is running');
      const GeocodeStore = useGeocodeStore();
      const feature = GeocodeStore.aisData.features[0].properties.bin.split('|');
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
      const GeocodeStore = useGeocodeStore();
      const feature = GeocodeStore.aisData.features[0].properties.bin.split('|');
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
      const GeocodeStore = useGeocodeStore();
      const feature = GeocodeStore.aisData.features[0].properties.bin.split('|');
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
      this.liBuildingCerts = await response.json();
    },

    async fillLiPermits() {
      const GeocodeStore = useGeocodeStore();
      const feature = GeocodeStore.aisData.features[0];
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
      this.liPermits = await response.json();
    },

    async fillLiAisZoningDocs() {
      const GeocodeStore = useGeocodeStore();
      const feature = GeocodeStore.aisData.features[0];
      let baseUrl = 'https://phl.carto.com/api/v2/sql?q=';
      const url = baseUrl += `select * from ais_zoning_documents where doc_id = ANY('{ ${feature.properties.zoning_document_ids} }'::text[])`;
      const response = await fetch(url);
      this.liAisZoningDocs = await response.json()
    },
    async fillLiEclipseZoningDocs() {
      const GeocodeStore = useGeocodeStore();
      const feature = GeocodeStore.aisData.features[0];
      let baseUrl = 'https://phl.carto.com/api/v2/sql?q=';
      let query = null;
      if (feature.properties.eclipse_location_id === null || feature.properties.eclipse_location_id === '') {
        query = 'select * from li_zoning_docs where address_objectid in (' + null + ')';
      } else {
        const eclipseLocId = feature.properties.eclipse_location_id.split('|');
        let str = "'";
        let i;
        for (i = 0; i < eclipseLocId.length; i++) {
          str += eclipseLocId[i];
          str += "', '";
        }
        str = str.slice(0, str.length - 3);
        query = `select * from li_zoning_docs where address_objectid in (${ str })`;
      }
      const url = baseUrl += query;
      const response = await fetch(url);
      this.liEclipseZoningDocs = await response.json();
    },

    async fillLiInspections() {
      const GeocodeStore = useGeocodeStore();
      const feature = GeocodeStore.aisData.features[0];
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
      this.liInspections = await response.json();
    },

    async fillLiViolations() {
      const GeocodeStore = useGeocodeStore();
      const feature = GeocodeStore.aisData.features[0];
      let baseUrl = 'https://phl.carto.com/api/v2/sql?q=';
      const eclipse_location_id = feature.properties.eclipse_location_id.replace(/\|/g, "', '");
      const streetaddress = feature.properties.street_address;
      const opaQuery = feature.properties.opa_account_num ? ` AND opa_account_num IN ('${ feature.properties.opa_account_num}')` : ``;
      const pwd_parcel_id = feature.properties.pwd_parcel_id;
      const addressId = feature.properties.li_address_key.replace(/\|/g, "', '");

      const url = baseUrl += `SELECT * FROM VIOLATIONS WHERE ( address = '${ streetaddress }' \
        OR addressobjectid IN ('${ addressId }') \
        OR parcel_id_num IN ( '${ pwd_parcel_id }' ) ) \
        ${ opaQuery } \
        AND systemofrecord IN ('HANSEN') \
        UNION SELECT * FROM VIOLATIONS WHERE ( addressobjectid IN ('${ eclipse_location_id }') \
        OR parcel_id_num IN ( '${ pwd_parcel_id }' ) ) \
        ${ opaQuery } \
        AND systemofrecord IN ('ECLIPSE') \
        ORDER BY casenumber DESC`;

      const response = await fetch(url);
      this.liViolations = await response.json();
    },

    async fillLiBusinessLicenses() {
      const GeocodeStore = useGeocodeStore();
      const feature = GeocodeStore.aisData.features[0];
      let baseUrl = 'https://phl.carto.com/api/v2/sql?q=';
      const eclipse_location_id = feature.properties.eclipse_location_id.replace(/\|/g, "', '");
      const streetaddress = feature.properties.street_address;
      const opaQuery = feature.properties.opa_account_num ? ` AND opa_account_num IN ('${ feature.properties.opa_account_num}')` : ``;
      const pwd_parcel_id = feature.properties.pwd_parcel_id;

      let query;
      if (eclipse_location_id) {
        query = `SELECT * FROM BUSINESS_LICENSES WHERE ( addressobjectid IN ('`+ eclipse_location_id +`') \
        OR address = '${streetaddress}' \
        OR parcel_id_num IN ( '${ pwd_parcel_id }' ) ) \
        ${opaQuery } \
        ORDER BY licensetype`;
      } else {
        query = `SELECT * FROM BUSINESS_LICENSES WHERE ( address = '${streetaddress}' \
        OR parcel_id_num IN ( '${ pwd_parcel_id }' ) ) \
        ${opaQuery } \
        ORDER BY licensetype`;
      }
      const url = baseUrl += query;
      const response = await fetch(url);
      this.liBusinessLicenses = await response.json();
    }
  },
  // keeping formatting getters here in the store only works if the data is not looped
  // through for a horizontal table
  getters: {

  }
})