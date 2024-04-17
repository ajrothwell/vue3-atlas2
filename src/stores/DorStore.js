import { defineStore } from 'pinia';
import { useParcelsStore } from './ParcelsStore';
import { useAddressStore } from './AddressStore';

import axios from 'axios';

const cleanDorAttribute = function(attr) {
  // console.log('cleanDorAttribute is running with attr', attr);
  // trim leading and trailing whitespace
  var cleanAttr = attr ? String(attr) : '';
  cleanAttr = cleanAttr.replace(/\s+/g, '');

  // return null for zeros and empty strings
  // if (['', '0'].indexOf(cleanAttr) > -1) {
  //   return null;
  // }

  // return empty for zeros and null
  if ([ null, '0' ].indexOf(cleanAttr) > -1) {
    return '';
  }

  // console.log('cleanDorAttribute cleanAttr result:', cleanAttr);
  return cleanAttr;
}

// TODO put this in base config transforms
const concatDorAddress = function(parcel, includeUnit) {
  console.log('concatDorAddress is running, parcel:', parcel);
  includeUnit = !!includeUnit;
  var STREET_FIELDS = [ 'STDIR', 'STNAM', 'STDES', 'STDESSUF' ];
  var props = parcel.properties;

  // handle house num
  var addressLow = cleanDorAttribute(props.HOUSE);
  var addressHigh = cleanDorAttribute(props.STEX);
  // maybe should be props.SUF below (it said props.SUFFIX)
  var addressSuffix = cleanDorAttribute(props.SUF);
  var address = addressLow;
  address = address + (addressHigh ? '-' + addressHigh : '');
  address = address + (addressSuffix || '');

  // handle unit
  var unit = cleanDorAttribute(props.UNIT);
  if (unit) {
    unit = '# ' + unit;
  }

  // clean up attributes
  var comps = STREET_FIELDS.map(function(streetField) {
    return props[streetField];
  });
  comps = comps.map(cleanDorAttribute);
  // TODO handle individual address comps (like mapping stex=2 => 1/2)
  // addressLow = comps.HOUSE,
  // addressHigh = comps.STEX,
  // streetPredir = comps.STDIR,
  // streetName = comps.STNAM,
  // streetSuffix = comps.STDES,
  // streetPostdir = comps.STDESSUF,

  // add address to front
  comps = [ address ].concat(comps);

  // add unit to end
  if (includeUnit) {
    comps = comps.concat([ unit ]);
  }

  // remove nulls and concat
  address = comps.filter(Boolean).join(' ');

  // console.log('concatDorAddress address result:', address);
  if (address === '') {
    address = 'Parcel has no address';
  }
  console.log('concatDorAddress address result:', address);
  return address;
}



export const useDorStore = defineStore("DorStore", {
  state: () => {
    return {
      dorDocuments: {},
    };
  },

  actions: {
    async initializeDorDocuments() {
      this.dorDocuments = {};
      const ParcelsStore = useParcelsStore();
      const AddressStore = useAddressStore();
      const url = `//services.arcgis.com/fLeGjb7u4uXqeF9q/ArcGIS/rest/services/RTT_SUMMARY/FeatureServer/0/query`;
      
      const where = function(feature) {
        console.log('where function is running, feature:', feature);
        // METHOD 1: via address
        var parcelBaseAddress = concatDorAddress(feature);
        var geocode = AddressStore.addressData.features[0].properties;
        var where;
      
        // REVIEW if the parcel has no address, we don't want to query
        // WHERE ADDRESS = 'null' (doesn't make sense), so use this for now
        if (!parcelBaseAddress || parcelBaseAddress === 'null'){
          where = "MATCHED_REGMAP = '" + ParcelsStore.DOR.features[0].properties.BASEREG + "'";
        } else {
          // TODO make these all camel case
          var props = AddressStore.addressData.features[0].properties,
            address_low = props.address_low,
            address_floor = Math.floor(address_low / 100, 1) * 100,
            address_remainder = address_low - address_floor,
            addressHigh = props.address_high,
            addressCeil = addressHigh || address_low;
      
          // form where clause
          where = "(((ADDRESS_LOW >= " + address_low + " AND ADDRESS_LOW <= " + addressCeil + ")"
                    + " OR (ADDRESS_LOW >= " + address_floor + " AND ADDRESS_LOW <= " + addressCeil + " AND ADDRESS_HIGH >= " + address_remainder + " ))"
                    + " AND STREET_NAME = '" + geocode.street_name
                    + "' AND STREET_SUFFIX = '" + geocode.street_suffix
                    + "' AND (MOD(ADDRESS_LOW,2) = MOD( " + address_low + ",2))";
      
      
      
          if (geocode.street_predir != '') {
            where += " AND STREET_PREDIR = '" + geocode.street_predir + "'";
          }
      
          if (geocode.address_low_suffix != '') {
            where += " AND ADDRESS_LOW_SUFFIX = '" + geocode.address_low_suffix + "'";
          }
      
          if (geocode.address_low_suffix == '') {
            where += " AND ADDRESS_LOW_SUFFIX = ''";
          }
      
          // this is hardcoded right now to handle DOR address suffixes that are actually fractions
          if (geocode.address_low_frac === '1/2') {
            where += " AND ADDRESS_LOW_SUFFIX = '2'"; //+ geocode.address_low_frac + "'";
          }
      
          if (geocode.street_postdir != '') {
            where += " AND STREET_POSTDIR = '" + geocode.street_postdir + "'";
          }
      
          // check for unit num
          var unitNum = cleanDorAttribute(feature.properties.UNIT),
            unitNum2 = geocode.unit_num;
      
          if (unitNum) {
            where += " AND UNIT_NUM = '" + unitNum + "'";
          } else if (unitNum2 !== '') {
            where += " AND UNIT_NUM = '" + unitNum2 + "'";
          }
      
          where += ") or MATCHED_REGMAP = '" + ParcelsStore.DOR.features[0].properties.BASEREG + "'";
          // where += ") or MATCHED_REGMAP like '%" + ParcelsStore.DOR.features[0].properties.BASEREG + "%'";
          where += " or REG_MAP_ID = '" + ParcelsStore.DOR.features[0].properties.BASEREG + "'";
        }
      
        return where;
      }

      for (let feature of ParcelsStore.DOR.features) {
        let theWhere = where(feature);
          
        const params = {
          where: theWhere,
          outFields: "DOCUMENT_ID, DISPLAY_DATE, DOCUMENT_TYPE, GRANTORS, GRANTEES",
          // outFields: "R_NUM, DISPLAY_DATE, DOCUMENT_TYPE, GRANTORS, GRANTEES",
          returnDistinctValues: 'true',
          returnGeometry: 'false',
          f: 'json',
          sqlFormat: 'standard',
        }

        console.log('params:', params);
        const response = await axios(url, { params });
        this.dorDocuments[feature.properties.OBJECTID] = response;
      }
    },
  },
})