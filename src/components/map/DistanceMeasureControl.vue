<script>

import controlMixin from "./controlMixin";
import withEvents from "./withEvents";
import withSelfEvents from "./withSelfEvents";

import { useMapStore} from '@/stores/MapStore.js';

import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'

// import mapbox-gl-draw-min.js, cloned from https://gist.github.com/godismyjudge95/a4ea43263db53b90b05511c911cd0034
// this was recommended by a comment in https://github.com/mapbox/mapbox-gl-js/issues/9114
// the official mapbox-gl-draw was blocking map clicks
// import MapboxDraw from './mapbox-gl-draw.min.js';
// import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
// import './mapbox-gl-draw.css';
import destination from '@turf/destination';
import distance from '@turf/distance';
import midpoint from '@turf/midpoint';
import area from '@turf/area';
import { point, polygon, multiPolygon, convertArea, featureCollection } from '@turf/helpers';

export default {
  name: 'DistanceMeasureControl',
  mixins: [ withEvents, withSelfEvents, controlMixin ],

  props: {
    position: {
      type: String,
      default: 'bottom-left',
    },
  },
  data() {
    const data = {
      mode: 'simple_select',
      selected: null,
      toggledOn: false,
      currentShape: null,
      currentArea: null,
      labelLayers: [],
    };
    return data;
  },
  computed: {
    currentOrSelectedShape() {
      let id;
      if (this.$data.selected) {
        id = this.$data.selected;
      } else if (this.currentShape) {
        id = this.currentShape;
      }
      return id;
    },
    currentDistances() {
      let shape = this.labelLayers.filter(layer => layer.id === this.currentOrSelectedShape);
      let set;
      if (shape[0]) {
        set = shape[0].distances;
      }
      return set;
    },
    currentTotalLength() {
      let total = 0;
      for (let distance of this.currentDistances) {
        total = total + distance.distance;
      }
      return total.toFixed(2) + ' Ft';
      // return 4.453;
    },
    shouldShowDistanceBox() {
      let booleanMode = this.$data.mode !== 'simple_select';
      let booleanSelected = this.$data.selected !== null;
      let booleanToggledOn = this.$data.toggledOn;
      let booleanTotal;
      if (booleanMode && booleanToggledOn || booleanSelected && booleanToggledOn) {
        booleanTotal = true;
      } else {
        booleanTotal = false;
      }
      // console.log('booleanMode:', booleanMode, 'booleanSelected:', booleanSelected, 'booleanToggledOn:', booleanToggledOn, 'booleanTotal:', booleanTotal);
      return booleanTotal;
    },
  },
  methods: {
    handleDeleteClick(e) {
      console.log('handleDeleteClick is running');
      this.$mapboxElement.delete(this.$data.selected);
      this.$emit('drawDelete', this.$data.selected);
      this.selected = null;
    },
    handleCancelClick(e) {
      console.log('handleCancelClick is running');
      this.$data.toggledOn = false;
      this.$emit('drawCancel', e);
    },
    handleFinishClick(e) {
      // console.log('handleFinishClick is running e:', e, 'this.$mapboxElement.getSelectedPoints():', this.$mapboxElement.getSelectedPoints());
      this.$emit('drawFinish', e);
      this.$data.mode = 'simple_select';
    },
    deleteDrawDistances(shapeId){
      // console.log('deleteDrawDistances is running, shapeId:', shapeId);
      // let shapeId = e.features[0].id;
      let index = this.currentShape.indexOf(this.currentShape.filter(set => set.id === shapeId)[0]);
      // console.log('deleteDrawDistances is running, index:', index);
      this.currentShape.splice(index, 1);
      draw.selection = null;
    },

    getDrawDistances(e){
      console.log('start of getDrawDistances, e:', e);
      const MapStore = useMapStore();
      let draw = MapStore.draw;
      let data = draw.getAll();
      let coordinates, lastClick, shapeId;
      if (e && e.point) { // if getDrawDistances was called by handleMapClick
        lastClick = e.point;
        shapeId = draw.getFeatureIdsAt(lastClick)[0];
        if (!shapeId) {
          shapeId = data.features[data.features.length-1].id;
        }
        // console.log('in if e.point, shapeId:', shapeId);
      } else if (e && e.features && e.features.length) { // if getDrawDistances was called a draw event firing
        shapeId = e.features[0].id;
        // console.log('in else if, shapeId:', shapeId);
      }

      this.currentShape = shapeId;
      let feature;
      // console.log('shapeId:', shapeId, 'draw.getSelectedIds():', draw.getSelectedIds());
      if (shapeId) {
        feature = data.features.filter(feature => feature.id === shapeId)[0];
        // console.log('if shapeId:', shapeId, 'feature:', feature);
        if (feature.geometry.type === 'LineString') {
          coordinates = feature.geometry.coordinates;
        } else {
          coordinates = feature.geometry.coordinates[0];
        }
      } else {
        feature = data.features[data.features.length-1];
        // console.log('else (no shapeId), feature.id:', feature.id, 'feature:', feature);
        if (feature && feature.geometry && feature.geometry.type === 'LineString') {
          coordinates = feature.geometry.coordinates;
        } else if (feature && feature.geometry) {
          coordinates = feature.geometry.coordinates[0];
        }
      }
      // console.log('middle of getDrawDistances, draw:', draw, 'shapeId:', shapeId, 'e:', e, 'mode is draw_polygon, data:', data, 'coordinates:', coordinates);

      // mapbox-gl-draw duplicates the points of a polygon in a way that has to be accounted for;
      if (e && e.point) {
        // console.log('if e.point is running');
        coordinates.splice(coordinates.length-2, 1);
      }
      if (feature && feature.geometry && feature.geometry.type === 'LineString') {
        // coordinates.pop();
        coordinates.splice(0, 1);
      }

      // console.log('coordinates:', coordinates);
      if (coordinates && coordinates.length >=4) {
        const thePolygon = polygon([ coordinates ]);
        const theArea = convertArea(area(thePolygon), 'meters', 'feet');
        // console.log('calculating the area:', theArea);
        this.currentArea = theArea.toFixed(2) + ' Sq Feet';
      }

      let i;
      let distancesArray = [];
      let features = [];
      if (coordinates) {
        for (i=0; i<coordinates.length; i++) {
          // console.log('loop, i:', i, 'coordinates[i][0]', coordinates[i][0], 'i+1:', i+1, 'coordinates.length:', coordinates.length, 'coordinates:', coordinates);
          let distVal = 0;
          let lastDistVal = null;
          let midPoint = [];
          let allVal = [];

          let coord2;
          if (coordinates[i+1]) {
            coord2 = coordinates[i+1];
          } else {
            coord2 = coordinates[0];
          }

          // console.log('MapPanel.vue in getDrawDistances, coordinates:', coordinates, 'coord2:', coord2);
          distVal = parseFloat((distance(coordinates[i], coord2, { units: 'miles' }) * 5280).toFixed(2));
          // distVal = distance(coordinates[i], coord2, { units: 'miles' }) * 5280;

          if (coordinates[i-1]) {
            lastDistVal = parseFloat((distance(coordinates[i-1], coordinates[i], { units: 'miles' }) * 5280).toFixed(2));
            // lastDistVal = distance(coordinates[i-1], coordinates[i], { units: 'miles' }) * 5280;
          }
          // console.log('distVal:', distVal, 'lastDistVal:', lastDistVal);

          allVal = {
            firstPoint: [ parseFloat(coordinates[i][0].toFixed(5)), parseFloat(coordinates[i][1].toFixed(5)) ],
            midPoint: midPoint,
            distance: lastDistVal,
          };
          distancesArray.push(allVal);
          // console.log('allVal:', allVal, 'distancesArray:', distancesArray);

          if (e.point && coordinates[i][0] !== coord2[0] && i < coordinates.length-2) {
            midPoint = midpoint(coordinates[i], coord2).geometry.coordinates;
            features.push(
              {
                'type': 'Feature',
                'properties': {
                  'description': distVal,
                },
                'geometry': {
                  'type': 'Point',
                  'coordinates': midPoint,
                },
              },
            );
          }
          if (!e.point && coordinates[i][0] !== coord2[0] && i < coordinates.length-1) {
            midPoint = midpoint(coordinates[i], coord2).geometry.coordinates;
            features.push(
              {
                'type': 'Feature',
                'properties': {
                  'description': distVal,
                },
                'geometry': {
                  'type': 'Point',
                  'coordinates': midPoint,
                },
              },
            );
          }

          if (e.point && i === coordinates.length-2) {
            // console.log('quitting loop: triggered by click and', i, " = ", coordinates.length-2);
            break;
          }
        } // end of loop
      }

      console.log('near end of getDrawDistances, distancesArray.length:', distancesArray.length, 'distancesArray:', distancesArray, 'features:', features);

      if (distancesArray.length) {
        let theSet = {};
        if (shapeId) {
          // console.log('if inside if is running, distancesArray[distancesArray.length-1].distance:', distancesArray[distancesArray.length-1].distance, 'distancesArray:', distancesArray);
          theSet = {
            id: shapeId,
            'distances': distancesArray,
            'source': {
              type: 'geojson',
              data: {
                'type': 'FeatureCollection',
                'features': [],
              },
            },
            'layer': {
              'id': shapeId,
              'type': 'symbol',
              'source': shapeId,
              'paint': {
                'text-color': 'red',
              },
              'layout': {
                'text-size': 12,
                'text-font': [ 'Open Sans Regular' ],
                'text-field': [ 'get', 'description' ],
                'text-variable-anchor': [ 'center' ],
                'text-radial-offset': 0.5,
                'text-justify': 'center',
              },
            },
          };

          let location = this.labelLayers.filter(set => set.id === shapeId)[0];
          // console.log('first try on location:', location);

          if (!location) {
            this.labelLayers.push(theSet);
            location = this.labelLayers.filter(set => set.id === shapeId)[0];
            // console.log('second try on location:', location);
          }
          location.distances = distancesArray;
          location.source.data.features = features;
        }
      }
      // if (e && !e.point) {
      //   this.currentShape = null;
      // }
    },

    handleDrawModeChange(e){
      console.log('handleDrawModeChange is running, e:', e, 'e.mode:', e.mode);
      const MapStore = useMapStore();
      draw.mode = e.mode;
      let currentShape = this.currentShape;

      if (e.mode === 'simple_select' && this.currentShape) {
        this.handleDrawFinish();
      }
    },

    handleDrawCancel(e){
      const MapStore = useMapStore();
      // draw.mode = 'simple_select';
      let shapeId = this.currentShape;
      console.log('MapPanel.vue handleDrawCancel is running, shapeId:', shapeId);
      if (shapeId) {
        let index = this.currentShape.indexOf(this.currentShape.filter(set => set.id === shapeId)[0]);
        this.currentShape.splice(index, 1);
        draw.selection = null;
        this.currentShape = null;
        MapStore.draw.trash();
      }
      MapStore.draw.changeMode('simple_select');
    },

    handleDrawFinish(e){
      const MapStore = useMapStore();
      let currentShape = this.currentShape;
      // let currentPoints = [];
      let fetchedPoints = this.currentShape.filter(set => set.id === this.currentShape)[0].distances;
      // console.log('MapPanel.vue handleDrawFinish 1 is running, MapStore.draw.getMode():', MapStore.draw.getMode(), 'currentShape:', currentShape, 'fetchedPoints:', fetchedPoints);

      let currentPoints = [];
      for (let point of fetchedPoints) {
        // console.log('in loop, point:', point, 'point.firstPoint:', point.firstPoint);
        currentPoints.push(point.firstPoint);
      }
      if (currentPoints.length > 1) {
        currentPoints.push(fetchedPoints[0].firstPoint);
      }

      if (fetchedPoints.length > 2) {
        MapStore.draw.changeMode('simple_select');
        draw.mode = 'simple_select';
      } else if (fetchedPoints.length === 2) {
        MapStore.draw.delete(this.currentShape);
        MapStore.draw.changeMode('draw_line_string');

        let geojson = {
          'type': 'Feature',
          'geometry': {
            'type': 'LineString',
            'coordinates': currentPoints,
          },
          'id': this.currentShape,
          'properties': {},
        };
        MapStore.draw.add(geojson);
        MapStore.draw.changeMode('simple_select');
        draw.mode = 'simple_select';
      } else if (fetchedPoints.length === 1 ) {
        MapStore.draw.delete(this.currentShape);
        MapStore.draw.changeMode('draw_point');

        let geojson = {
          'type': 'Feature',
          'geometry': {
            'type': 'Point',
            'coordinates': currentPoints[0],
          },
          'id': this.currentShape,
          'properties': {},
        };
        MapStore.draw.add(geojson);
        MapStore.draw.changeMode('simple_select');
        draw.mode = 'simple_select';
      } else {
        MapStore.draw.trash();
        this.handleDrawCancel();
      }
      // console.log('MapPanel.vue handleDrawFinish 2 is running, MapStore.draw.getMode():', MapStore.draw.getMode(), 'currentShape:', currentShape, 'fetchedPoints:', fetchedPoints);
    },

    handleDrawSelectionChange(e){
      let draw = MapStore.draw;
      let val = draw.getSelectedIds();
      // console.log('handleDrawSelectionChange, e:', e, 'val:', val);
      draw.selection = val;
    }
  }
};

</script>

<template>
  <div>
    <!-- v-if="shouldShowDistanceBox" -->
    <div
      :class="'measure-tool-popup-bottom-right'"
    >
      <div
        v-if="!currentDistances"
      >
        <div class="measure-tool-header">
          Measure distances and areas
        </div>
        <div class="measure-tool-description">
          Start creating a measurement by adding points to the map.
        </div>
        <hr class="popup-line">
        <div>
          <img
            :src="'@assets/images/cancel.png'"
            class="img-class"
            alt="cancel"
            @click="handleCancelClick"
          >
          <div
            class="inline-block-div"
            @click="handleCancelClick"
          >
            Cancel
          </div>
        </div>
      </div>

      <div
        v-if="currentDistances"
      >
        <table>
          <tr>
            <th>lat</th>
            <th>lng</th>
            <th>distance (ft)</th>
          </tr>
          <tr
            v-for="(entry, index) of currentDistances"
            :key="index"
          >
            <td>{{ entry.firstPoint[1] }}</td>
            <td>{{ entry.firstPoint[0] }}</td>
            <td>{{ entry.distance }}</td>
          </tr>
        </table>
        <hr class="popup-line">

        <div
          v-if="currentDistances.length >= 2"
        >
          Total Length: {{ currentTotalLength }}
          <hr class="popup-line">
        </div>

        <div
          v-if="currentDistances.length >= 3"
        >
          Total Area: {{ currentArea }}
          <hr class="popup-line">
        </div>

        <div
          v-if="mode === 'simple_select'"
          class="drawn-shape-actions"
        >
          <img
            :src="'@/assets/images/trash.png'"
            class="img-class"
            alt="cancel"
            @click="handleDeleteClick"
          >
          <div
            class="inline-block-div"
            @click="handleDeleteClick"
          >
            Delete
          </div>
        </div>

        <div
          v-if="mode !== 'simple_select'"
          class="draw-actions"
        >
          <img
            :src="'@/assets/images/cancel.png'"
            class="img-class"
            alt="cancel"
            @click="handleCancelClick"
          >
          <div
            class="inline-block-div"
            @click="handleCancelClick"
          >
            Cancel
          </div>
          <img
            :src="'@/assets/images/check.png'"
            class="img-class"
            alt="finish"
            @click="handleFinishClick"
          >
          <div
            class="inline-block-div"
            @click="handleFinishClick"
          >
            Finish Measurement
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>

.measure-tool-popup-bottom-right {
  font-family: Montserrat, sans-serif;
  font-size: 12px;
  position: absolute;
  width: 300px;
  min-width: 200px;
  bottom: 0;
  right: 0;
  padding: 10px;
  background-color: #fff;
  margin-bottom: 24px;
  margin-right: 50px;
  border-radius: 10px;
  z-index: 12;
}

.measure-tool-popup-bottom-left {
  font-family: Montserrat, sans-serif;
  font-size: 12px;
  position: absolute;
  width: 300px;
  min-width: 200px;
  bottom: 0;
  left: 0;
  padding: 10px;
  background-color: #fff;
  margin-bottom: 24px;
  margin-left: 50px;
  border-radius: 10px;
  z-index: 12;
}

.measure-tool-header {
  font-size: 14px;
}

.measure-tool-description {
  font-size: 10px;
}

table {
  margin-top: 0px;
  margin-bottom: 0px;
}

td {
  text-align: center;
}

tr:nth-child(even) {
  background-color: #f2f2f2;
}

.img-class {
  margin: 2px;
  cursor: pointer;
}

.inline-block-div {
  display: inline-block;
  margin: 2px;
  margin-right: 8px;
  cursor: pointer;
}

.popup-line {
  margin-top: 4px;
  margin-bottom: 4px;
}

.mapbox-gl-draw_polygon {
  background-image: url('@/assets/images/rulers.png') !important;
  text-indent: 100%;
  white-space: nowrap;
  overflow: hidden;
}

.mapbox-gl-draw_ctrl-draw-btn {
  background-repeat: no-repeat !important;
  background-position: center !important;
}

</style>
