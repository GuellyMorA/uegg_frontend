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

// =========================
//Configuración base Axios
// =========================
const apiUrl = import.meta.env;

// URL base de tu API
axios.defaults.baseURL = apiUrl.VITE_API_URL;

// Encabezados comunes
axios.defaults.headers.common['Accept'] =
  'application/json, text/plain, text/html, application/xhtml+xml, application/xml, image/png, */*';
axios.defaults.headers.common['Access-Control-Allow-Methods'] =
  'POST, PUT, GET, PATCH, DELETE';
axios.defaults.headers.common['Access-Control-Allow-Origin'] = '*';

//Desactivar caché en todas las peticiones GET
axios.defaults.headers.get['Cache-Control'] = 'no-cache';
axios.defaults.headers.get['Pragma'] = 'no-cache';
axios.defaults.headers.get['Expires'] = '0';

//Interceptor para:
// 1. Agregar el token dinámico (desde localStorage o Pinia)
// 2. Evitar cache con parámetro único
axios.interceptors.request.use((config) => {
  // Token dinámico (por ejemplo guardado después del login)
  /* const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } */
  try {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      if (user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    }
  } catch (e) {
    console.warn('No se pudo leer el token del localStorage:', e);
  }

  // Evitar cache del navegador
  if (config.method === 'get') {
    config.params = {
      ...config.params,
      t: Date.now(), // agrega parámetro temporal
    };
  }

  return config;
});

// =========================
// Inicialización de Vue
// =========================
const app = createApp(App);

app.use(router);
app.use(PerfectScrollbar);
app.use(createPinia());
app.use(VueTablerIcons);
app.use(Maska);
app.use(VueApexCharts);

app.use(Vue3Toasity, {
  autoClose: 3000,
} as ToastContainerOptions);

app.use(vuetify).mount('#app');
