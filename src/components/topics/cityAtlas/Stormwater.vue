<script setup>

import { computed } from 'vue';

import { useStormwaterStore } from '@/stores/StormwaterStore.js'
const StormwaterStore = useStormwaterStore();

import VerticalTable from '@/components/VerticalTable.vue';

import useTransforms from '@/composables/useTransforms';
const { thousandsPlace } = useTransforms();

import CustomPaginationLabels from '@/components/pagination/CustomPaginationLabels.vue';
import useTables from '@/composables/useTables';
const { paginationOptions } = useTables();

const stormwaterData = computed(() => {
  let data;
  if (StormwaterStore.stormwaterData && Object.keys(StormwaterStore.stormwaterData).length) {
    data = StormwaterStore.stormwaterData
  }
  return data;
})

const accounts = computed(() => {
  let data;
  if (StormwaterStore.stormwaterData && Object.keys(StormwaterStore.stormwaterData).length) {
    data = StormwaterStore.stormwaterData.Accounts
  }
  return data;
})

const accountsLength = computed(() => {
  let value;
  if (StormwaterStore.stormwaterData && Object.keys(StormwaterStore.stormwaterData).length) {
    value = StormwaterStore.stormwaterData.Accounts.length;
  }
  return value;
})

const stormwaterCapData = computed(() => {
  let data;
  if (StormwaterStore.stormwaterCapData && Object.keys(StormwaterStore.stormwaterCapData).length) {
    data = StormwaterStore.stormwaterCapData
  }
  return data;
})

const hasNoData = computed(() => {
  return !Object.keys(StormwaterStore.stormwaterData) || !Object.keys(StormwaterStore.stormwaterData);
});

const vertTableData = computed(() => {
  if (import.meta.env.VITE_DEBUG) console.log('stormwaterData:', stormwaterData, 'stormwaterCapData:', stormwaterCapData);
  if (stormwaterData.value && stormwaterCapData.value) {
    return [
      {
        label: 'ParcelID',
        value: stormwaterData.value.Parcel.ParcelID,
      },
      {
        label: 'Address',
        value: stormwaterData.value.Parcel.Address,
      },
      {
        label: 'Building Type',
        value: stormwaterData.value.Parcel.BldgType,
      },
      {
        label: 'Gross Area',
        value: thousandsPlace(stormwaterData.value.Parcel.GrossArea) + ' sq ft',
      },
      {
        label: 'Impervious Area',
        value: thousandsPlace(stormwaterData.value.Parcel.ImpervArea) + ' sq ft',
      },
      {
        label: 'CAP Eligible',
        value: stormwaterCapData.value.CAP.Eligible,
      }
    ]
  } else {
    return []
  }
})

const accountsTableData = computed(() => {
  return {
    columns: [
    {
        label: 'Account #',
        field: 'AccountNumber',
      },
      {
        label: 'Customer',
        field: 'CustomerName',
      },
      {
        label: 'Status',
        field: 'AcctStatus'
      },
      {
        label: 'Service Type',
        field: 'ServiceTypeLabel',
      },
      {
        label: 'Size',
        field: 'MeterSize',
      },
      {
        label: 'Stormwater',
        field: 'StormwaterStatus'
      },
    ],
    rows: accounts.value || [],
  }
})

</script>

<template>
  <div
    id="Stormwater-description"
    class="box"
  >
    Stormwater billing accounts associated with your search address. 
    The property boundaries displayed on the map for reference only
    and may not be used in place of recorded deeds or land surveys. 
    Boundaries are generalized for ease of visualization. 
    Source: Philadelphia Water Department
  </div>

  <div v-if="StormwaterStore.loadingStormwaterData">
    <p>
      Loading stormwater data... <font-awesome-icon
        icon="fa-solid fa-spinner"
        spin
      />
    </p>
  </div>
  <div v-else-if="hasNoData">
    <p>There is no stormwater data for this address.</p>
  </div>
  <!-- v-if="!shouldShowCondosMessage" -->
  <vertical-table
    table-id="stormwaterTable"
    :data="vertTableData"
  />

  <div class="data-section">
    <h5 class="subtitle is-5 table-title">
      Accounts
      <font-awesome-icon
        v-if="StormwaterStore.loadingStormwaterData"
        icon="fa-solid fa-spinner"
        spin
      />
      <span v-else>({{ accountsLength }})</span>
    </h5>
    <div
      v-if="accountsTableData.rows"
      class="horizontal-table"
    >

      <vue-good-table
        id="accounts"
        :columns="accountsTableData.columns"
        :rows="accountsTableData.rows"
        :pagination-options="paginationOptions"
        style-class="table"
      >
        <template #emptystate>
          <div v-if="StormwaterStore.loadingStormwaterData">
            Loading accounts... <font-awesome-icon
              icon="fa-solid fa-spinner"
              spin
            />
          </div>
          <div v-else>
            No accounts found
          </div>
        </template>
        <template #pagination-top="props">
          <custom-pagination-labels
            :mode="'pages'"
            :total="props.total"
            :perPage="5"
            @page-changed="props.pageChanged"
            @per-page-changed="props.perPageChanged"
          >
          </custom-pagination-labels>
        </template>
      </vue-good-table>
    </div>
    <a
      target="_blank"
      :href="`https://stormwater.phila.gov/parcelviewer/parcel/${stormwaterData.Parcel.ParcelID}`"
    >See more at Stormwater Billing <font-awesome-icon icon="fa-solid fa-external-link-alt" /></a>

  </div>

</template>