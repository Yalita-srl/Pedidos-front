<!-- src/components/admin/ProductoModal.vue -->
<template>
  <div class="modal-overlay" @click="cerrar">
    <div class="modal-card" @click.stop>
      <div class="modal-header">
        <h2>{{ producto?.id ? 'Editar Producto' : 'Nuevo Producto' }}</h2>
        <button @click="cerrar" class="btn-close">×</button>
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
          </div>
          <div v-else-if="producto?.imagen" class="image-preview">
            <img :src="getImagenUrl(producto.imagen)" alt="Actual" />
            <small>Imagen actual</small>
          </div>
        </div>

        <div class="modal-actions">
          <button type="button" @click="cerrar" class="btn-cancel">Cancelar</button>
          <button type="submit" class="btn-submit" :disabled="guardando">
            <i v-if="guardando" class="fas fa-spinner fa-spin"></i>
            {{ guardando ? 'Guardando...' : 'Guardar Producto' }}
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

const emit = defineEmits(['cerrar', 'guardado']) // Cambiado a 'guardado'

const form = reactive({
  nombre: '',
  precio: '',
  descripcion: '',
  categoria_id: null,
  disponible: true,
  imagen: null
})

const previewUrl = ref('')
const guardando = ref(false)

watch(() => props.producto, (nuevo) => {
  if (nuevo) {
    form.nombre = nuevo.nombre || ''
    form.precio = Number(nuevo.precio) || ''
    form.descripcion = nuevo.descripcion || ''
    form.categoria_id = nuevo.categoria_id || null
    form.disponible = nuevo.disponible !== false
    form.imagen = null
    previewUrl.value = ''
  } else {
    // Reset form
    form.nombre = ''
    form.precio = ''
    form.descripcion = ''
    form.categoria_id = null
    form.disponible = true
    form.imagen = null
    previewUrl.value = ''
  }
}, { immediate: true })

const onFileChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    form.imagen = file
    previewUrl.value = URL.createObjectURL(file)
  }
}

const getImagenUrl = (img) => `http://localhost:8000/storage/${img}`

const guardar = async () => {
  if (!form.categoria_id) {
    alert('Por favor selecciona una categoría')
    return
  }

  guardando.value = true
  try {
    const formData = new FormData()
    formData.append('nombre', form.nombre)
    formData.append('precio', form.precio)
    formData.append('descripcion', form.descripcion || '')
    formData.append('categoria_id', form.categoria_id)
    formData.append('disponible', form.disponible ? '1' : '0')
    formData.append('restaurante_id', props.restauranteId)

    if (form.imagen) {
      formData.append('imagen', form.imagen)
    }

    if (props.producto?.id) {
      await updateProducto(props.producto.id, formData)
    } else {
      await createProducto(formData)
    }

    emit('guardado')  // Emitimos evento correcto
    emit('cerrar')
  } catch (err) {
    console.error('Error al guardar producto:', err)
    alert('Error al guardar el producto. Verifica los datos.')
  } finally {
    guardando.value = false
  }
}

const cerrar = () => emit('cerrar')
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

.modal-header h2 { margin: 0; font-size: 1.6rem; }

.btn-close {
  width: 40px; height: 40px; border-radius: 50%; background: #f1f5f9; border: none;
  font-size: 1.5rem; cursor: pointer;
}

.modal-form { padding: 2rem; }

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.input-group {
  position: relative;
}

.input-group input,
.input-group select,
.input-group textarea {
  width: 100%;
  padding: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
}

.input-group label {
  position: absolute;
  left: 1rem; top: 1rem;
  background: white;
  padding: 0 0.4rem;
  color: #64748b;
  transition: all 0.3s;
  pointer-events: none;
}

.input-group input:focus ~ label,
.input-group input:not(:placeholder-shown) ~ label,
.input-group select:not([value=""]) ~ label,
.input-group textarea:not(:placeholder-shown) ~ label {
  top: -0.5rem;
  font-size: 0.85rem;
  color: #007bff;
}

.checkbox label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  position: static;
}

.file label { position: static; display: block; margin-bottom: 0.5rem; }

.image-preview {
  margin-top: 1rem;
  text-align: center;
}

.image-preview img {
  max-height: 150px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.btn-cancel, .btn-submit {
  flex: 1;
  padding: 1rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
}

.btn-cancel {
  background: #f1f5f9;
  color: #64748b;
  border: 2px solid #cbd5e0;
}

.btn-submit {
  background: #007bff;
  color: white;
  border: none;
}

.btn-submit:hover { background: #0056b3; }
</style>