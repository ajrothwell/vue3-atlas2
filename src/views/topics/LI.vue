<script setup>
console.log('LI.vue setup');
import { computed } from 'vue';

// import the AddressStore and LiStore
import { useAddressStore } from '@/stores/AddressStore';
const AddressStore = useAddressStore();
import { useLiStore } from '@/stores/LiStore';
const LiStore = useLiStore();

import useTransforms from '@/composables/useTransforms';
const { currency, date } = useTransforms();

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




</script>

<template>
  <section>
    <div class="box">
      Licenses, inspections, permits, property maintenance violations, and zoning permit documents at your search address. Source: Department of Licenses & Inspections
    </div>

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