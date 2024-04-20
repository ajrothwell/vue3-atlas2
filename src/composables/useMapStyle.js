export default function useMapStyle() {

  const noMapStyle = {
    version: 8,
    sources: {},
    // glyphs: 'mapbox://fonts/mapbox/{fontstack}/{range}.pbf',
    // glyphs: 'mapbox://fonts/mapbox/{fontstack}/{range}.pbf',
    glyphs: '//fonts.openmaptiles.org/{fontstack}/{range}.pbf',
    layers: [],
  }

  const pwdDrawnMapStyle = {
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
    ],
  };

  const dorDrawnMapStyle = {
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
    ],
  };

  const zoningDrawnMapStyle = {
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
      }
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
        id: 'zoning',
        source: 'zoning',
        type: 'raster',
      },
    ],
  };
  
  const imageryMapStyle = {
    version: 8,
    name: 'imageryMap',
    sources: {
      imagery: {
        tiles: [
          'https://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityImagery_2022_2in/MapServer/tile/{z}/{y}/{x}',
        ],
        type: 'raster',
        tileSize: 256,
      },
      imageryLabels: {
        tiles: [
        'https://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityImagery_Labels/MapServer/tile/{z}/{y}/{x}',
        ],
        type: 'raster',
        tileSize: 256,
      },
      stormwater: {
        tiles: [
          'https://stormwater.phila.gov/arcgis/rest/services/parcel_viewer/pv_data/MapServer/export?dpi=110\
            &transparent=true\
            &format=png36\
            &bbox={bbox-epsg-3857}\
            &bboxSR=3857\
            &imageSR=3857\
            &size=512,512\
            &f=image\
          ',
        ],
        type: 'raster',
        tileSize: 256,
      }
    },
    layers: [
      {
        id: 'imagery',
        source: 'imagery',
        type: 'raster',
      },
      {
        id: 'imageryLabels',
        source: 'imageryLabels',
        type: 'raster',
      },
      // {
      //   id: 'stormwater',
      //   source: 'stormwater',
      //   type: 'raster',
      // },
    ],
  }

  return {
    pwdDrawnMapStyle,
    dorDrawnMapStyle,
    zoningDrawnMapStyle,
    imageryMapStyle,
  }
}