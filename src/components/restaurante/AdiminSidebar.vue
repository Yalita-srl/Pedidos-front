<template>
  <aside
    class="flex fixed inset-y-0 left-0 z-50 flex-col w-72 to-black transition-all duration-500 ease-in-out text-to-indigo-400 from-slate-900 lg:translate-x-0"
    :class="{ 'w-20': isCollapsed, '-translate-x-full lg:translate-x-0': isMobile && isCollapsed }"
  >
    <!-- Header -->
    <div class="flex justify-between items-center p-5 border-b border-slate-800">
      <div class="flex overflow-hidden gap-3 items-center">
        <div class="text-3xl text-indigo-400">
          <i class="fas fa-utensils"></i>
        </div>
        <span
          class="text-xl font-bold tracking-tight transition-opacity duration-300"
          :class="{ 'opacity-0': isCollapsed }"
        >
          Mi Restaurante
        </span>
      </div>

      <!-- Botón colapsar/expandir -->
      <button
        @click="toggleSidebar"
        class="p-2 rounded-lg transition group"
        :title="isCollapsed ? 'Expandir menú' : 'Colapsar menú'"
      >
        <i
          class="text-lg transition-transform duration-300 fas"
          :class="isCollapsed ? 'fa-chevron-right group-hover:translate-x-1' : 'fa-chevron-left group-hover:-translate-x-1'"
        ></i>
      </button>
    </div>

    <!-- Menú -->
    <nav class="overflow-y-auto flex-1 px-4 py-6">
      <ul class="space-y-2">
        <!-- Dashboard -->
        <li>
          <router-link
            to=""
            class="flex gap-4 items-center px-4 py-3 rounded-xl transition-all group"
            active-class="font-semibold from-indigo-600 to-indigo-700 shadow-lg shadow-indigo-500/30"
            
          >
            <i class="w-6 text-center text-indigo-400 fas fa-tachometer-alt"></i>
            <span :class="{ 'opacity-0': isCollapsed }">Dashboard</span>
          </router-link>
        </li>

        <!-- Mis Restaurantes -->
        <li>
          <router-link
            to="/mis-restaurantes"
            class="flex gap-4 items-center px-4 py-3 rounded-xl transition-all group"
            active-class="font-semibold bg-gradient-to-r from-indigo-600 to-indigo-700 shadow-lg shadow-indigo-500/30"
            
          >
            <i class="w-6 text-center text-indigo-400 fas fa-store"></i>
            <span :class="{ 'opacity-0': isCollapsed }">Mis Restaurantes</span>
          </router-link>
        </li>

        <!-- Pedidos -->
        <li>
          <router-link
            to=""
            class="flex justify-between items-center px-4 py-3 rounded-xl transition-all group"
            active-class="font-semibold bg-gradient-to-r from-indigo-600 to-indigo-700 shadow-lg shadow-indigo-500/30"
            
          >
            <div class="flex gap-4 items-center">
              <i class="w-6 text-center text-indigo-400 fas fa-shopping-bag"></i>
              <span :class="{ 'opacity-0': isCollapsed }">Pedidos</span>
            </div>
            <span
              v-if="pedidosPendientes > 0 && !isCollapsed"
              class="px-2.5 py-1 text-xs font-bold text-white bg-red-500 rounded-full animate-pulse"
            >
              {{ pedidosPendientes }}
            </span>
          </router-link>
        </li>

        <!-- Productos -->
        <li>
          <router-link
            to="/restaurantes/productos"
            class="flex gap-4 items-center px-4 py-3 rounded-xl transition-all group"
            active-class="font-semibold bg-gradient-to-r from-indigo-600 to-indigo-700 shadow-lg shadow-indigo-500/30"
            
          >
            <i class="w-6 text-center text-indigo-400 fas fa-box-open"></i>
            <span :class="{ 'opacity-0': isCollapsed }">Productos</span>
          </router-link>
        </li>

        <!-- Categorías -->
        <li>
          <router-link
            to="/restaurantes/categorias"
            class="flex gap-4 items-center px-4 py-3 rounded-xl transition-all group"
            active-class="font-semibold bg-gradient-to-r from-indigo-600 to-indigo-700 shadow-lg shadow-indigo-500/30"
            
          >
            <i class="w-6 text-center text-indigo-400 fas fa-tags"></i>
            <span :class="{ 'opacity-0': isCollapsed }">Categorías</span>
          </router-link>
        </li>
      </ul>
    </nav>

    <!-- Footer: Usuario + Logout -->
    <div class="p-5 border-t border-slate-800">
      <div class="flex justify-between items-center">
        <div class="flex overflow-hidden gap-3 items-center">
          <div class="text-4xl text-indigo-400">
            <i class="fas fa-user-circle"></i>
          </div>
          <div :class="{ 'opacity-0': isCollapsed }" class="transition-opacity">
            <p class="text-sm font-semibold">{{ userName }}</p>
            <p class="text-xs text-slate-400">Administrador</p>
          </div>
        </div>

        <button
          @click="cerrarSesion"
          class="p-2.5 text-red-400 rounded-lg transition hover:bg-red-900/50 hover:text-red-300"
          title="Cerrar sesión"
        >
          <i class="text-xl fas fa-sign-out-alt"></i>
        </button>
      </div>
    </div>
  </aside>

  <!-- Overlay móvil -->
  <div
    v-if="isMobile && !isCollapsed"
    @click="isCollapsed = true"
    class="fixed inset-0 z-40 bg-black/50 lg:hidden"
  ></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const isCollapsed = ref(false)
const isMobile = ref(window.innerWidth <= 1024)

const userName = ref('Juan Pérez')
const pedidosPendientes = ref(7)

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
}

const handleResize = () => {
  isMobile.value = window.innerWidth <= 1024
  if (isMobile.value) isCollapsed.value = true
}

const cerrarSesion = () => {
  if (confirm('¿Cerrar sesión?')) {
    localStorage.removeItem('token')
    router.push('/login')
  }
}

onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<!-- Solo una clase personalizada para el gradiente del botón activo -->
<style scoped>
.bg-gradient-to-r.from-indigo-600.to-indigo-700 {
  background: linear-gradient(to right, #4f46e5, #4338ca);
}
</style>