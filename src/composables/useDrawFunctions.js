import { useMapStore } from '@/stores/MapStore.js'



export default function useDrawFunctions() {

  const draw = {
    mode: null,
    selection: null,
    currentShape: null,
    labelLayers: [],
    currentArea: null,
  };

  const deleteDrawDistances = (shapeId) => {
    // console.log('deleteDrawDistances is running, shapeId:', shapeId);
    // let shapeId = e.features[0].id;
    let index = this.$data.draw.labelLayers.indexOf(this.$data.draw.labelLayers.filter(set => set.id === shapeId)[0]);
    // console.log('deleteDrawDistances is running, index:', index);
    this.$data.draw.labelLayers.splice(index, 1);
    this.$data.draw.selection = null;
  }

  const getDrawDistances = (e) => {
    const MapStore = useMapStore();
    // console.log('start of getDrawDistances, e:', e);
    let draw = MapStore.draw;
    let data = draw.getAll();
    let coordinates, lastClick, shapeId;
    if (e.mapboxEvent) { // if getDrawDistances was called by handleMapClick
      lastClick = e.mapboxEvent.point;
      shapeId = draw.getFeatureIdsAt(lastClick)[0];
      if (!shapeId) {
        shapeId = data.features[data.features.length-1].id;
      }
      // console.log('in if e.mapboxEvent, shapeId:', shapeId);
    } else if (e.features.length) { // if getDrawDistances was called a draw event firing
      shapeId = e.features[0].id;
      // console.log('in else if, shapeId:', shapeId);
    }

    this.$data.draw.currentShape = shapeId;
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
      if (feature.geometry.type === 'LineString') {
        coordinates = feature.geometry.coordinates;
      } else {
        coordinates = feature.geometry.coordinates[0];
      }
    }
    // console.log('middle of getDrawDistances, draw:', draw, 'shapeId:', shapeId, 'e:', e, 'mode is draw_polygon, data:', data, 'coordinates:', coordinates);

    // mapbox-gl-draw duplicates the points of a polygon in a way that has to be accounted for;
    if (e.mapboxEvent) {
      // console.log('if e.mapboxEvent is running');
      coordinates.splice(coordinates.length-2, 1);
    }
    if (feature.geometry.type === 'LineString') {
      // coordinates.pop();
      coordinates.splice(0, 1);
    }

    // console.log('coordinates:', coordinates);
    if (coordinates.length >=4) {
      const thePolygon = polygon([ coordinates ]);
      const theArea = convertArea(area(thePolygon), 'meters', 'feet');
      // console.log('calculating the area:', theArea);
      this.$data.draw.currentArea = theArea.toFixed(2) + ' Sq Feet';
    }

    let i;
    let distancesArray = [];
    let features = [];
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

      if (e.mapboxEvent && coordinates[i][0] !== coord2[0] && i < coordinates.length-2) {
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
      if (!e.mapboxEvent && coordinates[i][0] !== coord2[0] && i < coordinates.length-1) {
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

      if (e.mapboxEvent && i === coordinates.length-2) {
        // console.log('quitting loop: triggered by click and', i, " = ", coordinates.length-2);
        break;
      }
    } // end of loop

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

        let location = this.$data.draw.labelLayers.filter(set => set.id === shapeId)[0];
        // console.log('first try on location:', location);

        if (!location) {
          this.$data.draw.labelLayers.push(theSet);
          location = this.$data.draw.labelLayers.filter(set => set.id === shapeId)[0];
          // console.log('second try on location:', location);
        }
        location.distances = distancesArray;
        location.source.data.features = features;
      }
    }
    if (!e.mapboxEvent) {
      this.$data.draw.currentShape = null;
    }
  }

  const handleDrawModeChange = (e) => {
    console.log('handleDrawModeChange is running, e:', e, 'e.mode:', e.mode);
    const MapStore = useMapStore();
    draw.mode = e.mode;
    let currentShape = draw.currentShape;

    if (e.mode === 'simple_select' && currentShape) {
      this.handleDrawFinish();
    }
  }

  const handleDrawCancel = (e) => {
    const MapStore = useMapStore();
    // this.$data.draw.mode = 'simple_select';
    let shapeId = this.$data.draw.currentShape;
    console.log('MapPanel.vue handleDrawCancel is running, shapeId:', shapeId);
    if (shapeId) {
      let index = this.$data.draw.labelLayers.indexOf(this.$data.draw.labelLayers.filter(set => set.id === shapeId)[0]);
      this.$data.draw.labelLayers.splice(index, 1);
      this.$data.draw.selection = null;
      this.$data.draw.currentShape = null;
      MapStore.draw.trash();
    }
    MapStore.draw.changeMode('simple_select');
  }

  const handleDrawFinish = (e) => {
    const MapStore = useMapStore();
    let currentShape = this.$data.draw.currentShape;
    // let currentPoints = [];
    let fetchedPoints = this.$data.draw.labelLayers.filter(set => set.id === currentShape)[0].distances;
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
      this.$data.draw.mode = 'simple_select';
    } else if (fetchedPoints.length === 2) {
      MapStore.draw.delete(currentShape);
      MapStore.draw.changeMode('draw_line_string');

      let geojson = {
        'type': 'Feature',
        'geometry': {
          'type': 'LineString',
          'coordinates': currentPoints,
        },
        'id': currentShape,
        'properties': {},
      };
      MapStore.draw.add(geojson);
      MapStore.draw.changeMode('simple_select');
      this.$data.draw.mode = 'simple_select';
    } else if (fetchedPoints.length === 1 ) {
      MapStore.draw.delete(currentShape);
      MapStore.draw.changeMode('draw_point');

      let geojson = {
        'type': 'Feature',
        'geometry': {
          'type': 'Point',
          'coordinates': currentPoints[0],
        },
        'id': currentShape,
        'properties': {},
      };
      MapStore.draw.add(geojson);
      MapStore.draw.changeMode('simple_select');
      this.$data.draw.mode = 'simple_select';
    } else {
      MapStore.draw.trash();
      this.handleDrawCancel();
    }

    // console.log('MapPanel.vue handleDrawFinish 2 is running, MapStore.draw.getMode():', MapStore.draw.getMode(), 'currentShape:', currentShape, 'fetchedPoints:', fetchedPoints);

  }

  const handleDrawSelectionChange = (e) => {
    let draw = MapStore.draw;
    let val = draw.getSelectedIds();
    // console.log('handleDrawSelectionChange, e:', e, 'val:', val);
    this.$data.draw.selection = val;
  }

  return {
    draw,
    deleteDrawDistances,
    getDrawDistances,
    handleDrawModeChange,
    handleDrawCancel,
    handleDrawFinish,
    handleDrawSelectionChange
  }
}