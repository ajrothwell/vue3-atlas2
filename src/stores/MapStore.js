import { defineStore } from 'pinia';
import proj4 from 'proj4';
import axios from 'axios';

import useMapStyle from '@/composables/useMapStyle';
const {
  noMapStyle,
  pwdDrawnMapStyle,
  dorDrawnMapStyle,
  zoningDrawnMapStyle,
  imageryMapStyle,
  parcelLayerForTopic,
  topicStyles
} = useMapStyle();

export const useMapStore = defineStore("MapStore", {
  state: () => {
    return {
      map: {},
      currentTopicMapStyle: {},
      bufferForAddress: {},
      topicStyles: {
        Property: pwdDrawnMapStyle,
        Condos: pwdDrawnMapStyle,
        Deeds: dorDrawnMapStyle,
        'Licenses & Inspections': pwdDrawnMapStyle,
        Zoning: zoningDrawnMapStyle,
        Voting: pwdDrawnMapStyle,
        'Nearby Activity': pwdDrawnMapStyle,
      },
      parcelLayerForTopic: {
        undefined: 'PWD',
        Property: 'PWD',
        Condos: 'PWD',
        Deeds: 'DOR',
        'Licenses & Inspections': 'PWD',
        Zoning: 'DOR',
        Voting: 'PWD',
        'Nearby Activity': 'PWD',
      },
    };
  },
  actions: {
    setMap(map) {
      this.map = map;
    },
    async fillBufferForAddress(lng, lat) {
      const projection4326 = "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs";
      const projection2272 = "+proj=lcc +lat_1=40.96666666666667 +lat_2=39.93333333333333 +lat_0=39.33333333333334 +lon_0=-77.75 +x_0=600000 +y_0=0 +ellps=GRS80 +datum=NAD83 +to_meter=0.3048006096012192 +no_defs";
      const distances = 500;

      const coords2272 = proj4(projection4326, projection2272, [ lng, lat ]);

      console.log('fillBufferForAddress is running, lng:', lng, 'lat:', lat);
      const bufferUrl = 'https://citygeo-geocoder-pub.databridge.phila.gov/arcgis/rest/services/Utilities/Geometry/GeometryServer/buffer';

      const params = {
        geometries: `${coords2272.join(', ')}`,
        inSR: 2272,
        outSR: 4326,
        bufferSR: 2272,
        distances: distances, //|| 0.0028,
        unionResults: true,
        geodesic: false,
        f: 'json',
      };

      let response = await axios.get(bufferUrl, { params });
      this.bufferForAddress = response.data;
    }
  },

});