<template>
  <!-- Layout principal con Sidebar -->
  <div class="flex min-h-screen bg-slate-50">

    <!-- Sidebar fijo -->
    <AdminSidebar />

    <!-- Contenido principal -->
    <div class="flex-1 ml-72 transition-all duration-300 max-lg:ml-0">

      <div class="p-6 pt-10 mx-auto max-w-6xl">

        <!-- Header -->
        <div class="flex flex-col gap-6 mb-10 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 class="text-4xl font-bold text-gray-800">Mis Restaurantes</h1>
            <p class="mt-2 text-gray-600">Gestiona todos tus restaurantes en un solo lugar</p>
          </div>
          <button @click="abrirModalNuevo"
                  class="flex gap-3 items-center px-6 py-4 font-semibold text-white bg-blue-600 rounded-xl shadow-lg transition hover:bg-blue-700 hover:shadow-xl">
            <i class="fas fa-plus"></i>
            Nuevo Restaurante
          </button>
        </div>

        <!-- Mensaje de éxito flotante -->
        <transition name="fade">
          <div v-if="successMessage"
               class="flex fixed top-6 right-6 z-50 gap-3 items-center px-6 py-4 text-white bg-emerald-500 rounded-xl shadow-2xl">
            <i class="fas fa-check-circle"></i>
            {{ successMessage }}
          </div>
        </transition>

        <!-- Loading -->
        <div v-if="loading" class="py-20 text-center">
          <i class="mb-4 text-5xl text-blue-600 fas fa-spinner fa-spin"></i>
          <p class="text-xl text-gray-600">Cargando restaurantes...</p>
        </div>

        <!-- Error -->
        <div v-else-if="error" class="p-8 text-center text-red-700 bg-red-50 rounded-2xl border border-red-200">
          <i class="mb-4 text-4xl fas fa-exclamation-triangle"></i>
          <p class="mb-4 text-lg">{{ error }}</p>
          <button @click="cargarRestaurantes"
                  class="px-6 py-3 font-medium text-white bg-red-600 rounded-lg hover:bg-red-700">
            Reintentar
          </button>
        </div>

        <!-- Sin restaurantes -->
        <div v-else-if="restaurantes.length === 0" class="py-20 text-center">
          <i class="mb-6 text-8xl text-gray-300 fas fa-store-slash"></i>
          <h3 class="mb-3 text-2xl font-bold text-gray-700">No tienes restaurantes registrados</h3>
          <p class="mb-8 text-gray-500">Comienza creando tu primer restaurante</p>
          <button @click="abrirModalNuevo"
                  class="px-8 py-4 text-lg font-bold text-white bg-blue-600 rounded-xl shadow-lg hover:bg-blue-700 hover:shadow-xl">
            Crear Primer Restaurante
          </button>
        </div>

        <!-- Lista de restaurantes -->
        <div v-else class="space-y-6">
          <div
            v-for="restaurante in restaurantes"
            :key="restaurante.id"
            @click="verDetalles(restaurante.id)"
            class="overflow-hidden bg-white rounded-2xl border border-gray-200 shadow-md transition-all duration-300 cursor-pointer hover:shadow-xl hover:border-blue-300 group"
          >
            <!-- Imagen del restaurante -->
            <div class="overflow-hidden relative w-full h-64 bg-gradient-to-br from-blue-50 to-indigo-100">
              <div v-if="restaurante.imagen" class="w-full h-full">
                <img
                  :src="restaurante.imagen_url"
                  @error="e => e.target.src = '/placeholder-restaurant.jpg'"
                  :alt="restaurante.nombre"
                  class="object-cover w-full h-full transition duration-500 group-hover:scale-110"
                />
                <div class="absolute inset-0 bg-gradient-to-t to-transparent from-black/60 via-black/20"></div>
              </div>
              <div v-else class="flex flex-col justify-center items-center w-full h-full text-gray-400">
                <i class="mb-3 text-6xl fas fa-store"></i>
                <p class="text-sm font-medium">Sin imagen</p>
              </div>
              
              <!-- Estado del restaurante -->
              <div class="absolute top-4 right-4">
                <span :class="restaurante.estado === 'Abierto' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-red-500 text-white'"
                  class="flex gap-2 items-center px-3 py-1.5 text-sm font-semibold rounded-full shadow-lg backdrop-blur-sm"
                >
                  <span class="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                  {{ restaurante.estado }}
                </span>
              </div>

              <!-- Nombre del restaurante -->
              <div class="absolute right-0 bottom-0 left-0 p-6">
                <h3 class="text-3xl font-bold text-white drop-shadow-lg transition-transform duration-300 group-hover:scale-105">
                  {{ restaurante.nombre }}
                </h3>
              </div>
            </div>

            <!-- Contenido de la card -->
            <div class="p-6">
              <!-- Información básica -->
              <div class="mb-4 space-y-2 text-gray-600">
                <div class="flex gap-3 items-center">
                  <i class="w-4 text-blue-500 fas fa-map-marker-alt"></i>
                  <span class="text-sm">{{ restaurante.direccion }}</span>
                </div>
                <div class="flex gap-3 items-center">
                  <i class="w-4 text-blue-500 fas fa-phone"></i>
                  <span class="text-sm">{{ restaurante.telefono }}</span>
                </div>
              </div>

              <!-- Estadísticas -->
              <div class="grid grid-cols-3 gap-4 py-4 mb-4 border-t border-b border-gray-100">
                <div class="text-center">
                  <div class="text-2xl font-bold text-blue-600">{{ restaurante.categorias?.length || 0 }}</div>
                  <div class="text-xs font-medium tracking-wider text-gray-500 uppercase">Categorías</div>
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold text-green-600">{{ restaurante.productos?.length || 0 }}</div>
                  <div class="text-xs font-medium tracking-wider text-gray-500 uppercase">Productos</div>
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold text-purple-600">{{ contarProductosDisponibles(restaurante) }}</div>
                  <div class="text-xs font-medium tracking-wider text-gray-500 uppercase">Disponibles</div>
                </div>
              </div>

              <!-- Acciones -->
              <div class="flex gap-3">
                <button @click.stop="cambiarEstado(restaurante)"
                        :class="restaurante.estado === 'Abierto'
                          ? 'bg-green-100 text-green-800 hover:bg-green-200 border-green-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200 border-red-200'"
                        class="flex flex-1 gap-2 justify-center items-center px-4 py-3 font-semibold rounded-lg border-2 transition">
                  <i :class="restaurante.estado === 'Abierto' ? 'fa-lock-open' : 'fa-lock'" class="fas"></i>
                  {{ restaurante.estado === 'Abierto' ? 'Cerrar' : 'Abrir' }}
                </button>
                <button @click.stop="abrirModalEditar(restaurante)"
                        class="flex flex-1 gap-2 justify-center items-center px-4 py-3 font-semibold text-blue-600 rounded-lg border-2 border-blue-600 transition hover:bg-blue-600 hover:text-white">
                  <i class="fas fa-edit"></i> Editar
                </button>
                <button @click.stop="eliminarRestaurante(restaurante.id)"
                        class="flex flex-1 gap-2 justify-center items-center px-4 py-3 font-semibold text-white bg-red-600 rounded-lg transition hover:bg-red-700">
                  <i class="fas fa-trash"></i> Eliminar
                </button>
              </div>
            </div>

            <!-- Indicador -->
            <div class="flex justify-center items-center py-3 bg-gray-50 border-t border-gray-100">
              <span class="flex gap-2 items-center text-sm font-medium text-gray-500 transition-colors group-hover:text-blue-600">
                Ver detalles
                <i class="text-xs fas fa-chevron-down"></i>
              </span>
            </div>
          </div>
        </div>

        <!-- Estadísticas generales -->
        <div v-if="restaurantes.length > 0" class="p-6 mt-12 bg-white rounded-2xl border border-gray-200 shadow-sm">
          <h3 class="mb-4 text-lg font-semibold text-gray-800">Resumen General</h3>
          <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div class="p-4 text-center bg-blue-50 rounded-lg">
              <div class="text-2xl font-bold text-blue-600">{{ restaurantes.length }}</div>
              <div class="text-sm text-gray-600">Total Restaurantes</div>
            </div>
            <div class="p-4 text-center bg-green-50 rounded-lg">
              <div class="text-2xl font-bold text-green-600">{{ restaurantesAbiertos }}</div>
              <div class="text-sm text-gray-600">Abiertos</div>
            </div>
            <div class="p-4 text-center bg-purple-50 rounded-lg">
              <div class="text-2xl font-bold text-purple-600">{{ totalCategorias }}</div>
              <div class="text-sm text-gray-600">Categorías</div>
            </div>
            <div class="p-4 text-center bg-amber-50 rounded-lg">
              <div class="text-2xl font-bold text-amber-600">{{ totalProductos }}</div>
              <div class="text-sm text-gray-600">Productos</div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- Modal de Restaurante -->
    <RestauranteModal
      v-model="mostrarModal"
      :restaurante-data="restauranteEditando"
      @guardar="guardarRestaurante"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth' // Importar el store de autenticación
import { 
  getRestaurantesPorUsuarioAdmin, 
  deleteRestaurante, 
  updateRestaurante,
  createRestaurante 
} from '@/services/catalogoService'
import AdminSidebar from '@/components/restaurante/AdiminSidebar.vue'
import RestauranteModal from '@/components/restaurante/RestauranteModal.vue'

const router = useRouter()
const authStore = useAuthStore() // Usar el store de autenticación

const restaurantes = ref([])
const loading = ref(true)
const error = ref('')
const successMessage = ref('')
const mostrarModal = ref(false)
const restauranteEditando = ref(null)

// Obtener el ID del usuario autenticado desde el store
const usuarioAdminId = computed(() => {
  return authStore.user?.id || null
})

// Computed properties para estadísticas
const restaurantesAbiertos = computed(() => {
  return restaurantes.value.filter(r => r.estado === 'Abierto').length
})

const totalCategorias = computed(() => {
  return restaurantes.value.reduce((total, rest) => total + (rest.categorias?.length || 0), 0)
})

const totalProductos = computed(() => {
  return restaurantes.value.reduce((total, rest) => total + (rest.productos?.length || 0), 0)
})

const cargarRestaurantes = async () => {
  // Verificar que tenemos un usuario autenticado
  if (!usuarioAdminId.value) {
    error.value = 'No se pudo identificar al usuario. Por favor, inicia sesión nuevamente.'
    loading.value = false
    return
  }

  loading.value = true
  error.value = ''
  try {
    console.log('🔄 Cargando restaurantes para usuario ID:', usuarioAdminId.value)
    const response = await getRestaurantesPorUsuarioAdmin(usuarioAdminId.value)
    restaurantes.value = response.data || []

    if (restaurantes.value.length > 0) {
      successMessage.value = `${restaurantes.value.length} restaurante(s) cargado(s)`
      setTimeout(() => successMessage.value = '', 3000)
    }
  } catch (err) {
    console.error('❌ Error al cargar restaurantes:', err)
    error.value = 'Error al cargar los restaurantes. Intenta nuevamente.'
  } finally {
    loading.value = false
  }
}

const contarProductosDisponibles = (restaurante) => {
  if (!restaurante.productos) return 0
  return restaurante.productos.filter(producto => producto.disponible).length
}

const verDetalles = (id) => {
  router.push({ name: 'RestauranteProductos', params: { id } })
}

const abrirModalNuevo = () => {
  restauranteEditando.value = null
  mostrarModal.value = true
}

const abrirModalEditar = (restaurante) => {
  restauranteEditando.value = { ...restaurante }
  mostrarModal.value = true
}

const guardarRestaurante = async ({ formData, id }) => {
  try {
    let response;
    
    if (id) {
      // Actualizar restaurante existente
      response = await updateRestaurante(id, formData);
    } else {
      // Crear nuevo restaurante
      response = await createRestaurante(formData);
    }
    
    console.log('✅ Operación exitosa:', response.data);
    cargarRestaurantes(); // Actualizar la lista
    
    // Mostrar mensaje de éxito
    showNotification({
      type: 'success',
      message: id ? 'Restaurante actualizado correctamente' : 'Restaurante creado correctamente'
    });
    
  } catch (error) {
    console.error('❌ Error al guardar el restaurante:', error);
    
    // Mostrar mensaje de error
    showNotification({
      type: 'error',
      message: error.response?.data?.message || 'Error al guardar el restaurante'
    });
  }
};

const eliminarRestaurante = async (id) => {
  const restaurante = restaurantes.value.find(r => r.id === id)
  if (!restaurante) return

  if (!confirm(`¿Estás seguro de que quieres eliminar el restaurante "${restaurante.nombre}"? Esta acción no se puede deshacer y se perderán todos los productos y categorías asociadas.`)) return

  try {
    await deleteRestaurante(id)
    successMessage.value = `"${restaurante.nombre}" eliminado correctamente`
    await cargarRestaurantes()
    setTimeout(() => successMessage.value = '', 3000)
  } catch (err) {
    error.value = 'Error al eliminar el restaurante. Asegúrate de que no tenga productos activos.'
  }
}

const cambiarEstado = async (restaurante) => {
  const nuevoEstado = restaurante.estado === 'Abierto' ? 'Cerrado' : 'Abierto'
  
  if (!confirm(`¿${nuevoEstado === 'Abierto' ? 'Abrir' : 'Cerrar'} el restaurante "${restaurante.nombre}"?`)) return

  try {
    await updateRestaurante(restaurante.id, { 
      ...restaurante, 
      estado: nuevoEstado 
    })
    restaurante.estado = nuevoEstado
    successMessage.value = `Restaurante ${nuevoEstado === 'Abierto' ? 'abierto' : 'cerrado'} correctamente`
    setTimeout(() => successMessage.value = '', 3000)
  } catch (err) {
    error.value = 'Error al cambiar el estado del restaurante'
  }
}

onMounted(() => {
  console.log('👤 Usuario autenticado:', authStore.user)
  console.log('🆔 ID del usuario:', usuarioAdminId.value)
  cargarRestaurantes()
})
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { 
  transition: opacity 0.3s ease; 
}
.fade-enter-from, .fade-leave-to { 
  opacity: 0; 
}
</style>