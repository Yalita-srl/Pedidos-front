import { createRouter, createWebHistory } from 'vue-router'
import RestaurantesLista from '@/views/cliente/RestaurantesLista.vue'
import PaymentView from '@/views/cliente/PaymentView.vue'
import Login from '@/views/Login.vue' // Importar el componente Login
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/',
    name: 'Restaurantes',
    component: RestaurantesLista,
    meta: { requiresAuth: true } // Marcar como ruta protegida
  },
  {
    path: '/restaurantes/:id/menu',
    name: 'RestauranteMenu',
    component: () => import('@/views/cliente/RestauranteMenu.vue'),
    meta: { requiresAuth: true } // Marcar como ruta protegida
  },
  {
    path: '/payment',
    name: 'Payment',
    component: PaymentView,
    meta: { requiresAuth: true } // Agregar protección a la ruta de pago
  },
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