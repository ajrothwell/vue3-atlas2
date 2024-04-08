<script setup>

import { ref, computed, defineProps, inject } from 'vue';

const dataLoaded = inject('dataLoadedKey');
console.log('dataLoaded:', dataLoaded.value);


import Topic from '../components/Topic.vue';
import Property from '@/views/topics/Property.vue';
import Deeds from '@/views/topics/Deeds.vue';
import LI from '@/views/topics/LI.vue';
import Zoning from '@/views/topics/Zoning.vue';
import Voting from '@/views/topics/Voting.vue';
import Nearby from '@/views/topics/Nearby.vue';

import { useRoute } from 'vue-router';
const route = useRoute();
console.log('TopicPanel setup, route.params:', route.params, 'route:', route);

const address = computed(() =>
  route.params.address
);

// defineProps({
//   dataLoaded: Boolean
// });

</script>

<template>
  <section>

    <div class="columns" v-if="!route.params.address">
      <div class="column is-12">
        <h3 class="subtitle is-3">Atlas is your front door to the City of Philadelphia.</h3>
        <p class="subtitle is-5">Here are some things you can do with Atlas:</p>
        <ul>
          <li>Find your polling place</li>
          <li>Get the history of permits, licenses, and inspections at any address</li>
          <li>Research real estate information including property values, zoning, and document archives</li>
          <li>Get easy access to a variety of hard-to-find City resources</li>
          <li>View recent activity around your address, such as crimes, 311 service requests, and more</li>
          <li>Explore historical imagery and maps</li>
        </ul>
        <p>To get started, click anywhere on the map, or type an address, intersection, property assessment account number, or Department of Records Map Registry number into the search box.</p>
      </div>
    </div>

    <div v-if="route.params.address">
      <div class="columns">
        <div class="column is-12">
          <h3 class="subtitle is-3">{{ address }}</h3>
        </div>
      </div>
      
      <topic :topic-name="'Property'" :loading="!dataLoaded.includes('Property')">
        <Property v-if="dataLoaded.includes('Property')"></Property>
      </topic>

      <topic :topic-name="'Deeds'" :loading="!dataLoaded.includes('Deeds')">
        <Deeds v-if="dataLoaded.includes('Deeds')"/>
      </topic>

      <topic :topic-name="'Licenses & Inspections'" :loading="!dataLoaded.includes('Licenses & Inspections')">
        <LI v-if="dataLoaded.includes('Licenses & Inspections')"/>
      </topic>

      <topic :topic-name="'Zoning'" :loading="!dataLoaded.includes('Zoning')">
        <Zoning v-if="dataLoaded.includes('Zoning')"/>
      </topic>

      <topic :topic-name="'Voting'" :loading="!dataLoaded.includes('Voting')">
        <Voting v-if="dataLoaded.includes('Voting')"/>
      </topic>

      <topic :topic-name="'Nearby Activity'" :loading="!dataLoaded.includes('Nearby Activity')">
        <Nearby v-if="dataLoaded.includes('Nearby')"/>
      </topic>

    </div>
    

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