// router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import RestaurantesLista from '@/views/cliente/Restaurantes.vue'
// Importa otros componentes que necesites para las rutas

const routes = [
  {
    path: '/',
    name: 'Restaurantes',
    component: RestaurantesLista
  },
  {
    path: '/restaurantes/:id/menu',
    name: 'RestauranteMenu',
    component: () => import('@/views/cliente/RestauranteMenu.vue') // Ajusta la ruta
  }
  // Agrega más rutas según necesites
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router