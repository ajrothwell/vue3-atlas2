<script setup>
console.log('Deeds.vue setup');
import { computed } from 'vue';

// import the AddressStore and DorParcels
import { useAddressStore } from '@/stores/AddressStore';
const AddressStore = useAddressStore();
import { useParcelsStore } from '@/stores/ParcelsStore';
const ParcelsStore = useParcelsStore();

console.log('ParcelsStore.dorParcelData.features', ParcelsStore.dorParcelData.features);

</script>

<template>
  <!-- <section> -->
    <div class="box">Deed information and document transactions for this address. The map faithfully reflects property boundaries as described in recorded deeds including multiple types of easements. The property boundaries displayed on the map are for reference only and should not be used in place of the recorded deeds or land surveys. Source: Department of Records</div>
    <div class="columns is-multiline">
      <div
        v-for="parcel in ParcelsStore.dorParcelData.features"
        class="column is-3 add-borders"
      >
        {{ parcel.properties.MAPREG }}
      </div>
    </div>
  <!-- </section> -->
</template>

<style scoped>

.add-borders {
  border: 1px solid #ccc;
  padding: .5em;
}

</style>