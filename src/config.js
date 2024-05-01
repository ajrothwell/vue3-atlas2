import mergeDeep from './util/merge-deep.js';

const imageryInfo = {
  sources: {
    imageryLabels: {
      tiles: [
      'https://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityImagery_Labels/MapServer/tile/{z}/{y}/{x}',
      ],
      type: 'raster',
      tileSize: 256,
    },
    2023: {
      tiles: [
        'https://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityImagery_2023/MapServer/tile/{z}/{y}/{x}',
      ],
      type: 'raster',
      tileSize: 256,
    },
    2022: {
      tiles: [
        'https://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityImagery_2022_2in/MapServer/tile/{z}/{y}/{x}',
      ],
      type: 'raster',
      tileSize: 256,
    },
    2020: {
      tiles: [
        'https://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityImagery_2020_3in/MapServer/tile/{z}/{y}/{x}',
      ],
      type: 'raster',
      tileSize: 256,
    },
    2019: {
      tiles: [
        'https://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityImagery_2019_3in/MapServer/tile/{z}/{y}/{x}',
      ],
      type: 'raster',
      tileSize: 256,
    },
    2018: {
      tiles: [
        'https://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityImagery_2018_3in/MapServer/tile/{z}/{y}/{x}',
      ],
      type: 'raster',
      tileSize: 256,
    },
    2017: {
      tiles: [
        'https://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityImagery_2017_3in/MapServer/tile/{z}/{y}/{x}',
      ],
      type: 'raster',
      tileSize: 256,
    },
    2016: {
      tiles: [
        'https://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityImagery_2016_3in/MapServer/tile/{z}/{y}/{x}',
      ],
      type: 'raster',
      tileSize: 256,
    },
    2015: {
      tiles: [
        'https://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityImagery_2015_3in/MapServer/tile/{z}/{y}/{x}',
      ],
      type: 'raster',
      tileSize: 256,
    },
    2012: {
      tiles: [
        'https://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityImagery_2012_3in/MapServer/tile/{z}/{y}/{x}',
      ],
      type: 'raster',
      tileSize: 256,
    },
    2010: {
      tiles: [
        'https://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityImagery_2010_3in/MapServer/tile/{z}/{y}/{x}',
      ],
      type: 'raster',
      tileSize: 256,
    },
    2008: {
      tiles: [
        'https://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityImagery_2008_3in/MapServer/tile/{z}/{y}/{x}',
      ],
      type: 'raster',
      tileSize: 256,
    },
    2004: {
      tiles: [
        'https://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityImagery_2004_6in/MapServer/tile/{z}/{y}/{x}',
      ],
      type: 'raster',
      tileSize: 256,
    },
    1996: {
      tiles: [
        'https://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityImagery_1996_6in/MapServer/tile/{z}/{y}/{x}',
      ],
      type: 'raster',
      tileSize: 256,
    },
    1962: {
      tiles: [
        'https://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/HistoricLandUse_1962/MapServer/tile/{z}/{y}/{x}',
      ],
      type: 'raster',
      tileSize: 256,
    },
    1942: {
      tiles: [
        'https://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/HistoricLandUse_1942/MapServer/tile/{z}/{y}/{x}',
      ],
      type: 'raster',
      tileSize: 256,
    },
    1910: {
      tiles: [
        'https://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/HistoricBromleyAtlas_1910/MapServer/tile/{z}/{y}/{x}',
      ],
      type: 'raster',
      tileSize: 256,
    },
    1895: {
      tiles: [
        'https://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/HistoricBromleyAtlas_1895/MapServer/tile/{z}/{y}/{x}',
      ],
      type: 'raster',
      tileSize: 256,
    },
    1875: {
      tiles: [
        'https://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/HistoricGMHopkinsAtlas_1875/MapServer/tile/{z}/{y}/{x}',
      ],
      type: 'raster',
      tileSize: 256,
    },
    1860: {
      tiles: [
        'https://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/HistoricHexamerLocherAtlas_1860/MapServer/tile/{z}/{y}/{x}',
      ],
      type: 'raster',
      tileSize: 256,
    },
    cyclomediaRecordings: {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: []
      },
    },
    camera: {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [],
        }
      }
    },
    viewCone: {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [[[]]],
        }
      }
    },
  },
}

const pwdDrawnMapStyle = mergeDeep(imageryInfo,{
  version: 8,
  name: 'pwdDrawnMap',
  sources: {
    pwd: {
      tiles: [
        'https://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityBasemap/MapServer/tile/{z}/{y}/{x}',
      ],
      type: 'raster',
      tileSize: 256,
    },
    pwdLabels: {
      tiles: [
        'https://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityBasemap_Labels/MapServer/tile/{z}/{y}/{x}',
      ],
      type: 'raster',
      tileSize: 256,
    },
    addressMarker: {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [],
        }
      }
    },
    dorParcel: {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [[[]]],
        }
      }
    },
  },
  layers: [
    {
      id: 'pwd',
      source: 'pwd',
      type: 'raster',
    },
    {
      id: 'pwdLabels',
      source: 'pwdLabels',
      type: 'raster',
    },
    {
      id: 'cyclomediaRecordings',
      source: 'cyclomediaRecordings',
      type: 'circle',
      paint: {
        'circle-radius': 6,
        'circle-color': '#80A5E6',
        'circle-stroke-width': 1,
        'circle-stroke-color': 'black',
        'circle-opacity': 0.5,
      }
    },
    {
      id: 'addressMarker',
      source: 'addressMarker',
      type: 'symbol',
      layout: {
        'icon-image': 'marker-blue',
        'icon-anchor' : 'bottom',
        'icon-size': .05,
      },
      paint: {
        "icon-color": "#ff0000",
        "icon-opacity": 1,
      },
    },
  ],
});

const liDrawnMapStyle = mergeDeep(imageryInfo,{
  version: 8,
  name: 'liDrawnMap',
  sources: {
    pwd: {
      tiles: [
        'https://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityBasemap/MapServer/tile/{z}/{y}/{x}',
      ],
      type: 'raster',
      tileSize: 256,
    },
    pwdLabels: {
      tiles: [
        'https://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityBasemap_Labels/MapServer/tile/{z}/{y}/{x}',
      ],
      type: 'raster',
      tileSize: 256,
    },
    liBuildingFootprints: {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: []
      },
    },
    addressMarker: {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [],
        }
      }
    },
    dorParcel: {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [[[]]],
        }
      }
    },
  },
  layers: [
    {
      id: 'pwd',
      source: 'pwd',
      type: 'raster',
    },
    {
      id: 'pwdLabels',
      source: 'pwdLabels',
      type: 'raster',
    },
    {
      id: 'cyclomediaRecordings',
      source: 'cyclomediaRecordings',
      type: 'circle',
      paint: {
        'circle-radius': 6,
        'circle-color': '#80A5E6',
        'circle-stroke-width': 1,
        'circle-stroke-color': 'black',
        'circle-opacity': 0.5,
      }
    },
    {
      id: 'liBuildingFootprints',
      type: 'fill',
      source: 'liBuildingFootprints',
      layout: {},
      paint: {
        // 'fill-color': '#C2B7FF',
        'fill-color': [
        'match',
        ['get', 'type'],
        'nearby311',
        '#FF0000',
        /* other */ '#C2B7FF'
        ],
        'fill-opacity': 0.5
      }
    },
    {
      id: 'addressMarker',
      source: 'addressMarker',
      type: 'symbol',
      layout: {
        'icon-image': 'marker-blue',
        'icon-anchor' : 'bottom',
        'icon-size': .05,
      },
      paint: {
        "icon-color": "#ff0000",
        "icon-opacity": 1,
      },
    },
  ],
});

const dorDrawnMapStyle = mergeDeep(imageryInfo,{
  version: 8,
  name: 'dorDrawnMap',
  sources: {
    dor: {
      tiles: [
        'https://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/DORBasemap/MapServer/tile/{z}/{y}/{x}',
      ],
      type: 'raster',
      tileSize: 256,
    },
    dorLabels: {
      tiles: [
        'https://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/DORBasemap_Labels/MapServer/tile/{z}/{y}/{x}',
      ],
      type: 'raster',
      tileSize: 256,
    },
    addressMarker: {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [],
        }
      }
    },
    dorParcel: {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [[[]]],
        }
      }
    },
  },
  layers: [
    {
      id: 'dor',
      source: 'dor',
      type: 'raster',
    },
    {
      id: 'dorLabels',
      source: 'dorLabels',
      type: 'raster',
    },
    {
      id: 'cyclomediaRecordings',
      source: 'cyclomediaRecordings',
      type: 'circle',
      paint: {
        'circle-radius': 6,
        'circle-color': '#80A5E6',
        'circle-stroke-width': 1,
        'circle-stroke-color': 'black',
        'circle-opacity': 0.5,
      }
    },
    {
      id: 'dorParcel',
      type: 'fill',
      source: 'dorParcel',
      layout: {},
      paint: {
        'fill-color': '#088',
        'fill-opacity': 0.4
      }
    }
  ],
});

const zoningDrawnMapStyle = mergeDeep(imageryInfo,{
  version: 8,
  name: 'dorDrawnMap',
  sources: {
    dor: {
      tiles: [
        'https://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/DORBasemap/MapServer/tile/{z}/{y}/{x}',
      ],
      type: 'raster',
      tileSize: 256,
    },
    dorLabels: {
      tiles: [
        'https://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/DORBasemap_Labels/MapServer/tile/{z}/{y}/{x}',
      ],
      type: 'raster',
      tileSize: 256,
    },
    zoning: {
      tiles: [
        'https://citygeo-geoserver.databridge.phila.gov/geoserver/wms?service=WMS&version=1.1.0&request=GetMap&layers=atlas_zoning_grouped&bbox={bbox-epsg-3857}&width=256&height=256&srs=EPSG%3A3857&styles=&format=image/png&transparent=true'
        // 'https://citygeo-geocoder-pub.databridge.phila.gov/arcgis/rest/services/Atlas/ZoningMap/MapServer/export?dpi=120\
        //   &transparent=true\
        //   &format=png32\
        //   &bbox={bbox-epsg-3857}\
        //   &bboxSR=3857\
        //   &imageSR=3857\
        //   &size=512,512\
        //   &f=image\
        // ',
      ],
      type: 'raster',
      tileSize: 256,
    },
    addressMarker: {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [],
        }
      }
    },
    dorParcel: {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [[[]]],
        }
      }
    },
  },
  layers: [
    {
      id: 'dor',
      source: 'dor',
      type: 'raster',
    },
    {
      id: 'dorLabels',
      source: 'dorLabels',
      type: 'raster',
    },
    {
      id: 'cyclomediaRecordings',
      source: 'cyclomediaRecordings',
      type: 'circle',
      paint: {
        'circle-radius': 6,
        'circle-color': '#80A5E6',
        'circle-stroke-width': 1,
        'circle-stroke-color': 'black',
        'circle-opacity': 0.5,
      }
    },
    {
      id: 'zoning',
      source: 'zoning',
      type: 'raster',
      paint: {
        'raster-opacity': 1,
      }
    },
    {
      id: 'dorParcel',
      type: 'fill',
      source: 'dorParcel',
      layout: {},
      paint: {
        'fill-color': '#088',
        'fill-opacity': 0.4
      }
    }
  ],
});

const nearbyDrawnMapStyle = mergeDeep(imageryInfo,{
  version: 8,
  name: 'pwdDrawnMap',
  // "sprite": 'https://docs.mapbox.com/mapbox-gl-js/assets/custom_marker.png',
  // "glyphs": 'mapbox://fonts/mapbox/{fontstack}/{range}.pbf',
  sources: {
    pwd: {
      tiles: [
        'https://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityBasemap/MapServer/tile/{z}/{y}/{x}',
      ],
      type: 'raster',
      tileSize: 256,
    },
    pwdLabels: {
      tiles: [
        'https://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityBasemap_Labels/MapServer/tile/{z}/{y}/{x}',
      ],
      type: 'raster',
      tileSize: 256,
    },
    addressMarker: {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [],
        },
      }
    },
    dorParcel: {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [[[]]],
        }
      }
    },
    nearby: {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: []
      },
    },
  },
  layers: [
    {
      id: 'pwd',
      source: 'pwd',
      type: 'raster',
    },
    {
      id: 'pwdLabels',
      source: 'pwdLabels',
      type: 'raster',
    },
    {
      id: 'cyclomediaRecordings',
      source: 'cyclomediaRecordings',
      type: 'circle',
      paint: {
        'circle-radius': 6,
        'circle-color': '#80A5E6',
        'circle-stroke-width': 1,
        'circle-stroke-color': 'black',
        'circle-opacity': 0.5,
      }
    },
    {
      id: 'nearby',
      source: 'nearby',
      type: 'circle',
      paint: {
        'circle-radius': 7,
        'circle-color': [
          'match',
          ['get', 'type'],
          'nearby311',
          '#FF0000',
          'nearbyCrimeIncidents',
          '#0096FF',
          /* other */ '#000000'
        ],
        'circle-stroke-width': 1,
        'circle-stroke-color': 'white',
      },
    },
    {
      id: 'addressMarker',
      source: 'addressMarker',
      type: 'symbol',
      layout: {
        'icon-image': 'marker-blue',
        'icon-anchor' : 'bottom',
        'icon-size': .05,
      }
    },
  ],
});

const $config = {
  topicStyles: {
    Property: 'pwdDrawnMapStyle',
    Condos: 'pwdDrawnMapStyle',
    Deeds: 'dorDrawnMapStyle',
    'Licenses & Inspections': 'liDrawnMapStyle',
    Zoning: 'zoningDrawnMapStyle',
    Voting: 'pwdDrawnMapStyle',
    'Nearby Activity': 'nearbyDrawnMapStyle',
  },
  parcelLayerForTopic: {
    undefined: 'pwd',
    Property: 'pwd',
    Condos: 'pwd',
    Deeds: 'dor',
    'Licenses & Inspections': 'pwd',
    Zoning: 'dor',
    Voting: 'pwd',
    'Nearby Activity': 'pwd',
  },
  mapLayers: {
    pwdBasemap: {
      id: 'pwdBasemap',
      source: 'pwdBasemap',
      type: 'raster',
    },
    pwdLabels: {
      id: 'pwdLabels',
      source: 'pwdLabels',
      type: 'raster',
    },
    dorBasemap: {
      id: 'dorBasemap',
      source: 'dorBasemap',
      type: 'raster',
    },
    dorLabels: {
      id: 'dorLabels',
      source: 'dorLabels',
      type: 'raster',
    },
    zoning: {
      id: 'zoning',
      source: 'zoning',
      type: 'raster',
    },
    addressMarker: {
      id: 'addressMarker',
      source: 'addressMarker',
      type: 'circle',
    },
    dorParcel: {
      id: 'dorParcel',
      type: 'fill',
      source: 'dorParcel',
      layout: {},
      paint: {
        'fill-color': '#088',
        'fill-opacity': 0.4
      }
    },
    imageryLabels: {
      id: 'imageryLabels',
      source: 'imageryLabels',
      type: 'raster',
    },
    2023: {
      id: '2023',
      source: '2023',
      type: 'raster',
    },
    2022: {
      id: '2022',
      source: '2022',
      type: 'raster',
    },
    2020: {
      id: '2020',
      source: '2020',
      type: 'raster',
    },
    2019: {
      id: '2019',
      source: '2019',
      type: 'raster',
    },
    2018: {
      id: '2018',
      source: '2018',
      type: 'raster',
    },
    2017: {
      id: '2017',
      source: '2017',
      type: 'raster',
    },
    2016: {
      id: '2016',
      source: '2016',
      type: 'raster',
    },
    2015: {
      id: '2015',
      source: '2015',
      type: 'raster',
    },
    2012: {
      id: '2012',
      source: '2012',
      type: 'raster',
    },
    2010: {
      id: '2010',
      source: '2010',
      type: 'raster',
    },
    2008: {
      id: '2008',
      source: '2008',
      type: 'raster',
    },
    2004: {
      id: '2004',
      source: '2004',
      type: 'raster',
    },
    1996: {
      id: '1996',
      source: '1996',
      type: 'raster',
    },
    1962: {
      id: '1962',
      source: '1962',
      type: 'raster',
    },
    1942: {
      id: '1942',
      source: '1942',
      type: 'raster',
    },
    1910: {
      id: '1910',
      source: '1910',
      type: 'raster',
    },
    1895: {
      id: '1895',
      source: '1895',
      type: 'raster',
    },
    1875: {
      id: '1875',
      source: '1875',
      type: 'raster',
    },
    1860: {
      id: '1860',
      source: '1860',
      type: 'raster',
    },
  },
}

$config['pwdDrawnMapStyle'] = pwdDrawnMapStyle;
$config['dorDrawnMapStyle'] = dorDrawnMapStyle;
$config['liDrawnMapStyle'] = liDrawnMapStyle;
$config['zoningDrawnMapStyle'] = zoningDrawnMapStyle;
$config['nearbyDrawnMapStyle'] = nearbyDrawnMapStyle;

export default $config;