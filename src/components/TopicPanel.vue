<script setup>

import { computed } from 'vue';
import { useMainStore } from '@/stores/MainStore.js'
const GeocodeStore = useGeocodeStore();
import { useGeocodeStore } from '@/stores/GeocodeStore.js'
const MainStore = useMainStore();
import { useCondosStore } from '@/stores/CondosStore.js'
const CondosStore = useCondosStore();

import FullScreenTopicsToggleTab from '@/components/FullScreenTopicsToggleTab.vue';
import AddressSearchControl from '@/components/map/AddressSearchControl.vue';

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
  <full-screen-topics-toggle-tab
    v-show="!MainStore.fullScreenMapEnabled"
  />
  <!-- v-once -->
      
  <!-- FRONT PAGE CONTENT -->
  <div
    v-if="route.name == 'home'"
    id="topic-panel-set-content"
  >
    <div v-if="MainStore.fullScreenTopicsEnabled">
      <address-search-control :input-id="'address-bar-search-input'" />
    </div>
    <h1 class="subtitle is-3">
      Atlas is your front door to the City of Philadelphia.
    </h1>
    <p class="subtitle is-4">
      Here are some things you can do with Atlas:
    </p>
    <ul class="bullet-list">
      <li>Find your polling place</li>
      <li>Get the history of permits, licenses, and inspections at any address</li>
      <li>Research real estate information including property values, zoning, and document archives</li>
      <li>Get easy access to a variety of hard-to-find City resources</li>
      <li>View recent activity around your address, such as crimes, 311 service requests, and more</li>
      <li>Explore historical imagery and maps</li>
    </ul>
    <br>
    <p>To get started, click anywhere on the map, or type an address, intersection, property assessment account number, or Department of Records Map Registry number into the search box.</p>
  </div>

  <!-- ADDRESS NOT FOUND CONTENT -->
  <div
    v-if="route.name == 'not-found'"
    id="topic-panel-set-content"
  >
    <div v-if="MainStore.fullScreenTopicsEnabled">
      <address-search-control :input-id="'address-bar-search-input'" />
    </div>
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

  <!-- IF AN ADDRESS IS LOADED, SHOW THE TOPICS  -->
  <div
    v-if="route.name !== 'home' && route.name !== 'not-found' && address"
    class="address-holder"
  >
    <div>
      <h1 class="address-and-marker subtitle is-3">
        <font-awesome-icon :icon="['fas', 'map-marker-alt']" /><div class="address">
          {{ address }}
        </div>
      </h1>
    </div>
    <div>PHILADELPHIA, PA {{ zipCode }}</div>

    <div v-if="MainStore.fullScreenTopicsEnabled">
      <address-search-control :input-id="'address-bar-search-input'" />
    </div>
  </div>

  <div
    v-if="route.name !== 'home' && route.name !== 'not-found' && address"
    id="topic-panel-content"
    class="topics"
  >
    <topic
      :topic-name="'Property'"
      :topic-icon="'fa-solid fa-home'"
      :loading="!dataSourcesLoadedArray.includes('Property')"
    >
      <Property />
    </topic>

    <topic
      v-show="CondosStore.condosData.pages.page_1.features && CondosStore.condosData.pages.page_1.features.length"
      :topic-name="'Condominiums'"
      :topic-icon="'fa-solid fa-building'"
      :loading="!dataSourcesLoadedArray.includes('Condominiums')"
    >
      <Condos v-if="dataSourcesLoadedArray.includes('Condominiums')" />
    </topic>

    <topic
      :topic-name="'Deeds'"
      :topic-icon="'fa-solid fa-book'"
      :loading="!dataSourcesLoadedArray.includes('Deeds')"
    >
      <Deeds />
    </topic>

    <topic
      :topic-name="'Licenses & Inspections'"
      :topic-icon="'fa-solid fa-wrench'"
      :loading="!dataSourcesLoadedArray.includes('Licenses & Inspections')"
    >
      <LI />
    </topic>

    <topic
      :topic-name="'Zoning'"
      :topic-icon="'fa-solid fa-university'"
      :loading="!dataSourcesLoadedArray.includes('Zoning')"
    >
      <Zoning />
    </topic>

    <topic
      :topic-name="'Voting'"
      :topic-icon="'fa-solid fa-gavel'"
      :loading="!dataSourcesLoadedArray.includes('Voting')"
    >
      <Voting />
    </topic>

    <topic
      :topic-name="'Nearby Activity'"
      :topic-icon="'fa-solid fa-map-marker-alt'"
      :loading="!dataSourcesLoadedArray.includes('Nearby Activity')"
    >
      <KeepAlive>
        <NearbyActivity />
      </KeepAlive>
    </topic>
  </div>
</template>

<style>

.address-and-marker {
  margin-top: .5rem !important;
  margin-bottom: 0px !important;
}

</style>