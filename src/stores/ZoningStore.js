import axios from 'axios';

import { defineStore } from 'pinia';
import { useParcelsStore } from './ParcelsStore';
import { useGeocodeStore } from '@/stores/GeocodeStore.js'
import { useMainStore } from '@/stores/MainStore.js'

import useTransforms from '@/composables/useTransforms';
const { currency, date, rcoPrimaryContact, phoneNumber } = useTransforms();

export const useZoningStore = defineStore('ZoningStore', {
  state: () => {
    return {
      zoningBase: {},
      zoningOverlays: {},
      pendingBills: {},
      zoningAppeals: {},
      rcos: {},
      loadingZoningData: true,
    };
  },
  actions: {
    async clearZoningData() {
      this.zoningBase = {};
      this.zoningOverlays = {};
      this.pendingBills = {};
      this.zoningAppeals = {};
      this.rcos = {};
      this.loadingZoningData = true;
    },
    async fillZoningBase() {
      const ParcelsStore = useParcelsStore();
      const features = ParcelsStore.dor.features;
      if (!features) return;
      for (let feature of features) {
        let baseUrl = 'https://phl.carto.com/api/v2/sql?q=';
        const mapreg = feature.properties.MAPREG;
        const query = "\
          WITH all_zoning AS \
            ( \
              SELECT * \
              FROM   phl.zoning_basedistricts \
            ), \
          parcel AS \
            ( \
              SELECT * \
              FROM   phl.dor_parcel \
              WHERE  dor_parcel.mapreg = '" + mapreg + "' \
            ), \
          zp AS \
            ( \
              SELECT all_zoning.* \
              FROM   all_zoning, parcel \
              WHERE  St_intersects(parcel.the_geom, all_zoning.the_geom) \
            ), \
          combine AS \
            ( \
              SELECT zp.objectid, \
              zp.long_code, \
              zp.pending, \
              zp.pendingbill, \
              zp.pendingbillurl, \
              St_area(St_intersection(zp.the_geom, parcel.the_geom)) / St_area(parcel.the_geom) AS overlap_area \
              FROM zp, parcel \
            ), \
          total AS \
            ( \
              SELECT long_code, pending, pendingbill, pendingbillurl, sum(overlap_area) as sum_overlap_area \
              FROM combine \
              GROUP BY long_code, pending, pendingbill, pendingbillurl \
            ) \
          SELECT * \
          FROM total \
          WHERE sum_overlap_area >= 0.01";
        const url = baseUrl += query;
        const response = await fetch(url);
        this.zoningBase[feature.properties.OBJECTID] = await response.json();
      }
    },
    async fillZoningOverlays() {
      const ParcelsStore = useParcelsStore();
      const features = ParcelsStore.dor.features;
      if (!features) return;
      for (let feature of features) {
        try {
          let baseUrl = 'https://phl.carto.com/api/v2/sql?q=';
          const mapreg = feature.properties.MAPREG;
          const query = "WITH all_zoning AS \
              ( SELECT * FROM phl.zoning_overlays ), \
            parcel AS \
              ( SELECT * FROM phl.dor_parcel WHERE dor_parcel.mapreg = '" + mapreg + "' ), \
            zp AS \
              ( SELECT all_zoning.* FROM all_zoning, parcel WHERE st_intersects(parcel.the_geom, all_zoning.the_geom)) \
            SELECT code_section, code_section_link, objectid, overlay_name, overlay_symbol, pending, pendingbill, pendingbillurl, sunset_date, type \
            FROM zp";
          const url = baseUrl += query;
          const response = await fetch(url);
          if (response.ok) {
            const data = await response.json();
            console.log('data:', data);
            data.rows.forEach(row => {
              row.link = `<a target='_blank' href='${row.code_section_link}'>${row.code_section}<i class='fas fa-external-link-alt'></i></a>`
            });
            this.zoningOverlays[feature.properties.OBJECTID] = data;
          } else {
            console.warn('fillZoningOverlays - await resolved but HTTP status was not successful');
          }
        } catch {
          console.error('fillZoningOverlays - await never resolved, failed to fetch data');
        }
      }
    },
    async fillPendingBills() {
      const ParcelsStore = useParcelsStore();
      const features = ParcelsStore.dor.features;
      if (!features) return;
      for (let feature of features) {
        let featureId = feature.properties.OBJECTID,
          target = this.zoningBase[featureId] || {},
          data = target.data || {};

        // include only rows where pending is true
        const { rows=[]} = data;
        const rowsFiltered = rows.filter(row => row.pending === 'Yes');

        // give each pending zoning bill a type of "zoning"
        const rowsFilteredWithType = rowsFiltered.map((row) => {
          row.billType = 'Base District';
          row.currentZoning = row.long_code;
          return row;
        });

        let overlayRowsFilteredWithType = [];

        // append pending overlays
        if (this.zoningOverlays[featureId]) {
          const overlayRows = this.zoningOverlays[featureId].rows;
          const overlayRowsFiltered = overlayRows.filter(row => row.pending === 'Yes');
          overlayRowsFilteredWithType = overlayRowsFiltered.map((row) => {
            row.billType = 'Overlay';
            row.currentZoning = row.overlay_name;
            return row;
          });
        } else {
          overlayRowsFilteredWithType = [];
        }

        // combine pending zoning and overlays
        const zoningAndOverlays = rowsFilteredWithType.concat(overlayRowsFilteredWithType);
        this.pendingBills[featureId] = zoningAndOverlays;
      }
    },
    async fillZoningAppeals() {
      try {
        const GeocodeStore = useGeocodeStore();
        const feature = GeocodeStore.aisData.features[0];
        let baseUrl = 'https://phl.carto.com/api/v2/sql?q=';
        const eclipse_location_id = feature.properties.eclipse_location_id.replace(/\|/g, "', '");
        const streetaddress = feature.properties.street_address;
        const opaQuery = feature.properties.opa_account_num ? ` AND opa_account_num IN ('${ feature.properties.opa_account_num}')` : ``;
        const pwd_parcel_id = feature.properties.pwd_parcel_id;
        const addressId = feature.properties.li_address_key.replace(/\|/g, "', '");
        
        const query = `SELECT * FROM APPEALS WHERE ( address = '${ streetaddress }' \
          OR addressobjectid IN ('${ addressId }') OR parcel_id_num IN ( '${ pwd_parcel_id }' ) ) ${ opaQuery } \
          AND systemofrecord IN ('HANSEN') \
          UNION SELECT * FROM APPEALS WHERE ( addressobjectid IN ('${ eclipse_location_id }') \
          OR parcel_id_num IN ( '${ pwd_parcel_id }' ) ) ${ opaQuery } AND systemofrecord IN ('ECLIPSE') \
          ORDER BY scheduleddate DESC`;
        
        const url = baseUrl += query;
        const response = await fetch(url);
        if (response.ok) {
          let data = await response.json();
          this.zoningAppeals = data;
        } else {
          console.warn('fillZoningAppeals - await resolved but HTTP status was not successful');
        }
      } catch {
        console.error('fillZoningAppeals - await never resolved, failed to fetch data');
      }
    },

    async fillRcos() {
      try {
        const GeocodeStore = useGeocodeStore();
        const feature = GeocodeStore.aisData.features[0];
        let url = '//services.arcgis.com/fLeGjb7u4uXqeF9q/arcgis/rest/services/Zoning_RCO/FeatureServer/0/query';

        let params = {
          'returnGeometry': true,
          'where': "1=1",
          'outSR': 4326,
          'outFields': '*',
          'inSr': 4326,
          'geometryType': 'esriGeometryPoint',
          'spatialRel': 'esriSpatialRelWithin',
          'f': 'geojson',
          'geometry': JSON.stringify({ "x": feature.geometry.coordinates[0], "y": feature.geometry.coordinates[1], "spatialReference": { "wkid": 4326 }}),
        };

        const response = await axios.get(url, { params });
        if (response.status === 200) {
          let data = await response.data;
          data.features.forEach(item => {
            item.properties.rco = `<b>${item.properties.ORGANIZATION_NAME}</b><br>${item.properties.ORGANIZATION_ADDRESS}`;
            item.properties.contact = `${rcoPrimaryContact(item.properties.PRIMARY_NAME)}<br>${phoneNumber(item.properties.PRIMARY_PHONE)}<br><a target='_blank' href='mailto:${item.properties.PRIMARY_EMAIL}'>${item.properties.PRIMARY_EMAIL}</a>`;
          })
          this.rcos = data;
        } else {
          console.warn('fillRcos - await resolved but HTTP status was not successful');
        }
      } catch {
        console.error('fillRcos - await never resolved, failed to fetch data');
      }
    }
  },
  // keeping formatting getters here in the store only works if the data is not looped
  // through for a horizontal table
  getters: {},
})