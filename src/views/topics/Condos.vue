<script setup>
  console.log('Condos.vue setup');
  import { computed } from 'vue';
  import { RouterLink } from 'vue-router'

  import { useCondosStore } from '@/stores/CondosStore';
  const CondosStore = useCondosStore();

  const condos = computed(() => CondosStore.condosData);

</script>

<template>
  <section>
    <div class="box">
      Condominium units at your search address, as recorded for property assessment purposes. Click one of the addresses below to see information for that unit. Use the back button to return to this list. Source: Office of Property Assessment
    </div>

    <h5 class="subtitle is-5">Condominiums</h5>
    <table class="table is-fullwidth is-striped">
      <thead>
        <tr>
          <th>Address</th>
          <th>OPA Account #</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in condos">
          <td><router-link :to="{ name: 'address-and-topic', params: { address: item.properties.opa_address, topic: 'Property' }}">{{ item.properties.opa_address }}</router-link></td>
          <td>{{ item.properties.opa_account_num }}</td>
        </tr>
      </tbody>
    </table>
  </section>
</template>