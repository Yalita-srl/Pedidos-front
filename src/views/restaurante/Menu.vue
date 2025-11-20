<template>
  <div class="restaurantes-admin">
    <div class="header">
      <h1>Mis Restaurantes</h1>
      <button @click="nuevoRestaurante" class="btn-primary">
        <i class="fas fa-plus"></i> Nuevo Restaurante
      </button>
    </div>

    <!-- Mensaje de éxito (fijo arriba) -->
    <transition name="fade">
      <div v-if="successMessage" class="success-message">
        <i class="fas fa-check-circle"></i> {{ successMessage }}
      </div>
    </transition>

    <!-- Loading -->
    <div v-if="loading" class="loading">
      <i class="fas fa-spinner fa-spin"></i> Cargando restaurantes...
    </div>

    <!-- Error -->
    <div v-else-if="error" class="error">
      <i class="fas fa-exclamation-triangle"></i> {{ error }}
      <button @click="cargarRestaurantes" class="btn-retry">Reintentar</button>
    </div>

    <!-- Empty -->
    <div v-else-if="restaurantes.length === 0" class="empty-state">
      <i class="fas fa-store-slash"></i>
      <h3>No tienes restaurantes registrados</h3>
      <p>Comienza creando tu primer restaurante</p>
      <button @click="nuevoRestaurante" class="btn-primary">
        Crear Primer Restaurante
      </button>
    </div>

    <!-- Lista de restaurantes (cards apiladas) -->
    <div v-else class="restaurantes-list">
      <div
        v-for="restaurante in restaurantes"
        :key="restaurante.id"
        class="restaurante-card"
        @click="verDetalles(restaurante.id)"
      >
        <div class="card-content">
          <!-- Header con nombre y estado -->
          <div class="card-header">
            <h3 class="nombre">{{ restaurante.nombre }}</h3>

            <button
              @click.stop="cambiarEstado(restaurante)"
              class="estado-btn"
              :class="restaurante.estado === 'Abierto' ? 'abierto' : 'cerrado'"
            >
              {{ restaurante.estado }}
              <span class="status-dot"></span>
            </button>
          </div>

          <!-- Información básica -->
          <div class="card-info">
            <div class="info-item">
              <i class="fas fa-map-marker-alt"></i>
              <span>{{ restaurante.direccion }}</span>
            </div>
            <div class="info-item">
              <i class="fas fa-phone"></i>
              <span>{{ restaurante.telefono }}</span>
            </div>
          </div>

          <!-- Estadísticas -->
          <div class="card-stats">
            <div class="stat">
              <span class="number">{{ restaurante.categorias.length }}</span>
              <span class="label">Categorías</span>
            </div>
            <div class="stat">
              <span class="number">{{ restaurante.productos.length }}</span>
              <span class="label">Productos</span>
            </div>
          </div>

          <!-- Acciones (sin el botón "Ver") -->
          <div class="card-actions">
            <button @click.stop="editarRestaurante(restaurante.id)" class="btn-outline">
              <i class="fas fa-edit"></i> Editar
            </button>
            <button @click.stop="eliminarRestaurante(restaurante.id)" class="btn-danger">
              <i class="fas fa-trash"></i> Eliminar
            </button>
          </div>
        </div>

        <!-- Flecha sutil para indicar que es clickable -->
        <div class="card-arrow">
          <i class="fas fa-chevron-right"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getRestaurantesPorUsuarioAdmin, deleteRestaurante,updateRestaurante } from '@/services/catalogoService'

const router = useRouter()
const restaurantes = ref([])
const loading = ref(false)
const error = ref('')
const successMessage = ref('')

// TODO: Cambiar por el ID del usuario autenticado
const usuarioAdminId = ref(1)

const cargarRestaurantes = async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await getRestaurantesPorUsuarioAdmin(usuarioAdminId.value)
    restaurantes.value = response.data

    successMessage.value = `${restaurantes.value.length} restaurante(s) cargado(s)`
    setTimeout(() => (successMessage.value = ''), 3000)
  } catch (err) {
    console.error(err)
    error.value = 'Error al cargar los restaurantes. Intenta nuevamente.'
  } finally {
    loading.value = false
  }
}

const verDetalles = (id) => {
  router.push({ name: 'RestauranteProductos', params: { id } })
}

const editarRestaurante = (id) => {
  router.push(`/restaurantes/${id}/editar`)
}

const nuevoRestaurante = () => {
  router.push('/restaurantes/nuevo')
}

const eliminarRestaurante = async (id) => {
  if (!confirm('¿Seguro que quieres eliminar este restaurante? Esta acción no se puede deshacer.')) return

  try {
    await deleteRestaurante(id)
    successMessage.value = 'Restaurante eliminado correctamente'
    await cargarRestaurantes()
    setTimeout(() => (successMessage.value = ''), 3000)
  } catch (err) {
    error.value = 'Error al eliminar el restaurante.'
  }
}

const cambiarEstado = async (restaurante) => {
  const nuevoEstado = restaurante.estado === 'Abierto' ? 'Cerrado' : 'Abierto';
  const confirmacion = confirm(`¿Estás seguro de cambiar el estado a ${nuevoEstado}?`);
  
  if (confirmacion) {
    try {
      // Assuming you have an updateRestaurante service method
      await updateRestaurante(restaurante.id, { 
        ...restaurante,
        estado: nuevoEstado 
      });
      
      // Update the local state
      const index = restaurantes.value.findIndex(r => r.id === restaurante.id);
      if (index !== -1) {
        restaurantes.value[index].estado = nuevoEstado;
      }
      
      // Show success message
      successMessage.value = `Estado actualizado a ${nuevoEstado} correctamente`;
      setTimeout(() => { successMessage.value = ''; }, 3000);
      
    } catch (error) {
      console.error('Error al actualizar el estado:', error);
      error.value = 'Error al actualizar el estado del restaurante';
    }
  }
};

onMounted(cargarRestaurantes)
</script>

<style scoped>
.restaurantes-admin {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 15px;
}

.header h1 {
  margin: 0;
  font-size: 2rem;
  color: #222;
}

.btn-primary {
  background: #007bff;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #0056b3;
}

/* Mensajes */
.success-message {
  position: fixed;
  top: 20px;
  right: 20px;
  background: #d4edda;
  color: #155724;
  padding: 12px 20px;
  border-radius: 8px;
  border: 1px solid #c3e6cb;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  animation: slideIn 0.4s ease;
}

@keyframes slideIn {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.loading, .error, .empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #666;
  font-size: 1.1rem;
}

.error { color: #dc3545; }
.empty-state i { font-size: 64px; color: #bbb; margin-bottom: 20px; }

/* Lista de cards apiladas */
.restaurantes-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.restaurante-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  align-items: center;
  position: relative;
}

.restaurante-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0,0,0,0.12);
  border-color: #007bff33;
}

.card-content {
  flex: 1;
  padding: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  gap: 16px;
}

.nombre {
  margin: 0;
  font-size: 1.5rem;
  color: #222;
  font-weight: 600;
}

.estado-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 30px;
  font-weight: 600;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.estado-btn.abierto {
  background: #d4edda;
  color: #155724;
}

.estado-btn.cerrado {
  background: #f8d7da;
  color: #721c24;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: currentColor;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.card-info {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: #555;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.95rem;
}

.info-item i {
  color: #007bff;
  width: 18px;
}

.card-stats {
  display: flex;
  gap: 30px;
  padding: 16px 0;
  border-top: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 20px;
}

.stat {
  text-align: center;
}

.number {
  display: block;
  font-size: 1.8rem;
  font-weight: 700;
  color: #007bff;
}

.label {
  font-size: 0.8rem;
  text-transform: uppercase;
  color: #777;
  letter-spacing: 0.5px;
}

.card-actions {
  display: flex;
  gap: 12px;
}

.btn-outline, .btn-danger {
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
}

.btn-outline {
  background: transparent;
  color: #007bff;
  border: 1.5px solid #007bff;
}

.btn-outline:hover {
  background: #007bff;
  color: white;
}

.btn-danger {
  background: #dc3545;
  color: white;
  border: none;
}

.btn-danger:hover {
  background: #c82333;
}

.card-arrow {
  padding: 0 24px;
  color: #007bff88;
  font-size: 1.5rem;
}

/* Responsive */
@media (max-width: 768px) {
  .header {
    flex-direction: column;
    text-align: center;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .card-stats {
    gap: 20px;
  }

  .card-actions {
    flex-direction: column;
  }
}
</style>