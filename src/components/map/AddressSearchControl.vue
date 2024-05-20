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
        class="button address-input-button"
        @click="router.replace({ name: 'search', query: { address: inputAddress }})"
      >
        <font-awesome-icon :icon="['fas', 'search']" size="xl"/>
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
}

.address-input {
  border-style: solid;
  border-width: 1px;
  border-color: #0f4d90;
  background-color: white;
  border-radius: 3px;
  z-index: 2;
}

.address-input:hover {
  border-color: #0f4d90;
}

.address-input-button {
  height: 40px !important;
  width: 40px;
  z-index: 2;
  background-color: #0f4d90;
  color: white;
  padding-left: 6px;
  padding-top: 10px;
}

.address-input-button:hover {
  color: white;
}


</style>