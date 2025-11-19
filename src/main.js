// main.js
import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue' // Deberías tener un App.vue principal
import router from './router'

const app = createApp(App)
app.use(router)
app.mount('#app')