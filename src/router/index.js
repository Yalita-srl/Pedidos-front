import { createRouter, createWebHistory } from 'vue-router'
import RestaurantesLista from '@/views/cliente/RestaurantesLista.vue'
import RestauranteForm from '@/components/restaurante/RestauranteModal.vue'
import PaymentView from '@/views/cliente/PaymentView.vue'
import Login from '@/views/Login.vue'
import { useAuthStore } from '@/stores/auth'

const routes = [
  // Rutas para clientes
  {
    path: '/',
    name: 'Restaurantes',
    component: RestaurantesLista,
    meta: { requiresAuth: true }
  },
  {
    path: '/restaurantes/:id/menu',
    name: 'RestauranteMenu',
    component: () => import('@/views/cliente/RestauranteMenu.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/payment',
    name: 'Payment',
    component: PaymentView,
    meta: { requiresAuth: true }
  },
  
  // Rutas para administración de restaurantes
  {
    path: '/mis-restaurantes',
    name: 'RestaurantesAdmin',
    component: () => import('@/views/restaurante/Restaurantes.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/restaurantes/nuevo',
    name: 'NuevoRestaurante',
    component: RestauranteForm,
    meta: { requiresAuth: true }
  },
  {
    path: '/restaurantes/:id/editar',
    name: 'EditarRestaurante',
    component: RestauranteForm,
    props: true,
    meta: { requiresAuth: true }
  },
  {
    path: '/restaurantes/:id/productos',
    name: 'RestauranteProductos',
    component: () => import('@/views/restaurante/Productos.vue'),
    props: true,
    meta: { requiresAuth: true }
  },
  {
  path: '/restaurantes/categorias',
  name: 'GestionCategorias',
  component: () => import('@/views/restaurante/Categorias.vue'),
  meta: { requiresAuth: true }
},
{
  path: '/restaurantes/productos',
  name: 'VistaProductos',
  component: () => import('@/views/restaurante/TodosProductos.vue'),
  meta: { requiresAuth: true }
},
  
  // Ruta de login (sin autenticación requerida)
  {
    path: '/login',
    name: 'Login',
    component: Login
  }
  // Agrega más rutas según necesites
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    // Si la ruta requiere autenticación y el usuario no está autenticado
    next({ name: 'Login' })
  } else {
    // En cualquier otro caso, permite el acceso
    next()
  }
})

export default router