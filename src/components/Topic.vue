<script setup>

import { storeToRefs } from 'pinia';
import { ref, reactive, computed } from 'vue';
import { useMainStore } from '@/stores/MainStore.js';

const MainStore = useMainStore();

const props = defineProps({
  topicName: String,
  topicIcon: String,
  loading: Boolean
});

// both of these methods seem to work to get the reactive current address
// const { currentAddress } = storeToRefs(MainStore);
// const currentAddress = computed(() => route.params.address);

import { useRoute, useRouter } from 'vue-router';
const route = useRoute();
const router = useRouter();

import useRouting from '@/composables/useRouting';
const { routeApp } = useRouting();

const open = computed(() => {
  return route.params.topic == props.topicName ? true : false;
});

const handleTopicClick = () => {
  if (props.topicName == route.params.topic) {
    MainStore.currentTopic = '';
  } else {
    MainStore.currentTopic = props.topicName;
  }
  console.log('topic clicked:', props.topicName);
  routeApp(router);
}

</script>

<template>
  <section>

    <div
      class="topic is-vcentered"
      @click="handleTopicClick"
    >
      <div class="topic-name">
        <div class="icon-holder"><font-awesome-icon :icon="props.topicIcon"/></div>
        <div class="name-holder">{{ topicName }}</div>
        <div class="mr-2 is-pulled-right" v-if="open && loading"><font-awesome-icon icon="fa-solid fa-spinner"/></div>
      </div>
    </div>
    <div
      v-if="open"
    >
      <div class="inside-topic">
        <slot></slot>
      </div>
    </div>

  </section>

</template>

<style scoped>

.topic-loading {
  
}

.icon-holder {
  display: inline-block;
  margin-left: .25em;
  margin-right: .5em;
  width: 1em;
}

.name-holder {
  display: inline-block;
}

.is-vcentered {
  display: flex;
  flex-wrap: wrap;
  align-content: center; /* used this for multiple child */
  align-items: center; /* if an only child */
}

.topic {
  font-size: .75em;
  /* height: 3.5em; */
  height: 60px;
  background-color: #f0f0f0;
  color: #0f4d90;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-top: .25em;
  padding: .25em;
  cursor: pointer;
}

.topic:hover {
  background-color: #fff;
  color: #000
}

.topic-name {
  width: 100%;
  font-size: 2em;
  /* display: flex; */
  /* flex-direction: row; */
}

.inside-topic {
  background-color: #ffffff;
  border: 1px solid #929292;
  font-size: 1em;
  padding: 1em;
  left: 0 !important;
  right: 0 !important;
}

</style>