<template>
  <div class="restaurante-form">
    <div class="header">
      <div class="header-content">
        <h1>{{ esEdicion ? 'Editar Restaurante' : 'Nuevo Restaurante' }}</h1>
        <p class="subtitle">{{ esEdicion ? 'Actualiza la información de tu restaurante' : 'Completa los datos para registrar tu restaurante' }}</p>
      </div>
      <button @click="volverALista" class="btn-secondary">
        <i class="fas fa-arrow-left"></i> Volver
      </button>
    </div>

    <!-- Formulario -->
    <form @submit.prevent="guardarRestaurante" class="form-container">
      <div class="form-grid">
        <!-- Nombre -->
        <div class="form-group">
          <label for="nombre">
            <i class="fas fa-store"></i>
            Nombre del Restaurante *
          </label>
          <input
            type="text"
            id="nombre"
            v-model="formData.nombre"
            required
            placeholder="Ingresa el nombre del restaurante"
            :class="{ 'error': errores.nombre }"
          />
          <span v-if="errores.nombre" class="error-message">
            <i class="fas fa-exclamation-circle"></i> {{ errores.nombre }}
          </span>
        </div>

        <!-- Dirección -->
        <div class="form-group">
          <label for="direccion">
            <i class="fas fa-map-marker-alt"></i>
            Dirección *
          </label>
          <input
            type="text"
            id="direccion"
            v-model="formData.direccion"
            required
            placeholder="Ingresa la dirección completa"
            :class="{ 'error': errores.direccion }"
          />
          <span v-if="errores.direccion" class="error-message">
            <i class="fas fa-exclamation-circle"></i> {{ errores.direccion }}
          </span>
        </div>

        <!-- Teléfono -->
        <div class="form-group">
          <label for="telefono">
            <i class="fas fa-phone"></i>
            Teléfono *
          </label>
          <input
            type="tel"
            id="telefono"
            v-model="formData.telefono"
            required
            placeholder="Ingresa el número de teléfono"
            :class="{ 'error': errores.telefono }"
          />
          <span v-if="errores.telefono" class="error-message">
            <i class="fas fa-exclamation-circle"></i> {{ errores.telefono }}
          </span>
        </div>

        <!-- Estado -->
        <div class="form-group">
          <label for="estado">
            <i class="fas fa-toggle-on"></i>
            Estado *
          </label>
          <select
            id="estado"
            v-model="formData.estado"
            required
            :class="{ 'error': errores.estado }"
          >
            <option value="">Selecciona un estado</option>
            <option value="Abierto">🟢 Abierto</option>
            <option value="Cerrado">🔴 Cerrado</option>
            <option value="En mantenimiento">🟡 En mantenimiento</option>
          </select>
          <span v-if="errores.estado" class="error-message">
            <i class="fas fa-exclamation-circle"></i> {{ errores.estado }}
          </span>
        </div>
      </div>

      <!-- Sección de Categorías (solo en edición) -->
      <div v-if="esEdicion" class="categorias-section">
        <div class="section-header">
          <div>
            <h3><i class="fas fa-list"></i> Categorías del Menú</h3>
            <p class="section-subtitle">Organiza los productos de tu menú</p>
          </div>
          <button type="button" @click="mostrarModalCategoria = true" class="btn-primary">
            <i class="fas fa-plus"></i> Agregar Categoría
          </button>
        </div>
        
        <div v-if="categorias.length === 0" class="empty-categories">
          <i class="fas fa-inbox fa-3x"></i>
          <p>No hay categorías registradas</p>
          <small>Agrega categorías para organizar tu menú</small>
        </div>
        
        <div v-else class="categorias-list">
          <div 
            v-for="categoria in categorias" 
            :key="categoria.id" 
            class="categoria-item"
          >
            <div class="categoria-info">
              <i class="fas fa-tag"></i>
              <span>{{ categoria.nombre }}</span>
            </div>
            <div class="categoria-actions">
              <button 
                type="button" 
                @click="editarCategoria(categoria)"
                class="btn-icon btn-edit"
                title="Editar"
              >
                <i class="fas fa-edit"></i>
              </button>
              <button 
                type="button" 
                @click="eliminarCategoria(categoria.id)"
                class="btn-icon btn-delete"
                title="Eliminar"
              >
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Botones de acción -->
      <div class="form-actions">
        <button 
          type="button" 
          @click="volverALista" 
          class="btn-secondary"
          :disabled="guardando"
        >
          <i class="fas fa-times"></i> Cancelar
        </button>
        <button 
          type="submit" 
          class="btn-primary"
          :disabled="guardando"
        >
          <i v-if="guardando" class="fas fa-spinner fa-spin"></i>
          <i v-else class="fas fa-save"></i>
          {{ guardando ? 'Guardando...' : (esEdicion ? 'Actualizar' : 'Crear Restaurante') }}
        </button>
      </div>
    </form>

    <!-- Modal para Categorías -->
    <CategoriaModal
      v-if="mostrarModalCategoria"
      :categoria="categoriaEditando"
      :restauranteId="restauranteId"
      @guardar="guardarCategoria"
      @cerrar="cerrarModalCategoria"
    />

    <!-- Mensajes de éxito/error -->
    <transition name="slide-fade">
      <div v-if="mensajeExito" class="message success-message">
        <i class="fas fa-check-circle"></i> 
        <span>{{ mensajeExito }}</span>
      </div>
    </transition>

    <transition name="slide-fade">
      <div v-if="mensajeError" class="message error-message-alert">
        <i class="fas fa-exclamation-triangle"></i> 
        <span>{{ mensajeError }}</span>
      </div>
    </transition>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { 
  createRestaurante, 
  updateRestaurante, 
  getRestaurante,
  getCategoriasPorRestaurante,
  createCategoriaMenu,
  updateCategoriaMenu,
  deleteCategoriaMenu
} from '@/services/catalogoService'
import CategoriaModal from './CategoriaModal.vue'

export default {
  name: 'RestauranteForm',
  components: {
    CategoriaModal
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    
    const esEdicion = computed(() => route.name === 'EditarRestaurante')
    const restauranteId = computed(() => route.params.id)

    // Estados
    const guardando = ref(false)
    const mensajeExito = ref('')
    const mensajeError = ref('')
    const mostrarModalCategoria = ref(false)
    const categoriaEditando = ref(null)
    const categorias = ref([])

    // Datos del formulario
    const formData = reactive({
      nombre: '',
      direccion: '',
      telefono: '',
      estado: 'Abierto'
    })

    // Errores
    const errores = reactive({
      nombre: '',
      direccion: '',
      telefono: '',
      estado: ''
    })

    // Obtener datos del restaurante para edición
    const cargarRestaurante = async () => {
      if (!esEdicion.value) return

      try {
        const response = await getRestaurante(restauranteId.value)
        const restaurante = response.data
        
        Object.assign(formData, {
          nombre: restaurante.nombre,
          direccion: restaurante.direccion,
          telefono: restaurante.telefono,
          estado: restaurante.estado
        })

        // Cargar categorías
        await cargarCategorias()
      } catch (error) {
        console.error('Error al cargar restaurante:', error)
        mensajeError.value = 'Error al cargar los datos del restaurante'
      }
    }

    // Cargar categorías del restaurante
    const cargarCategorias = async () => {
      if (!esEdicion.value) return

      try {
        const response = await getCategoriasPorRestaurante(restauranteId.value)
        categorias.value = response.data
      } catch (error) {
        console.error('Error al cargar categorías:', error)
      }
    }

    // Validar formulario
    const validarFormulario = () => {
      let valido = true
      
      // Resetear errores
      Object.keys(errores).forEach(key => errores[key] = '')

      if (!formData.nombre.trim()) {
        errores.nombre = 'El nombre es requerido'
        valido = false
      }

      if (!formData.direccion.trim()) {
        errores.direccion = 'La dirección es requerida'
        valido = false
      }

      if (!formData.telefono.trim()) {
        errores.telefono = 'El teléfono es requerido'
        valido = false
      }

      if (!formData.estado) {
        errores.estado = 'El estado es requerido'
        valido = false
      }

      return valido
    }

    // Guardar restaurante (crear o actualizar)
    const guardarRestaurante = async () => {
      if (!validarFormulario()) return

      guardando.value = true
      mensajeError.value = ''

      try {
        if (esEdicion.value) {
          await updateRestaurante(restauranteId.value, formData)
          mensajeExito.value = 'Restaurante actualizado correctamente'
        } else {
          // Obtener el ID del usuario admin (ajustar según tu sistema)
          const usuarioAdminId = 1 // Cambiar por el ID real
          const datosCompletos = {
            ...formData,
            usuario_admin_id: usuarioAdminId
          }
          
          await createRestaurante(datosCompletos)
          mensajeExito.value = 'Restaurante creado correctamente'
        }

        // Redirigir después de guardar
        setTimeout(() => {
          router.push('/mis-restaurantes')
        }, 1500)

      } catch (error) {
        console.error('Error al guardar restaurante:', error)
        mensajeError.value = error.response?.data?.message || 'Error al guardar el restaurante'
      } finally {
        guardando.value = false
      }
    }

    // Funciones para categorías
    const editarCategoria = (categoria) => {
      categoriaEditando.value = categoria
      mostrarModalCategoria.value = true
    }

    const eliminarCategoria = async (categoriaId) => {
      if (!confirm('¿Estás seguro de que deseas eliminar esta categoría?')) {
        return
      }

      try {
        await deleteCategoriaMenu(categoriaId)
        await cargarCategorias()
        mensajeExito.value = 'Categoría eliminada correctamente'
      } catch (error) {
        console.error('Error al eliminar categoría:', error)
        mensajeError.value = 'Error al eliminar la categoría'
      }
    }

    const guardarCategoria = async (categoriaData) => {
      try {
        if (categoriaData.id) {
          await updateCategoriaMenu(categoriaData.id, categoriaData)
        } else {
          await createCategoriaMenu(categoriaData)
        }
        
        await cargarCategorias()
        cerrarModalCategoria()
        mensajeExito.value = 'Categoría guardada correctamente'
      } catch (error) {
        console.error('Error al guardar categoría:', error)
        mensajeError.value = 'Error al guardar la categoría'
      }
    }

    const cerrarModalCategoria = () => {
      mostrarModalCategoria.value = false
      categoriaEditando.value = null
    }

    const volverALista = () => {
      router.push('/mis-restaurantes')
    }

    onMounted(() => {
      cargarRestaurante()
    })

    return {
      esEdicion,
      restauranteId,
      formData,
      errores,
      guardando,
      mensajeExito,
      mensajeError,
      categorias,
      mostrarModalCategoria,
      categoriaEditando,
      guardarRestaurante,
      editarCategoria,
      eliminarCategoria,
      guardarCategoria,
      cerrarModalCategoria,
      volverALista
    }
  }
}
</script>

<style scoped>
/* Variables de color - Forzando especificidad */
.restaurante-form {
  --primary-color: #4f46e5;
  --primary-dark: #4338ca;
  --primary-light: #818cf8;
  --secondary-color: #64748b;
  --success-color: #10b981;
  --danger-color: #ef4444;
  --warning-color: #f59e0b;
  --background: #f8fafc;
  --surface: #ffffff;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --border-color: #e2e8f0;
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

* {
  box-sizing: border-box;
}

.restaurante-form {
  max-width: 900px;
  margin: 0 auto;
  padding: 32px 24px;
  background: var(--background);
  min-height: 100vh;
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  gap: 24px;
}

.header-content h1 {
  margin: 0 0 8px 0;
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary);
  background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  margin: 0;
  color: var(--text-secondary);
  font-size: 15px;
}

/* Formulario */
.form-container {
  background: var(--surface);
  padding: 32px;
  border-radius: 16px;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-color);
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-bottom: 32px;
}

/* Form Groups */
.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--text-primary);
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: color 0.2s;
}

.form-group label i {
  color: var(--primary-color);
  font-size: 16px;
}

.form-group input,
.form-group select {
  padding: 12px 16px;
  border: 2px solid var(--border-color);
  border-radius: 10px;
  font-size: 15px;
  color: var(--text-primary);
  background: var(--surface);
  transition: all 0.3s ease;
  font-family: inherit;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
  transform: translateY(-1px);
}

.form-group input::placeholder {
  color: #94a3b8;
}

.form-group input:hover,
.form-group select:hover {
  border-color: var(--primary-light);
}

.form-group input.error,
.form-group select.error {
  border-color: var(--danger-color);
  background: #fef2f2;
}

.error-message {
  color: var(--danger-color);
  font-size: 13px;
  margin-top: 6px;
  display: flex;
  align-items: center;
  gap: 6px;
  animation: shake 0.3s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

/* Sección de Categorías */
.categorias-section {
  margin: 32px 0;
  padding: 24px;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  background: linear-gradient(to bottom, #faf5ff, var(--surface));
  transition: all 0.3s ease;
}

.categorias-section:hover {
  border-color: var(--primary-light);
  box-shadow: var(--shadow-md);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 16px;
}

.section-header h3 {
  margin: 0 0 4px 0;
  color: var(--text-primary);
  font-size: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-header h3 i {
  color: var(--primary-color);
}

.section-subtitle {
  margin: 0;
  color: var(--text-secondary);
  font-size: 13px;
}

.empty-categories {
  text-align: center;
  color: var(--text-secondary);
  padding: 48px 24px;
  background: var(--surface);
  border-radius: 10px;
  border: 2px dashed var(--border-color);
}

.empty-categories i {
  color: var(--border-color);
  margin-bottom: 16px;
}

.empty-categories p {
  margin: 8px 0 4px 0;
  font-weight: 500;
  color: var(--text-primary);
}

.empty-categories small {
  color: var(--text-secondary);
}

/* Lista de Categorías */
.categorias-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.categoria-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: var(--surface);
  border-radius: 10px;
  border: 2px solid var(--border-color);
  transition: all 0.3s ease;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.categoria-item:hover {
  border-color: var(--primary-color);
  box-shadow: var(--shadow-md);
  transform: translateX(4px);
}

.categoria-info {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 500;
  color: var(--text-primary);
}

.categoria-info i {
  color: var(--primary-color);
  font-size: 18px;
}

.categoria-actions {
  display: flex;
  gap: 8px;
}

/* Botones */
button {
  border: none;
  cursor: pointer;
  font-family: inherit;
  font-weight: 600;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
}

.btn-primary {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  color: white;
  padding: 12px 24px;
  border-radius: 10px;
  font-size: 15px;
  box-shadow: var(--shadow-md);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  background: linear-gradient(135deg, var(--primary-dark), var(--primary-color));
}

.btn-primary:active:not(:disabled) {
  transform: translateY(0);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: var(--surface);
  color: var(--text-secondary);
  padding: 12px 24px;
  border-radius: 10px;
  font-size: 15px;
  border: 2px solid var(--border-color);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--background);
  border-color: var(--secondary-color);
  color: var(--text-primary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

.btn-icon {
  padding: 10px;
  border-radius: 8px;
  font-size: 14px;
  width: 36px;
  height: 36px;
}

.btn-edit {
  background: #eff6ff;
  color: #2563eb;
  border: 1px solid #bfdbfe;
}

.btn-edit:hover {
  background: #dbeafe;
  transform: scale(1.1);
}

.btn-delete {
  background: #fef2f2;
  color: var(--danger-color);
  border: 1px solid #fecaca;
}

.btn-delete:hover {
  background: #fee2e2;
  transform: scale(1.1);
}

/* Form Actions */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 2px solid var(--border-color);
}

/* Mensajes */
.message {
  padding: 16px 20px;
  border-radius: 10px;
  margin-top: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 500;
  box-shadow: var(--shadow-md);
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.success-message {
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
  color: #065f46;
  border: 2px solid #6ee7b7;
}

.success-message i {
  font-size: 20px;
}

.error-message-alert {
  background: linear-gradient(135deg, #fee2e2, #fecaca);
  color: #991b1b;
  border: 2px solid #fca5a5;
}

.error-message-alert i {
  font-size: 20px;
}

/* Transitions */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.3s ease-in;
}

.slide-fade-enter-from {
  transform: translateY(-20px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .restaurante-form {
    padding: 20px 16px;
  }

  .form-container {
    padding: 24px 20px;
  }

  .form-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .header {
    flex-direction: column;
    gap: 16px;
  }

  .header-content h1 {
    font-size: 26px;
  }

  .btn-secondary {
    width: 100%;
  }
  
  .section-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .section-header button {
    width: 100%;
  }
  
  .form-actions {
    flex-direction: column-reverse;
  }

  .form-actions button {
    width: 100%;
  }

  .categoria-item {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .categoria-actions {
    justify-content: flex-end;
  }
}

@media (max-width: 480px) {
  .header-content h1 {
    font-size: 22px;
  }

  .form-container {
    padding: 20px 16px;
  }
}
</style>