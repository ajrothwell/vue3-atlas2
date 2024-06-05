import axios from 'axios';

import { defineStore } from 'pinia';
import { useGeocodeStore } from '@/stores/GeocodeStore.js'

export const useVotingStore = defineStore("VotingStore", {
  state: () => {
    return {
      divisions: {},
      pollingPlaces: {},
      electedOfficials: {},
      nextElection: {},
    };
  },
  actions: {
    async clearVotingData() {
      this.divisions = {};
      this.pollingPlaces = {};
      this.electedOfficials = {};
      this.nextElection = {};
    },
    async fillDivisions() {
      console.log('fillDivisions is running');
      const GeocodeStore = useGeocodeStore();
      const feature = GeocodeStore.aisData.features[0];
      let url = '//services.arcgis.com/fLeGjb7u4uXqeF9q/arcgis/rest/services/Political_Divisions/FeatureServer/0/query';

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
      this.divisions = await response.data;
    },
    async fillPollingPlaces() {
      console.log('fillPollingPlaces is running');
      const GeocodeStore = useGeocodeStore();
      const feature = GeocodeStore.aisData.features[0];
      let baseUrl = 'https://phl.carto.com/api/v2/sql?q=';
      const url = baseUrl += `select ST_X(the_geom) as lng, ST_Y(the_geom) as lat, * from polling_places where precinct ='${feature.properties.election_precinct}'`;
      const response = await fetch(url);
      this.pollingPlaces = await response.json();
    },
    async fillElectedOfficials() {
      console.log('fillElectedOfficials is running');
      const GeocodeStore = useGeocodeStore();
      const feature = GeocodeStore.aisData.features[0];
      let baseUrl = 'https://phl.carto.com/api/v2/sql?q=';
      const url = baseUrl += `WITH split AS (SELECT * FROM splits WHERE precinct = '${feature.properties.election_precinct}') \
      SELECT eo.*, s.ballot_file_id\
      FROM elected_officials eo, split s \
      WHERE eo.office = 'city_council' AND eo.district = '${feature.properties.council_district_2024}' \
                OR eo.office = 'state_house' AND eo.district = s.state_house \
                OR eo.office = 'state_senate' AND eo.district = s.state_senate \
                OR eo.office = 'us_house' AND eo.district = s.federal_house \
      `;
      const response = await fetch(url);
      this.electedOfficials = await response.json();
    },
    async fillNextElection() {
      console.log('fillNextElection is running');
      const url = 'https://admin-vote.phila.gov/wp-json/votes/v1/election';
      const response = await fetch(url);
      this.nextElection = await response.json();
    }
  },
});
