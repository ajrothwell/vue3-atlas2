import { defineStore } from 'pinia';
import { useAddressStore } from '@/stores/AddressStore.js'

import axios from 'axios';
import { format, subHours, addHours, subDays, addDays, subWeeks, addWeeks, subMonths, addMonths, subYears, addYears } from 'date-fns';


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
      nearby311: {},
    };
  },

  actions: {
    async fillNearby311() {
      const AddressStore = useAddressStore();
      const feature = AddressStore.addressData.features[0];
      let dataSource = {
        url: 'https://phl.carto.com/api/v2/sql?',
        options: {
          table: 'public_cases_fc',
          dateMinNum: 30,
          dateMinType: 'day',
          dateField: 'requested_datetime',
        },
      };
      let params = fetchNearby(feature, dataSource);
      // console.log('params:', params);
      const response = await axios.get(dataSource.url, { params })
      this.nearby311 = response;
    },
  },

});

