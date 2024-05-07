<script setup>
import $config from '@/config';
import { ref, computed, onMounted, onBeforeMount } from 'vue';

  // import the AddressStore and DorParcels
import { useAddressStore } from '@/stores/AddressStore';
const AddressStore = useAddressStore();
import { useParcelsStore } from '@/stores/ParcelsStore';
const ParcelsStore = useParcelsStore();
import { useZoningStore } from '@/stores/ZoningStore';
const ZoningStore = useZoningStore();
import { useMainStore } from '@/stores/MainStore';
const MainStore = useMainStore();
import CollectionSummary from '@/components/CollectionSummary.vue';

import useTransforms from '@/composables/useTransforms';
const { rcoPrimaryContact } = useTransforms();

let selectedParcelId = computed(() => { return MainStore.selectedParcelId });
const selectedParcel = computed(() => {
  return ParcelsStore.dor.features.filter(feature => feature.id === selectedParcelId.value)[0];
});
const selectedDocs = computed(() => {
  if (selectedParcelId.value) {
    console.log('selected.value:', selectedParcelId.value);
    return DorStore.dorDocuments[selectedParcelId.value].data.features;
  } else {
    return null;
  }
});

// ZONING APPEALS
const zoningAppealsCompareFn = (a, b) => new Date(b.scheduleddate) - new Date(a.scheduleddate);
const zoningAppeals = computed(() => {
  if (!ZoningStore.zoningAppeals.rows) return [];
  return ZoningStore.zoningAppeals.rows.sort(zoningAppealsCompareFn);
});

const getLinkAppeals = (item) => {
  let address = item.address;
  if (item.unit_num && item.unit_num != null) {
    address += ' Unit ' + item.unit_num;
  }
  return "<a target='_blank' href='https://li.phila.gov/Property-History/search/Appeal-Detail?address="+encodeURIComponent(address)+"&Id="+item.appealnumber+"'>"+item.appealnumber+"<i class='fa fa-external-link-alt'></i></a>";
};

onBeforeMount(() => {
  console.log('Zoning.vue onBeforeMount');
  if (ParcelsStore.dor.features.length > 0) {
    MainStore.selectedParcelId = ParcelsStore.dor.features[0].properties.OBJECTID;
  }
});


</script>

<template>
  <div class="box">Base district zoning maps, associated zoning overlays, and Registered Community Organizations applicable to your search address. If you notice a discrepancy, please contact <a href="mailto:planning@phila.gov">planning@phila.gov</a>. Source: Department of Planning and Development</div>
  <collection-summary
    :value="'STATUS'"
    :descriptor="'parcel'"
  >
  </collection-summary>
  <div class="columns is-multiline">
    <div
      v-for="parcel in ParcelsStore.dor.features"
      :key="parcel.properties.OBJECTID"
      @click="MainStore.selectedParcelId = parcel.properties.OBJECTID"
      class="column is-3 add-borders has-text-centered"
      :class="{ 'is-selected': parcel.properties.OBJECTID === selectedParcelId }"
    >
      {{ parcel.properties.MAPREG }}
    </div>
  </div>

  <div class="columns mt-3" v-if="selectedParcel">
    <div class="columns is-multiline column is-8 is-offset-2 has-text-centered badge">
      <div class="column is-12 mb-1 badge-title">Base District</div>
      <div class="column is-3 is-flex is-align-items-center code"><b>{{ ZoningStore.zoningBase[selectedParcelId].rows[0].long_code }}</b></div>
      <div class="column is-9 description">{{ $config.ZONING_CODE_MAP[ZoningStore.zoningBase[selectedParcelId].rows[0].long_code] }}</div>
    </div>
  </div>

  <h5 class="subtitle is-5 table-title">Pending Bills</h5>
  <table class="table is-fullwidth is-striped">
    <thead>
      <tr>
        <th>Bill Type</th>
        <th>Current Zoning</th>
        <th>Pending Bill</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in ZoningStore.pendingBills[selectedParcelId]">
        <td>{{ item.billType }}</td>
        <td>{{ item.currentZoning }}</td>
        <td v-html="`<a target='_blank' href='${item.pendingbillurl}'>${item.pendingbill} <i class='fa fa-external-link-alt'></i></a>`"></td>
      </tr>
    </tbody>
  </table>

  <h5 class="subtitle is-5 table-title">Overlays</h5>
  <table class="table is-fullwidth is-striped">
    <thead>
      <tr>
        <th>Name</th>
        <th>Code Section</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in ZoningStore.zoningOverlays[selectedParcelId].rows">
        <td>{{ item.overlay_name }}</td>
        <td v-html="`<a target='_blank' href='${item.code_section_link}'>${item.code_section} <i class='fa fa-external-link-alt'></i></a>`"></td>
      </tr>
    </tbody>
  </table>

  <h5 class="subtitle is-5 table-title">Appeals</h5>
  <table class="table is-fullwidth is-striped">
    <thead>
      <tr>
        <th>Processed Date</th>
        <th>Id</th>
        <th>Description</th>
        <th>Scheduled Date</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in zoningAppeals">
        <td>{{ date(item.createddate) }}</td>
        <td>{{ getLinkAppeals(item) }}</td>
        <td>{{ item.appealgrounds }}</td>
        <td>{{ item.scheduleddate }}</td>
        <td>{{ item.decision }}</td>
      </tr>
    </tbody>
  </table>

  <div class="box">Looking for zoning documents? They are now located in the Licenses & Inspections tab under "Zoning Permit Documents".</div>

  <h5 class="subtitle is-5 table-title">Registered Community Organizations</h5>
  <table class="table is-fullwidth is-striped">
    <thead>
      <tr>
        <th>RCO</th>
        <th>Meeting Address</th>
        <th>Primary Contact</th>
        <th>Preferred Method</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in ZoningStore.rcos.features">
        <td v-html = "'<b>' + item.properties.ORGANIZATION_NAME + '</b><br>'
              + item.properties.ORGANIZATION_ADDRESS"></td>
        <td>{{ item.properties.MEETING_LOCATION_ADDRESS }}</td>
        <td v-html="rcoPrimaryContact(item.properties.PRIMARY_NAME + '<br>'
              + item.properties.PRIMARY_PHONE + '<br>'
              + item.properties.PRIMARY_EMAIL)"></td>
        <td>{{ item.properties.PREFFERED_CONTACT_METHOD }}</td>
      </tr>
    </tbody>
  </table>


</template>

<style scoped>

.badge {
  /* width: 400px; */
}

.badge-title {
  color: white;
  background-color: #58c04d;
}

.code {
  background-color: #f0f0f0;
  margin-left: 1px;
  margin-right: 2px;
}

.description {
  background-color: #f0f0f0;
  margin-left: 2px;
  margin-right: 1px;
}

</style>