<script setup>

import { ref, onMounted } from 'vue';
import axios from 'axios';

import { Base64 } from 'js-base64';
import qs from 'qs';
const clientId = import.meta.env.VITE_PICTOMETRY_API_KEY;
const clientSecret = import.meta.env.VITE_PICTOMETRY_SECRET_KEY;
const basicAuth = 'Basic ' + Base64.encode(clientId + ':' + clientSecret);
const data = { 'grant_type': 'client_credentials' };
const url = 'https://api.eagleview.com/auth-service/v1/token HTTP/1.1';
const options = {
  method: 'POST',
  headers: {
    'Authorization': basicAuth,
    'Accept': 'application/json',
    'content-type': 'application/x-www-form-urlencoded'
  },
  data: qs.stringify(data),
  url,
};


// const params = new URLSearchParams();
// params.append('grant_type', 'client_credentials');
console.log('clientId:', clientId, 'clientSecret:', clientSecret, 'basicAuth:', basicAuth);

onMounted( async() => {
  // const params = {
  //   'grant_type': 'client_credentials',
  // }
  // const headers = {
  //   'Authorization': basicAuth,
  //   'Accept': 'application/json',
  //   'Content-Type': 'application/x-www-form-urlencoded',
  // }
  const response = await axios(options);
  // const response = await axios.post('https://api.eagleview.com/auth-service/v1/token HTTP/1.1', params, headers);
  console.log('response:', response);
  const map = new window.ev.EmbeddedExplorer().mount('pictometry', { authToken: response.data.access_token });
})
</script>

<template>
  <div id='pictometry' style="height: 100%; width: 50%;"></div>
</template>