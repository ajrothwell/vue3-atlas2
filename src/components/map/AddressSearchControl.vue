<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
const router = useRouter();

const inputAddress = ref('');

</script>

<template>

  <input
    class="input address-input"
    type="text"
    placeholder="Search an address"
    v-model="inputAddress"
    @keydown.enter="router.replace({ name: 'search', query: { address: inputAddress }})"
  >
  <input>
  <button
    class="button"
    @click="router.replace({ name: 'search', query: { address: inputAddress }})"
  >
    Search
  </button>

</template>

<style scoped>

.address-input {
  position: absolute;
  width: 300px;
  margin-top: 20px;
  margin-left: 20px;
  z-index: 1000;
}

.button {
  position: absolute;
  width: 50px;
  margin-top: 20px;
  margin-left: 160px;
  z-index: 1000;
}

</style>