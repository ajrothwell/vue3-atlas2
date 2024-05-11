<script setup>

import { computed, onBeforeMount } from 'vue';
// import { storeToRefs } from 'pinia';

import useTransforms from '@/composables/useTransforms';
const { date, integer, prettyNumber } = useTransforms();

// import the AddressStore and DorParcels
import { useAddressStore } from '@/stores/AddressStore';
const AddressStore = useAddressStore();
import { useParcelsStore } from '@/stores/ParcelsStore';
const ParcelsStore = useParcelsStore();
import { useDorStore } from '@/stores/DorStore';
const DorStore = useDorStore();
import { useMainStore } from '@/stores/MainStore';
const MainStore = useMainStore();
import { useMapStore } from '@/stores/MapStore';
const MapStore = useMapStore();
import CollectionSummary from '@/components/CollectionSummary.vue';

let selectedParcelId = computed(() => { return MainStore.selectedParcelId });
const selectedParcel = computed(() => {
  return ParcelsStore.dor.features.filter(feature => feature.id === selectedParcelId.value)[0];
});
const selectedDocs = computed(() => {
  if (selectedParcelId.value && DorStore.dorDocuments[selectedParcelId.value]) {
    console.log('selectedParcelId.value:', selectedParcelId.value);
    return DorStore.dorDocuments[selectedParcelId.value].data.features;
  } else {
    return null;
  }
});

const selectedCondos = computed(() => {
  if (selectedParcelId.value && DorStore.dorCondos[selectedParcelId.value]) {
    return DorStore.dorCondos[selectedParcelId.value].rows;
  } else {
    return null;
  }
});

const regmaps = computed(() => {
  return DorStore.regmaps.data.features;
});

onBeforeMount(() => {
  console.log('Deeds.vue onBeforeMount');
  if (ParcelsStore.dor.features.length > 0) {
    MainStore.selectedParcelId = ParcelsStore.dor.features[0].properties.OBJECTID;
  }
});

const statusKey = {
  1: 'Active',
  2: 'Inactive',
  3: 'Remainder',
}

const addRegmapLayer = (regmap) => {
  if (MapStore.selectedRegmap === regmap) {
    MapStore.selectedRegmap = null;
  } else {
    MapStore.selectedRegmap = regmap;
  }
}

const selectedRegmap = computed(() => {
  return MapStore.selectedRegmap;
});

const getHref = (DOCUMENT_ID) => {
  return `http://epay.phila-records.com/phillyepay/web/integration/document/InstrumentID=${DOCUMENT_ID}&Guest=true`;
}

</script>

<template>
  <div class="box">Deed information and document transactions for this address. The map faithfully reflects property boundaries as described in recorded deeds including multiple types of easements. The property boundaries displayed on the map are for reference only and should not be used in place of the recorded deeds or land surveys. Source: Department of Records</div>
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

  <h5 class="title is-5">Parcel Details</h5>
  <div class="vert-table" v-if="selectedParcel">
    <div class="columns">
      <div class="column is-4">Map Registry #</div>
      <div class="column is-8">{{ selectedParcel.properties.MAPREG }}</div>
    </div>
    <div class="columns">
      <div class="column is-4">Parcel Address</div>
      <div class="column is-8">{{ selectedParcel.properties.ADDR_SOURCE }}</div>
    </div>
    <div class="columns">
      <div class="column is-4">Status</div>
      <div class="column is-8">{{ statusKey[selectedParcel.properties.STATUS] }}</div>
    </div>
    <div class="columns">
      <div class="column is-4">Origination Date</div>
      <div class="column is-8">{{ date(selectedParcel.properties.ORIG_DATE) }}</div>
    </div>
    <div class="columns">
      <div class="column is-4">Inactive Date</div>
      <div class="column is-8">{{ date(selectedParcel.properties.INACTDATE) || 'None' }}</div>
    </div>
    <div class="columns">
      <div class="column is-4">Has Air Rights</div>
      <div class="column is-8">{{ selectedParcel.properties.SUFFIX ? 'Yes' : 'No' }}</div>
    </div>
    <div class="columns">
      <div class="column is-4">Is Condo</div>
      <div class="column is-8">{{ !selectedParcel.properties.CONDOFLAG ? 'No' : 'Yes' }}</div>
    </div>
    <div class="columns">
      <div class="column is-4">Perimeter</div>
      <div class="column is-8">{{ prettyNumber(integer(selectedParcel.properties.TURF_PERIMETER)) }} ft</div>
    </div>
    <div class="columns">
      <div class="column is-4">Area</div>
      <div class="column is-8">{{ prettyNumber(integer(selectedParcel.properties.TURF_AREA)) }} sq ft</div>
    </div>
  </div>

  <!-- Deeded Condominiums -->
  <div class="mt-6">
    <h5 class="subtitle is-5">Deeded Condominiums</h5>
    <table class="table is-fullwidth is-striped">
      <thead>
        <tr>
          <th>Condo Parcel</th>
          <th>Condo Name</th>
          <th>Unit #</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in selectedCondos" :key="item.cartodb_id">
          <td>{{ item.recmap }}-{{ item.parcel }}</td>
          <td>{{ item.condo_name }}</td>
          <td>Unit #{{ item.condounit }}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="box">You can access a view-only, watermarked unofficial copy of the deeds below at
     no cost by clicking on the deeds below. In order to view and print non-watermarked 
     copies of the deeds below, you must purchase a subscription to 
     <a target="_blank" href="https://epay.phila-records.com/phillyepay/web/">PhilaDox</a>.
     Please note that the following list shows documents recorded from December 1999 forward,
     and may not be a complete history of title for the parcel.
  </div>

  <!-- DOR Docs Table -->
  <div class="mt-6">
    <h5 class="subtitle is-5">Documents</h5>
    <table class="table is-fullwidth is-striped">
      <thead>
        <tr>
          <th>ID</th>
          <th>Date</th>
          <th>Type</th>
          <th>Grantor</th>
          <th>Grantee</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in selectedDocs">
          <td><a target='_blank' :href="getHref(item.attributes.DOCUMENT_ID)">{{item.attributes.DOCUMENT_ID}}<font-awesome-icon icon='fa-solid fa-external-link-alt'></font-awesome-icon></a></td>
          <td>{{ item.attributes.DISPLAY_DATE }}</td>
          <td>{{ item.attributes.DOCUMENT_TYPE }}</td>
          <td>{{ item.attributes.GRANTORS }}</td>
          <td>{{ item.attributes.GRANTEES }}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Registry Maps -->
  <div class="mt-6">
    <h5 class="subtitle is-5">Registry Maps</h5>
    <div class="columns is-multiline">
      <div
        v-for="regmap in regmaps"
        class="column is-2 add-borders has-text-centered regmap-div"
        :class="{ 'is-selected': regmap.properties.RECMAP === selectedRegmap }"
        @click="addRegmapLayer(regmap.properties.RECMAP)"
      >
        {{ regmap.properties.RECMAP }}
      </div>
    </div>
  </div>
    
</template>

<style scoped>

.add-borders {
  border: 1px solid #ccc;
  padding: .5em;
}

.is-selected {
  background-color: #b8b8b8
}

.regmap-div.is-selected {
  background-color: orange;
  color: white !important;
}

.add-borders.regmap-div {
  color: orange;
  border-color: orange;
  cursor: pointer;
}

.table .is-full-width {
  left: 0 !important;
  right: 0 !important;
}

</style>