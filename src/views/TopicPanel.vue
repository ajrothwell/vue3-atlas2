<script setup>

import { computed, inject } from 'vue';

const addressDataLoadedFlag = inject('addressDataLoadedFlagKey');
const dataSourcesLoadedArray = inject('dataSourcesLoadedArrayKey');
console.log('addressDataLoadedFlag:', addressDataLoadedFlag, 'dataSourcesLoadedArray:', dataSourcesLoadedArray.value);

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

</script>

<template>
  <section>

    <!-- FRONT PAGE CONTENT -->
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

    <!-- IF AN ADDRESS TAKES A LONG TIME TO LOAD, DO NOT SHOW THE TOPICS -->
    <div v-if="route.params.address && !addressDataLoadedFlag">
      Loading...
    </div>

    <!-- IF AN ADDRESS IS LOADED, SHOW THE TOPICS  -->
    <div v-if="route.params.address && addressDataLoadedFlag">
      <div class="columns">
        <div class="column is-12">
          <h3 class="subtitle is-3">{{ address }}</h3>
        </div>
      </div>
      
      
      <topic :topic-name="'Property'" :loading="!dataSourcesLoadedArray.includes('Property')">
        <Property v-if="dataSourcesLoadedArray.includes('Property')"></Property>
      </topic>

      <topic :topic-name="'Deeds'" :loading="!dataSourcesLoadedArray.includes('Deeds')">
        <Deeds v-if="dataSourcesLoadedArray.includes('Deeds')"/>
      </topic>

      <topic :topic-name="'Licenses & Inspections'" :loading="!dataSourcesLoadedArray.includes('Licenses & Inspections')">
        <LI v-if="dataSourcesLoadedArray.includes('Licenses & Inspections')"/>
      </topic>

      <topic :topic-name="'Zoning'" :loading="!dataSourcesLoadedArray.includes('Zoning')">
        <Zoning v-if="dataSourcesLoadedArray.includes('Zoning')"/>
      </topic>

      <topic :topic-name="'Voting'" :loading="!dataSourcesLoadedArray.includes('Voting')">
        <Voting v-if="dataSourcesLoadedArray.includes('Voting')"/>
      </topic>

      <topic :topic-name="'Nearby Activity'" :loading="!dataSourcesLoadedArray.includes('Nearby Activity')">
        <Nearby v-if="dataSourcesLoadedArray.includes('Nearby')"/>
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