<template>
  <div class="modal-overlay" @click.self="cerrar">
    <div class="modal-content">
      <div class="modal-header">
        <h3>{{ categoriaData.id ? 'Editar Categoría' : 'Nueva Categoría' }}</h3>
        <button @click="cerrar" class="btn-close">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <form @submit.prevent="guardar">
        <div class="modal-body">
          <div class="form-group">
            <label for="nombreCategoria">Nombre de la Categoría *</label>
            <input
              type="text"
              id="nombreCategoria"
              v-model="categoriaData.nombre"
              required
              placeholder="Ingresa el nombre de la categoría"
            />
          </div>
        </div>

        <div class="modal-actions">
          <button type="button" @click="cerrar" class="btn-secondary">
            Cancelar
          </button>
          <button type="submit" class="btn-primary">
            {{ categoriaData.id ? 'Actualizar' : 'Crear' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { reactive, onMounted } from 'vue'

export default {
  name: 'CategoriaModal',
  props: {
    categoria: {
      type: Object,
      default: () => ({})
    },
    restauranteId: {
      type: [String, Number],
      required: true
    }
  },
  emits: ['guardar', 'cerrar'],
  setup(props, { emit }) {
    const categoriaData = reactive({
      id: null,
      nombre: '',
      restaurante_id: props.restauranteId
    })

    const guardar = () => {
      emit('guardar', { ...categoriaData })
    }

    const cerrar = () => {
      emit('cerrar')
    }

    onMounted(() => {
      if (props.categoria && props.categoria.id) {
        Object.assign(categoriaData, {
          id: props.categoria.id,
          nombre: props.categoria.nombre,
          restaurante_id: props.categoria.restaurante_id || props.restauranteId
        })
      }
    })

    return {
      categoriaData,
      guardar,
      cerrar
    }
  }
}
</script>