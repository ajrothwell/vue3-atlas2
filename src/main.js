import './assets/style.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App);

// import $config from './config'
// app.config.globalProperties.$config = config;

app.use(createPinia())
app.use(router)

app.mount('#app')
