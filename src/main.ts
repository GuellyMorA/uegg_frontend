import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import { router } from './router';
import vuetify from './plugins/vuetify';
import '@/scss/style.scss';
import PerfectScrollbar from 'vue3-perfect-scrollbar';
import VueApexCharts from 'vue3-apexcharts';
import VueTablerIcons from 'vue-tabler-icons';
import Maska from 'maska';

import Vue3Toasity, { type ToastContainerOptions } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';

import axios from 'axios';

const apiUrl = import.meta.env;

axios.defaults.baseURL = apiUrl.VITE_API_URL;
//axios.defaults.headers.common['Access-Control-Allow-Methods'] = 'POST, PUT, GET, PATCH, DELETE';
//axios.defaults.headers.common['Access-Control-Allow-Origin'] = '*';
axios.defaults.headers.common['Accept'] = 'application/json, text/plain, text/html, application/xhtml+xml, application/xml, image/png, */*';
axios.defaults.headers.common['Authorization'] = apiUrl.VITE_API_URL_TOKEN;
// axios.defaults.headers.common['Authorization'] = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c3VhcmlvX2lkIjo5MjQ5ODEyMiwiaWF0IjoxNzEyMjA1OTY5fQ.LsnO4syEI1WT-BDL1qxjPicRHU__XUeHJyGCS5gAZCo';

const app = createApp(App);
app.use(router);
app.use(PerfectScrollbar);
app.use(createPinia());
app.use(VueTablerIcons);
app.use(Maska);
app.use(VueApexCharts);
app.use( 
    Vue3Toasity,
    {
      autoClose: 3000,
    } as ToastContainerOptions,
);
app.use(vuetify).mount('#app');