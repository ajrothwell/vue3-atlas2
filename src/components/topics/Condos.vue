<script setup>
console.log('Condos.vue setup');
import { ref, computed, watch, onMounted } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router'
const route = useRoute();
const router = useRouter();
console.log('route:', route);

import { useGeocodeStore } from '@/stores/GeocodeStore';
const GeocodeStore = useGeocodeStore();
import { useCondosStore } from '@/stores/CondosStore';
const CondosStore = useCondosStore();

const totalSize = computed(() => {
  return CondosStore.condosData.total_size
})

const totalPages = computed(() => {
  return Math.ceil(totalSize.value / 10)
})

let currentPage = computed(() => parseInt(route.params.data));

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

let currentPages = computed(() => {
  let multiple = Math.floor(currentPage.value/3.0001);
  let bottom = multiple * 3;
  let pages = [];
  for (let i = 1; i < 4; i++) {
    if (bottom + i <= totalPages.value) {
      pages.push(bottom + i);
    }
  }
  return pages;
});

let startingCondo = computed(() => {
  let multiple = Math.floor(currentPage.value/10.0001);
  let currentPageReduced = currentPage.value - (multiple * 10);
  return (currentPageReduced - 1) * 10
});

const condos = computed(() => {
  return CondosStore.condosData.features.slice(startingCondo.value, startingCondo.value + 10);
});

const dataPagesFilled = computed(() => {
  return CondosStore.dataPagesFilled;
});

const currentDataPage = computed(() => {
  return Math.floor(currentPage.value/10.0001) + 1
})

let condosLoading = ref(false);

watch(
  () => currentDataPage.value,
  async (newPage) => {
    condosLoading.value = true;
    console.log('watch currentDataPage, newPage:', newPage);
    // if (!dataPagesFilled.value.includes(newPage)) {
    const address = GeocodeStore.aisData.features[0].properties.street_address;
    // const address = GeocodeStore.aisData.normalized;
    await CondosStore.fillCondoData(address, newPage);
    condosLoading.value = false;
    // }
  }
)

const getPreviousPage = () => {
  if (currentPage.value > 1) {
    return currentPage.value - 1;
  } else {
    return 1;
  }
}

const getNextPage = () => {
  if (currentPage.value < totalPages.value) {
    return currentPage.value + 1;
  } else {
    return totalPages.value;
  }
}

</script>

<template>
  <section>
    <div class="box">
      Condominium units at your search address, as recorded for property assessment purposes. Click one of the addresses below to see information for that unit. Use the back button to return to this list. Source: Office of Property Assessment
    </div>

    <h5 class="subtitle is-5">Condominiums</h5>

    <nav class="pagination is-small is-centered" role="navigation" aria-label="pagination">
      <router-link :to="{ name: 'address-topic-and-data', params: { data: getPreviousPage() }}" class="pagination-previous"><</router-link>
      <ul class="pagination-list">
        <li v-if="!currentPages.includes(1)"><span class="pagination-ellipsis">&hellip;</span></li>
        <li><router-link :to="{ name: 'address-topic-and-data', params: { data: currentPages[0] }}" class="pagination-link" :class="currentPage === currentPages[0] ? 'is-current' : ''" aria-label="Goto page 1">{{ currentPages[0] }}</router-link></li>
        <li v-if="currentPages[1]"><router-link :to="{ name: 'address-topic-and-data', params: { data: currentPages[1] }}" class="pagination-link" :class="currentPage === currentPages[1] ? 'is-current' : ''" aria-label="Goto page 45">{{ currentPages[1] }}</router-link></li>
        <li v-if="currentPages[2]"><router-link :to="{ name: 'address-topic-and-data', params: { data: currentPages[2] }}" class="pagination-link" :class="currentPage === currentPages[2] ? 'is-current' : ''" aria-label="Page 46" aria-current="page">{{ currentPages[2] }}</router-link></li>
        <li v-if="!currentPages.includes(totalPages)"><span class="pagination-ellipsis">&hellip;</span></li>
        <li v-if="!currentPages.includes(totalPages)"><router-link :to="{ name: 'address-topic-and-data', params: { data: totalPages }}" class="pagination-link" :class="currentPage === totalPages" :aria-label="`Goto page ${totalPages}`">{{totalPages}}</router-link></li>
      </ul>
      <router-link :to="{ name: 'address-topic-and-data', params: { data: getNextPage() }}" class="pagination-next">></router-link>
    </nav>

    <table class="table is-fullwidth is-striped">
      <thead>
        <tr>
          <th>Address</th>
          <th>OPA Account #</th>
        </tr>
      </thead>
      <div v-if="condosLoading">loading...</div>
      <tbody v-if="!condosLoading">
        <tr v-for="item in condos">
          <td><router-link :to="{ name: 'address-and-topic', params: { address: item.properties.opa_address, topic: 'Property' }}">{{ item.properties.opa_address }}</router-link></td>
          <td>{{ item.properties.opa_account_num }}</td>
        </tr>
      </tbody>
    </table>

  </section>
</template>

<style>

.pagination-previous {
  font-weight: bold !important;
}

.pagination-next {
  justify-content: flex-end !important;
  font-weight: bold !important;
}

@media screen and (max-width: 768px) {

  .pagination-link {
    margin: 0px !important;
    padding: 0px;
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

}

</style>