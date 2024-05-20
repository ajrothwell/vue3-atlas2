<script setup>
console.log('Property.vue setup');

// import the GeocodeStore and OpaStore
import { useGeocodeStore } from '@/stores/GeocodeStore';
const GeocodeStore = useGeocodeStore();
import { useOpaStore } from '@/stores/OpaStore';
const OpaStore = useOpaStore();
import { useCondosStore } from '@/stores/CondosStore';
import { onMounted } from 'vue';
const CondosStore = useCondosStore();

onMounted(() => {
  const topic = document.getElementById('Property-topic');
  const topicPanel = document.getElementById('topic-panel-content');
  topic.scrollIntoView();
  const main = document.getElementById('main');
  const mainScrollTop = main.scrollTop;
  main.scrollTo(0, mainScrollTop - 80);
});


</script>

<template>
  <section>
    <div id="Property-description" class="box" v-if="OpaStore.opaData.rows.length">
      Property assessment and sale information for this address. Source: Office of Property Assessments (OPA). OPA was formerly a part of the Bureau of Revision of Taxes (BRT) and some City records may still use that name.
    </div>

    <div class="vert-table" v-if="OpaStore.opaData.rows.length">
      <div class="columns">
        <div class="column is-4">OPA Account #</div>
        <div class="column is-8">{{ GeocodeStore.aisData.features[0].properties.opa_account_num }}</div>
      </div>
      <div class="columns">
        <div class="column is-4">OPA Address</div>
        <div class="column is-8">{{ GeocodeStore.aisData.features[0].properties.opa_address }}</div>
      </div>
      <div class="columns">
        <div class="column is-4">Owners</div>
        <div class="column is-8">{{ GeocodeStore.getOpaOwners }}</div>
      </div>
      <div class="columns">
        <div class="column is-4">Assessed Value</div>
        <div class="column is-8">{{ OpaStore.getMarketValue }}</div>
        <!-- <div class="column is-8">${{ OpaStore.opaData.rows[0].market_value }}</div> -->
      </div>
      <div class="columns">
        <div class="column is-4">Sale Date</div>
        <div class="column is-8">{{ OpaStore.getSaleDate || 'none' }}</div>
        <!-- <div class="column is-8">{{ OpaStore.opaData.rows[0].sale_date }}</div> -->
      </div>
      <div class="columns">
        <div class="column is-4">Sale Price</div>
        <div class="column is-8">{{ OpaStore.getSalePrice }}</div>
      </div>
    </div>

    <div v-if="!OpaStore.opaData.rows.length && CondosStore.condosData.features.length">
      <h5 class="title is-5">There are {{ CondosStore.condosData.total_size }} condominium units at this address.</h5>
      <p>You can use the Condominiums tab below to see information for an individual unit.</p>
    </div>
    <div v-else-if="!OpaStore.opaData.rows.length">
      <p>There is no property assessment record for this address.</p>
    </div>
    <div>
      <a target='_blank' :href="`https://property.phila.gov/?p=${GeocodeStore.aisData.features[0].properties.opa_account_num}`">See more at Property Search <font-awesome-icon icon='fa-solid fa-external-link-alt'></font-awesome-icon></a>
    </div>

  </section>
</template>

<style scoped>

.vert-table {
  margin: 1em;
}

</style>