<script setup>
console.log('LI.vue setup');
import { computed, onMounted, onBeforeMount } from 'vue';
import { polygon, featureCollection } from '@turf/helpers';

import { useMainStore } from '@/stores/MainStore';
const MainStore = useMainStore();
import { useLiStore } from '@/stores/LiStore';
const LiStore = useLiStore();
import { useMapStore } from '@/stores/MapStore';
const MapStore = useMapStore();
const map = MapStore.map;

import useTransforms from '@/composables/useTransforms';
const { date, integer, prettyNumber } = useTransforms();

// BUILDING CERTIFICATIONS
const buildingCertsCompareFn = (a, b) => new Date(b.expirationdate) - new Date(a.expirationdate);
const selectedBuildingCerts = computed(() => LiStore.liBuildingCerts.rows.filter(building => building.bin == selectedLiBuildingNumber.value).sort(buildingCertsCompareFn));

// PERMITS
const permitsCompareFn = (a, b) => new Date(b.permitissuedate) - new Date(a.permitissuedate);
const permits = computed(() => LiStore.liPermits.rows.sort(permitsCompareFn).slice(0, 5));

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
const liAllZoningDocs = liAisZoningDocs.value.concat(liEclipseZoningDocs.value).sort(liZoningDocsCompareFn);
console.log('allDocs:', liAllZoningDocs);

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
const inspections = computed(() => LiStore.liInspections.rows.sort(inspectionsCompareFn).slice(0, 5));

const getLinkInvestigationNumber = (item) => {
  let address = item.address;
  if (item.unit_num && item.unit_num != null) {
    address += ' Unit ' + item.unit_num;
  }
  return "<a target='_blank' href='https://li.phila.gov/Property-History/search/Violation-Detail?address="+encodeURIComponent(address)+"&Id="+item.casenumber+"'>"+item.casenumber+" <i class='fa fa-external-link-alt'></i></a>";
};

// VIOLATIONS
const violationsCompareFn = (a, b) => new Date(b.casecreateddate) - new Date(a.casecreateddate);
const violations = computed(() => LiStore.liViolations.rows.sort(violationsCompareFn).slice(0, 5));

const getLinkViolationNumber = (item) => {
  let address = item.address;
  if (item.unit_num && item.unit_num != null) {
    address += ' Unit ' + item.unit_num;
  }
  return "<a target='_blank' href='https://li.phila.gov/Property-History/search/Violation-Detail?address="+encodeURIComponent(address)+"&Id="+item.casenumber+"'>"+item.casenumber+" <i class='fa fa-external-link-alt'></i></a>";
};

// BUSINESS LICENSES
const businessLicensesCompareFn = (a, b) => new Date(b.initialissuedate) - new Date(a.initialissuedate);
const businessLicenses = computed(() => LiStore.liBusinessLicenses.rows.sort(businessLicensesCompareFn).slice(0, 5));

const getLinkLicenseNumber = (item) => {
  let address = item.address;
  if (item.unit_num && item.unit_num != null) {
    address += ' Unit ' + item.unit_num;
  }
  return "<a target='_blank' href='https://li.phila.gov/Property-History/search/Business-License-Detail?address="+encodeURIComponent(address)+"&Id="+item.licensenum+"'>"+item.licensenum+" <i class='fa fa-external-link-alt'></i></a>";
};

onBeforeMount( async() => {
  LiStore.selectedLiBuildingNumber = LiStore.liBuildingFootprints.features[0].attributes.BIN;
})

onMounted( async () => {
  let features = [];
  if (!LiStore.liBuildingFootprints.features) return features;
  for (let item of LiStore.liBuildingFootprints.features) {
    features.push(polygon([item.geometry.rings[0]], { id: item.attributes.BIN, type: 'liBuildingFootprints' }));
  }
  let geojson = featureCollection(features);
  // console.log('geojson:', geojson, 'map.getSource("liBuildingFootprints"):', map.getSource('liBuildingFootprints'), 'map.getLayer("liBuildingFootprints"):', map.getLayer('liBuildingFootprints'));
  await map.getSource('liBuildingFootprints').setData(geojson);
});

const selectedLiBuildingNumber = computed(() => LiStore.selectedLiBuildingNumber);

const selectedLiBuilding = computed(() => {
  return LiStore.liBuildingFootprints.features.filter(feature => feature.attributes.BIN === selectedLiBuildingNumber.value)[0];
});

const handleBinClick = (bin) => {
  // LiStore.selectedLiBuildingNumber = footprint.attributes.BIN
  LiStore.selectedLiBuildingNumber = bin;
};

</script>

<template>
  <section>
    <div class="box">
      Licenses, inspections, permits, property maintenance violations, and zoning permit documents at your search address. Source: Department of Licenses & Inspections
    </div>

    <h5 class="subtitle is-5">There are {{ LiStore.liBuildingFootprints.features.length }} buildings at this address</h5>
    <!-- Li Building Footprints Section -->
    <div class="columns is-multiline">
      <div
        v-for="footprint in LiStore.liBuildingFootprints.features"
        :key="footprint.attributes.BIN"
        @click="handleBinClick(footprint.attributes.BIN)"
        class="column is-2 add-borders has-text-centered"
        :class="{ 'is-selected': footprint.attributes.BIN === selectedLiBuildingNumber }"
      >
        {{ footprint.attributes.BIN }}
      </div>
    </div>

    <!-- Li Building info-->
    <!-- <h5 class="title is-5">Parcel Details</h5> -->
    <div class="vert-table">
      <div class="columns">
        <div class="column is-4">Building ID</div>
        <div class="column is-8">{{ selectedLiBuilding.attributes.BIN || 'N/A' }}</div>
      </div>
      <div class="columns">
        <div class="column is-4">Building Name</div>
        <div class="column is-8">{{ selectedLiBuilding.attributes.BUILDING_NAME || 'N/A' }}</div>
      </div>
      <div class="columns">
        <div class="column is-4">Parcel Address</div>
        <div class="column is-8">{{ selectedLiBuilding.attributes.ADDRESS || 'N/A' }}</div>
      </div>
      <div class="columns">
        <div class="column is-4">Building Height (approx)</div>
        <div class="column is-8">{{ selectedLiBuilding.attributes.APPROX_HGT || 'N/A' }} ft</div>
      </div>
      <div class="columns">
        <div class="column is-4">Building Footprint (approx)</div>
        <div class="column is-8">{{ prettyNumber(integer(selectedLiBuilding.attributes.Shape__Area * 6.3225)) || 'N/A' }} sq ft</div>
      </div>
    </div>

    <!-- Building Certs Table -->
    <h5 class="subtitle is-5 table-title">Building Certifications</h5>
    <table class="table is-fullwidth is-striped link-at-bottom">
      <thead>
        <tr>
          <th>InspectionType</th>
          <th>Date Inspected</th>
          <th>Inspection Result</th>
          <th>Expiration Date</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in selectedBuildingCerts">
          <td>{{ item.buildingcerttype }}</td>
          <td>{{ date(item.inspectiondate) }}</td>
          <td>{{ item.inspectionresult }}</td>
          <td>{{ date(item.expirationdate) }}</td>
        </tr>
      </tbody>
    </table>
    <div class="table-link">
      <a target="_blank" :href="`https://li.phila.gov/Property-History/search?address=${encodeURIComponent(MainStore.currentAddress)}`">See all {{ LiStore.liBuildingCerts.rows.length || '' }} building certifications for this property at L&I Property History <font-awesome-icon icon='fa-solid fa-external-link-alt'></font-awesome-icon></a>
    </div>

    <!-- Li Permits Table -->
    <h5 class="subtitle is-5 table-title">Permits</h5>
    <table
      :class="LiStore.liPermits.rows.length > 5 ? 'link-at-bottom' : ''"
      class="table is-fullwidth is-striped"
    >
      <thead>
        <tr>
          <th>Date</th>
          <th>ID</th>
          <th>Description</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in permits">
          <td>{{ date(item.permitissuedate) }}</td>
          <td v-html="getLinkPermit(item)"></td>
          <td>{{ item.permitdescription }}</td>
          <td>{{ item.status }}</td>
        </tr>
      </tbody>
    </table>
    <div v-if="LiStore.liPermits.rows.length > 5" class="table-link">
      <a target="_blank" :href="`https://li.phila.gov/Property-History/search?address=${encodeURIComponent(MainStore.currentAddress)}`">See {{ LiStore.liPermits.rows.length-5 }} older permits at L&I Property History <font-awesome-icon icon='fa-solid fa-external-link-alt'></font-awesome-icon></a>
    </div>

    <!-- liAisZoningDocs and liEclipseZoningDocs Table-->
    <h5 class="subtitle is-5 table-title">Zoning Permit Documents</h5>
    <h6 class="subtitle is-6">Formerly "Zoning Archive"</h6>
    <table class="table is-fullwidth is-striped">
      <thead>
        <tr>
          <th>Date</th>
          <th>Permit Number</th>
          <th># Pages</th>
          <th>ID</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in liAllZoningDocs">
          <td>{{ getZoningDocDate(item) }}</td>
          <td>{{ item.permit_number }}</td>
          <td>{{ getZoningDocPages(item) }}</td>
          <td v-html="getZoningDocLink(item)"></td>
        </tr>
      </tbody>
    </table>

    <!-- Li Inspections Table -->
    <h5 class="subtitle is-5 table-title">Inspections</h5>
    <table 
      :class="LiStore.liInspections.rows.length > 5 ? 'link-at-bottom' : ''"
      class="table is-fullwidth is-striped"
    >

      <thead>
        <tr>
          <th>Date</th>
          <th>ID</th>
          <th>Description</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in inspections">
          <td>{{ date(item.investigationcompleted) }}</td>
          <td v-html="getLinkInvestigationNumber(item)"></td>
          <td>{{ item.investigationtype }}</td>
          <td>{{ item.investigationstatus }}</td>
        </tr>
      </tbody>
    </table>
    <div v-if="LiStore.liInspections.rows.length > 5" class="table-link">
      <a target="_blank" :href="`https://li.phila.gov/Property-History/search?address=${encodeURIComponent(MainStore.currentAddress)}`">See {{ LiStore.liInspections.rows.length }} older inspections at L&I Property History <font-awesome-icon icon='fa-solid fa-external-link-alt'></font-awesome-icon></a>
    </div>

    <!-- Li Violations Table -->
    <h5 class="subtitle is-5 table-title">Violations</h5>
    <table
      :class="LiStore.liInspections.rows.length > 5 ? 'link-at-bottom' : ''"
      class="table is-fullwidth is-striped"
    >
      <thead>
        <tr>
          <th>Date</th>
          <th>ID</th>
          <th>Description</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in violations">
          <td>{{ date(item.casecreateddate) }}</td>
          <td v-html="getLinkViolationNumber(item)"></td>
          <td>{{ item.violationcodetitle }}</td>
          <td>{{ item.violationstatus }}</td>
        </tr>
      </tbody>
    </table>
    <div v-if="LiStore.liInspections.rows.length > 5" class="table-link">
      <a target="_blank" :href="`https://li.phila.gov/Property-History/search?address=${encodeURIComponent(MainStore.currentAddress)}`">See {{ LiStore.liViolations.rows.length-5 }} older violations at L&I Property History <font-awesome-icon icon='fa-solid fa-external-link-alt'></font-awesome-icon></a>
    </div>

    <!-- Li Business Licenses Table -->
    <h5 class="subtitle is-5 table-title">Business Licenses</h5>
    <table
      :class="LiStore.liBusinessLicenses.rows.length > 5 ? 'link-at-bottom' : ''"
      class="table is-fullwidth is-striped link-at-bottom"
    >
      <thead>
        <tr>
          <th>Date</th>
          <th>License Number</th>
          <th>Name</th>
          <th>Type</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in businessLicenses">
          <td>{{ date(item.initialissuedate) }}</td>
          <td v-html="getLinkLicenseNumber(item)"></td>
          <td>{{ item.business_name }}</td>
          <td>{{ item.licensetype }}</td>
          <td>{{ item.licensestatus }}</td>
        </tr>
      </tbody>
    </table>
    <div v-if="LiStore.liBusinessLicenses.rows.length > 5" class="table-link">
      <a target="_blank" :href="`https://li.phila.gov/Property-History/search?address=${encodeURIComponent(MainStore.currentAddress)}`">See {{ LiStore.liBusinessLicenses.rows.length-5 }} older business licenses at L&I Property History <font-awesome-icon icon='fa-solid fa-external-link-alt'></font-awesome-icon></a>
    </div>

  </section>
</template>

<style>

.add-borders {
  border: 1px solid #ccc;
  padding: .5em;
}

.is-selected {
  background-color: #b8b8b8
}

</style>