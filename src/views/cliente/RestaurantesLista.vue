<template>
  <div class="max-w-5xl mx-auto px-4 pt-6">

    <!-- HEADER DE AUTENTICACIÓN -->
    <header class="flex justify-between items-center mb-6">
      <div v-if="authStore.isAuthenticated" class="text-sm text-gray-600">
        Bienvenido, <span class="font-semibold">{{ authStore.user?.email }}</span>
      </div>
      <div v-else></div>
      <div>
        <button
          v-if="authStore.isAuthenticated"
          @click="handleLogout"
          class="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600"
        >
          Cerrar Sesión
        </button>
        <router-link
          v-else
          to="/login"
          class="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600"
        >
          Iniciar Sesión
        </router-link>
      </div>
    </header>

    <!-- TÍTULO -->
    <h1 class="text-3xl font-bold text-center">Restaurantes Disponibles</h1>
    <p class="text-center text-gray-500 mt-1">
      Descubre nuestros restaurantes y sus deliciosos menús
    </p>

    <!-- BANNER YALA -->
    <div class="relative overflow-hidden rounded-2xl px-8 pt-8 pb-16 text-white shadow-md
            bg-linear-to-r from-red-500 to-red-400 mb-12">
      <!-- LOGO -->
      <div class="flex items-center gap-3 mb-3 relative z-10">
        <img src="/img/logo-yala.png" class="w-12 h-12 rounded-xl shadow-lg" />
        <div>
          <h3 class="text-2xl font-extrabold tracking-tight">YALA Delivery</h3>
          <p class="text-sm opacity-90">Tu comida favorita al instante</p>
        </div>
      </div>

      <!-- ONDA SUPERIOR -->
      <svg class="absolute top-0 left-0 w-full opacity-20" viewBox="0 0 500 150" preserveAspectRatio="none">
        <path d="M0.00,49.98 C150.00,150.00 349.56,-49.98 500.00,49.98 L500.00,00.00 L0.00,00.00 Z" 
              style="stroke: none; fill: #ffffff;"></path>
      </svg>

    </div>

    <div class="h-6"></div>

    <!-- BUSCADOR -->
    <div class="mt-10">
      <SearchBar v-model="searchQuery" />
    </div>

    <!-- FILTROS -->
    <div class="mt-6">
      <FiltersSection
        :categorias="uniqueCategorias"
        :filtro-categoria="filtroCategoria"
        @update:filtro-categoria="filtroCategoria = $event"
      />
    </div>

    <!-- DESTACADOS -->
    <div class="mt-10">
      <RestaurantsCarousel
        titulo="Destacados para ti"
        :restaurantes="restaurantesFiltrados.slice(0, 10)"
        @ver-menu="verMenu"
      />
    </div>

    <!-- TODOS -->
    <h2 class="text-xl font-bold mt-10 mb-4">Todos los Restaurantes</h2>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
      <RestaurantCard
        v-for="r in restaurantesFiltrados"
        :key="r.id"
        :restaurante="r"
        @click="verMenu(r.id)"
      />
    </div>

  </div>
</template>


<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { getRestaurantes } from '@/services/catalogoService';

import HeaderSection from '@/components/client/HederSection.vue';
import SearchBar from '@/components/client/SearchBar.vue';
import FiltersSection from '@/components/client/FiltersSection.vue';
import LoadingSpinner from '@/components/client/LoadingSpinner.vue';
import ErrorMessage from '@/components/client/ErrorMessage.vue';
import RestaurantsCarousel from '@/components/client/RestaurantsCarousel.vue';
import RestaurantCard from '@/components/client/RestaurantCard.vue';
import EmptyState from '@/components/client/EmptyState.vue';

const router = useRouter();
const authStore = useAuthStore();

const restaurantes = ref([]);
const loading = ref(true);
const error = ref(null);
const searchQuery = ref('');
const filtroCategoria = ref(null);

const uniqueCategorias = computed(() => {
  const cats = new Set();
  restaurantes.value.forEach(r => {
    if (r.categorias) r.categorias.forEach(c => cats.add(c.nombre));
  });
  return Array.from(cats);
});

const restaurantesFiltrados = computed(() => {
  let filtered = restaurantes.value.filter(r => {
    const matchesSearch =
      r.nombre.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      r.direccion.toLowerCase().includes(searchQuery.value.toLowerCase());

    const matchesCategoria =
      filtroCategoria.value === null ||
      r.categorias?.some(c => c.nombre === filtroCategoria.value);

    return matchesSearch && matchesCategoria && r.estado === 'Abierto';
  });
  return filtered;
});

onMounted(() => fetchRestaurantes());

async function fetchRestaurantes() {
  loading.value = true;
  error.value = null;
  try {
    const response = await getRestaurantes();
    restaurantes.value = response.data;
  } catch (err) {
    console.error('Error al cargar:', err);
    error.value = 'No se pudieron cargar los restaurantes. ¡Intenta de nuevo!';
  } finally {
    loading.value = false;
  }
}

function verMenu(restauranteId) {
  router.push({
    name: 'RestauranteMenu',
    params: { id: restauranteId }
  });
}

function handleLogout() {
  authStore.logout();
}
</script>
