import { point, polygon, multiPolygon } from '@turf/helpers';
import distance from '@turf/distance';
import area from '@turf/area';

export default function useParcels() {

  const processParcels = async(featureCollection) => {
    console.log('featureCollection:', featureCollection, 'featureCollection.features.length:', featureCollection.features.length);
    if (!featureCollection || featureCollection.features.length === 0) {
      return;
    }
    const features = featureCollection.features;
    const featuresSorted = sortDorParcelFeatures(features);
    let feature = featuresSorted[0];

    // use turf to get area and perimeter of all parcels returned
    console.log('featuresSorted:', featuresSorted);
    for (let featureSorted of featuresSorted) {
      // console.log('featureSorted:', featureSorted);
      const geometry = calculateAreaAndPerimeter(featureSorted);
      featureSorted.properties.TURF_PERIMETER = geometry.perimeter;
      featureSorted.properties.TURF_AREA = geometry.area;
    }

    // at this point there is definitely a feature or features - put it in state
    // this.setParcelsInState(parcelLayer, multipleAllowed, feature, featuresSorted, mapregStuff);
    return feature;
  }

  const sortDorParcelFeatures = (features) => {
    console.log('features:', features);
    // map parcel status to a numeric priority
    // (basically so remainders come before inactives)
    const STATUS_PRIORITY = {
      1: 1,
      2: 3,
      3: 2,
    };

    // first sort by mapreg (descending)
    features.sort((a, b) => {
      const mapregA = a.properties.MAPREG;
      const mapregB = b.properties.MAPREG;

      if (mapregA < mapregB) {
        return 1;
      }
      if (mapregA > mapregB) {
        return -1;
      }
      return 0;
    });

    // then sort by status
    features.sort((a, b) => {
      const statusA = STATUS_PRIORITY[a.properties.STATUS];
      const statusB = STATUS_PRIORITY[b.properties.STATUS];

      if (statusA < statusB) {
        return -1;
      }
      if (statusA > statusB) {
        return 1;
      }
      return 0;
    });

    return features;
  }

  const getDistances = (coords) => {
    // console.log('getDistances, coords:', coords)
    let turfCoordinates = [];
    for (let coordinate of coords[0]) {
      // console.log('in getDistances, coordinate:', coordinate);
      turfCoordinates.push(point(coordinate));
    }
    let distances = [];
    for (let i=0; i<turfCoordinates.length - 1; i++) {
      distances[i] = distance(turfCoordinates[i], turfCoordinates[i+1], { units: 'feet' });
    }
    return distances;
  }

  const getMultiPolyDistances = (coords) => {
    // console.log('getMultiPolyDistances, coords:', coords)
    let turfCoordinates = [];
    for (let coordinate of coords) {
      // console.log('in getMultiPolyDistances, coordinate:', coordinate);
      turfCoordinates.push(point(coordinate));
    }
    let distances = [];
    for (let i=0; i<turfCoordinates.length - 1; i++) {
      distances[i] = distance(turfCoordinates[i], turfCoordinates[i+1], { units: 'feet' });
    }
    return distances;
  }

  const calculateAreaAndPerimeter = (feature) => {
    let coords = feature.geometry.coordinates;

    // console.log('utils.calculateAreaAndPerimeter, feature:', feature, 'coords.length:', coords.length);
    if (coords.length > 1 || feature.geometry.type === 'MultiPolygon') {
      let distances = [];
      let areas = [];
      for (let coordsSet of coords) {
        // console.log('coordsSet:', coordsSet);
        if (coordsSet.length > 2) {
          // console.log('in multiPolygon loop');
          const turfPolygon = multiPolygon(coordsSet);
          distances.push(this.getMultiPolyDistances(coordsSet).reduce(function(acc, val) {
            return acc + val;
          }));
          areas.push(area(turfPolygon) * 10.7639);
          // console.log('areas:', areas);
        } else {
          // console.log('in polygon loop');
          const turfPolygon = polygon(coordsSet);
          distances.push(getDistances(coordsSet).reduce(function(acc, val) {
            return acc + val;
          }));
          areas.push(area(turfPolygon) * 10.7639);
        }
      }
      return { perimeter: distances.reduce(function(acc, val) {
        return acc + val;
      }),
      area: areas.reduce(function(acc, val) {
        return acc + val;
      }),
      };
    }
    // console.log('coords:', coords);
    const turfPolygon = polygon(coords);
    let distances = getDistances(coords);
    console.log('distances:', distances);
    return { perimeter: distances.reduce(function(acc, val) {
      return acc + val;
    }),
    area: area(turfPolygon) * 10.7639,
    };
  }

  return {
    processParcels,
    sortDorParcelFeatures,
    getDistances,
    getMultiPolyDistances,
    calculateAreaAndPerimeter,
  }
}
