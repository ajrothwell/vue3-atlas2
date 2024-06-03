<script setup>
console.log('LI.vue setup');
import { ref, computed, watch, onMounted, onBeforeMount } from 'vue';
import { polygon, featureCollection } from '@turf/helpers';

import { useMainStore } from '@/stores/MainStore';
const MainStore = useMainStore();
import { useLiStore } from '@/stores/LiStore';
const LiStore = useLiStore();
import { useMapStore } from '@/stores/MapStore';
const MapStore = useMapStore();
const map = MapStore.map;

import VerticalTable from '../VerticalTable.vue';

import useTransforms from '@/composables/useTransforms';
const { date, integer, prettyNumber } = useTransforms();

// BUILDING CERTIFICATIONS
const buildingCertsCompareFn = (a, b) => new Date(b.expirationdate) - new Date(a.expirationdate);
const selectedBuildingCerts = computed(() => {
  if (!LiStore.liBuildingCerts.rows || !selectedLiBuildingNumber.value) return [];
  return LiStore.liBuildingCerts.rows.filter(building => building.bin == selectedLiBuildingNumber.value).sort(buildingCertsCompareFn)
});

// PERMITS
const permitsCompareFn = (a, b) => new Date(b.permitissuedate) - new Date(a.permitissuedate);
// const permits = computed(() => LiStore.liPermits.rows.sort(permitsCompareFn).slice(0, 5));
const permits = computed(() => { if(LiStore.liPermits.rows) return LiStore.liPermits.rows.sort(permitsCompareFn) });

const getLinkPermit = (item) => {
  let address = item.address;
  if (item.unit_num && item.unit_num != null) {
    address += ' Unit ' + item.unit_num;
  }
  return "<a target='_blank' href='https://li.phila.gov/Property-History/search/Permit-Detail?address="+encodeURIComponent(address)+"&Id="+item.permitnumber+"'>"+item.permitnumber+" <i class='fa fa-external-link-alt'></i></a>";
};

// ZONING DOCS
const liZoningDocsCompareFn = (a, b) => new Date(b.scan_date || a.issue_date) - new Date(a.scan_date || a.issue_date);
const liAisZoningDocs = computed(() => LiStore.liAisZoningDocs.rows);
const liEclipseZoningDocs = computed(() => LiStore.liEclipseZoningDocs.rows);
console.log('liAisZoningDocs.value:', liAisZoningDocs.value, 'liEclipseZoningDocs.value:', liEclipseZoningDocs.value);
const liAllZoningDocs = computed(() => {
  if (!liAisZoningDocs.value || !liEclipseZoningDocs.value) return [];
  return liAisZoningDocs.value.concat(liEclipseZoningDocs.value).sort(liZoningDocsCompareFn);
});
console.log('liAllZoningDocs:', liAllZoningDocs);

const getZoningDocDate = (item) => {
  if (item.issue_date) {
    return date(item.issue_date);
  } else if (item.scan_date) {
    return date(item.scan_date);
  } else {
    return 'N/A';
  }
};

const getZoningDocLink = (item) => {
  let appId;
  if (item.app_id) {
    appId = item.app_id;
    if (appId.length < 3) {
      appId = '0' + appId;
    }
  }
  let docId, url;
  if (item.doc_id) {
    docId = item.doc_id;
    url = '//s3.amazonaws.com/lni-zoning-pdfs/';
  } else if (item.permit_number ) {
    docId = item.permit_number ;
    url = 'http://s3.amazonaws.com/eclipse-docs-pdfs/zoning/';
  }
  return '<a target="_blank" href="' //s3.amazonaws.com/lni-zoning-pdfs/'
          + url
          + docId
          + '.pdf">'
          + docId
          + ' <font-awesome-icon icon="fa-solid fa-external-link-alt"></font-awesome-icon></a>'
          + '</a>';
};

const getZoningDocPages = (item) => {
  if (item.num_pages) {
    return item.num_pages;
  } else if (item.pages_scanned) {
    return item.page_scanned;
  } else {
    return 'N/A';
  }
};

// INSPECTIONS
const inspectionsCompareFn = (a, b) => new Date(b.investigationcompleted) - new Date(a.investigationcompleted);
const inspections = computed(() => {
  if (!LiStore.liInspections.rows) return [];
  return LiStore.liInspections.rows.sort(inspectionsCompareFn);//.slice(0, 5);
});

// const getLinkInvestigationNumber = (item) => {
//   let address = item.address;
//   if (item.unit_num && item.unit_num != null) {
//     address += ' Unit ' + item.unit_num;
//   }
//   return "<a target='_blank' href='https://li.phila.gov/Property-History/search/Violation-Detail?address="+encodeURIComponent(address)+"&Id="+item.casenumber+"'>"+item.casenumber+" <i class='fa fa-external-link-alt'></i></a>";
// };

// VIOLATIONS
const violationsCompareFn = (a, b) => new Date(b.casecreateddate) - new Date(a.casecreateddate);
const violations = computed(() => {
  if (!LiStore.liViolations.rows) return [];
  return LiStore.liViolations.rows.sort(violationsCompareFn);//.slice(0, 5);
});

// const getLinkViolationNumber = (item) => {
//   let address = item.address;
//   if (item.unit_num && item.unit_num != null) {
//     address += ' Unit ' + item.unit_num;
//   }
//   return "<a target='_blank' href='https://li.phila.gov/Property-History/search/Violation-Detail?address="+encodeURIComponent(address)+"&Id="+item.casenumber+"'>"+item.casenumber+" <i class='fa fa-external-link-alt'></i></a>";
// };

// BUSINESS LICENSES
const businessLicensesCompareFn = (a, b) => new Date(b.initialissuedate) - new Date(a.initialissuedate);
const businessLicenses = computed(() => {
  if (!LiStore.liBusinessLicenses.rows) return [];
  return LiStore.liBusinessLicenses.rows.sort(businessLicensesCompareFn);//.slice(0, 5);
});

// const getLinkLicenseNumber = (item) => {
//   let address = item.address;
//   if (item.unit_num && item.unit_num != null) {
//     address += ' Unit ' + item.unit_num;
//   }
//   return "<a target='_blank' href='https://li.phila.gov/Property-History/search/Business-License-Detail?address="+encodeURIComponent(address)+"&Id="+item.licensenum+"'>"+item.licensenum+" <i class='fa fa-external-link-alt'></i></a>";
// };

const liBuildingFootprints = computed(() => LiStore.liBuildingFootprints);

watch (liBuildingFootprints,
  async (newLiBuildingFootprints, oldLiBuildingFootprints) => {
    console.log('watch newLiBuildingFootprints.features:', newLiBuildingFootprints.features);
    LiStore.selectedLiBuildingNumber = LiStore.liBuildingFootprints.features[0].attributes.BIN;

    let features = [];
    for (let item of newLiBuildingFootprints.features) {
      features.push(polygon([item.geometry.rings[0]], { id: item.attributes.BIN, type: 'liBuildingFootprints' }));
    }
    let geojson = featureCollection(features);
    // console.log('geojson:', geojson, 'map.getSource("liBuildingFootprints"):', map.getSource('liBuildingFootprints'), 'map.getLayer("liBuildingFootprints"):', map.getLayer('liBuildingFootprints'));
    const map = MapStore.map;
    await map.getSource('liBuildingFootprints').setData(geojson);
  }
)

const selectedLiBuildingNumber = computed(() => LiStore.selectedLiBuildingNumber);

const selectedLiBuilding = computed(() => {
  if (!LiStore.liBuildingFootprints.features) return;
  return LiStore.liBuildingFootprints.features.filter(feature => feature.attributes.BIN === selectedLiBuildingNumber.value)[0];
});

const handleBinClick = (bin) => {
  // LiStore.selectedLiBuildingNumber = footprint.attributes.BIN
  LiStore.selectedLiBuildingNumber = bin;
};

const buildingData = computed(() => {
  const selectedLiBuilding = LiStore.liBuildingFootprints.features.filter(feature => feature.attributes.BIN === selectedLiBuildingNumber.value)[0];
  return [
    {
      label: 'Building ID',
      value: selectedLiBuilding.attributes.BIN || 'N/A',
    },
    {
      label: 'Building Name',
      value: selectedLiBuilding.attributes.BUILDING_NAME || 'N/A',
    },
    {
      label: 'Parcel Address',
      value: selectedLiBuilding.attributes.ADDRESS || 'N/A',
    },
    {
      label: 'Building Height (approx)',
      value: selectedLiBuilding.attributes.APPROX_HGT + ' ft' || 'N/A',
    },
    {
      label: 'Building Footprint (approx)',
      value: prettyNumber(integer(selectedLiBuilding.attributes.Shape__Area * 6.3225)) + ' sq ft' || 'N/A',
    },
  ];
});

const paginationOptions = ref({
  enabled: true,
  mode: 'pages',
  perPage: 5,
  position: 'top',
  dropdownAllowAll: false,
  nextLabel: '',
  prevLabel: '',
  rowsPerPageLabel: '# rows',
  ofLabel: 'of',
  pageLabel: 'page', // for 'pages' mode
  allLabel: 'All',
});

const buildingCertsTableData = ref({
  columns: [
    {
      label: 'Inspection Type',
      field: 'buildingcerttype',
    },
    {
      label: 'Date Inspected',
      field: 'inspectiondate',
      type: 'date',
      dateInputFormat: "yyyy-MM-dd'T'HH:mm:ssX",
      dateOutputFormat: 'MM/dd/yyyy',
    },
    {
      label: 'Inspection Result',
      field: 'inspectionresult',
    },
    {
      label: 'Expiration Date',
      field: 'expirationdate',
      type: 'date',
      dateInputFormat: "yyyy-MM-dd'T'HH:mm:ssX",
      dateOutputFormat: 'MM/dd/yyyy',
    }
  ],
  rows: selectedBuildingCerts,
})

const permitsTableData = computed(() => {
  return {
    columns: [
      {
        label: 'Date',
        field: 'permitissuedate',
        type: 'date',
        dateInputFormat: "yyyy-MM-dd'T'HH:mm:ssX",
        dateOutputFormat: 'MM/dd/yyyy',
      },
      {
        label: 'ID',
        field: 'link',
        html: true,
      },
      {
        label: 'Description',
        field: 'permitdescription',
      },
      {
        label: 'Status',
        field: 'status',
      }
    ],
    rows: permits.value,
  }
});

const zoningDocsTableData = computed(() => {
  return {
    columns: [
      {
        label: 'Date',
        field: 'doc_date',
        type: 'date',
        dateInputFormat: 'MM/dd/yyyy',
        dateOutputFormat: 'MM/dd/yyyy',
      },
      {
        label: 'Permit Number',
        field: 'permit_number',
      },
      {
        label: '# Pages',
        field: 'pages',
      },
      {
        label: 'ID',
        field: 'link',
        html: true,
      }
    ],
    rows: liAllZoningDocs.value,
  }
});

const inspectionsTableData = computed(() => {
  return {
    columns: [
      {
        label: 'Date',
        field: 'investigationcompleted',
        type: 'date',
        dateInputFormat: "yyyy-MM-dd'T'HH:mm:ssX",
        dateOutputFormat: 'MM/dd/yyyy',
      },
      {
        label: 'ID',
        field: 'link',
        html: true,
      },
      {
        label: 'Description',
        field: 'investigationtype',
      },
      {
        label: 'Status',
        field: 'investigationstatus',
      }
    ],
    rows: inspections.value,
  }
});

const violationsTableData = computed(() => {
  return {
    columns: [
      {
        label: 'Date',
        field: 'casecreateddate',
        type: 'date',
        dateInputFormat: "yyyy-MM-dd'T'HH:mm:ssX",
        dateOutputFormat: 'MM/dd/yyyy',
      },
      {
        label: 'ID',
        field: 'link',
        html: true,
      },
      {
        label: 'Description',
        field: 'violationcodetitle',
      },
      {
        label: 'Status',
        field: 'violationstatus',
      }
    ],
    rows: violations.value,
  }
});

const businessLicensesTableData = computed(() => {
  return {
    columns: [
      {
        label: 'Date',
        field: 'initialissuedate',
        type: 'date',
        dateInputFormat: "yyyy-MM-dd'T'HH:mm:ssX",
        dateOutputFormat: 'MM/dd/yyyy',
      },
      {
        label: 'License Number',
        field: 'link',
        html: true,
      },
      {
        label: 'Name',
        field: 'business_name',
      },
      {
        label: 'Type',
        field: 'licensetype',
      },
      {
        label: 'Status',
        field: 'licensestatus',
      }
    ],
    rows: businessLicenses.value,
  }
});

</script>

<template>
  <section>
    <div id="Licenses & Inspections-description" class="box">
      Licenses, inspections, permits, property maintenance violations, and zoning permit documents at your search address. Source: Department of Licenses & Inspections
    </div>

    <!-- <h5 class="subtitle is-5">There are {{ LiStore.liBuildingFootprints.features.length }} buildings at this address</h5> -->
    <!-- Li Building Footprints Section -->
    <div v-if="selectedLiBuilding" id="li-building-div" class="columns add-borders p-2">
      <div class="column is-12">
        <div v-if="selectedLiBuilding">
          <div class="columns is-multiline is-mobile">
            <div
              v-for="footprint in LiStore.liBuildingFootprints.features"
              :key="footprint.attributes.BIN"
              @click="handleBinClick(footprint.attributes.BIN)"
              class="column is-2-desktop is-3-mobile has-text-centered add-borders"
              :class="{ 'is-selected': footprint.attributes.BIN === selectedLiBuildingNumber }"
            >
              {{ footprint.attributes.BIN }}
            </div>
          </div>

          <!-- Li Building info-->
          <vertical-table tableId="buildingTable" :data="buildingData"></vertical-table>
          <br>

          <!-- Building Certs Table -->
          <h5 class="subtitle is-5 table-title">Building Certifications</h5>
          <div v-if="selectedBuildingCerts" class="horizontal-table">

            <vue-good-table
              id="building-certs"
              :columns="buildingCertsTableData.columns"
              :rows="buildingCertsTableData.rows"
              :pagination-options="paginationOptions"
              style-class="table"
            >
              <template #emptystate>
                No building certifications found
              </template>
            </vue-good-table>
          </div>
          <!-- <div class='mobile-no-data' v-if="!selectedBuildingCerts.length">No building certifications found</div> -->
          <!-- <div class="table-link" v-if="selectedBuildingCerts.length"> -->
          <a target="_blank" :href="`https://li.phila.gov/Property-History/search?address=${encodeURIComponent(MainStore.currentAddress)}`">See all {{ LiStore.liBuildingCerts.rows.length || '' }} building certifications for this property at L&I Property History <font-awesome-icon icon='fa-solid fa-external-link-alt'></font-awesome-icon></a>
          <!-- </div> -->
        </div>
      </div>
    </div>

    <!-- Li Permits Table -->
    <div class="data-section">
      <h5 class="subtitle is-5 table-title">Permits</h5>
      <div v-if="permitsTableData.rows" class="horizontal-table">
        <vue-good-table
          id="permits"
          :columns="permitsTableData.columns"
          :rows="permitsTableData.rows"
          :pagination-options="paginationOptions"
          style-class="table"
        />
      </div>
      <a target="_blank" :href="`https://li.phila.gov/Property-History/search?address=${encodeURIComponent(MainStore.currentAddress)}`">See all permits at L&I Property History <font-awesome-icon icon='fa-solid fa-external-link-alt'></font-awesome-icon></a>
    </div>
    
    <!-- <a target="_blank" :href="`https://li.phila.gov/Property-History/search?address=${encodeURIComponent(MainStore.currentAddress)}`">See all {{ LiStore.liPermits.rows.length }} permits at L&I Property History <font-awesome-icon icon='fa-solid fa-external-link-alt'></font-awesome-icon></a> -->

    <!-- liAisZoningDocs and liEclipseZoningDocs Table-->
    <div class="data-section">
      <h5 class="subtitle is-5 table-title">Zoning Permit Documents</h5>
      <h6 class="subtitle is-6 table-subtitle">Formerly "Zoning Archive"</h6>
      <div v-if="zoningDocsTableData.rows" class="horizontal-table">
        <vue-good-table
          id="zoningDocs"
          :columns="zoningDocsTableData.columns"
          :rows="zoningDocsTableData.rows"
          :pagination-options="paginationOptions"
          style-class="table"
        />
      </div>
    </div>

    <!-- Li Inspections Table -->
    <div class="data-section">
      <h5 class="subtitle is-5 table-title">Inspections</h5>
      <div v-if="inspectionsTableData.rows" class="horizontal-table">
        <vue-good-table
          id="inspections"
          :columns="inspectionsTableData.columns"
          :rows="inspectionsTableData.rows"
          :pagination-options="paginationOptions"
          style-class="table"
        />
      </div>
      <a target="_blank" :href="`https://li.phila.gov/Property-History/search?address=${encodeURIComponent(MainStore.currentAddress)}`">See older inspections at L&I Property History <font-awesome-icon icon='fa-solid fa-external-link-alt'></font-awesome-icon></a>
    </div>
    
      <!-- <a target="_blank" :href="`https://li.phila.gov/Property-History/search?address=${encodeURIComponent(MainStore.currentAddress)}`">See {{ LiStore.liInspections.rows.length }} older inspections at L&I Property History <font-awesome-icon icon='fa-solid fa-external-link-alt'></font-awesome-icon></a> -->

    <!-- Li Violations Table -->
    <div class="data-section">
      <h5 class="subtitle is-5 table-title">Violations</h5>
      <div v-if="violationsTableData.rows" class="horizontal-table">
        <vue-good-table
          id="violations"
          :columns="violationsTableData.columns"
          :rows="violationsTableData.rows"
          :pagination-options="paginationOptions"
          style-class="table"
        />
      </div>
      <a target="_blank" :href="`https://li.phila.gov/Property-History/search?address=${encodeURIComponent(MainStore.currentAddress)}`">See older violations at L&I Property History <font-awesome-icon icon='fa-solid fa-external-link-alt'></font-awesome-icon></a>
    </div>

    <!-- <a target="_blank" :href="`https://li.phila.gov/Property-History/search?address=${encodeURIComponent(MainStore.currentAddress)}`">See {{ LiStore.liViolations.rows.length-5 }} older violations at L&I Property History <font-awesome-icon icon='fa-solid fa-external-link-alt'></font-awesome-icon></a> -->

    <!-- Li Business Licenses Table -->
    <div class="data-section">
      <h5 class="subtitle is-5 table-title">Business Licenses</h5>
      <div v-if="businessLicensesTableData" class="horizontal-table">
        <vue-good-table
          id="business-licenses"
          :columns="businessLicensesTableData.columns"
          :rows="businessLicensesTableData.rows"
          :pagination-options="paginationOptions"
          style-class="table"
        />
      </div>
      <a target="_blank" :href="`https://li.phila.gov/Property-History/search?address=${encodeURIComponent(MainStore.currentAddress)}`">See older business licenses at L&I Property History <font-awesome-icon icon='fa-solid fa-external-link-alt'></font-awesome-icon></a>
    </div>
    
    <!-- <a target="_blank" :href="`https://li.phila.gov/Property-History/search?address=${encodeURIComponent(MainStore.currentAddress)}`">See {{ LiStore.liBusinessLicenses.rows.length-5 }} older business licenses at L&I Property History <font-awesome-icon icon='fa-solid fa-external-link-alt'></font-awesome-icon></a> -->

  </section>
</template>

<style>

.data-section {
  margin-bottom: 2rem;
}

.add-borders {
  border: 1px solid #ccc;
}

.add-white-borders {
  background-color: #e8e8e8;
  border: 2px solid white;
}

.is-selected {
  background-color: #ccc;
  /* background-color: #a9a9a9 */
}

#li-building-div {
  padding: 0px !important;
  margin-bottom: 1.5rem;
}

@media 
only screen and (max-width: 760px),
(min-device-width: 768px) and (max-device-width: 1024px)  {

  /* td {
    padding-left: 85px !important;
  } */
  td[colspan="4"] {
    padding-left: 0px !important;
  }

	/* Label the data */
    
	#building-certs {

    td {
      min-height: 60px;
    }

    td:nth-of-type(1):before { content: "Inspection Type"; }
    td:nth-of-type(2):before { content: "Date Inspected"; }
    td:nth-of-type(3):before { content: "Inspection Result"; }
    td:nth-of-type(4):before { content: "Expiration Date"; }
  }

  #permits, #inspections, #violations {

    /* td:nth-of-type(1):before { content: "Date"; }} */
    td:nth-of-type(1):before { content: "Date"; }
    td:nth-of-type(2):before { content: "ID"; }
    td:nth-of-type(3):before { content: "Description"; }
    td:nth-of-type(4):before { content: "Status"; }
  }

  #zoning-permit-docs {
    /* margin-bottom: 2rem; */

    td:nth-of-type(2) {
      min-height: 60px;
    }

    td:nth-of-type(1):before { content: "Date"; }
    td:nth-of-type(2):before { content: "Permit Number"; }
    td:nth-of-type(3):before { content: "# Pages"; }
    td:nth-of-type(4):before { content: "ID"; }
  }

  #business-licenses {
    td:nth-of-type(2) {
      min-height: 60px;
    }

    td:nth-of-type(1):before { content: "Date"; }
    td:nth-of-type(2):before { content: "License Number"; }
    td:nth-of-type(3):before { content: "Name"; }
    td:nth-of-type(4):before { content: "Type"; }
    td:nth-of-type(5):before { content: "Status"; }
  }

}



</style>