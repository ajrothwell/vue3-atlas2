<script setup>

import { storeToRefs } from 'pinia';
import { ref, reactive, computed } from 'vue';
import { useMainStore } from '@/stores/MainStore.js';

const MainStore = useMainStore();

const props = defineProps({
  topicName: String,
  loading: Boolean
});

// both of these methods seem to work to get the reactive current address
const { currentAddress } = storeToRefs(MainStore);
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
  if (props.topicName == MainStore.currentTopic) {
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
      class="topic"
      @click="handleTopicClick"
    >
      <span class="topic-name has-text-left">
        {{ topicName }}
      </span>
      <span class="topic-loading has-text-right" v-if="open && loading">Loading...</span>
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

.topic {
  height: 3.5em;
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  margin-top: .25em;
  padding: .25em;
}

.topic-name {
  font-size: 2em;
}

.inside-topic {
  background-color: #ffffff;
  border: 1px solid #929292;
  font-size: 1em;
  padding: 1em;
}

</style>