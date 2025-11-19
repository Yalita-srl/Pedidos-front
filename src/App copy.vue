<template>
  <div class="restaurantes-container">
    <h1 class="page-title">Nuestros Restaurantes</h1>
    
    <div v-if="loading" class="loading">
      <p>Cargando restaurantes...</p>
    </div>

    <div v-else-if="error" class="error">
      <p>Error al cargar los restaurantes: {{ error }}</p>
      <button @click="fetchRestaurantes" class="retry-btn">Reintentar</button>
    </div>

    <div v-else class="restaurantes-grid">
      <div 
        v-for="restaurante in restaurantes" 
        :key="restaurante.id" 
        class="restaurante-card"
      >
        <!-- Información del restaurante -->
        <div class="restaurante-header">
          <h2 class="restaurante-nombre">{{ restaurante.nombre }}</h2>
          <span 
            :class="['estado-badge', restaurante.estado.toLowerCase()]"
          >
            {{ restaurante.estado }}
          </span>
        </div>

        <div class="restaurante-info">
          <p class="direccion">
            <i class="fas fa-map-marker-alt"></i>
            {{ restaurante.direccion }}
          </p>
          <p class="telefono">
            <i class="fas fa-phone"></i>
            {{ restaurante.telefono }}
          </p>
        </div>

        <!-- Categorías y productos -->
        <div class="menu-section">
          <h3 class="section-title">Menú</h3>
          
          <div v-if="restaurante.categorias.length === 0" class="no-menu">
            <p>Este restaurante no tiene menú disponible</p>
          </div>

          <div v-else class="categorias-container">
            <div 
              v-for="categoria in restaurante.categorias" 
              :key="categoria.id" 
              class="categoria"
            >
              <h4 class="categoria-nombre">{{ categoria.nombre }}</h4>
              
              <div class="productos-list">
                <div 
                  v-for="producto in getProductosPorCategoria(restaurante.productos, categoria.id)" 
                  :key="producto.id" 
                  :class="['producto-card', { 'no-disponible': !producto.disponible }]"
                >
                  <div class="producto-imagen" v-if="producto.imagen">
                    <img 
                      :src="getImagenUrl(producto.imagen)" 
                      :alt="producto.nombre"
                      @error="handleImageError"
                    />
                  </div>
                  <div class="producto-info">
                    <h5 class="producto-nombre">{{ producto.nombre }}</h5>
                    <p class="producto-descripcion">{{ producto.descripcion }}</p>
                    <div class="producto-precio-disponible">
                      <span class="precio">${{ producto.precio }}</span>
                      <span 
                        :class="['disponibilidad', producto.disponible ? 'disponible' : 'no-disponible']"
                      >
                        {{ producto.disponible ? 'Disponible' : 'No disponible' }}
                      </span>
                    </div>
                  </div>
                </div>

                <div 
                  v-if="getProductosPorCategoria(restaurante.productos, categoria.id).length === 0" 
                  class="no-productos"
                >
                  <p>No hay productos en esta categoría</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getRestaurantes } from '@/services/catalogoService';

export default {
  name: 'RestaurantesView',
  data() {
    return {
      restaurantes: [],
      loading: false,
      error: null
    };
  },
  mounted() {
    this.fetchRestaurantes();
  },
  methods: {
    async fetchRestaurantes() {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await getRestaurantes();
        this.restaurantes = response.data;
      } catch (error) {
        console.error('Error fetching restaurantes:', error);
        this.error = error.message || 'Error al cargar los restaurantes';
      } finally {
        this.loading = false;
      }
    },

    getProductosPorCategoria(productos, categoriaId) {
      return productos.filter(producto => producto.categoria_id === categoriaId);
    },

    getImagenUrl(imagenPath) {
      // Asumiendo que las imágenes están almacenadas en el backend
      return `http://localhost:8000/storage/${imagenPath}`;
    },

    handleImageError(event) {
      // Reemplazar imagen rota por una placeholder
      event.target.src = 'https://via.placeholder.com/150x150?text=Imagen+No+Disponible';
    }
  }
};
</script>

<style scoped>
.restaurantes-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-title {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
  font-size: 2.5rem;
}

.loading, .error {
  text-align: center;
  padding: 40px;
  font-size: 1.2rem;
}

.error {
  color: #d32f2f;
}

.retry-btn {
  background-color: #1976d2;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 10px;
}

.retry-btn:hover {
  background-color: #1565c0;
}

.restaurantes-grid {
  display: grid;
  gap: 30px;
}

.restaurante-card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 25px;
  border-left: 5px solid #1976d2;
}

.restaurante-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 15px;
}

.restaurante-nombre {
  color: #333;
  margin: 0;
  font-size: 1.8rem;
}

.estado-badge {
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: bold;
}

.estado-badge.abierto {
  background-color: #4caf50;
  color: white;
}

.estado-badge.cerrado {
  background-color: #f44336;
  color: white;
}

.restaurante-info {
  margin-bottom: 20px;
}

.direccion, .telefono {
  margin: 5px 0;
  color: #666;
  display: flex;
  align-items: center;
  gap: 8px;
}

.menu-section {
  margin-top: 20px;
}

.section-title {
  color: #333;
  border-bottom: 2px solid #1976d2;
  padding-bottom: 8px;
  margin-bottom: 20px;
  font-size: 1.4rem;
}

.no-menu {
  text-align: center;
  color: #999;
  padding: 20px;
  font-style: italic;
}

.categorias-container {
  display: grid;
  gap: 25px;
}

.categoria {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
}

.categoria-nombre {
  color: #1976d2;
  margin: 0 0 15px 0;
  font-size: 1.3rem;
  border-bottom: 1px solid #dee2e6;
  padding-bottom: 10px;
}

.productos-list {
  display: grid;
  gap: 15px;
}

.producto-card {
  display: flex;
  gap: 15px;
  background: white;
  border-radius: 8px;
  padding: 15px;
  border-left: 3px solid #4caf50;
  transition: transform 0.2s, box-shadow 0.2s;
}

.producto-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.producto-card.no-disponible {
  border-left-color: #9e9e9e;
  opacity: 0.7;
}

.producto-imagen {
  flex-shrink: 0;
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
}

.producto-imagen img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.producto-info {
  flex: 1;
}

.producto-nombre {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 1.1rem;
}

.producto-descripcion {
  margin: 0 0 10px 0;
  color: #666;
  font-size: 0.9rem;
  line-height: 1.4;
}

.producto-precio-disponible {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.precio {
  font-weight: bold;
  color: #1976d2;
  font-size: 1.1rem;
}

.disponibilidad {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
}

.disponibilidad.disponible {
  background-color: #e8f5e8;
  color: #4caf50;
}

.disponibilidad.no-disponible {
  background-color: #ffebee;
  color: #f44336;
}

.no-productos {
  text-align: center;
  color: #999;
  padding: 20px;
  font-style: italic;
}

/* Responsive */
@media (max-width: 768px) {
  .restaurantes-container {
    padding: 10px;
  }

  .restaurante-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .producto-card {
    flex-direction: column;
  }

  .producto-imagen {
    width: 100%;
    height: 150px;
  }

  .producto-precio-disponible {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
}
</style>