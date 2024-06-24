<script setup>

import { computed } from 'vue';

import { useStormwaterStore } from '@/stores/StormwaterStore.js'
const StormwaterStore = useStormwaterStore();

import VerticalTable from '@/components/VerticalTable.vue';

import useTransforms from '@/composables/useTransforms';
const { thousandsPlace } = useTransforms();

const stormwaterData = computed(() => {
  let data;
  if (StormwaterStore.stormwaterData && Object.keys(StormwaterStore.stormwaterData).length) {
    data = StormwaterStore.stormwaterData
  }
  return data;
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

</template>