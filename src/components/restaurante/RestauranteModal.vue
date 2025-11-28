<template>
  <!-- Modal Overlay -->
  <transition name="modal-fade">
    <div v-if="modelValue" class="modal-overlay" @click.self="cerrar">
      <div class="modal-container" @click.stop>
        <!-- Header del Modal -->
        <div class="modal-header">
          <div class="header-content">
            <h2>
              <i :class="esEdicion ? 'fas fa-edit' : 'fas fa-plus-circle'"></i>
              {{ esEdicion ? 'Editar Restaurante' : 'Nuevo Restaurante' }}
            </h2>
            <p class="subtitle">
              {{ esEdicion ? 'Actualiza la información de tu restaurante' : 'Completa los datos para registrar tu restaurante' }}
            </p>
          </div>
          <button @click="cerrar" class="btn-close" type="button">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Contenido del Modal -->
        <div class="modal-body">
          <form @submit.prevent="guardarRestaurante" id="restaurante-form">
            
            <!-- Sección de Imagen -->
            <div class="form-section">
              <h3 class="section-title">
                <i class="fas fa-image"></i>
                Imagen del Restaurante
              </h3>
              
              <div class="image-upload-container">
                <!-- Preview de la imagen -->
                <div class="image-preview" :class="{ 'has-image': imagenPreview || restauranteData?.imagen_url }">
                  <div v-if="imagenPreview || restauranteData?.imagen_url" class="preview-content">
                    <img 
                      :src="imagenPreview || restauranteData?.imagen_url" 
                      alt="Preview"
                      class="preview-image"
                    />
                    <button 
                      type="button" 
                      @click="eliminarImagen" 
                      class="btn-remove-image"
                      title="Eliminar imagen"
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                  <div v-else class="preview-placeholder">
                    <i class="fas fa-image"></i>
                    <p>Vista previa de la imagen</p>
                    <small>Sube una imagen para tu restaurante</small>
                  </div>
                </div>

                <!-- Input de archivo -->
                <div class="upload-controls">
                  <input
                    type="file"
                    ref="imagenInput"
                    @change="manejarCambioImagen"
                    accept="image/*"
                    class="file-input"
                    id="imagen-upload"
                  />
                  <label for="imagen-upload" class="btn-upload">
                    <i class="fas fa-cloud-upload-alt"></i>
                    {{ imagenPreview || restauranteData?.imagen_url ? 'Cambiar imagen' : 'Seleccionar imagen' }}
                  </label>
                  <p class="upload-hint">
                    <i class="fas fa-info-circle"></i>
                    Formatos: JPG, PNG, GIF (Max: 5MB)
                  </p>
                </div>
              </div>
            </div>

            <!-- Información Básica -->
            <div class="form-section">
              <h3 class="section-title">
                <i class="fas fa-info-circle"></i>
                Información Básica
              </h3>
              
              <div class="form-grid">
                <!-- Nombre -->
                <div class="form-group full-width">
                  <label for="nombre">
                    <i class="fas fa-store"></i>
                    Nombre del Restaurante *
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    v-model="formData.nombre"
                    required
                    placeholder="Ej: La Casona del Chef"
                    :class="{ 'error': errores.nombre }"
                  />
                  <span v-if="errores.nombre" class="error-message">
                    <i class="fas fa-exclamation-circle"></i> {{ errores.nombre }}
                  </span>
                </div>

                <!-- Dirección -->
                <div class="form-group full-width">
                  <label for="direccion">
                    <i class="fas fa-map-marker-alt"></i>
                    Dirección *
                  </label>
                  <input
                    type="text"
                    id="direccion"
                    v-model="formData.direccion"
                    required
                    placeholder="Ej: Av. Principal #123, Centro"
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
                    placeholder="Ej: +591 12345678"
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
            </div>

          </form>
        </div>

        <!-- Footer del Modal -->
        <div class="modal-footer">
          <button 
            type="button" 
            @click="cerrar" 
            class="btn-secondary"
            :disabled="guardando"
          >
            <i class="fas fa-times"></i> Cancelar
          </button>
          <button 
            type="submit"
            form="restaurante-form"
            class="btn-primary"
            :disabled="guardando"
          >
            <i v-if="guardando" class="fas fa-spinner fa-spin"></i>
            <i v-else class="fas fa-save"></i>
            {{ guardando ? 'Guardando...' : (esEdicion ? 'Actualizar' : 'Crear Restaurante') }}
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue'

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  restauranteData: {
    type: Object,
    default: null
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'guardar'])

// Computed
const esEdicion = computed(() => !!props.restauranteData)

// Estados
const guardando = ref(false)
const imagenInput = ref(null)
const imagenPreview = ref('')
const imagenArchivo = ref(null)

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

// Watch para cargar datos en edición
watch(() => props.restauranteData, (newData) => {
  if (newData) {
    Object.assign(formData, {
      nombre: newData.nombre || '',
      direccion: newData.direccion || '',
      telefono: newData.telefono || '',
      estado: newData.estado || 'Abierto'
    })
    imagenPreview.value = ''
    imagenArchivo.value = null
  }
}, { immediate: true })

// Métodos
const cerrar = () => {
  if (!guardando.value) {
    emit('update:modelValue', false)
    resetearFormulario()
  }
}

const resetearFormulario = () => {
  Object.assign(formData, {
    nombre: '',
    direccion: '',
    telefono: '',
    estado: 'Abierto'
  })
  Object.keys(errores).forEach(key => errores[key] = '')
  imagenPreview.value = ''
  imagenArchivo.value = null
}

const validarFormulario = () => {
  let valido = true
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
  } else if (!/^[+\d\s()-]+$/.test(formData.telefono)) {
    errores.telefono = 'Formato de teléfono inválido'
    valido = false
  }

  if (!formData.estado) {
    errores.estado = 'El estado es requerido'
    valido = false
  }

  return valido
}

const manejarCambioImagen = (event) => {
  const file = event.target.files[0]
  if (!file) return

  // Validar tipo de archivo
  if (!file.type.startsWith('image/')) {
    alert('Por favor selecciona un archivo de imagen válido')
    return
  }

  // Validar tamaño (5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert('La imagen no debe superar los 5MB')
    return
  }

  imagenArchivo.value = file

  // Crear preview
  const reader = new FileReader()
  reader.onload = (e) => {
    imagenPreview.value = e.target.result
  }
  reader.readAsDataURL(file)
}

const eliminarImagen = () => {
  imagenPreview.value = ''
  imagenArchivo.value = null
  if (imagenInput.value) {
    imagenInput.value.value = ''
  }
}

const guardarRestaurante = async () => {
  if (!validarFormulario()) return;

  guardando.value = true;

  try {
    // 1. Crear objeto FormData
    const formDataObj = new FormData();
    
    // 2. Agregar campos del formulario
    Object.entries(formData).forEach(([key, value]) => {
      formDataObj.append(key, value);
    });

    // 3. Agregar imagen si existe
    if (imagenArchivo.value) {
      formDataObj.append('imagen', imagenArchivo.value);
    }

    // 4. Agregar usuario_admin_id (obtener del sistema de autenticación)
    const usuarioAdminId = 1; // Reemplazar con el ID del usuario autenticado
    formDataObj.append('usuario_admin_id', usuarioAdminId);

    // 5. Si es edición, agregar _method=PUT
    if (esEdicion.value) {
      formDataObj.append('_method', 'PUT');
    }

    // 6. Emitir los datos del formulario
    emit('guardar', {
      formData: formDataObj,
      id: esEdicion.value ? props.restauranteData.id : null
    });
    
    // Cerrar el modal después de un breve retraso
    setTimeout(() => {
      guardando.value = false;
      cerrar();
    }, 500);

  } catch (error) {
    console.error('Error al guardar:', error);
    guardando.value = false;
  }
};
</script>

<style scoped>
/* Modal Overlay */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  overflow-y: auto;
}

/* Modal Container */
.modal-container {
  background: white;
  border-radius: 20px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Modal Header */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px 32px;
  border-bottom: 2px solid #e5e7eb;
  gap: 16px;
}

.header-content {
  flex: 1;
}

.header-content h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-content h2 i {
  color: #4f46e5;
}

.subtitle {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
}

.btn-close {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: #f3f4f6;
  color: #6b7280;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.btn-close:hover {
  background: #e5e7eb;
  color: #1f2937;
  transform: scale(1.05);
}

/* Modal Body */
.modal-body {
  padding: 32px;
  overflow-y: auto;
  flex: 1;
}

/* Form Sections */
.form-section {
  margin-bottom: 32px;
}

.form-section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 12px;
  border-bottom: 2px solid #e5e7eb;
}

.section-title i {
  color: #4f46e5;
}

/* Image Upload */
.image-upload-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  align-items: start;
}

.image-preview {
  width: 100%;
  height: 240px;
  border: 3px dashed #d1d5db;
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s;
  background: #f9fafb;
}

.image-preview.has-image {
  border-style: solid;
  border-color: #4f46e5;
}

.preview-content {
  position: relative;
  width: 100%;
  height: 100%;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.btn-remove-image {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 36px;
  height: 36px;
  background: rgba(239, 68, 68, 0.95);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  backdrop-filter: blur(4px);
}

.btn-remove-image:hover {
  background: #dc2626;
  transform: scale(1.1);
}

.preview-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  text-align: center;
  padding: 20px;
}

.preview-placeholder i {
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.preview-placeholder p {
  margin: 4px 0;
  font-weight: 600;
  color: #6b7280;
}

.preview-placeholder small {
  color: #9ca3af;
  font-size: 12px;
}

.upload-controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.file-input {
  display: none;
}

.btn-upload {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 16px 24px;
  background: linear-gradient(135deg, #4f46e5, #4338ca);
  color: white;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.3);
}

.btn-upload:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.4);
}

.upload-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #6b7280;
  margin: 0;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
}

.upload-hint i {
  color: #4f46e5;
}

/* Form Grid */
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.full-width {
  grid-column: 1 / -1;
}

/* Form Groups */
.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-weight: 600;
  margin-bottom: 8px;
  color: #374151;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-group label i {
  color: #4f46e5;
  font-size: 14px;
}

.form-group input,
.form-group select {
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 15px;
  color: #1f2937;
  background: white;
  transition: all 0.2s;
  font-family: inherit;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
}

.form-group input.error,
.form-group select.error {
  border-color: #ef4444;
  background: #fef2f2;
}

.error-message {
  color: #ef4444;
  font-size: 13px;
  margin-top: 6px;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* Modal Footer */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 32px;
  border-top: 2px solid #e5e7eb;
  background: #f9fafb;
  border-radius: 0 0 20px 20px;
}

/* Buttons */
.btn-primary,
.btn-secondary {
  padding: 12px 24px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, #4f46e5, #4338ca);
  color: white;
  box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: white;
  color: #6b7280;
  border: 2px solid #e5e7eb;
}

.btn-secondary:hover:not(:disabled) {
  background: #f9fafb;
  color: #374151;
  border-color: #d1d5db;
}

/* Transitions */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .modal-container {
    max-height: 95vh;
    border-radius: 20px 20px 0 0;
    margin-top: auto;
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 20px;
  }

  .header-content h2 {
    font-size: 20px;
  }

  .image-upload-container {
    grid-template-columns: 1fr;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .modal-footer {
    flex-direction: column-reverse;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
    justify-content: center;
  }
}
</style>