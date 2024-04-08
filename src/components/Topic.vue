
<script setup>

import { storeToRefs } from 'pinia';
import { ref, reactive, computed } from 'vue';
import { useMainStore } from '@/stores/MainStore.js';
const MainStore = useMainStore();

// both of these methods seem to work to get the reactive current address
const { currentAddress } = storeToRefs(MainStore);
const address = computed(() =>
  route.params.address
);

import { useRoute, useRouter } from 'vue-router';
const route = useRoute();
const router = useRouter();
const currentTopic = route.params.topic;

const props = defineProps({
  topicName: String,
  loading: Boolean
});


const open = computed(() => {
  return route.params.topic == props.topicName ? true : false;
});


const handleTopicClick = () => {
  console.log('topic clicked:', props.topicName);
  if (route.params.topic == props.topicName) {
    router.push({ name: 'address', params: { address: currentAddress.value } });
  } else {
    router.push({ name: 'address-and-topic', params: { address: currentAddress.value, topic: props.topicName } });
  }
}

</script>

<template>
  <section>

    <div
      class="topic"
      @click="handleTopicClick"
    >
      <div class="topic-name">
        {{ topicName }}
      </div>
      <div class="topic-loading" v-if="open && loading">Loading...</div>
    </div>
    <div
      v-if="open"
    >
      <div class="inside-topic">
        <!-- <div v-if="loading">Loading...</div> -->
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
  display: inline-block;
  /* margin-left: 1em; */
}

.topic-loading {
  display: inline-block;
  text-align: right;
}

.inside-topic {
  background-color: #ffffff;
  border: 1px solid #929292;
  font-size: 1em;
  min-height: 100px;
}

</style>