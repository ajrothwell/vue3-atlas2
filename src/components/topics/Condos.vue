<script setup>
// console.log('Condos.vue setup');
import { ref, computed, watch, onMounted } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router'
const route = useRoute();
// const router = useRouter();

// import { useGeocodeStore } from '@/stores/GeocodeStore';
// const GeocodeStore = useGeocodeStore();
import { useCondosStore } from '@/stores/CondosStore';
const CondosStore = useCondosStore();

import CustomPaginationCondos from '@/components/pagination/CustomPaginationCondos.vue';

const totalSize = computed(() => CondosStore.condosData.total_size);

// const totalPages = computed(() => Math.ceil(totalSize.value / 10));

const paginationOptions = ref({
  enabled: true,
  mode: 'pages',
  perPage: 10,
  position: 'top',
  dropdownAllowAll: false,
  nextLabel: '',
  prevLabel: '',
  rowsPerPageLabel: '# rows',
  ofLabel: 'of',
  pageLabel: 'page', // for 'pages' mode
  allLabel: 'All',
  // infoFn: (params) => {
  //   return `${params.firstRecordOnPage} - ${params.lastRecordOnPage} of ${totalSize.value}`
  // }
});

// let currentPage = computed(() => parseInt(route.params.data));

watch (
  () => route.params.data,
  (newPage) => {
    CondosStore.lastPageUsed = parseInt(newPage);
  }
)

onMounted( () => {
  CondosStore.lastPageUsed = parseInt(route.params.data);
  console.log('Condos.vue onMounted, CondosStore.lastPageUsed:', CondosStore.lastPageUsed);
});

// let currentPages = computed(() => {
//   let multiple = Math.floor(currentPage.value/3.0001);
//   let bottom = multiple * 3;
//   let pages = [];
//   for (let i = 1; i < 4; i++) {
//     if (bottom + i <= totalPages.value) {
//       pages.push(bottom + i);
//     }
//   }
//   return pages;
// });

// let startingCondo = computed(() => {
//   let multiple = Math.floor(currentPage.value/10.0001);
//   let currentPageReduced = currentPage.value - (multiple * 10);
//   return (currentPageReduced - 1) * 10
// });

const condos = computed(() => {
  // if (condosLoading.value) {
  if (CondosStore.loadingCondosData) {
    return [];
  }
  let features = [];
  console.log('Object.keys(CondosStore.condosData.pages).sort():', Object.keys(CondosStore.condosData.pages).sort());
  for (let dataPage of Object.keys(CondosStore.condosData.pages).sort()) {
    features = features.concat(CondosStore.condosData.pages[dataPage].features);
  }
  return features;
});

// const currentDataPage = computed(() => {
//   return Math.floor(currentPage.value/10.0001) + 1
// })

// let condosLoading = ref(CondosStore.loadingCondosData);

// watch(
//   () => currentDataPage.value,
//   async (newPage) => {
//     condosLoading.value = true;
//     console.log('watch currentDataPage, newPage:', newPage);
//     const address = GeocodeStore.aisData.features[0].properties.street_address;
//     await CondosStore.fillCondoData(address, newPage);
//     condosLoading.value = false;
//   }
// )

// const getPreviousPage = () => {
//   if (currentPage.value > 1) {
//     return currentPage.value - 1;
//   } else {
//     return 1;
//   }
// }

// const getNextPage = () => {
//   if (currentPage.value < totalPages.value) {
//     return currentPage.value + 1;
//   } else {
//     return totalPages.value;
//   }
// }

const condosTableData = computed(() => {
  return {
    columns: [
      {
        label: 'Address',
        field: 'properties.link',
        html: true,
      },
      {
        label: 'OPA Account #',
        field: 'properties.opa_account_num',
      },
    ],
    rows: condos.value || [],
  }
});

</script>

<template>
  <section>
    <div
      id="Condominiums-description"
      class="box"
    >
      Condominium units at your search address, as recorded for property assessment purposes. Click one of the addresses below to see information for that unit. Use the back button to return to this list. Source: Office of Property Assessment
    </div>

    <h5 class="subtitle is-5">
      Condominiums ({{ totalSize }})
    </h5>

    <div class="horizontal-table">
      <vue-good-table
        id="condos"
        :columns="condosTableData.columns"
        :rows="condosTableData.rows"
        :total-rows="totalSize"
        style-class="table"
        :pagination-options="paginationOptions"
        :sort-options="{ enabled: false }"
      >
        <template #table-row="props">
          <span v-if="props.column.label == 'Address'">
            <router-link :to="{ name: 'address-and-topic', params: { address: props.row.properties.opa_address, topic: 'Property'} }">{{ props.row.properties.opa_address }}</router-link>
          </span>
        </template>
        <template #emptystate>
          <div v-if="CondosStore.loadingCondosData">
            Loading more condos... <font-awesome-icon
              icon="fa-solid fa-spinner"
              spin
            />
          </div>
          <div v-else>
            No Condos found
          </div>
        </template>
        <template #pagination-top="props">
          <custom-pagination-condos
            :mode="'pages'"
            :total="props.total"
            :page-changed="props.pageChanged"
            :per-page-changed="props.perPageChanged"
          />
        </template>
      </vue-good-table>
    </div>
  </section>
</template>

<style scoped>

.pagination-previous {
  font-weight: bold !important;
}

.pagination-next {
  justify-content: flex-end !important;
  font-weight: bold !important;
}

@media 
only screen and (max-width: 760px),
(min-device-width: 768px) and (max-device-width: 1024px)  {
  
  .pagination-link {
    margin: 0px !important;
    /* padding: 0px; */
    min-width: 16px !important;
  }

  .pagination-ellipsis {
    margin: 0px !important;
    min-width: 16px !important;
  }

  .pagination-previous {
    margin: 0px !important;
    min-width: 16px !important;
    font-weight: bold !important;
  }

  .pagination-next {
    margin: 0px !important;
    min-width: 16px !important;
    justify-content: flex-end !important;
    font-weight: bold !important;
  }

  .horizontal-table {
    /* td {
      padding-left: 125px !important;
    } */
    
    /* td:before {
      width: 90px !important; 
    } */
    td:nth-of-type(2) { min-height: 60px; }
    /* Label the data */
    td:nth-of-type(1):before { content: "Address"; }
    td:nth-of-type(2):before { content: "OPA Account #"; }
  }

}

</style>