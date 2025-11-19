<template>
  <div class="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
    <HeaderSection />
    
    <SearchBar v-model="searchQuery" />
    
    <FiltersSection 
      :categorias="uniqueCategorias" 
      :filtro-categoria="filtroCategoria"
      @update:filtro-categoria="filtroCategoria = $event"
    />
    
    <LoadingSpinner v-if="loading" />
    
    <ErrorMessage 
      v-else-if="error" 
      :message="error" 
      @retry="fetchRestaurantes"
    />
    
    <div v-else class="space-y-8">
      <!-- Carrusel de Destacados -->
      <RestaurantsCarousel 
        v-if="restaurantesFiltrados.length > 0"
        titulo="Restaurantes Destacados"
        :restaurantes="restaurantesFiltrados.slice(0, 5)"
        @ver-menu="verMenu"
      />
      
      <!-- Carrusel de Todos -->
      <RestaurantsCarousel 
        titulo="Todos los Restaurantes"
        :restaurantes="restaurantesFiltrados"
        @ver-menu="verMenu"
      />
    </div>
    
    <EmptyState 
      v-if="!loading && restaurantesFiltrados.length === 0" 
      :mensaje="searchQuery ? 'No hay restaurantes que coincidan con tu búsqueda' : 'No hay restaurantes disponibles'"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getRestaurantes } from '@/services/catalogoService';
import HeaderSection from '@/components/client/HederSection.vue';
import SearchBar from '@/components/client/SearchBar.vue';
import FiltersSection from '@/components/client/FiltersSection.vue';
import LoadingSpinner from '@/components/client/LoadingSpinner.vue';
import ErrorMessage from '@/components/client/ErrorMessage.vue';
import RestaurantsCarousel from '@/components/client/RestaurantsCarousel.vue';
import EmptyState from '@/components/client/EmptyState.vue';

const router = useRouter();

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
    const matchesSearch = r.nombre.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                          r.direccion.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesCategoria = filtroCategoria.value === null || 
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
  router.push({ name: 'RestauranteMenu', params: { id: restauranteId } });
}
</script>