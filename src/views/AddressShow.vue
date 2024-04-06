<script setup>

import { ref, computed } from 'vue';

import Topic from '../components/Topic.vue';

import { useRoute } from 'vue-router';
const route = useRoute();
console.log('AddressShow setup, route.params:', route.params, 'route:', route);

const address = computed(() =>
  route.params.address
);

</script>

<template>
  <section>

    <div class="columns">
      <div class="column is-12">
        {{ address }}
      </div>
    </div>

    <topic :topic-name="'Property'"></topic>
    <topic :topic-name="'Deeds'"></topic>
    <topic :topic-name="'License & Inspections'"></topic>
    

  </section>

</template>

<style scoped>

.topic {
  height: 2em;
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  font-size: 2em;
}



</style>