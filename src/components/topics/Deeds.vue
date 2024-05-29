<script setup>

import { ref, computed, onBeforeMount, onMounted } from 'vue';
// import { storeToRefs } from 'pinia';

import useTransforms from '@/composables/useTransforms';
const { date, integer, prettyNumber, timeReverseFn } = useTransforms();

// import the GeocodeStore and DorParcels
import { useGeocodeStore } from '@/stores/GeocodeStore';
const GeocodeStore = useGeocodeStore();
import { useParcelsStore } from '@/stores/ParcelsStore';
const ParcelsStore = useParcelsStore();
import { useDorStore } from '@/stores/DorStore';
const DorStore = useDorStore();
import { useMainStore } from '@/stores/MainStore';
const MainStore = useMainStore();
import { useMapStore } from '@/stores/MapStore';
const MapStore = useMapStore();
import CollectionSummary from '@/components/CollectionSummary.vue';
import VerticalTable from '@/components/VerticalTable.vue';

let selectedParcelId = computed(() => { return MainStore.selectedParcelId });
const selectedParcel = computed(() => {
  if (ParcelsStore.dor.features && ParcelsStore.dor.features.length > 0) {
    return ParcelsStore.dor.features.filter(feature => feature.id === selectedParcelId.value)[0];
  }
});
const selectedDocs = computed(() => {
  if (selectedParcelId.value && DorStore.dorDocuments[selectedParcelId.value]) {
    // console.log('selectedParcelId.value:', selectedParcelId.value);
    const data = DorStore.dorDocuments[selectedParcelId.value].data.features;
    return data.sort((a, b) => new Date(b.attributes.DISPLAY_DATE) - new Date(a.attributes.DISPLAY_DATE));
  } else {
    return null;
  }
});

const selectedCondos = computed(() => {
  if (selectedParcelId.value && DorStore.dorCondos[selectedParcelId.value]) {
    return DorStore.dorCondos[selectedParcelId.value].rows;
  } else {
    return null;
  }
});

const regmaps = computed(() => {
  if (!DorStore.regmaps.data) {
    return [];
  }
  return DorStore.regmaps.data.features;
});

onBeforeMount(() => {
  console.log('Deeds.vue onBeforeMount');
  if (ParcelsStore.dor.features && ParcelsStore.dor.features.length > 0) {
    MainStore.selectedParcelId = ParcelsStore.dor.features[0].properties.OBJECTID;
  }
});

const statusKey = {
  1: 'Active',
  2: 'Inactive',
  3: 'Remainder',
}

const addRegmapLayer = (regmap) => {
  if (MapStore.selectedRegmap === regmap) {
    MapStore.selectedRegmap = null;
  } else {
    MapStore.selectedRegmap = regmap;
  }
}

const selectedRegmap = computed(() => {
  return MapStore.selectedRegmap;
});

const getHref = (DOCUMENT_ID) => {
  return `http://epay.phila-records.com/phillyepay/web/integration/document/InstrumentID=${DOCUMENT_ID}&Guest=true`;
}

const deededCondosExist = computed(() => {
  let flag = false;
  if (DorStore.dorCondos[selectedParcelId.value] && DorStore.dorCondos[selectedParcelId.value].rows && DorStore.dorCondos[selectedParcelId.value].rows.length > 0) {
    flag = true;
  }
  return flag;
});

const getAddress = (address) => {
  console.log('address:', address, address.length);
  if (address && address.length > 2) {
    return address;
  } else {
    return 'Parcel has no address';
  }
}

onMounted(() => {
  // const topic = document.getElementById('Deeds-topic');
  // topic.scrollIntoView();
  // const main = document.getElementById('main');
  // const mainScrollTop = main.scrollTop;
  // main.scrollTo(0, mainScrollTop - 80);
});

const parcelData = computed(() => [
  {
    label: 'Map Registry #',
    value: selectedParcel.value ? selectedParcel.value.properties.MAPREG : '',
  },
  {
    label: 'Parcel Address',
    value: selectedParcel.value ? getAddress(selectedParcel.value.properties.ADDR_SOURCE) : '',
  },
  {
    label: 'Status',
    value: selectedParcel.value ? statusKey[selectedParcel.value.properties.STATUS] : '',
  },
  {
    label: 'Origination Date',
    value: selectedParcel.value ? date(selectedParcel.value.properties.ORIG_DATE) : '',
  },
  {
    label: 'Inactive Date',
    value: selectedParcel.value ? date(selectedParcel.value.properties.INACTDATE) : '',
  },
  {
    label: 'Has Air Rights',
    value: selectedParcel.value ? selectedParcel.value.properties.SUFFIX ? 'Yes' : 'No' : '',
  },
  {
    label: 'Is Condo',
    value: selectedParcel.value ? !selectedParcel.value.properties.CONDOFLAG ? 'No' : 'Yes' : '',
  },
  {
    label: 'Perimeter',
    value: selectedParcel.value ? prettyNumber(integer(selectedParcel.value.properties.TURF_PERIMETER)) + ' ft' : '',
  },
  {
    label: 'Area',
    value: selectedParcel.value ? prettyNumber(integer(selectedParcel.value.properties.TURF_AREA)) + ' sq ft' : '',
  },
]);

const tableData = ref({
  columns: [
    {
      label: 'Condo Parcel',
      field: 'condo_parcel',
    },
    {
      label: 'Condo Name',
      field: 'condo_name',
    },
    {
      label: 'Unit #',
      field: 'unit_number',
    },
  ],
  rows: selectedCondos,
  paginationOptions: {
    enabled: true,
    mode: 'pages',
    perPage: 5,
    position: 'top',
    // perPageDropdown: [3, 7, 9],
    dropdownAllowAll: false,
    // setCurrentPage: 2,
    nextLabel: '',
    prevLabel: '',
    rowsPerPageLabel: '# rows',
    ofLabel: 'of',
    pageLabel: 'page', // for 'pages' mode
    allLabel: 'All',
    // infoFn: (params) => `my own page ${params.firstRecordOnPage}`, 
  }
});

</script>

<template>
  <div id="Deeds-description" class="box">Deed information and document transactions for this address. The map faithfully reflects property boundaries as described in recorded deeds including multiple types of easements. The property boundaries displayed on the map are for reference only and should not be used in place of the recorded deeds or land surveys. Source: Department of Records</div>
  <collection-summary
    :value="'STATUS'"
    :descriptor="'parcel'"
  >
  </collection-summary>
  <div v-if="selectedParcel" id="parcel-div" class="section add-borders p-3">
    <div class="columns is-multiline is-mobile">
      <div
        v-for="parcel in ParcelsStore.dor.features"
        :key="parcel.properties.OBJECTID"
        @click="MainStore.selectedParcelId = parcel.properties.OBJECTID"
        class="column is-3 add-borders has-text-centered p-2"
        :class="{ 'is-selected': parcel.properties.OBJECTID === selectedParcelId }"
      >
        {{ parcel.properties.MAPREG }}
      </div>
    </div>

    <h5 class="title is-5">Parcel Details</h5>
    <vertical-table v-if="selectedParcel" tableId="dorTable" :data="parcelData"></vertical-table>

    <!-- Deeded Condominiums -->
    <!-- <div v-if="deededCondosExist" class="mt-6 mb-4">
      <h5 class="subtitle is-5">Deeded Condominiums</h5>
      <table class="table is-fullwidth is-striped">
        <thead>
          <tr>
            <th>Condo Parcel</th>
            <th>Condo Name</th>
            <th>Unit #</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in selectedCondos" :key="item.cartodb_id">
            <td>{{ item.recmap }}-{{ item.parcel }}</td>
            <td>{{ item.condo_name }}</td>
            <td>Unit #{{ item.condounit }}</td>
          </tr>
        </tbody>
      </table>
    </div> -->

    <div v-if="deededCondosExist" class="mt-6 mb-4">
      <h5 class="subtitle is-5">Deeded Condominiums</h5>
      <vue-good-table
        :columns="tableData.columns"
        :rows="tableData.rows"
        :pagination-options="tableData.paginationOptions"
        style-class="table"
      />
    </div>

    <div class="box mt-6 mb-0">You can access a view-only, watermarked unofficial copy of the deeds below at
      no cost by clicking on the deeds below. In order to view and print non-watermarked 
      copies of the deeds below, you must purchase a subscription to 
      <a target="_blank" href="https://epay.phila-records.com/phillyepay/web/">PhilaDox</a>.
      Please note that the following list shows documents recorded from December 1999 forward,
      and may not be a complete history of title for the parcel.
    </div>

    <!-- DOR Docs Table -->
    <div class="mt-4">
      <h5 class="subtitle is-5">Documents</h5>
      <div class="horizontal-table">
        <table id="dor-docs" class="table is-fullwidth is-striped">
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
              <td><a target='_blank' :href="getHref(item.attributes.DOCUMENT_ID)">{{item.attributes.DOCUMENT_ID}}<font-awesome-icon icon='fa-solid fa-external-link-alt'></font-awesome-icon></a></td>
              <td>{{ date(item.attributes.DISPLAY_DATE) }}</td>
              <td>{{ item.attributes.DOCUMENT_TYPE }}</td>
              <td>{{ item.attributes.GRANTORS }}</td>
              <td>{{ item.attributes.GRANTEES }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class='mobile-no-data' v-if="!selectedDocs.length">No documents found</div>
  </div>

  <div class="box">Use the buttons below to view images of hard-copy deed maps, some of which have handwritten information that may be useful for historical deed research.</div>

  <!-- Registry Maps -->
  <div class="mb-4">
    <h5 class="subtitle is-5">Registry Maps</h5>
    <div class="columns is-multiline is-mobile">
      <div
        v-for="regmap in regmaps"
        class="column is-2 add-borders has-text-centered regmap-div p-1 mr-1 ml-1"
        :class="{ 'is-selected': regmap.properties.RECMAP === selectedRegmap }"
        @click="addRegmapLayer(regmap.properties.RECMAP)"
      >
        {{ regmap.properties.RECMAP }}
      </div>
    </div>
  </div>
    
</template>

<style scoped>

.add-borders {
  border: 1px solid #ccc;
}

.is-selected {
  background-color: #b8b8b8
}

#parcel-div {
  margin-bottom: 1.5rem;
}

.regmap-div.is-selected {
  background-color: orange;
  color: white !important;
}

.add-borders.regmap-div {
  color: orange;
  border-color: orange;
  cursor: pointer;
}

.table .is-full-width {
  left: 0 !important;
  right: 0 !important;
}

@media 
only screen and (max-width: 760px),
(min-device-width: 768px) and (max-device-width: 1024px)  {
	/*Label the data*/

  #dor-docs {
    td:nth-of-type(1):before { content: "ID"; }
    td:nth-of-type(2):before { content: "Date"; }
    td:nth-of-type(3):before { content: "Type"; }
    td:nth-of-type(4):before { content: "Grantor"; }
    td:nth-of-type(5):before { content: "Grantee"; }
  }



}

</style>