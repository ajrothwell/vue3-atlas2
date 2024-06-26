<script setup>

import { computed } from 'vue';
import { useMainStore } from '@/stores/MainStore';
const MainStore = useMainStore();
import { useGeocodeStore } from '@/stores/GeocodeStore';
const GeocodeStore = useGeocodeStore();
import { useOpaStore } from '@/stores/OpaStore';
const OpaStore = useOpaStore();
import { useCondosStore } from '@/stores/CondosStore';
const CondosStore = useCondosStore();

import useTransforms from '@/composables/useTransforms';
const { titleCase } = useTransforms();

import VerticalTable from '@/components/VerticalTable.vue';

const atlasVertTableData = computed(() => {
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

const mailingAddress = computed(() => {
  const mailing = [];
  if (!OpaStore.opaData.rows || !OpaStore.opaData.rows.length) return null;
  const opa = OpaStore.opaData.rows[0];
  opa.mailing_care_of != null && opa.mailing_care_of.length > 0 ? mailing.push(titleCase(opa.mailing_care_of) +'<br>'):null;
  opa.mailing_address_1 != null && opa.mailing_address_1.length > 0 ? mailing.push(titleCase(opa.mailing_address_1) +'<br>'):null;
  opa.mailing_address_2 != null && opa.mailing_address_2.length > 0 ? mailing.push(titleCase(opa.mailing_address_2) +'<br>'):null;
  console.log(mailing);
  return opa.mailing_street != null && opa.mailing_street.length > 0 ?
    mailing.join('') + titleCase(opa.mailing_street) +
          '<br>'+ titleCase(opa.mailing_city_state).replace(/\w$/, c => c.toUpperCase()) +
          '<br>'+ opa.mailing_zip : titleCase(opa.location) +
          '<br> Philadelphia, PA '+ [ opa.zip_code.slice(0, 5), "-", opa.zip_code.slice(5) ].join('');

})

const cityatlasVertTable1Data = computed(() => {
  if(GeocodeStore.aisData.features && GeocodeStore.aisData.features.length || OpaStore.rows && OpaStore.rows.length) {
    return [
      {
        label: 'Owners',
        value: GeocodeStore.getOpaOwners,
      },
      {
        label: 'OPA Address',
        value: GeocodeStore.aisData.features[0].properties.opa_address,
      },
      {
        label: 'Mailing Address',
        value: mailingAddress.value,
      },
    ]
  } else {
    return []
  }
});

const cityatlasVertTable2Data = computed(() => {
  if(GeocodeStore.aisData.features && GeocodeStore.aisData.features.length || OpaStore.rows && OpaStore.rows.length) {
    return [
      {
        label: 'OPA Account #',
        value: GeocodeStore.aisData.features[0].properties.opa_account_num,
      },
      {
        label: 'Homestead Exemption',
        value: OpaStore.getHomesteadExemption,
      },
      {
        label: 'Description',
        value: OpaStore.getDescription,
      },
      {
        label: 'Condition',
        value: OpaStore.getCondition,
      },
      {
        label: 'Beginning Point',
        value: OpaStore.getBeginningPoint,
      },
      {
        label: 'Land Area',
        value: OpaStore.getLandArea,
      },
      {
        label: 'Improvement Area',
        value: OpaStore.getImprovementArea,
      }
    ]
  } else {
    return []
  }
});

const cityatlasVertTable3Data = computed(() => {
  if(GeocodeStore.aisData.features && GeocodeStore.aisData.features.length || OpaStore.rows && OpaStore.rows.length) {
    return [
      {
        label: 'Sale Price',
        value: OpaStore.getSalePrice,
      },
      {
        label: 'Sale Date',
        value: OpaStore.getSaleDate || 'none',
      },
    ]
  } else {
    return []
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

    <div v-if="!shouldShowCondosMessage && MainStore.appVersion == 'atlas'">
      <vertical-table
        table-id="opaTable"
        :data="atlasVertTableData"
      />
      <a
        v-if="!shouldShowCondosMessage && !hasNoData"
        target="_blank"
        :href="`https://property.phila.gov/?p=${opaAccountNumber}`"
      >See more at Property Search <font-awesome-icon icon="fa-solid fa-external-link-alt" /></a>
    </div>

    <div v-if="!shouldShowCondosMessage && MainStore.appVersion == 'cityatlas'">
      <vertical-table
        table-id="cityatlasTable1"
        :data="cityatlasVertTable1Data"
      />
      <br>
      <h5 class="subtitle is-5 table-title">
        Property Characteristics
      </h5>
      <vertical-table
        table-id="cityatlasTable2"
        :data="cityatlasVertTable2Data"
      />
      <br>
      <h5 class="subtitle is-5 table-title">
        Sales Details
      </h5>
      <vertical-table
        table-id="cityatlasTable3"
        :data="cityatlasVertTable3Data"
      />
      <br>
      <h5 class="subtitle is-5 table-title">
        Valuation History
      </h5>
      
      <br>

    </div>

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