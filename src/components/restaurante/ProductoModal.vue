<template>
  <div class="modal-overlay" @click="cerrar">
    <div class="modal-card" @click.stop>
      <div class="modal-header">
        <h2>{{ producto?.id ? 'Editar Producto' : 'Nuevo Producto' }}</h2>
        <button @click="cerrar" class="btn-close">×</button>
      </div>

      <!-- Mensaje de error -->
      <div v-if="error" class="error-message">
        <i class="fas fa-exclamation-circle"></i>
        {{ error }}
      </div>

      <form @submit.prevent="guardar" class="modal-form">
        <div class="form-grid">
          <div class="input-group">
            <input type="text" v-model="form.nombre" required placeholder=" " />
            <label>Nombre del producto *</label>
          </div>

          <div class="input-group">
            <input type="number" step="0.01" v-model.number="form.precio" required placeholder=" " />
            <label>Precio (Bs.) *</label>
          </div>

          <div class="input-group">
            <select v-model="form.categoria_id" required>
              <option :value="null" disabled>Selecciona una categoría</option>
              <option v-for="cat in categorias" :key="cat.id" :value="cat.id">
                {{ cat.nombre }}
              </option>
            </select>
            <label>Categoría *</label>
          </div>

          <div class="input-group checkbox">
            <label>
              <input type="checkbox" v-model="form.disponible" />
              <span>Producto disponible</span>
            </label>
          </div>
        </div>

        <div class="input-group textarea">
          <textarea v-model="form.descripcion" rows="4" placeholder=" "></textarea>
          <label>Descripción (opcional)</label>
        </div>

        <div class="input-group file">
          <label>Imagen del producto</label>
          <input type="file" accept="image/*" @change="onFileChange" />
          <div v-if="previewUrl" class="image-preview">
            <img :src="previewUrl" alt="Vista previa" />
            <small>Vista previa de la nueva imagen</small>
          </div>
          <div v-else-if="producto?.imagen" class="image-preview">
            <img :src="getImagenUrl(producto.imagen)" alt="Actual" />
            <small>Imagen actual</small>
          </div>
          <div v-else class="image-preview">
            <div class="no-image">
              <i class="fas fa-image"></i>
              <small>No hay imagen seleccionada</small>
            </div>
          </div>
        </div>

        <div class="modal-actions">
          <button type="button" @click="cerrar" class="btn-cancel">Cancelar</button>
          <button type="submit" class="btn-submit" :disabled="guardando">
            <i v-if="guardando" class="fas fa-spinner fa-spin"></i>
            {{ guardando ? 'Guardando...' : (producto?.id ? 'Actualizar Producto' : 'Guardar Producto') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { createProducto, updateProducto } from '@/services/catalogoService'

const props = defineProps({
  producto: Object,
  categorias: Array,
  restauranteId: [String, Number]
})

const emit = defineEmits(['cerrar', 'guardado'])

const form = reactive({
  nombre: '',
  precio: 0,
  descripcion: '',
  categoria_id: null,
  disponible: true,
  imagen: null
})

const previewUrl = ref('')
const guardando = ref(false)
const error = ref(null)

// Cargar datos del producto cuando cambie el prop
watch(() => props.producto, (nuevo) => {
  if (nuevo) {
    console.log('Cargando producto para editar:', nuevo)
    form.nombre = nuevo.nombre || ''
    form.precio = parseFloat(nuevo.precio) || 0
    form.descripcion = nuevo.descripcion || ''
    form.categoria_id = nuevo.categoria_id || null
    form.disponible = nuevo.disponible !== false
    form.imagen = null
    previewUrl.value = ''
  } else {
    // Resetear formulario para nuevo producto
    console.log('Preparando formulario para nuevo producto')
    Object.assign(form, {
      nombre: '',
      precio: 0,
      descripcion: '',
      categoria_id: null,
      disponible: true,
      imagen: null
    })
    previewUrl.value = ''
  }
}, { immediate: true })

const onFileChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    form.imagen = file
    previewUrl.value = URL.createObjectURL(file)
    console.log('Imagen seleccionada:', file.name)
  }
}

const getImagenUrl = (img) => {
  if (!img) return ''
  return `http://localhost:8000/storage/${img}`
}

const guardar = async () => {
  // Validaciones frontend
  if (!form.nombre.trim()) {
    error.value = 'El nombre del producto es obligatorio'
    return
  }

  if (!form.precio || form.precio <= 0) {
    error.value = 'El precio debe ser mayor a 0'
    return
  }

  if (!form.categoria_id) {
    error.value = 'Por favor selecciona una categoría'
    return
  }

  guardando.value = true
  error.value = null

  try {
    const formData = new FormData()
    
    // Agregar campos al FormData
    formData.append('nombre', form.nombre.trim())
    formData.append('precio', form.precio)
    formData.append('descripcion', form.descripcion.trim())
    formData.append('categoria_id', form.categoria_id)
    formData.append('disponible', form.disponible ? '1' : '0')
    formData.append('restaurante_id', props.restauranteId)

    // Solo agregar imagen si se seleccionó una nueva
    if (form.imagen instanceof File) {
      console.log('Agregando imagen al formulario:', form.imagen.name)
      formData.append('imagen', form.imagen)
    } else if (props.producto?.id) {
      console.log('No se seleccionó nueva imagen, manteniendo la actual')
    }

    let response
    if (props.producto?.id) {
      console.log('🔄 Actualizando producto existente ID:', props.producto.id)
      
      // DEBUG: Mostrar datos que se enviarán
      console.log('Datos a enviar:')
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value)
      }
      
      response = await updateProducto(props.producto.id, formData)
      console.log('✅ Producto actualizado exitosamente:', response.data)
    } else {
      console.log('🆕 Creando nuevo producto')
      
      // DEBUG: Mostrar datos que se enviarán
      console.log('Datos a enviar:')
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value)
      }
      
      response = await createProducto(formData)
      console.log('✅ Producto creado exitosamente:', response.data)
    }

    // Emitir evento con el producto actualizado/creado
    emit('guardado', response.data)
    emit('cerrar')
    
  } catch (err) {
    console.error('❌ Error completo al guardar el producto:', err)
    
    if (err.response) {
      console.error('📡 Respuesta de error del servidor:', err.response.data)
      console.error('📊 Status:', err.response.status)
      console.error('🔧 Headers:', err.response.headers)
      
      const serverError = err.response.data
      
      if (serverError.errors) {
        // Mostrar errores de validación del servidor
        const firstError = Object.values(serverError.errors)[0]
        error.value = Array.isArray(firstError) ? firstError[0] : firstError
        console.error('🚨 Errores de validación:', serverError.errors)
      } else if (serverError.message) {
        error.value = serverError.message
      } else {
        error.value = 'Error del servidor al guardar el producto'
      }
    } else if (err.request) {
      console.error('🌐 Error de red:', err.request)
      error.value = 'No se pudo conectar con el servidor. Verifica tu conexión.'
    } else {
      console.error('⚡ Error inesperado:', err.message)
      error.value = 'Error inesperado al guardar el producto: ' + err.message
    }
  } finally {
    guardando.value = false
  }
}

const cerrar = () => {
  emit('cerrar')
}
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
  max-width: 600px;
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
  font-size: 1.6rem; 
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

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.input-group {
  position: relative;
  margin-bottom: 1rem;
}

.input-group input,
.input-group select,
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
.input-group select:focus,
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
.input-group select:focus ~ label,
.input-group select:not([value=""]) ~ label,
.input-group textarea:focus ~ label,
.input-group textarea:not(:placeholder-shown) ~ label {
  top: -0.5rem;
  font-size: 0.85rem;
  color: #007bff;
  font-weight: 500;
}

.checkbox label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  position: static;
  padding: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  transition: border-color 0.3s;
}

.checkbox input[type="checkbox"] {
  width: auto;
}

.checkbox label:hover {
  border-color: #cbd5e1;
}

.file label { 
  position: static; 
  display: block; 
  margin-bottom: 0.5rem; 
  font-weight: 500;
  color: #374151;
}

.file input[type="file"] {
  padding: 0.75rem;
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  width: 100%;
  background: #f9fafb;
}

.image-preview {
  margin-top: 1rem;
  text-align: center;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #f8fafc;
}

.image-preview img {
  max-height: 150px;
  max-width: 100%;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.image-preview small {
  display: block;
  margin-top: 0.5rem;
  color: #6b7280;
  font-size: 0.875rem;
}

.no-image {
  color: #9ca3af;
  padding: 2rem;
}

.no-image i {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
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

.error-message {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 1rem 2rem;
  margin: 0 2rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
}

/* Responsive */
@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-actions {
    flex-direction: column;
  }
}
</style>