<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const inputAddress = ref('');

</script>

<template>
  <!-- <div class="columns"> -->
    <div class="holder">
      <input
        class="input address-input"
        type="text"
        placeholder="Search an address"
        v-model="inputAddress"
        @keydown.enter="router.replace({ name: 'search', query: { address: inputAddress }})"
      />
      <button
        class="button"
        @click="router.replace({ name: 'search', query: { address: inputAddress }})"
      >
        <font-awesome-icon :icon="['fas', 'magnifying-glass']"/>
      </button>
    </div>
  <!-- </div> -->

</template>

<style scoped>

.holder {
  position: absolute;
  top: 10px;
  left: 10px;
  width: 70%;
  display: flex;
  flex-direction: row;
  /* z-index: 1000; */
}

.address-input {
  z-index: 2;
}

.button {
  width: 40px;
  z-index: 2;
}

</style>