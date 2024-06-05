import { defineStore } from 'pinia';
import { useGeocodeStore } from '@/stores/GeocodeStore.js'
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
  const extraWhere = options.where || null;

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

  if (extraWhere) {
    params['q'] = params['q'] + " and " + extraWhere;
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
      } else if (dataType === 'nearbyConstructionPermits') {
        await this.fillNearbyConstructionPermits();
      } else if (dataType === 'nearbyDemolitionPermits') {
        await this.fillNearbyDemolitionPermits();
      } else if (dataType === 'nearbyImminentlyDangerous') {
        await this.fillNearbyImminentlyDangerous();
      }
    },
    async fillNearby311() {
      try {
        const GeocodeStore = useGeocodeStore();
        this.setLoadingData(true);
        const feature = GeocodeStore.aisData.features[0];
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
        if (response.status === 200) {
          const data = response.data;
          console.log('nearby311 data:', data);
          data.rows.forEach(row => {
            row.distance_ft = (row.distance * 3.28084).toFixed(0) + ' ft';
          });
          this.nearby311 = data;
          this.setLoadingData(false);
        } else {
          console.warn('nearby311 - await resolved but HTTP status was not successful');
        }
      } catch {
        console.error('nearby311 - await never resolved, failed to fetch address data');
      }
    },
    async fillNearbyCrimeIncidents() {
      try {
        const GeocodeStore = useGeocodeStore();
        this.setLoadingData(true);
        const feature = GeocodeStore.aisData.features[0];
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
        if (response.status === 200) {
          const data = response.data;
          console.log('nearbyCrimeIncidents data:', data);
          data.rows.forEach(row => {
            row.distance_ft = (row.distance * 3.28084).toFixed(0) + ' ft';
          });
          this.nearbyCrimeIncidents = data;
          this.setLoadingData(false);
        } else {
          console.warn('nearbyCrimeIncidents - await resolved but HTTP status was not successful');
        }
      } catch {
        console.error('nearbyCrimeIncidents - await never resolved, failed to fetch address data');
      }
    },
    async fillNearbyZoningAppeals() {
      const GeocodeStore = useGeocodeStore();
      this.setLoadingData(true);
      const feature = GeocodeStore.aisData.features[0];
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
      const GeocodeStore = useGeocodeStore();
      const coordinates = GeocodeStore.aisData.features[0].geometry.coordinates;
      const MapStore = useMapStore();
      await MapStore.fillBufferForAddress(coordinates[0], coordinates[1]);
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
      // const GeocodeStore = useGeocodeStore();
      const feature = GeocodeStore.aisData.features[0];
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

    async fillNearbyConstructionPermits() {
      const GeocodeStore = useGeocodeStore();
      this.setLoadingData(true);
      const feature = GeocodeStore.aisData.features[0];
      let dataSource = {
        url: 'https://phl.carto.com/api/v2/sql?',
        options: {
          table: 'permits',
          where: "typeofwork like '%NEW CONSTRUCTION%'",
          dateMinNum: 1,
          dateMinType: 'year',
          dateField: 'permitissuedate',
        },
      };
      let params = fetchNearby(feature, dataSource);
      const response = await axios.get(dataSource.url, { params })
      this.nearbyConstructionPermits = response;
      this.setLoadingData(false);
    },

    async fillNearbyDemolitionPermits() {
      const GeocodeStore = useGeocodeStore();
      this.setLoadingData(true);
      const feature = GeocodeStore.aisData.features[0];
      let dataSource = {
        url: 'https://phl.carto.com/api/v2/sql?',
        options: {
          table: 'permits',
          where: "permitdescription like '%DEMOLITION PERMIT%'",
          dateMinNum: 1,
          dateMinType: 'year',
          dateField: 'permitissuedate',
        },
      };
      let params = fetchNearby(feature, dataSource);
      const response = await axios.get(dataSource.url, { params })
      this.nearbyDemolitionPermits = response;
      this.setLoadingData(false);
    },

    async fillNearbyImminentlyDangerous() {
      const GeocodeStore = useGeocodeStore();
      this.setLoadingData(true);
      const feature = GeocodeStore.aisData.features[0];
      let dataSource = {
        url: 'https://phl.carto.com/api/v2/sql?',
        options: {
          table: 'violations',
          where: "caseprioritydesc like '%IMMINENTLY DANGEROUS%'",
          dateMinNum: 1,
          dateMinType: 'year',
          dateField: 'casecreateddate',
          groupby: 'casenumber, casecreateddate, caseprioritydesc, casestatus, address',
        },
      };
      let params = fetchNearby(feature, dataSource);
      const response = await axios.get(dataSource.url, { params })
      this.nearbyImminentlyDangerous = response;
      this.setLoadingData(false);
    },
  },

});

