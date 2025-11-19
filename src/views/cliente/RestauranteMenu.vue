<template>
  <div class="menu-container">
    <!-- Botón Volver -->
    <button @click="volver" class="btn-volver">
      <span class="icon-back">←</span> Volver a Restaurantes
    </button>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Cargando menú...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <span class="error-icon">⚠️</span>
      <p>{{ error }}</p>
      <button @click="fetchRestaurante" class="btn-retry">Reintentar</button>
    </div>

    <!-- Contenido del Menú -->
    <div v-else-if="restaurante">
      <!-- Header del Restaurante -->
      <div class="restaurante-header">
        <div class="header-content">
          <h1>{{ restaurante.nombre }}</h1>
          <div class="restaurante-info">
            <span class="info-badge">
              <span class="icon">📍</span> {{ restaurante.direccion }}
            </span>
            <span class="info-badge">
              <span class="icon">📞</span> {{ restaurante.telefono }}
            </span>
            <span 
              class="estado-badge" 
              :class="restaurante.estado === 'Abierto' ? 'abierto' : 'cerrado'"
            >
              <span class="status-dot"></span>
              {{ restaurante.estado }}
            </span>
          </div>
        </div>
      </div>

      <!-- Filtros por Categoría -->
      <div class="filtros-container" v-if="restaurante.categorias && restaurante.categorias.length > 0">
        <h3>Filtrar por categoría</h3>
        <div class="categorias-tabs">
          <button 
            @click="categoriaSeleccionada = null"
            class="tab-btn"
            :class="{ active: categoriaSeleccionada === null }"
          >
            Todas
          </button>
          <button 
            v-for="categoria in restaurante.categorias" 
            :key="categoria.id"
            @click="categoriaSeleccionada = categoria.id"
            class="tab-btn"
            :class="{ active: categoriaSeleccionada === categoria.id }"
          >
            {{ categoria.nombre }}
          </button>
        </div>
      </div>

      <!-- Lista de Productos -->
      <div class="productos-section">
        <h2 class="section-title">
          {{ categoriaSeleccionada ? getNombreCategoria(categoriaSeleccionada) : 'Nuestro Menú' }}
          <span class="productos-count">({{ productosFiltrados.length }} productos)</span>
        </h2>

        <!-- Grid de Productos -->
        <div v-if="productosFiltrados.length > 0" class="productos-grid">
          <div 
            v-for="producto in productosFiltrados" 
            :key="producto.id"
            class="producto-card"
            :class="{ 'no-disponible': !producto.disponible }"
          >
            <!-- Imagen del Producto -->
            <div class="producto-imagen">
              <img 
                v-if="producto.imagen" 
                :src="getImagenUrl(producto.imagen)" 
                :alt="producto.nombre"
                @error="handleImageError"
              />
              <div v-else class="imagen-placeholder">
                <span class="placeholder-icon">🍽️</span>
              </div>
              
              <!-- Badge de Disponibilidad -->
              <div v-if="!producto.disponible" class="badge-no-disponible">
                No disponible
              </div>
            </div>

            <!-- Información del Producto -->
            <div class="producto-info">
              <div class="producto-header">
                <h3 class="producto-nombre">{{ producto.nombre }}</h3>
                <span class="producto-precio">Bs. {{ formatPrice(producto.precio) }}</span>
              </div>
              
              <p class="producto-descripcion">{{ producto.descripcion }}</p>
              
              <div class="producto-categoria">
                <span class="categoria-tag">
                  {{ getNombreCategoria(producto.categoria_id) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="empty-productos">
          <span class="empty-icon">🍴</span>
          <h3>No hay productos disponibles</h3>
          <p>{{ categoriaSeleccionada ? 'En esta categoría no hay productos' : 'Este restaurante aún no tiene productos en su menú' }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getRestaurante } from '@/services/catalogoService';
import { useRouter, useRoute } from 'vue-router';

export default {
  name: 'RestauranteMenu',
  setup() {
    const router = useRouter();
    const route = useRoute();
    return { router, route };
  },
  data() {
    return {
      restaurante: null,
      loading: true,
      error: null,
      categoriaSeleccionada: null
    };
  },
  computed: {
    productosFiltrados() {
      if (!this.restaurante || !this.restaurante.productos) return [];
      
      if (this.categoriaSeleccionada === null) {
        return this.restaurante.productos;
      }
      
      return this.restaurante.productos.filter(
        producto => producto.categoria_id === this.categoriaSeleccionada
      );
    }
  },
  mounted() {
    this.fetchRestaurante();
  },
  methods: {
    async fetchRestaurante() {
      this.loading = true;
      this.error = null;
      
      try {
        const restauranteId = this.route.params.id;
        const response = await getRestaurante(restauranteId);
        this.restaurante = response.data;
      } catch (error) {
        console.error('Error al cargar el restaurante:', error);
        this.error = 'No se pudo cargar el menú del restaurante. Por favor, intenta de nuevo.';
      } finally {
        this.loading = false;
      }
    },
    volver() {
      // Opción 1: Navegar por nombre de ruta
      this.router.push({ name: 'Restaurantes' });
      
      // Opción 2: Navegar por path directo
      // this.router.push('/restaurantes');
      
      // Opción 3: Volver atrás en el historial
      // this.router.back();
    },
    getNombreCategoria(categoriaId) {
      if (!this.restaurante || !this.restaurante.categorias) return '';
      const categoria = this.restaurante.categorias.find(c => c.id === categoriaId);
      return categoria ? categoria.nombre : 'Sin categoría';
    },
    getImagenUrl(imagen) {
      // Ajusta esta URL según tu configuración de backend
      return `http://localhost:8000/storage/${imagen}`;
    },
    handleImageError(event) {
      event.target.style.display = 'none';
      event.target.parentElement.innerHTML = '<div class="imagen-placeholder"><span class="placeholder-icon">🍽️</span></div>';
    },
    formatPrice(precio) {
      return parseFloat(precio).toFixed(2);
    }
  }
};
</script>

<style scoped>
.menu-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

/* Botón Volver */
.btn-volver {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 2rem;
}

.btn-volver:hover {
  background: #667eea;
  color: white;
  transform: translateX(-5px);
}

.icon-back {
  font-size: 1.25rem;
}

/* Loading & Error States */
.loading-container {
  text-align: center;
  padding: 4rem 2rem;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-container {
  text-align: center;
  padding: 3rem;
  background: #fee;
  border-radius: 12px;
  color: #c33;
}

.error-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 1rem;
}

.btn-retry {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
}

/* Header del Restaurante */
.restaurante-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 3rem 2rem;
  border-radius: 16px;
  margin-bottom: 2rem;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
}

.header-content h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.restaurante-info {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
}

.info-badge {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  backdrop-filter: blur(10px);
}

.estado-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.estado-badge.abierto {
  background: #d4edda;
  color: #155724;
}

.estado-badge.cerrado {
  background: #f8d7da;
  color: #721c24;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
  animation: pulse 2s infinite;
}

/* Filtros */
.filtros-container {
  margin-bottom: 2rem;
}

.filtros-container h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.categorias-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.tab-btn {
  padding: 0.75rem 1.5rem;
  background: white;
  color: #555;
  border: 2px solid #e0e0e0;
  border-radius: 25px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
}

.tab-btn:hover {
  border-color: #667eea;
  color: #667eea;
}

.tab-btn.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

/* Sección de Productos */
.productos-section {
  margin-top: 2rem;
}

.section-title {
  font-size: 2rem;
  color: #2c3e50;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.productos-count {
  font-size: 1rem;
  color: #7f8c8d;
  font-weight: normal;
}

/* Grid de Productos */
.productos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.producto-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
}

.producto-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.producto-card.no-disponible {
  opacity: 0.7;
}

.producto-imagen {
  width: 100%;
  height: 200px;
  position: relative;
  overflow: hidden;
  background: #f8f9fa;
}

.producto-imagen img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.producto-card:hover .producto-imagen img {
  transform: scale(1.1);
}

.imagen-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.placeholder-icon {
  font-size: 4rem;
  opacity: 0.5;
}

.badge-no-disponible {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: #e74c3c;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
}

.producto-info {
  padding: 1.5rem;
}

.producto-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
  gap: 1rem;
}

.producto-nombre {
  font-size: 1.25rem;
  color: #2c3e50;
  flex: 1;
}

.producto-precio {
  font-size: 1.5rem;
  font-weight: bold;
  color: #667eea;
  white-space: nowrap;
}

.producto-descripcion {
  color: #7f8c8d;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.producto-categoria {
  display: flex;
  align-items: center;
}

.categoria-tag {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  background: #e8eaf6;
  color: #667eea;
  border-radius: 15px;
  font-size: 0.875rem;
  font-weight: 600;
}

/* Empty State */
.empty-productos {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.empty-icon {
  font-size: 4rem;
  display: block;
  margin-bottom: 1rem;
}

.empty-productos h3 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.empty-productos p {
  color: #7f8c8d;
}

/* Responsive */
@media (max-width: 768px) {
  .menu-container {
    padding: 1rem;
  }

  .restaurante-header {
    padding: 2rem 1.5rem;
  }

  .header-content h1 {
    font-size: 1.75rem;
  }

  .restaurante-info {
    flex-direction: column;
    align-items: flex-start;
  }

  .productos-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .section-title {
    font-size: 1.5rem;
    flex-direction: column;
    align-items: flex-start;
  }

  .categorias-tabs {
    overflow-x: auto;
    flex-wrap: nowrap;
    padding-bottom: 0.5rem;
  }

  .tab-btn {
    white-space: nowrap;
  }
}
</style>