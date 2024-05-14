<script setup>

import { computed } from 'vue';
import { useMainStore } from '@/stores/MainStore.js'
const GeocodeStore = useGeocodeStore();
import { useGeocodeStore } from '@/stores/GeocodeStore.js'
const MainStore = useMainStore();
import { useCondosStore } from '@/stores/CondosStore.js'
const CondosStore = useCondosStore();

import Topic from '@/components/Topic.vue';
import Property from '@/components/topics/Property.vue';
import Condos from '@/components/topics/Condos.vue';
import Deeds from '@/components/topics/Deeds.vue';
import LI from '@/components/topics/LI.vue';
import Zoning from '@/components/topics/Zoning.vue';
import Voting from '@/components/topics/Voting.vue';
import NearbyActivity from '@/components/topics/nearbyActivity/NearbyActivity.vue';

import { useRoute } from 'vue-router';
const route = useRoute();

const address = computed(() => MainStore.currentAddress);
const dataSourcesLoadedArray = computed(() => MainStore.dataSourcesLoadedArray);

const zipCode = computed(() => {
  if (GeocodeStore.aisData && GeocodeStore.aisData.features) {
    return GeocodeStore.aisData.features[0].properties.zip_code + '-' + GeocodeStore.aisData.features[0].properties.zip_4;
  }
  return '';
});

</script>

<template>
  <section>
      
    <!-- FRONT PAGE CONTENT -->
    <div class="columns" v-if="route.name == 'home'">
      <div class="column is-12 topic-panel-content">
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

    <!-- ADDRESS NOT FOUND CONTENT -->
    <div class="columns" v-if="route.name == 'not-found'">
      <div class="column is-12 topic-panel-content">
        <p>We couldn't find that address. Are you sure everything was spelled correctly?</p>
        <p>Here are some examples of things you can search for:</p>
        <ul>
          <li>1234 Market St</li>
          <li>1001 Pine Street #201</li>
          <li>12th & Market</li>
          <li>12th & Market</li>
          <li>883309050 (an OPA number with no hyphens or other characters)</li>
        </ul>
      </div>
    </div>

    <!-- IF AN ADDRESS IS LOADED, SHOW THE TOPICS  -->
    <!-- <div v-if="route.params.address && aisDataLoadedFlag"> -->
    <div v-if="address">
      <div class="columns address-holder">
        <div>
          <h3 class="subtitle is-3"><font-awesome-icon :icon="['fas', 'map-marker-alt']" /><div class="address">{{ address }}</div></h3>
        </div>
        <div>PHILADELPHIA, PA {{ zipCode }}</div>
      </div>

      <div class="topics topic-panel-content">      
        <topic :topic-name="'Property'" :topic-icon="'fa-solid fa-home'" :loading="!dataSourcesLoadedArray.includes('Property')">
          <Property v-if="dataSourcesLoadedArray.includes('Property')"></Property>
        </topic>

        <topic v-show="CondosStore.condosData.features && CondosStore.condosData.features.length" :topic-name="'Condominiums'" :topic-icon="'fa-solid fa-building'" :loading="!dataSourcesLoadedArray.includes('Condominiums')">
          <Condos v-if="dataSourcesLoadedArray.includes('Condominiums')"></Condos>
        </topic>

        <topic :topic-name="'Deeds'" :topic-icon="'fa-solid fa-book'" :loading="!dataSourcesLoadedArray.includes('Deeds')">
          <Deeds v-if="dataSourcesLoadedArray.includes('Deeds')"/>
        </topic>

        <topic :topic-name="'Licenses & Inspections'" :topic-icon="'fa-solid fa-wrench'" :loading="!dataSourcesLoadedArray.includes('Licenses & Inspections')">
          <LI v-if="dataSourcesLoadedArray.includes('Licenses & Inspections')"/>
        </topic>

        <topic :topic-name="'Zoning'" :topic-icon="'fa-solid fa-university'" :loading="!dataSourcesLoadedArray.includes('Zoning')">
          <Zoning v-if="dataSourcesLoadedArray.includes('Zoning')"/>
        </topic>

        <topic :topic-name="'Voting'" :topic-icon="'fa-solid fa-gavel'" :loading="!dataSourcesLoadedArray.includes('Voting')">
          <Voting v-if="dataSourcesLoadedArray.includes('Voting')"/>
        </topic>

        <topic :topic-name="'Nearby Activity'" :topic-icon="'fa-solid fa-map-marker-alt'" :loading="!dataSourcesLoadedArray.includes('Nearby Activity')">
          <KeepAlive>
            <NearbyActivity v-if="dataSourcesLoadedArray.includes('Nearby Activity')"/>
          </KeepAlive>
        </topic>
      </div>

    </div>

  </section>

</template>

<style scoped>

.topics {
  height: 77vh;
  overflow-y: scroll;
}

.topic {
  height: 2em;
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  font-size: 2em;
}

.address-holder {
  color: #0f4d90 !important;
  background-color: #DAEDFe;
  display: flex;
  flex-direction: column;
  padding-left: 2.25em;
  padding-bottom: .5em;
  padding-top: .5em;

  h3 {
    color: #0f4d90 !important;
  }
}

.address {
  display: inline-block;
  padding-left: .25em;
}

.topic-panel-content {
  padding-left: 1.25em;
  padding-right: 1em;
}



</style>