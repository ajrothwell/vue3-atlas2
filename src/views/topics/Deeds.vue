<script setup>

import { ref, computed, onMounted, onBeforeMount } from 'vue';
// import { storeToRefs } from 'pinia';

// import the AddressStore and DorParcels
import { useAddressStore } from '@/stores/AddressStore';
const AddressStore = useAddressStore();
import { useParcelsStore } from '@/stores/ParcelsStore';
const ParcelsStore = useParcelsStore();
import { useDorStore } from '@/stores/DorStore';
const DorStore = useDorStore();

const selected = ref('');
const selectedParcel = computed(() => {
  return ParcelsStore.dorParcelData.features.filter(feature => feature.id === selected.value)[0];
});
const selectedDocs = computed(() => {
  return DorStore.dorDocuments[selected.value].data.features;
});

onBeforeMount(() => {
  console.log('Deeds.vue onBeforeMount');
  selected.value = ParcelsStore.dorParcelData.features[0].properties.OBJECTID;
});

onMounted(() => {
  console.log('Deeds.vue onMounted');
});

const statusKey = {
  1: 'Active',
  2: 'Inactive',
  3: 'Remainder',
}
</script>

<template>
  <div class="box">Deed information and document transactions for this address. The map faithfully reflects property boundaries as described in recorded deeds including multiple types of easements. The property boundaries displayed on the map are for reference only and should not be used in place of the recorded deeds or land surveys. Source: Department of Records</div>
  <div class="columns is-multiline">
    <div
      v-for="parcel in ParcelsStore.dorParcelData.features"
      :key="parcel.properties.OBJECTID"
      @click="selected = parcel.properties.OBJECTID"
      class="column is-3 add-borders"
      :class="{ 'is-selected': parcel.properties.OBJECTID === selected }"
    >
      {{ parcel.properties.MAPREG }}
    </div>
  </div>

  <h5 class="title is-5">Parcel Details</h5>
  <div class="vert-table" v-if="ParcelsStore.dorParcelData.features.length">
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
      <div class="column is-8">{{ selectedParcel.properties.ORIG_DATE }}</div>
    </div>
    <div class="columns">
      <div class="column is-4">Inactive Date</div>
      <div class="column is-8">{{ selectedParcel.properties.INACTDATE || 'None' }}</div>
    </div>
    <div class="columns">
      <div class="column is-4">Has Air Rights</div>
      <div class="column is-8">{{ selectedParcel.properties.SUFFIX ? 'Yes' : 'No' }}</div>
    </div>
    <div class="columns">
      <div class="column is-4">Is Condo</div>
      <div class="column is-8">{{ !selectedParcel.properties.CONDOFLAG ? 'No' : 'Yes' }}</div>
    </div>
    <!--<div class="columns">
      <div class="column is-4">Perimeter</div>
      <div class="column is-8">{{ OpaStore.getSaleDate }}</div>
    </div>
    <div class="columns">
      <div class="column is-4">Area</div>
      <div class="column is-8">{{ OpaStore.getSalePrice }}</div>
    </div> -->
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
          <td>{{ item.attributes.DOCUMENT_ID }}</td>
          <td>{{ item.attributes.DISPLAY_DATE }}</td>
          <td>{{ item.attributes.DOCUMENT_TYPE }}</td>
          <td>{{ item.attributes.GRANTORS }}</td>
          <td>{{ item.attributes.GRANTEES }}</td>
        </tr>
      </tbody>
    </table>
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

</style>