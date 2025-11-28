<template>
  <div class="flex min-h-screen bg-slate-50">
    <!-- Sidebar -->
    <AdminSidebar />

    <!-- Contenido principal -->
    <div class="flex-1 ml-72 transition-all duration-300 max-sm:ml-0">
      <div class="p-6 pt-8 mx-auto max-w-7xl">

        <!-- Header -->
        <div class="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-800">Todos los Productos</h1>
            <p class="mt-2 text-gray-600">Vista global de todos los productos de tus restaurantes</p>
          </div>
          
          <div class="flex gap-3">
            <!-- Filtro por disponibilidad -->
            <select v-model="filtroDisponible" 
                    class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="todos">Todos los productos</option>
              <option value="disponible">Solo disponibles</option>
              <option value="no-disponible">No disponibles</option>
            </select>

            <!-- Buscador -->
            <div class="relative">
              <input type="text" 
                     v-model="terminoBusqueda"
                     placeholder="Buscar productos..."
                     class="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <i class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 fas fa-search"></i>
            </div>
          </div>
        </div>

        <!-- Loading / Error -->
        <div v-if="loading" class="py-12 text-center">
          <i class="text-4xl text-blue-600 fas fa-spinner fa-spin"></i>
          <p class="mt-4 text-gray-600">Cargando productos...</p>
        </div>

        <div v-else-if="error" class="p-6 text-center text-red-700 bg-red-50 rounded-xl border border-red-200">
          <i class="text-2xl fas fa-exclamation-triangle"></i>
          <p class="mt-2">{{ error }}</p>
          <button @click="cargarRestaurantes" class="px-6 py-2 mt-4 text-white bg-red-600 rounded-lg hover:bg-red-700">
            Reintentar
          </button>
        </div>

        <!-- Contenido principal -->
        <div v-else>
          <!-- Estadísticas rápidas -->
          <div class="grid grid-cols-1 gap-6 mb-8 md:grid-cols-5">
            <div class="p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-600">Total Productos</p>
                  <p class="mt-1 text-2xl font-bold text-gray-900">{{ totalProductos }}</p>
                </div>
                <div class="p-3 bg-blue-100 rounded-xl">
                  <i class="text-xl text-blue-600 fas fa-utensils"></i>
                </div>
              </div>
            </div>

            <div class="p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-600">Disponibles</p>
                  <p class="mt-1 text-2xl font-bold text-green-600">{{ productosDisponibles }}</p>
                </div>
                <div class="p-3 bg-green-100 rounded-xl">
                  <i class="text-xl text-green-600 fas fa-check-circle"></i>
                </div>
              </div>
            </div>

            <div class="p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-600">No Disponibles</p>
                  <p class="mt-1 text-2xl font-bold text-red-600">{{ productosNoDisponibles }}</p>
                </div>
                <div class="p-3 bg-red-100 rounded-xl">
                  <i class="text-xl text-red-600 fas fa-times-circle"></i>
                </div>
              </div>
            </div>

            <div class="p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-600">Restaurantes</p>
                  <p class="mt-1 text-2xl font-bold text-gray-900">{{ restaurantesConProductos }}</p>
                </div>
                <div class="p-3 bg-purple-100 rounded-xl">
                  <i class="text-xl text-purple-600 fas fa-store"></i>
                </div>
              </div>
            </div>

            <div class="p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-600">Valor Total</p>
                  <p class="mt-1 text-2xl font-bold text-amber-600">Bs. {{ valorTotalInventario }}</p>
                </div>
                <div class="p-3 bg-amber-100 rounded-xl">
                  <i class="text-xl text-amber-600 fas fa-dollar-sign"></i>
                </div>
              </div>
            </div>
          </div>

          <!-- Filtros avanzados -->
          <div class="p-6 mb-8 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <h3 class="text-lg font-semibold text-gray-800">Filtros Avanzados</h3>
              
              <div class="flex flex-wrap gap-4">
                <!-- Filtro por restaurante -->
                <select v-model="filtroRestaurante" 
                        class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="todos">Todos los restaurantes</option>
                  <option v-for="rest in restaurantes" :key="rest.id" :value="rest.id">
                    {{ rest.nombre }}
                  </option>
                </select>

                <!-- Filtro por categoría -->
                <select v-model="filtroCategoria" 
                        class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="todas">Todas las categorías</option>
                  <option v-for="cat in categoriasUnicas" :key="cat.id" :value="cat.id">
                    {{ cat.nombre }}
                  </option>
                </select>

                <!-- Filtro por precio -->
                <select v-model="filtroPrecio" 
                        class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="todos">Todos los precios</option>
                  <option value="0-10">Bs. 0 - 10</option>
                  <option value="10-25">Bs. 10 - 25</option>
                  <option value="25-50">Bs. 25 - 50</option>
                  <option value="50+">Bs. 50+</option>
                </select>

                <!-- Botón limpiar filtros -->
                <button @click="limpiarFiltros" 
                        class="px-4 py-2 text-gray-600 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200">
                  <i class="fas fa-times"></i> Limpiar
                </button>
              </div>
            </div>

            <!-- Info de filtros activos -->
            <div v-if="filtrosActivos" class="flex flex-wrap gap-2 mt-4">
              <span class="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
                {{ productosFiltrados.length }} productos encontrados
              </span>
              <span v-if="filtroRestaurante !== 'todos'" class="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-full">
                Restaurante: {{ nombreRestauranteFiltro }}
              </span>
              <span v-if="filtroCategoria !== 'todas'" class="px-3 py-1 text-sm bg-purple-100 text-purple-800 rounded-full">
                Categoría: {{ nombreCategoriaFiltro }}
              </span>
              <span v-if="filtroDisponible !== 'todos'" class="px-3 py-1 text-sm bg-amber-100 text-amber-800 rounded-full">
                {{ filtroDisponible === 'disponible' ? 'Solo disponibles' : 'Solo no disponibles' }}
              </span>
            </div>
          </div>

          <!-- Vista de productos -->
          <div v-if="productosFiltrados.length === 0" class="py-16 text-center">
            <i class="text-6xl text-gray-400 fas fa-utensils"></i>
            <p class="mt-4 text-xl text-gray-600">No se encontraron productos</p>
            <p class="text-gray-500">Intenta ajustar los filtros de búsqueda</p>
            <button @click="limpiarFiltros" class="px-6 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700">
              Limpiar filtros
            </button>
          </div>

          <!-- Grid de productos -->
          <div v-else class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <div v-for="producto in productosFiltrados" :key="producto.id"
                 class="overflow-hidden bg-white rounded-2xl shadow-lg transition hover:shadow-2xl hover:-translate-y-2 border border-gray-200">
              
              <!-- Imagen del producto -->
              <div class="overflow-hidden relative h-48 bg-gray-100">
                <img v-if="producto.imagen"
                     :src="getImagenUrl(producto.imagen)"
                     @error="e => e.target.src = '/placeholder-food.jpg'"
                     class="object-cover w-full h-full transition duration-300 hover:scale-105" />
                <div v-else class="flex justify-center items-center h-full text-gray-400">
                  <i class="text-5xl fas fa-image"></i>
                </div>
                
                <!-- Badges -->
                <div class="absolute top-3 left-3 flex flex-col gap-2">
                  <span :class="producto.disponible ? 'bg-green-500' : 'bg-red-500'"
                        class="px-2 py-1 text-xs font-medium text-white rounded-full">
                    {{ producto.disponible ? 'Disponible' : 'No disponible' }}
                  </span>
                  <span class="px-2 py-1 text-xs font-medium text-white bg-blue-500 rounded-full">
                    {{ obtenerNombreCategoria(producto.categoria_id) }}
                  </span>
                </div>

                <!-- Precio -->
                <div class="absolute top-3 right-3">
                  <span class="px-3 py-2 text-lg font-bold text-white bg-black bg-opacity-70 rounded-full">
                    Bs. {{ formatoPrecio(producto.precio) }}
                  </span>
                </div>
              </div>

              <!-- Información del producto -->
              <div class="p-5">
                <h3 class="text-lg font-bold text-gray-800 line-clamp-1">{{ producto.nombre }}</h3>
                <p class="mt-2 text-sm text-gray-600 line-clamp-2">{{ producto.descripcion || 'Sin descripción' }}</p>
                
                <!-- Información del restaurante -->
                <div class="flex items-center gap-2 mt-3 p-3 bg-gray-50 rounded-lg">
                  <div class="flex-shrink-0 w-8 h-8 overflow-hidden rounded-full">
                    <img v-if="obtenerRestaurante(producto.restaurante_id)?.imagen"
                         :src="getImagenUrl(obtenerRestaurante(producto.restaurante_id)?.imagen)"
                         class="object-cover w-full h-full" />
                    <div v-else class="flex items-center justify-center w-full h-full bg-gray-200">
                      <i class="text-xs text-gray-500 fas fa-store"></i>
                    </div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-800 truncate">
                      {{ obtenerNombreRestaurante(producto.restaurante_id) }}
                    </p>
                    <p class="text-xs text-gray-500 truncate">
                      {{ obtenerDireccionRestaurante(producto.restaurante_id) }}
                    </p>
                  </div>
                </div>

                <!-- Acciones -->
                <div class="flex gap-2 mt-4">
                  <button @click="editarProducto(producto)"
                          class="flex-1 flex gap-2 justify-center items-center py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg transition hover:bg-blue-200">
                    <i class="fas fa-edit"></i> Editar
                  </button>
                  <button @click="verRestaurante(producto.restaurante_id)"
                          class="flex-1 flex gap-2 justify-center items-center py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg transition hover:bg-gray-200">
                    <i class="fas fa-external-link-alt"></i> Ver
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Paginación (opcional) -->
          <div v-if="productosFiltrados.length > 12" class="flex justify-center mt-8">
            <div class="flex gap-2">
              <button class="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                Anterior
              </button>
              <button class="px-4 py-2 text-white bg-blue-600 border border-blue-600 rounded-lg">
                1
              </button>
              <button class="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de edición de producto -->
    <ProductoModal
      v-if="mostrarModalProducto"
      :producto="productoSeleccionado"
      :categorias="categoriasDelRestaurante"
      :restaurante-id="productoSeleccionado?.restaurante_id"
      @cerrar="cerrarModalProducto"
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
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AdminSidebar from '@/components/restaurante/AdiminSidebar.vue'
import ProductoModal from '@/components/restaurante/ProductoModal.vue'
import { getRestaurantesPorUsuarioAdmin } from '@/services/catalogoService'

const router = useRouter()

// Estado principal
const restaurantes = ref([])
const loading = ref(true)
const error = ref(null)
const mensaje = ref('')

// Filtros
const filtroRestaurante = ref('todos')
const filtroCategoria = ref('todas')
const filtroDisponible = ref('todos')
const filtroPrecio = ref('todos')
const terminoBusqueda = ref('')

// Modal de producto
const mostrarModalProducto = ref(false)
const productoSeleccionado = ref(null)

// Computed properties
const todosLosProductos = computed(() => {
  return restaurantes.value.flatMap(rest => 
    rest.productos.map(producto => ({
      ...producto,
      restaurante_nombre: rest.nombre,
      restaurante_direccion: rest.direccion,
      restaurante_imagen: rest.imagen
    }))
  )
})

const productosFiltrados = computed(() => {
  let productos = todosLosProductos.value

  // Filtro por restaurante
  if (filtroRestaurante.value !== 'todos') {
    productos = productos.filter(p => p.restaurante_id === parseInt(filtroRestaurante.value))
  }

  // Filtro por categoría
  if (filtroCategoria.value !== 'todas') {
    productos = productos.filter(p => p.categoria_id === parseInt(filtroCategoria.value))
  }

  // Filtro por disponibilidad
  if (filtroDisponible.value === 'disponible') {
    productos = productos.filter(p => p.disponible)
  } else if (filtroDisponible.value === 'no-disponible') {
    productos = productos.filter(p => !p.disponible)
  }

  // Filtro por precio
  if (filtroPrecio.value !== 'todos') {
    const [min, max] = filtroPrecio.value.split('-').map(val => {
      if (val.endsWith('+')) return [parseFloat(val), Infinity]
      return parseFloat(val)
    })
    
    productos = productos.filter(p => {
      const precio = parseFloat(p.precio)
      if (max === Infinity) return precio >= min
      return precio >= min && precio <= max
    })
  }

  // Filtro por búsqueda
  if (terminoBusqueda.value) {
    const term = terminoBusqueda.value.toLowerCase()
    productos = productos.filter(p => 
      p.nombre.toLowerCase().includes(term) ||
      p.descripcion?.toLowerCase().includes(term) ||
      obtenerNombreRestaurante(p.restaurante_id).toLowerCase().includes(term)
    )
  }

  return productos
})

const categoriasUnicas = computed(() => {
  const categoriasMap = new Map()
  restaurantes.value.forEach(rest => {
    rest.categorias.forEach(cat => {
      if (!categoriasMap.has(cat.id)) {
        categoriasMap.set(cat.id, cat)
      }
    })
  })
  return Array.from(categoriasMap.values())
})

const categoriasDelRestaurante = computed(() => {
  if (!productoSeleccionado.value) return []
  const restaurante = restaurantes.value.find(r => r.id === productoSeleccionado.value.restaurante_id)
  return restaurante ? restaurante.categorias : []
})

// Estadísticas
const totalProductos = computed(() => todosLosProductos.value.length)
const productosDisponibles = computed(() => todosLosProductos.value.filter(p => p.disponible).length)
const productosNoDisponibles = computed(() => todosLosProductos.value.filter(p => !p.disponible).length)
const restaurantesConProductos = computed(() => 
  restaurantes.value.filter(rest => rest.productos.length > 0).length
)
const valorTotalInventario = computed(() => {
  const total = todosLosProductos.value.reduce((sum, p) => sum + parseFloat(p.precio), 0)
  return new Intl.NumberFormat('es-BO', { minimumFractionDigits: 2 }).format(total)
})

const filtrosActivos = computed(() => {
  return filtroRestaurante.value !== 'todos' || 
         filtroCategoria.value !== 'todas' || 
         filtroDisponible.value !== 'todos' ||
         filtroPrecio.value !== 'todos' ||
         terminoBusqueda.value !== ''
})

const nombreRestauranteFiltro = computed(() => {
  if (filtroRestaurante.value === 'todos') return ''
  const rest = restaurantes.value.find(r => r.id === parseInt(filtroRestaurante.value))
  return rest ? rest.nombre : ''
})

const nombreCategoriaFiltro = computed(() => {
  if (filtroCategoria.value === 'todas') return ''
  const cat = categoriasUnicas.value.find(c => c.id === parseInt(filtroCategoria.value))
  return cat ? cat.nombre : ''
})

// Métodos
const cargarRestaurantes = async () => {
  try {
    loading.value = true
    error.value = null
    
    // Aquí necesitas obtener el ID del usuario admin desde tu store o localStorage
    const usuarioAdminId = 1 // Reemplaza con la forma en que obtienes el ID del usuario
    
    const response = await getRestaurantesPorUsuarioAdmin(usuarioAdminId)
    restaurantes.value = response.data
    
  } catch (err) {
    console.error('Error al cargar restaurantes:', err)
    error.value = 'Error al cargar los productos'
  } finally {
    loading.value = false
  }
}

const obtenerNombreRestaurante = (restauranteId) => {
  const restaurante = restaurantes.value.find(r => r.id === restauranteId)
  return restaurante ? restaurante.nombre : 'Restaurante no encontrado'
}

const obtenerDireccionRestaurante = (restauranteId) => {
  const restaurante = restaurantes.value.find(r => r.id === restauranteId)
  return restaurante ? restaurante.direccion : ''
}

const obtenerRestaurante = (restauranteId) => {
  return restaurantes.value.find(r => r.id === restauranteId)
}

const obtenerNombreCategoria = (categoriaId) => {
  for (const restaurante of restaurantes.value) {
    const categoria = restaurante.categorias.find(c => c.id === categoriaId)
    if (categoria) return categoria.nombre
  }
  return 'Sin categoría'
}

const getImagenUrl = (filename) => {
  if (!filename) return ''
  return `http://localhost:8000/storage/${filename}`
}

const formatoPrecio = (precio) => {
  return new Intl.NumberFormat('es-BO', { minimumFractionDigits: 2 }).format(precio)
}

const limpiarFiltros = () => {
  filtroRestaurante.value = 'todos'
  filtroCategoria.value = 'todas'
  filtroDisponible.value = 'todos'
  filtroPrecio.value = 'todos'
  terminoBusqueda.value = ''
}

const editarProducto = (producto) => {
  productoSeleccionado.value = { ...producto }
  mostrarModalProducto.value = true
}

const cerrarModalProducto = () => {
  mostrarModalProducto.value = false
  productoSeleccionado.value = null
}

const handleProductoGuardado = () => {
  cargarRestaurantes()
  cerrarModalProducto()
  mensaje.value = 'Producto actualizado correctamente'
  setTimeout(() => mensaje.value = '', 3000)
}

const verRestaurante = (restauranteId) => {
  router.push(`/admin/restaurante/${restauranteId}`)
}

onMounted(() => {
  cargarRestaurantes()
})
</script>

<style scoped>
.line-clamp-1 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
}

.line-clamp-2 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.fade-enter-active, .fade-leave-active { 
  transition: opacity 0.3s; 
}
.fade-enter-from, .fade-leave-to { 
  opacity: 0; 
}

/* Responsive */
@media (max-width: 768px) {
  .max-sm\:ml-0 {
    margin-left: 0;
  }
}
</style>