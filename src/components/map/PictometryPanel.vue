<script setup>

import { ref, onMounted } from 'vue';

onMounted( async() => {
  const map = new window.ev.EmbeddedExplorer().mount('pictometry', { authToken:'<access_token>' });
})
</script>

<template>
  <div id='pictometry' style="height: 100%; width: 50%;"></div>
</template>