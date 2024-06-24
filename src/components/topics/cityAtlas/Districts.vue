<script setup>

import { computed } from 'vue'

import { useGeocodeStore } from '@/stores/GeocodeStore';
const GeocodeStore = useGeocodeStore();

import VerticalTable from '@/components/VerticalTable.vue';

const geocode = computed(() => {
  if (GeocodeStore.aisData.features && GeocodeStore.aisData.features.length > 0) {
    return GeocodeStore.aisData.features[0].properties;
  } else {
    return null;
  }
})

const districtsVertTableData = computed(() => {
  if (GeocodeStore.aisData.features && GeocodeStore.aisData.features.length > 0) {
    return [
      {
        label: 'Planning',
        value: geocode.value.planning_district,
      },
      {
        label: 'L+I',
        value: geocode.value.li_district,
      },
      {
        label: 'Census Tract (2010)',
        value: geocode.value.census_tract_2010,
      },
      {
        label: 'Census Block Group (2010)',
        value: geocode.value.census_block_group_2010,
      },
      {
        label: 'Commercial Corridor',
        value: geocode.value.commercial_corridor || 'n/a',
        // value: function(state) {
        //   if(geocode.value.commercial_corridor.length > 0) {
        //     return geocode.value.commercial_corridor;
        //   } 
        //   return "n/a";
        // }(),
      },
      {
        label: 'Sanitation District',
        value: geocode.value.sanitation_district,
      },
      {
        label: 'Sanitation Convenience Center',
        value: geocode.value.sanitation_convenience_center,
      },
    ]
  } else {
    return []
  }
})

</script>

<template>
  
  <div
    id="Districts-description"
    class="box"
  >
    Districts related to police, L&I, city planning, streets, census, and commerce for this address. Sources: Department of Streets, Licenses and Inspections, Planning and Development, & Philadelphia Police Dept.
  </div>

  <div class="data-section">
    <h5 class="subtitle is-5 table-title">
      Districts
      <!-- <font-awesome-icon
        v-if="GeocodeStore.loadingStormwaterData"
        icon="fa-solid fa-spinner"
        spin
      /> -->
    </h5>
    <!-- <div v-if="StormwaterStore.loadingStormwaterData">
      <p>
        Loading districts data... <font-awesome-icon
          icon="fa-solid fa-spinner"
          spin
        />
      </p>
    </div> -->
    <!-- <div v-else-if="hasNoData">
      <p>There is no districts data for this address.</p>
    </div> -->
    <!-- v-if="!shouldShowCondosMessage" -->
    <vertical-table
      table-id="districtsTable"
      :data="districtsVertTableData"
    />
  </div>

</template>