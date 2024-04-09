<script setup>
  console.log('Property.vue setup');

  // import the AddressStore and OpaStore
  import { useAddressStore } from '@/stores/AddressStore';
  const AddressStore = useAddressStore();
  import { useOpaStore } from '@/stores/OpaStore';
  const OpaStore = useOpaStore();

  
  import { inject, computed } from 'vue';
  // const dataSourcesLoadedArray = inject('dataSourcesLoadedArrayKey');

  // this may be able to be done in the AddressStore with a getter
  const owners = computed(() => {
    return AddressStore.addressData.features[0].properties.opa_owners.join(', ');
  });

</script>

<template>
  <section>
    <div class="box">
      Property assessment and sale information for this address. Source: Office of Property Assessments (OPA). OPA was formerly a part of the Bureau of Revision of Taxes (BRT) and some City records may still use that name.
    </div>

    <div class="vert-table">
      <div class="columns">
        <div class="column is-4">OPA Account #</div>
        <div class="column is-8">{{ AddressStore.addressData.features[0].properties.opa_account_num }}</div>
      </div>
      <div class="columns">
        <div class="column is-4">OPA Address</div>
        <div class="column is-8">{{ AddressStore.addressData.features[0].properties.opa_address }}</div>
      </div>
      <div class="columns">
        <div class="column is-4">Owners</div>
        <div class="column is-8">{{ owners }}</div>
      </div>
      <div class="columns">
        <div class="column is-4">Assessed Value</div>
        <div class="column is-8">${{ OpaStore.opaData.rows[0].market_value }}</div>
      </div>
      <div class="columns">
        <div class="column is-4">Sale Date</div>
        <div class="column is-8">{{ OpaStore.opaData.rows[0].sale_date }}</div>
      </div>
      <div class="columns">
        <div class="column is-4">Sale Price</div>
        <div class="column is-8">${{ OpaStore.opaData.rows[0].sale_price }}</div>
      </div>
    </div>
  </section>
</template>

<style scoped>

.vert-table {
  margin: 1em;
}

</style>