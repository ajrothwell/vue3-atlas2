<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
const router = useRouter();
import { useMapStore } from '@/stores/MapStore.js'
const MapStore = useMapStore();

const inputAddress = ref('');

onMounted(() => {
  // const instance = getCurrentInstance();
  // console.log('instance.parent:', instance.parent);
  const map = MapStore.map;
  // map.addControl(addressSearchControl, 'top-left');
});

// class AddressSearchControl {
//   constructor({ id = "", className = "", title = "", eventHandler = function () {} }){
//     this._id = id;
//     this._className = className;
//     this._title = title;
//     this._eventHandler = eventHandler;
//   }
//   onAdd(map) {
//     this._map = map;
//     this._container = document.createElement('div');
//     this._container.className = 'maplibregl-ctrl';
//     this._input = document.createElement('input');
//     this._input.className = 'input';
//     this._input.onkeydown = this._eventHandler;
//     this._container.appendChild(this._input);
//     return this._container;
//   }
//   onRemove() {
//     this._container.parentNode.removeChild(this._container);
//     this._map = undefined;
//   }
// }

// const searchAddress = (value) => {
//   if (value.key === 'Enter') {
//     console.log('searchAddress, value:', value.srcElement.value);
//     router.replace({ name: 'search', query: { address: value.srcElement.value }})
//   }
// }

// const addressSearchControl = new AddressSearchControl({
//   id:'address-search-control',
//   className: "test",
//   title: 'image',
//   imgSrc: './src/assets/imagery_small.png',
//   eventHandler: searchAddress,
// });

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

</template>

<style scoped>

.address-input {
  position: absolute;
  width: 300px;
  margin-top: 20px;
  margin-left: 20px;
  padding: 10px;
  z-index: 1000;
}

</style>