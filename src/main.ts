import { createApp } from 'vue'

import App from './App.vue'
import router from './router'

import "bootstrap";
import "bootstrap/dist/css/bootstrap.css";

const pwaboy = createApp(App)
pwaboy.use(router);
pwaboy.mount('#app');
