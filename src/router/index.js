// router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import RestaurantesLista from '@/views/cliente/RestaurantesLista.vue'
import RestauranteForm from '@/components/restaurante/RestauranteForm.vue'
// Importa otros componentes que necesites para las rutas

const routes = [
  //Rutas restaurantes
  {
    path: '/',
    name: 'Restaurantes',
    component: RestaurantesLista
  },
  {
    path: '/restaurantes/:id/menu',
    name: 'RestauranteMenu',
    component: () => import('@/views/cliente/RestauranteMenu.vue')
  },
  {
  path: '/mis-restaurantes',
  name: 'RestaurantesAdmin',
  component: () => import('@/views/restaurante/Menu.vue')
},
{
  path: '/restaurantes/nuevo',
  name: 'NuevoRestaurante',
  component: RestauranteForm
},
{
  path: '/restaurantes/:id/editar',
  name: 'EditarRestaurante',
  component: RestauranteForm,
  props: true
},

{
  path: '/restaurantes/:id/productos',
  name: 'RestauranteProductos',
  component: () => import('@/views/restaurante/RestauranteProductos.vue'),
  props: true
}
  
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router