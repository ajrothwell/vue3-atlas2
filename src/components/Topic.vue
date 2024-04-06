
<script setup>

import { ref, reactive, computed } from 'vue';

import { useRoute, useRouter } from 'vue-router';
const route = useRoute();
const router = useRouter();
// const address = computed(() => route.params.address);
const address = route.params.address;
// const currentTopic = computed(() => route.params.topic);
const currentTopic = route.params.topic;

const props = defineProps({
  topicName: String
});

// console.log('route.params:', route.params, 'currentTopic:', currentTopic, 'address:', address);

const open = computed(() => {
  return route.params.topic == props.topicName ? true : false;
});

const handleTopicClick = () => {
  console.log('topic clicked:', props.topicName);
  if (route.params.topic == props.topicName) {
    router.push({ name: 'address', params: { address: address } });
  } else {
    router.push({ name: 'address-and-topic', params: { address: address, topic: props.topicName } });
  }
}

</script>

<template>
  <section>

    <!-- <router-link :to="{ name: 'address-and-topic', params: { urlAddress: urlAddress, topic: topicName }}"> -->
    <div class="columns">
      <div
        class="column is-6 topic"
        @click="handleTopicClick"
      >
        {{ topicName }}
      </div>
    </div>
    <div
      v-if="open"
      class="columns"
    >
      <div class="column is-6 inside-topic">
        topic content here
      </div>
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

.inside-topic {
  background-color: #ffffff;
  border: 1px solid #929292;
  font-size: 1em;
  height: 140px;
}

</style>