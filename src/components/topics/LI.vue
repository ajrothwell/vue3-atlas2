<script setup>
console.log('LI.vue setup');
import { computed, onMounted, onBeforeMount } from 'vue';

// import the AddressStore and LiStore
import { useAddressStore } from '@/stores/AddressStore';
const AddressStore = useAddressStore();
import { useLiStore } from '@/stores/LiStore';
const LiStore = useLiStore();
import { useMapStore } from '@/stores/MapStore';
const MapStore = useMapStore();
const map = MapStore.map;

import useTransforms from '@/composables/useTransforms';
const { currency, date } = useTransforms();

// BUILDING CERTIFICATIONS
const buildingCertsCompareFn = (a, b) => new Date(b.expirationdate) - new Date(a.expirationdate);
const selectedBuildingCerts = computed(() => LiStore.liBuildingCerts.rows.filter(building => building.bin == selectedLiBuildingNumber.value).sort(buildingCertsCompareFn));

// PERMITS
const permitsCompareFn = (a, b) => new Date(b.permitissuedate) - new Date(a.permitissuedate);
const permits = computed(() => LiStore.liPermits.rows.sort(permitsCompareFn).slice(0, 5));

// INSPECTIONS
const inspectionsCompareFn = (a, b) => new Date(b.investigationcompleted) - new Date(a.investigationcompleted);
const inspections = computed(() => LiStore.liInspections.rows.sort(inspectionsCompareFn).slice(0, 5));

// individual data manipulations for INSPECTIONS
const linkInvestigationNumber = (item) => {
  let address = AddressStore.addressData.features[0].properties.street_address;
  if (item.unit_num && item.unit_num != null) {
    address += ' Unit ' + item.unit_num;
  }
  return "<a target='_blank' href='https://li.phila.gov/Property-History/search/Violation-Detail?address="+encodeURIComponent(address)+"&Id="+item.casenumber+"'>"+item.casenumber+" <i class='fa fa-external-link-alt'></i></a>";
};

onBeforeMount( async() => {
  LiStore.selectedLiBuildingNumber = LiStore.liBuildingFootprints.features[0].attributes.BIN;
})

onMounted( async () => {
  let features = [];
  if (!LiStore.liBuildingFootprints.features) return features;
  for (let item of LiStore.liBuildingFootprints.features) {
    features.push({
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [item.geometry.rings[0]]
      },
      properties: {
        id: item.attributes.BIN,
        type: 'liBuildingFootprints',
      }
    })
  }
  let geojson = {
    'type': 'FeatureCollection',
    'features': features,
  }
  console.log('geojson:', geojson, 'map.getSource("liBuildingFootprints"):', map.getSource('liBuildingFootprints'), 'map.getLayer("liBuildingFootprints"):', map.getLayer('liBuildingFootprints'));
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
        <div class="column is-8">{{ selectedLiBuilding.attributes.APPROX_HEIGHT || 'N/A' }} ft</div>
      </div>
      <div class="columns">
        <div class="column is-4">Building Footprint (approx)</div>
        <div class="column is-8">{{ (selectedLiBuilding.attributes.Shape__Area * 6.3225).toFixed(0) || 'N/A' }} sq ft</div>
      </div>
    </div>

    <!-- Building Certs Table -->
    <h5 class="subtitle is-5">Building Certifications</h5>
    <table class="table is-fullwidth is-striped">
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

    <!-- Li Permits Table -->
    <h5 class="subtitle is-5">Permits</h5>
    <table class="table is-fullwidth is-striped">
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
          <td>{{ item.permitnumber }}</td>
          <td>{{ item.permitdescription }}</td>
          <td>{{ item.status }}</td>
        </tr>
      </tbody>
    </table>

    <!-- Li Inspections Table -->
    <h5 class="subtitle is-5">Inspections</h5>
    <table class="table is-fullwidth is-striped">
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
          <td v-html="linkInvestigationNumber(item)"></td>
          <td>{{ item.investigationtype }}</td>
          <td>{{ item.investigationstatus }}</td>
        </tr>
      </tbody>
    </table>
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