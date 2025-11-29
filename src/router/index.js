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
  
  {
    path: '/login',
    name: 'Login',
    component: Login
  },

  {
    path: "/perfil",
    name: "Perfil",
    component: () => import("@/views/cliente/ProfileView.vue"),
    meta: { requiresAuth: true }
  },
  {
    path: "/mis-compras",
    name: "MisCompras",
    component: () => import("@/views/cliente/OrdersView.vue"),
    meta: { requiresAuth: true }
  },

  // RUTAS DEL PANEL DE ADMINISTRACIÓN
  {
    path: '/admin/dashboard',
    name: 'admin-dashboard',
    component: () => import('@/views/admin/Dashboard.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/categorias',
    name: 'admin-categorias',
    component: () => import('@/views/admin/Categorias.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/usuarios',
    name: 'admin-usuarios',
    component: () => import('@/views/admin/Usuarios.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/restaurantes',
    name: 'admin-restaurantes',
    component: () => import('@/views/admin/Restaurantes.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/reportes',
    name: 'admin-reportes',
    component: () => import('@/views/admin/Reportes.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/configuracion',
    name: 'admin-configuracion',
    component: () => import('@/views/admin/Configuracion.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  
  // Redirección para /admin
  {
    path: '/admin',
    redirect: '/admin/dashboard'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // Si el usuario está autenticado y va al login, redirigir según su rol
  if (to.name === 'Login' && authStore.isAuthenticated) {
    if (authStore.user?.role === 'ADMIN') {
      next({ name: 'admin-dashboard' })
    } else {
      next({ name: 'Restaurantes' })
    }
  }
  // Si un ADMIN va a la ruta raíz, redirigir al dashboard
  else if (to.name === 'Restaurantes' && authStore.isAuthenticated && authStore.user?.role === 'ADMIN') {
    next({ name: 'admin-dashboard' })
  }
  // Si la ruta requiere autenticación y el usuario no está autenticado
  else if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'Login' })
  } 
  // Si la ruta requiere ser admin y el usuario no es admin
  else if (to.meta.requiresAdmin && authStore.user?.role !== 'ADMIN') {
    next({ name: 'Restaurantes' })
  }
  else {
    next()
  }
})

export default router