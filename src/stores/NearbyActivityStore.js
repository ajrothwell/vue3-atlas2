import { defineStore } from 'pinia';
import { useAddressStore } from '@/stores/AddressStore.js'
import { useMapStore } from '@/stores/MapStore.js'

import axios from 'axios';
import { format, subHours, addHours, subDays, addDays, subWeeks, addWeeks, subMonths, addMonths, subYears, addYears } from 'date-fns';
import { point, polygon, lineString } from '@turf/helpers';
import distance from '@turf/distance';
import explode from '@turf/explode';
import nearest from '@turf/nearest-point';

const evaluateParams = (feature, dataSource) => {
  const params = {};
  if (!dataSource.options.params) {
    return params; 
  }
  // console.log("dataSource: ", dataSource);
  const paramEntries = Object.entries(dataSource.options.params);
  const state = this.store.state;

  for (let [ key, valOrGetter ] of paramEntries) {
    let val;

    if (typeof valOrGetter === 'function') {
      val = valOrGetter(feature);
    } else {
      val = valOrGetter;
    }
    params[key] = val;
  }
  // console.log("params: ", params)
  return params;
}

// this was the fetch function from @phila/vue-datafetch http-client.js
const fetchNearby = (feature, dataSource) => {
  const params = evaluateParams(feature, dataSource);
  const url = dataSource.url;
  const options = dataSource.options;
  // const srid = options.srid || 4326;
  const table = options.table;
  // TODO generalize these options into something like a `sql` param that
  // returns a sql statement
  const dateMinNum = options.dateMinNum || null;
  const dateMinType = options.dateMinType || null;
  // console.log('dateMinType:', dateMinType);
  const dateField = options.dateField || null;
  const successFn = options.success;
  const distances = options.distances || 250;
  // console.log('fetchNearby distances:', distances);

  const groupby = options.groupby || null;

  const distQuery = "ST_Distance(the_geom::geography, ST_SetSRID(ST_Point("
                  + feature.geometry.coordinates[0]
                  + "," + feature.geometry.coordinates[1]
                  + "),4326)::geography)";

  const latQuery = "ST_Y(the_geom)";
  const lngQuery = "ST_X(the_geom)";

  let select;
  
  if (!groupby) {
    select = '*';
  } else {
    select = groupby + ', the_geom';
  }
  // if (calculateDistance) {
  select = select + ", " + distQuery + 'as distance,' + latQuery + 'as lat, ' + lngQuery + 'as lng';
  // }

  params['q'] = "select " + select + " from " + table + " where " + distQuery + " < " + distances;

  let subFn;
  if (dateMinNum) {
    // let subFn, addFn;
    switch (dateMinType) {
    case 'hour':
      subFn = subHours;
      break;
    case 'day':
      subFn = subDays;
      break;
    case 'week':
      subFn = subWeeks;
      break;
    case 'month':
      subFn = subMonths;
      break;
    case 'year':
      subFn = subYears;
      break;
    }

    // let test = format(subFn(new Date(), dateMinNum), 'YYYY-MM-DD');
    params['q'] = params['q'] + " and " + dateField + " > '" + format(subFn(new Date(), dateMinNum), 'yyyy-MM-dd') + "'";
  }

  if (groupby) {
    params['q'] = params['q'] + " group by " + groupby + ", the_geom";
  }
  return params
}

  

export const useNearbyActivityStore = defineStore('NearbyActivityStore', {
  state: () => {
    return {
      loadingData: false,
      nearby311: {},
      nearbyCrimeIncidents: null,
      nearbyZoningAppeals: null,
      nearbyVacantIndicatorPoints: null,
      nearbyConstructionPermits: null,
      nearbyDemolitionPermits: null,
      nearbyImminentlyDangerous: null,
    };
  },

  actions: {
    setLoadingData(loading) {
      this.loadingData = loading;
    },
    async fetchData(dataType) {
      console.log("fetchData is runnning, dataType:", dataType);
      if (dataType === 'nearby311') {
        await this.fillNearby311();
      } else if (dataType === 'nearbyCrimeIncidents') {
        await this.fillNearbyCrimeIncidents();
      } else if (dataType === 'nearbyZoningAppeals') {
        await this.fillNearbyZoningAppeals();
      } else if (dataType === 'nearbyVacantIndicatorPoints') {
        await this.fillNearbyVacantIndicatorPoints();
      }
    },
    async fillNearby311() {
      const AddressStore = useAddressStore();
      this.setLoadingData(true);
      const feature = AddressStore.addressData.features[0];
      let dataSource = {
        url: 'https://phl.carto.com/api/v2/sql?',
        options: {
          table: 'public_cases_fc',
          dateMinNum: 365,
          dateMinType: 'day',
          dateField: 'requested_datetime',
        },
      };
      let params = fetchNearby(feature, dataSource);
      const response = await axios.get(dataSource.url, { params })
      this.nearby311 = response;
      this.setLoadingData(false);
    },
    async fillNearbyCrimeIncidents() {
      const AddressStore = useAddressStore();
      this.setLoadingData(true);
      const feature = AddressStore.addressData.features[0];
      let dataSource = {
        url: 'https://phl.carto.com/api/v2/sql?',
        options: {
          table: 'incidents_part1_part2',
          dateMinNum: 90,
          dateMinType: 'day',
          dateField: 'dispatch_date',
        },
      };
      let params = fetchNearby(feature, dataSource);
      const response = await axios.get(dataSource.url, { params })
      this.nearbyCrimeIncidents = response;
      this.setLoadingData(false);
    },
    async fillNearbyZoningAppeals() {
      const AddressStore = useAddressStore();
      this.setLoadingData(true);
      const feature = AddressStore.addressData.features[0];
      let dataSource = {
        url: 'https://phl.carto.com/api/v2/sql?',
        options: {
          table: 'appeals',
          dateMinNum: 1,
          dateMinType: 'year',
          dateField: 'scheduleddate',
        },
      };
      let params = fetchNearby(feature, dataSource);
      const response = await axios.get(dataSource.url, { params })
      this.nearbyZoningAppeals = response;
      this.setLoadingData(false);
    },

    async fillNearbyVacantIndicatorPoints() {
      this.setLoadingData(true);
      const MapStore = useMapStore();
      const buffer = MapStore.bufferForAddress;

      const url = 'https://services.arcgis.com/fLeGjb7u4uXqeF9q/arcgis/rest/services/Vacant_Indicators_Points/FeatureServer/0/query?';
      const xyCoords = buffer.geometries[0].rings[0];
      let xyCoordsReduced = [[ parseFloat(xyCoords[0][0].toFixed(6)), parseFloat(xyCoords[0][1].toFixed(6)) ]];
      var i;
      for (i = 0; i < xyCoords.length; i++) {
        if (i%3 == 0) {
          let newXyCoordReduced = [ parseFloat(xyCoords[i][0].toFixed(6)), parseFloat(xyCoords[i][1].toFixed(6)) ];
          xyCoordsReduced.push(newXyCoordReduced);
        }
      }
      xyCoordsReduced.push([ parseFloat(xyCoords[0][0].toFixed(6)), parseFloat(xyCoords[0][1].toFixed(6)) ]);

      const params = {
        'returnGeometry': true,
        'where': '1=1',
        'outSR': 4326,
        'outFields': '*',
        'inSr': 4326,
        'geometryType': 'esriGeometryPolygon',
        'spatialRel': 'esriSpatialRelContains',
        'f': 'geojson',
        'geometry': JSON.stringify({ "rings": [xyCoordsReduced], "spatialReference": { "wkid": 4326 }}),
      };

      const response = await axios.get(url, { params });
      const data = await response.data;

      let features = (data || {}).features;
      const AddressStore = useAddressStore();
      const feature = AddressStore.addressData.features[0];
      const from = point(feature.geometry.coordinates);

      features = features.map(feature => {
        const featureCoords = feature.geometry.coordinates;
        let dist;
        if (Array.isArray(featureCoords[0])) {
          let instance;
          if (feature.geometry.type === 'LineString') {
            instance = lineString([ featureCoords[0], featureCoords[1] ], { name: 'line 1' });
          } else {
            instance = polygon([ featureCoords[0] ]);
          }
          const vertices = explode(instance);
          const closestVertex = nearest(from, vertices);
          dist = distance(from, closestVertex, { units: 'miles' });
        } else {
          const to = point(featureCoords);
          dist = distance(from, to, { units: 'miles' });
        }
        const distFeet = parseInt(dist * 5280);
        feature._distance = distFeet;
        return feature;
      });

      this.nearbyVacantIndicatorPoints = features;
      this.setLoadingData(false);
    },
  },

});
