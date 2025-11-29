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
            <h1 class="text-3xl font-bold text-gray-800">Gestión de Categorías</h1>
            <p class="mt-2 text-gray-600">Administra las categorías de todos tus restaurantes</p>
          </div>
        </div>

        <!-- Loading / Error -->
        <div v-if="loading" class="py-12 text-center">
          <i class="text-4xl text-blue-600 fas fa-spinner fa-spin"></i>
          <p class="mt-4 text-gray-600">Cargando restaurantes...</p>
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
          <div class="grid grid-cols-1 gap-6 mb-8 md:grid-cols-4">
            <div class="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div class="flex justify-between items-center">
                <div>
                  <p class="text-sm font-medium text-gray-600">Total Restaurantes</p>
                  <p class="mt-1 text-2xl font-bold text-gray-900">{{ restaurantes.length }}</p>
                </div>
                <div class="p-3 bg-blue-100 rounded-xl">
                  <i class="text-xl text-blue-600 fas fa-store"></i>
                </div>
              </div>
            </div>

            <div class="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div class="flex justify-between items-center">
                <div>
                  <p class="text-sm font-medium text-gray-600">Total Categorías</p>
                  <p class="mt-1 text-2xl font-bold text-gray-900">{{ totalCategorias }}</p>
                </div>
                <div class="p-3 bg-green-100 rounded-xl">
                  <i class="text-xl text-green-600 fas fa-tags"></i>
                </div>
              </div>
            </div>

            <div class="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div class="flex justify-between items-center">
                <div>
                  <p class="text-sm font-medium text-gray-600">Restaurantes Activos</p>
                  <p class="mt-1 text-2xl font-bold text-gray-900">{{ restaurantesAbiertos }}</p>
                </div>
                <div class="p-3 bg-emerald-100 rounded-xl">
                  <i class="text-xl text-emerald-600 fas fa-check-circle"></i>
                </div>
              </div>
            </div>

            <div class="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div class="flex justify-between items-center">
                <div>
                  <p class="text-sm font-medium text-gray-600">Sin Categorías</p>
                  <p class="mt-1 text-2xl font-bold text-gray-900">{{ restaurantesSinCategorias }}</p>
                </div>
                <div class="p-3 bg-amber-100 rounded-xl">
                  <i class="text-xl text-amber-600 fas fa-exclamation-triangle"></i>
                </div>
              </div>
            </div>
          </div>

          <!-- Lista de restaurantes -->
          <div class="space-y-6">
            <div v-for="restaurante in restaurantes" :key="restaurante.id" 
                 class="overflow-hidden bg-white rounded-2xl border border-gray-200 shadow-lg">
              
              <!-- Header del restaurante -->
              <div class="p-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div class="flex gap-4 items-center">
                    <div class="flex-shrink-0">
                      <div v-if="restaurante.imagen" class="overflow-hidden w-16 h-16 rounded-xl">
                        <img :src="restaurante.imagen_url" :alt="restaurante.nombre" 
                             class="object-cover w-full h-full">
                      </div>
                      <div v-else class="flex justify-center items-center w-16 h-16 bg-gray-100 rounded-xl">
                        <i class="text-2xl text-gray-400 fas fa-store"></i>
                      </div>
                    </div>
                    <div>
                      <h3 class="text-xl font-bold text-gray-800">{{ restaurante.nombre }}</h3>
                      <div class="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                        <div class="flex gap-1 items-center">
                          <i class="fas fa-map-marker-alt"></i>
                          <span>{{ restaurante.direccion }}</span>
                        </div>
                        <div class="flex gap-1 items-center">
                          <i class="fas fa-phone"></i>
                          <span>{{ restaurante.telefono }}</span>
                        </div>
                        <div class="flex gap-1 items-center">
                          <i class="fas fa-circle" :class="restaurante.estado === 'Abierto' ? 'text-green-500' : 'text-red-500'"></i>
                          <span>{{ restaurante.estado }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="flex gap-3">
                    <span class="px-3 py-1 text-sm font-medium text-blue-800 bg-blue-100 rounded-full">
                      {{ restaurante.categorias.length }} categorías
                    </span>
                    <span class="px-3 py-1 text-sm font-medium text-green-800 bg-green-100 rounded-full">
                      {{ restaurante.productos.length }} productos
                    </span>
                  </div>
                </div>
              </div>

              <!-- Categorías del restaurante -->
              <div class="p-6">
                <div class="flex flex-col gap-4 mb-4 sm:flex-row sm:items-center sm:justify-between">
                  <h4 class="text-lg font-semibold text-gray-800">Categorías del Menú</h4>
                  <button @click="abrirModalCategoria(restaurante.id)" 
                          class="flex gap-2 items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
                    <i class="fas fa-plus"></i>
                    Nueva Categoría
                  </button>
                </div>

                <!-- Sin categorías -->
                <div v-if="!restaurante.categorias.length" 
                     class="py-8 text-center text-gray-500 bg-gray-50 rounded-xl">
                  <i class="text-4xl fas fa-tags"></i>
                  <p class="mt-2 text-lg">No hay categorías creadas</p>
                  <p class="text-sm">Agrega categorías para organizar los productos del menú</p>
                </div>

                <!-- Grid de categorías -->
                <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div v-for="categoria in restaurante.categorias" :key="categoria.id"
                       class="flex justify-between items-center p-4 rounded-xl border border-gray-200 hover:bg-gray-50 group">
                    <div class="flex gap-3 items-center">
                      <div class="p-2 bg-indigo-100 rounded-lg">
                        <i class="text-indigo-600 fas fa-tag"></i>
                      </div>
                      <div>
                        <h5 class="font-medium text-gray-800">{{ categoria.nombre }}</h5>
                        <p class="text-sm text-gray-500">
                          {{ contarProductosEnCategoria(restaurante, categoria.id) }} productos
                        </p>
                      </div>
                    </div>
                    
                    <div class="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                      <button @click="editarCategoria(categoria, restaurante.id)"
                              class="p-2 text-blue-600 rounded-lg transition hover:bg-blue-100"
                              title="Editar categoría">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button @click="eliminarCategoria(categoria.id, restaurante.nombre)"
                              class="p-2 text-red-600 rounded-lg transition hover:bg-red-100"
                              title="Eliminar categoría">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Sin restaurantes -->
          <div v-if="!restaurantes.length && !loading" class="py-16 text-center">
            <i class="text-6xl text-gray-400 fas fa-store-slash"></i>
            <p class="mt-4 text-xl text-gray-600">No tienes restaurantes registrados</p>
            <p class="text-gray-500">Comienza creando tu primer restaurante</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de categoría -->
    <div v-if="modalCategoria.abierto" class="modal-overlay" @click="cerrarModalCategoria">
      <div class="modal-card" @click.stop>
        <div class="modal-header">
          <h2>{{ modalCategoria.datos?.id ? 'Editar Categoría' : 'Nueva Categoría' }}</h2>
          <button @click="cerrarModalCategoria" class="btn-close">×</button>
        </div>

        <form @submit.prevent="guardarCategoria" class="modal-form">
          <div class="input-group">
            <input type="text" v-model="modalCategoria.form.nombre" required placeholder=" " />
            <label>Nombre de la categoría *</label>
          </div>

          <div class="input-group textarea">
            <textarea v-model="modalCategoria.form.descripcion" rows="3" placeholder=" "></textarea>
            <label>Descripción (opcional)</label>
          </div>

          <div class="p-4 mt-4 bg-blue-50 rounded-xl">
            <div class="flex gap-3 items-center">
              <i class="text-blue-600 fas fa-info-circle"></i>
              <div>
                <p class="text-sm font-medium text-blue-800">Restaurante:</p>
                <p class="text-blue-900">{{ nombreRestauranteSeleccionado }}</p>
              </div>
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" @click="cerrarModalCategoria" class="btn-cancel">Cancelar</button>
            <button type="submit" class="btn-submit" :disabled="modalCategoria.guardando">
              <i v-if="modalCategoria.guardando" class="fas fa-spinner fa-spin"></i>
              {{ modalCategoria.guardando ? 'Guardando...' : (modalCategoria.datos?.id ? 'Actualizar' : 'Crear Categoría') }}
            </button>
          </div>
        </form>
      </div>
    </div>

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
import { useAuthStore } from '@/stores/auth' // Importar el store de autenticación
import AdminSidebar from '@/components/restaurante/AdiminSidebar.vue'
import { 
  getRestaurantesPorUsuarioAdmin, 
  createCategoriaMenu, 
  updateCategoriaMenu, 
  deleteCategoriaMenu 
} from '@/services/catalogoService'

const authStore = useAuthStore() // Usar el store de autenticación

// Estado principal
const restaurantes = ref([])
const loading = ref(true)
const error = ref(null)
const mensaje = ref('')

// Modal de categoría
const modalCategoria = reactive({
  abierto: false,
  guardando: false,
  datos: null,
  restauranteId: null,
  form: {
    nombre: '',
    descripcion: ''
  }
})

// Obtener el ID del usuario autenticado desde el store
const usuarioAdminId = computed(() => {
  return authStore.user?.id || null
})

// Computed properties
const totalCategorias = computed(() => {
  return restaurantes.value.reduce((total, rest) => total + rest.categorias.length, 0)
})

const restaurantesAbiertos = computed(() => {
  return restaurantes.value.filter(rest => rest.estado === 'Abierto').length
})

const restaurantesSinCategorias = computed(() => {
  return restaurantes.value.filter(rest => !rest.categorias.length).length
})

const nombreRestauranteSeleccionado = computed(() => {
  if (!modalCategoria.restauranteId) return ''
  const restaurante = restaurantes.value.find(r => r.id === modalCategoria.restauranteId)
  return restaurante ? restaurante.nombre : ''
})

// Métodos
const cargarRestaurantes = async () => {
  try {
    // Verificar que tenemos un usuario autenticado
    if (!usuarioAdminId.value) {
      error.value = 'No se pudo identificar al usuario. Por favor, inicia sesión nuevamente.'
      loading.value = false
      return
    }

    loading.value = true
    error.value = null
    
    console.log('🔄 Cargando restaurantes para usuario ID:', usuarioAdminId.value)
    const response = await getRestaurantesPorUsuarioAdmin(usuarioAdminId.value)
    restaurantes.value = response.data
    
  } catch (err) {
    console.error('❌ Error al cargar restaurantes:', err)
    error.value = 'Error al cargar los restaurantes'
  } finally {
    loading.value = false
  }
}

const contarProductosEnCategoria = (restaurante, categoriaId) => {
  return restaurante.productos.filter(producto => producto.categoria_id === categoriaId).length
}

const abrirModalCategoria = (restauranteId, categoria = null) => {
  modalCategoria.abierto = true
  modalCategoria.restauranteId = restauranteId
  modalCategoria.datos = categoria
  
  if (categoria) {
    // Modo edición
    modalCategoria.form.nombre = categoria.nombre
    modalCategoria.form.descripcion = categoria.descripcion || ''
  } else {
    // Modo creación
    modalCategoria.form.nombre = ''
    modalCategoria.form.descripcion = ''
  }
}

const cerrarModalCategoria = () => {
  modalCategoria.abierto = false
  modalCategoria.datos = null
  modalCategoria.restauranteId = null
  modalCategoria.form.nombre = ''
  modalCategoria.form.descripcion = ''
  modalCategoria.guardando = false
}

const editarCategoria = (categoria, restauranteId) => {
  abrirModalCategoria(restauranteId, categoria)
}

const guardarCategoria = async () => {
  if (!modalCategoria.form.nombre.trim()) {
    return
  }

  modalCategoria.guardando = true

  try {
    const categoriaData = {
      restaurante_id: modalCategoria.restauranteId,
      nombre: modalCategoria.form.nombre.trim(),
      descripcion: modalCategoria.form.descripcion.trim()
    }

    let response
    if (modalCategoria.datos?.id) {
      // Actualizar categoría existente
      response = await updateCategoriaMenu(modalCategoria.datos.id, categoriaData)
    } else {
      // Crear nueva categoría
      response = await createCategoriaMenu(categoriaData)
    }

    // Recargar los datos
    await cargarRestaurantes()
    
    // Mostrar mensaje de éxito
    mensaje.value = modalCategoria.datos?.id ? 'Categoría actualizada' : 'Categoría creada'
    setTimeout(() => mensaje.value = '', 3000)
    
    // Cerrar modal
    cerrarModalCategoria()

  } catch (err) {
    console.error('Error al guardar categoría:', err)
    error.value = 'Error al guardar la categoría'
  } finally {
    modalCategoria.guardando = false
  }
}

const eliminarCategoria = async (categoriaId, restauranteNombre) => {
  const productosEnCategoria = contarProductosEnCategoriaPorId(categoriaId)
  
  if (productosEnCategoria > 0) {
    alert(`No puedes eliminar esta categoría porque tiene ${productosEnCategoria} producto(s) asociado(s). Primero mueve o elimina los productos.`)
    return
  }

  if (!confirm(`¿Estás seguro de que quieres eliminar esta categoría del restaurante "${restauranteNombre}"?`)) {
    return
  }

  try {
    await deleteCategoriaMenu(categoriaId)
    
    // Recargar los datos
    await cargarRestaurantes()
    
    // Mostrar mensaje de éxito
    mensaje.value = 'Categoría eliminada'
    setTimeout(() => mensaje.value = '', 3000)
    
  } catch (err) {
    console.error('Error al eliminar categoría:', err)
    error.value = 'Error al eliminar la categoría'
  }
}

const contarProductosEnCategoriaPorId = (categoriaId) => {
  for (const restaurante of restaurantes.value) {
    const productosEnCategoria = restaurante.productos.filter(p => p.categoria_id === categoriaId)
    if (productosEnCategoria.length > 0) {
      return productosEnCategoria.length
    }
  }
  return 0
}

onMounted(() => {
  console.log('👤 Usuario autenticado:', authStore.user)
  console.log('🆔 ID del usuario:', usuarioAdminId.value)
  cargarRestaurantes()
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 1rem;
}

.modal-card {
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 500px;
  max-height: 95vh;
  overflow-y: auto;
  box-shadow: 0 20px 50px rgba(0,0,0,0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #eee;
}

.modal-header h2 { 
  margin: 0; 
  font-size: 1.5rem; 
  color: #1e293b;
}

.btn-close {
  width: 40px; 
  height: 40px; 
  border-radius: 50%; 
  background: #f1f5f9; 
  border: none;
  font-size: 1.5rem; 
  cursor: pointer;
  color: #64748b;
  transition: all 0.2s;
}

.btn-close:hover {
  background: #e2e8f0;
  color: #475569;
}

.modal-form { 
  padding: 2rem; 
}

.input-group {
  position: relative;
  margin-bottom: 1.5rem;
}

.input-group input,
.input-group textarea {
  width: 100%;
  padding: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  transition: border-color 0.3s;
  background: white;
}

.input-group input:focus,
.input-group textarea:focus {
  outline: none;
  border-color: #007bff;
}

.input-group label {
  position: absolute;
  left: 1rem; 
  top: 1rem;
  background: white;
  padding: 0 0.4rem;
  color: #64748b;
  transition: all 0.3s;
  pointer-events: none;
  font-size: 1rem;
}

.input-group input:focus ~ label,
.input-group input:not(:placeholder-shown) ~ label,
.input-group textarea:focus ~ label,
.input-group textarea:not(:placeholder-shown) ~ label {
  top: -0.5rem;
  font-size: 0.85rem;
  color: #007bff;
  font-weight: 500;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.btn-cancel, .btn-submit {
  flex: 1;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel {
  background: #f8fafc;
  color: #475569;
  border: 2px solid #cbd5e1;
}

.btn-cancel:hover {
  background: #f1f5f9;
  border-color: #94a3b8;
}

.btn-submit {
  background: #007bff;
  color: white;
  border: 2px solid #007bff;
}

.btn-submit:hover:not(:disabled) {
  background: #0056b3;
  border-color: #0056b3;
}

.btn-submit:disabled {
  background: #9ca3af;
  border-color: #9ca3af;
  cursor: not-allowed;
  opacity: 0.7;
}

.fade-enter-active, .fade-leave-active { 
  transition: opacity 0.3s; 
}
.fade-enter-from, .fade-leave-to { 
  opacity: 0; 
}

/* Responsive */
@media (max-width: 768px) {
  .modal-actions {
    flex-direction: column;
  }
}
</style>