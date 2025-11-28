<template>
  <div class="flex min-h-screen bg-slate-50">
    <!-- Sidebar fijo -->
    <AdminSidebar />

    <!-- Contenido principal -->
    <div class="flex-1 ml-72 transition-all duration-300 max-sm:ml-0">
      <div class="p-6 pt-8 mx-auto max-w-6xl">

        <!-- Header de la página -->
        <div class="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-between">
          <h1 class="flex gap-3 items-center text-3xl font-bold">
            {{ restaurante?.nombre || 'Cargando...' }}
            <span :class="restaurante?.estado === 'Abierto' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'"
                  class="px-4 py-2 text-sm font-semibold rounded-full">
              {{ restaurante?.estado }}
            </span>
          </h1>

          <button @click="abrirModalProducto()" class="flex gap-2 items-center px-6 py-3 font-semibold text-white bg-blue-600 rounded-xl shadow-lg hover:bg-blue-700">
            <i class="fas fa-plus"></i> Nuevo Producto
          </button>
        </div>

        <!-- Loading / Error -->
        <div v-if="loading" class="py-12 text-center">
          <i class="text-4xl text-blue-600 fas fa-spinner fa-spin"></i>
          <p class="mt-4 text-gray-600">Cargando menú...</p>
        </div>

        <div v-else-if="error" class="p-6 text-center text-red-700 bg-red-50 rounded-xl border border-red-200">
          <i class="text-2xl fas fa-exclamation-triangle"></i>
          <p class="mt-2">{{ error }}</p>
          <button @click="cargarDatos" class="px-6 py-2 mt-4 text-white bg-red-600 rounded-lg hover:bg-red-700">
            Reintentar
          </button>
        </div>

        <!-- Contenido real -->
        <div v-else>
          <!-- Info rápida del restaurante -->
          <div class="flex flex-wrap gap-6 mb-8 text-gray-600">
            <div class="flex gap-2 items-center">
              <i class="text-blue-600 fas fa-map-marker-alt"></i>
              <span>{{ restaurante.direccion }}</span>
            </div>
            <div class="flex gap-2 items-center">
              <i class="text-blue-600 fas fa-phone"></i>
              <span>{{ restaurante.telefono }}</span>
            </div>
          </div>

          <!-- Sección de filtros por categoría -->
          <div class="p-6 mb-10 bg-indigo-50 rounded-2xl border-2 border-indigo-300 border-dashed">
            <div class="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
              <h3 class="text-2xl font-bold text-gray-800">Filtrar por Categoría</h3>
              <div class="flex gap-2 text-sm text-gray-600">
                <span>Total: {{ productos.length }} productos</span>
                <span v-if="categoriaSeleccionada">| Filtrados: {{ productosFiltrados.length }}</span>
              </div>
            </div>

            <!-- Sin categorías -->
            <div v-if="!categorias.length" class="py-8 text-center text-gray-500">
              <p class="text-lg">No hay categorías creadas aún</p>
              <small>Las categorías ayudan a organizar y filtrar tus productos</small>
            </div>

            <!-- Filtros de categorías -->
            <div v-else class="flex flex-wrap gap-3">
              <button
                @click="categoriaSeleccionada = null"
                :class="{ 
                  'bg-indigo-600 text-white border-indigo-600 shadow-md': categoriaSeleccionada === null, 
                  'bg-white border-gray-300 hover:border-indigo-400': categoriaSeleccionada !== null 
                }"
                class="flex gap-2 items-center px-6 py-3 font-medium rounded-full border-2 transition-all duration-200 hover:shadow-md"
              >
                <i class="fas fa-layer-group"></i>
                Todas las categorías
                <span class="ml-1 text-xs opacity-80">({{ productos.length }})</span>
              </button>

              <button
                v-for="cat in categorias"
                :key="cat.id"
                @click="categoriaSeleccionada = cat.id"
                :class="{ 
                  'bg-indigo-600 text-white border-indigo-600 shadow-md': categoriaSeleccionada === cat.id, 
                  'bg-white border-gray-300 hover:border-indigo-400': categoriaSeleccionada !== cat.id 
                }"
                class="flex gap-2 items-center px-6 py-3 font-medium rounded-full border-2 transition-all duration-200 hover:shadow-md"
              >
                <i class="fas fa-tag"></i>
                {{ cat.nombre }}
                <span class="ml-1 text-xs opacity-80">
                  ({{ productos.filter(p => p.categoria_id === cat.id).length }})
                </span>
              </button>
            </div>

            <!-- Indicador de filtro activo -->
            <div v-if="categoriaSeleccionada" class="flex gap-2 items-center mt-4 text-sm text-indigo-700">
              <i class="fas fa-filter"></i>
              <span>Filtrando por: <strong>{{ nombreCategoriaSeleccionada }}</strong></span>
              <button @click="categoriaSeleccionada = null" class="ml-2 px-3 py-1 text-xs bg-white border border-indigo-300 rounded-full hover:bg-indigo-50">
                Limpiar filtro
              </button>
            </div>
          </div>

          <!-- Lista de productos -->
          <div>
            <div class="flex gap-3 items-center mb-8">
              <h2 class="text-2xl font-bold text-gray-800">
                {{ categoriaSeleccionada ? nombreCategoriaSeleccionada : 'Todos los productos' }}
              </h2>
              <span class="px-3 py-1 text-sm font-medium text-gray-600 bg-gray-100 rounded-full">
                {{ productosFiltrados.length }} producto{{ productosFiltrados.length !== 1 ? 's' : '' }}
              </span>
            </div>

            <!-- Sin productos -->
            <div v-if="productosFiltrados.length === 0" class="py-16 text-center text-gray-500">
              <i class="mb-4 text-6xl fas fa-utensils"></i>
              <p class="text-xl mb-2">
                {{ categoriaSeleccionada ? 'No hay productos en esta categoría' : 'No hay productos en el menú' }}
              </p>
              <p class="text-sm">
                {{ categoriaSeleccionada ? 'Intenta con otra categoría o agrega productos a esta categoría' : 'Comienza agregando productos a tu menú' }}
              </p>
              <button v-if="categoriaSeleccionada" 
                      @click="categoriaSeleccionada = null"
                      class="mt-4 px-6 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
                Ver todos los productos
              </button>
            </div>

            <!-- Grid de productos -->
            <div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <div v-for="producto in productosFiltrados" :key="producto.id"
                   class="overflow-hidden bg-white rounded-2xl shadow-lg transition hover:shadow-2xl hover:-translate-y-2">
                <div class="overflow-hidden relative h-48 bg-gray-100">
                  <img v-if="producto.imagen"
                       :src="getImagenUrl(producto.imagen)"
                       @error="e => e.target.src = '/placeholder-food.jpg'"
                       class="object-cover w-full h-full" />
                  <div v-else class="flex justify-center items-center h-full text-gray-400">
                    <i class="text-5xl fas fa-image"></i>
                  </div>
                  
                  <!-- Badge de categoría -->
                  <div class="absolute top-3 left-3">
                    <span class="px-3 py-1 text-xs font-medium text-indigo-700 bg-indigo-100 rounded-full">
                      {{ obtenerNombreCategoria(producto.categoria_id) }}
                    </span>
                  </div>
                </div>

                <div class="p-5">
                  <h3 class="text-lg font-bold text-gray-800">{{ producto.nombre }}</h3>
                  <p class="my-2 text-2xl font-bold text-blue-600">Bs. {{ formatoPrecio(producto.precio) }}</p>
                  <p class="text-sm text-gray-600 line-clamp-2">{{ producto.descripcion || 'Sin descripción' }}</p>

                  <div class="flex gap-3 mt-4">
                    <button @click="editarProducto(producto)"
                            class="flex flex-1 gap-2 justify-center items-center py-2 font-medium text-blue-700 bg-blue-100 rounded-lg transition hover:bg-blue-200">
                      <i class="fas fa-edit"></i> Editar
                    </button>
                    <button @click="eliminarProducto(producto.id)"
                            class="flex flex-1 gap-2 justify-center items-center py-2 font-medium text-red-700 bg-red-100 rounded-lg transition hover:bg-red-200">
                      <i class="fas fa-trash"></i> Eliminar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modales -->
    <ProductoModal
      v-if="mostrarModal"
      :producto="productoSeleccionado"
      :categorias="categorias"
      :restaurante-id="restauranteId"
      @cerrar="cerrarModal"
      @guardado="handleProductoGuardado"
    />

    <!-- Mensaje flotante -->
    <transition name="fade">
      <div v-if="mensaje"
           class="flex fixed top-6 right-6 z-50 gap-3 items-center px-6 py-4 text-white bg-emerald-500 rounded-xl shadow-2xl">
        <i class="fas fa-check-circle"></i>
        {{ mensaje }}
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { getRestaurante, getCategoriasPorRestaurante, getProductosPorRestaurante } from '@/services/catalogoService'
import AdminSidebar from '@/components/restaurante/AdiminSidebar.vue'
import ProductoModal from '@/components/restaurante/ProductoModal.vue'

const route = useRoute()
const restauranteId = route.params.id

const restaurante = ref(null)
const categorias = ref([])
const productos = ref([])
const loading = ref(true)
const error = ref(null)
const mensaje = ref('')

// === MODAL PRODUCTO ===
const mostrarModal = ref(false)
const productoSeleccionado = ref(null)

// === FILTRO CATEGORÍA ===
const categoriaSeleccionada = ref(null)

// Computed para nombre de categoría
const nombreCategoriaSeleccionada = computed(() => {
  if (!categoriaSeleccionada.value) return 'Todos los productos'
  const cat = categorias.value.find(c => c.id === categoriaSeleccionada.value)
  return cat ? cat.nombre : 'Categoría'
})

// Productos filtrados
const productosFiltrados = computed(() => {
  if (!categoriaSeleccionada.value) return productos.value
  return productos.value.filter(p => p.categoria_id === categoriaSeleccionada.value)
})

// Función para obtener nombre de categoría por ID
const obtenerNombreCategoria = (categoriaId) => {
  const categoria = categorias.value.find(c => c.id === categoriaId)
  return categoria ? categoria.nombre : 'Sin categoría'
}

// === FUNCIONES PRINCIPALES ===
const cargarDatos = async () => {
  try {
    loading.value = true
    const [restauranteRes, categoriasRes] = await Promise.all([
      getRestaurante(restauranteId),
      getCategoriasPorRestaurante(restauranteId)
    ])
    
    restaurante.value = restauranteRes.data
    categorias.value = categoriasRes.data
    await cargarProductos()
  } catch (err) {
    console.error('Error al cargar datos:', err)
    error.value = 'Error al cargar los datos del restaurante'
  } finally {
    loading.value = false
  }
}

const cargarProductos = async () => {
  try {
    const response = await getProductosPorRestaurante(restauranteId)
    productos.value = response.data
  } catch (err) {
    console.error('Error al cargar productos:', err)
  }
}

const abrirModalProducto = () => {
  productoSeleccionado.value = null
  mostrarModal.value = true
}

const editarProducto = (producto) => {
  productoSeleccionado.value = { ...producto }
  mostrarModal.value = true
}

const cerrarModal = () => {
  mostrarModal.value = false
  productoSeleccionado.value = null
}

const handleProductoGuardado = () => {
  cargarProductos()
  cerrarModal()
  mensaje.value = 'Producto guardado correctamente'
  setTimeout(() => mensaje.value = '', 3000)
}

const eliminarProducto = async (id) => {
  if (!confirm('¿Seguro que quieres eliminar este producto?')) return
  // Aquí iría tu lógica de eliminar
  // await eliminarProductoAPI(id)
  await cargarProductos()
  mensaje.value = 'Producto eliminado'
  setTimeout(() => mensaje.value = '', 3000)
}

const formatoPrecio = (precio) => {
  return new Intl.NumberFormat('es-BO', { minimumFractionDigits: 2 }).format(precio)
}

const getImagenUrl = (filename) => {
  return `http://localhost:8000/storage/${filename}`
}

onMounted(() => {
  cargarDatos()
})
</script>

<style>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>