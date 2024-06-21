<script setup>
if (import.meta.env.VITE_DEBUG == 'true') console.log('Property.vue setup');

import { computed } from 'vue';

// import the GeocodeStore and OpaStore
import { useGeocodeStore } from '@/stores/GeocodeStore';
const GeocodeStore = useGeocodeStore();
import { useOpaStore } from '@/stores/OpaStore';
const OpaStore = useOpaStore();
import { useCondosStore } from '@/stores/CondosStore';
import { onMounted } from 'vue';
const CondosStore = useCondosStore();

import VerticalTable from '@/components/VerticalTable.vue';

onMounted(() => {
  // const topic = document.getElementById('Property-topic');
  // topic.scrollIntoView();
  // const main = document.getElementById('main');
  // const mainScrollTop = main.scrollTop;
  // main.scrollTo(0, mainScrollTop - 80);
});

const vertTableData = computed(() => {
  if(GeocodeStore.aisData.features && GeocodeStore.aisData.features.length || OpaStore.rows && OpaStore.rows.length) {
    return [
      {
        label: 'OPA Account #',
        value: GeocodeStore.aisData.features[0].properties.opa_account_num,
      },
      {
        label: 'OPA Address',
        value: GeocodeStore.aisData.features[0].properties.opa_address,
      },
      {
        label: 'Owners',
        value: GeocodeStore.getOpaOwners,
      },
      {
        label: 'Assessed Value',
        value: OpaStore.getMarketValue,
      },
      {
        label: 'Sale Date',
        value: OpaStore.getSaleDate || 'none',
      },
      {
        label: 'Sale Price',
        value: OpaStore.getSalePrice,
      },
    ]
  } else {
    return []
  }
});

const shouldShowTable = computed(() => {
  if (OpaStore.opaData.rows) {
    if (!CondosStore.condosData.pages.page_1.features) {
      return OpaStore.opaData.rows.length > 0;
    } else {
      return OpaStore.opaData.rows.length > 0 && !CondosStore.condosData.pages.page_1.features.length > 0;
    }
  }
});

const opaAccountNumber = computed(() => {
  if (GeocodeStore.aisData.features) {
    return GeocodeStore.aisData.features[0].properties.opa_account_num;
  }
});

const shouldShowCondosMessage = computed(() => {
  if (OpaStore.opaData.rows) {
    if (!CondosStore.condosData.pages.page_1.features) {
      return false;
    } else if (CondosStore.condosData.pages.page_1.features.length == 1) {
      if (CondosStore.condosData.pages.page_1.features[0].match_type == 'has_base_no_suffix_unit_child') {
        return false;
      }
    } else {
      return CondosStore.condosData.pages.page_1.features.length > 1;
    }
  }
});

const hasNoData = computed(() => {
  return !OpaStore.opaData.rows || !OpaStore.opaData.rows.length;
});

</script>

<template>
  <section>
    <div
      v-if="!shouldShowCondosMessage"
      id="Property-description"
      class="box"
    >
      Property assessment and sale information for this address. Source: Office of Property Assessments (OPA). OPA was formerly a part of the Bureau of Revision of Taxes (BRT) and some City records may still use that name.
    </div>

    <!-- v-if="shouldShowTable" -->
    <vertical-table
      v-if="!shouldShowCondosMessage"
      table-id="opaTable"
      :data="vertTableData"
    />

    <div v-if="shouldShowCondosMessage">
      <h5 class="title is-5">
        There {{ CondosStore.condosData.total_size > 1 ? 'are':'is' }} {{ CondosStore.condosData.total_size }} condominium {{ CondosStore.condosData.total_size > 1 ? 'units':'unit' }} at this address.
      </h5>
      <p>You can use the Condominiums tab below to see information for an individual unit.</p>
    </div>
    <div v-else-if="OpaStore.loadingOpaData">
      <p>
        Loading property assessment data... <font-awesome-icon
          icon="fa-solid fa-spinner"
          spin
        />
      </p>
    </div>
    <div v-else-if="hasNoData">
      <p>There is no property assessment record for this address.</p>
    </div>
    <div>
      <a
        v-if="!shouldShowCondosMessage && !hasNoData"
        target="_blank"
        :href="`https://property.phila.gov/?p=${opaAccountNumber}`"
      >See more at Property Search <font-awesome-icon icon="fa-solid fa-external-link-alt" /></a>
    </div>
  </section>
</template>

<style scoped>

table {
  border-collapse: separate;
  border-spacing: 2px;
  width: 100%;
}

th {
  background-color: rgb(68, 68, 68);
  color: white;
  padding-left: 10px;
  padding-right: 10px;
  padding-top: 6px;
  padding-bottom: 6px;
  width: 30%;
}

td {
  padding-left: 10px;
  padding-right: 10px;
  padding-top: 6px;
  padding-bottom: 6px;
}

</style>