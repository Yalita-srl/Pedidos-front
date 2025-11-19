<template>
  <div class="restaurantes-container">
    <div class="header">
      <h1>Restaurantes Disponibles</h1>
      <p class="subtitle">Descubre nuestros restaurantes y sus deliciosos menús</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Cargando restaurantes...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <span class="error-icon">⚠️</span>
      <p>{{ error }}</p>
      <button @click="fetchRestaurantes" class="btn-retry">Reintentar</button>
    </div>

    <!-- Restaurantes Grid -->
    <div v-else class="restaurantes-grid">
      <div 
        v-for="restaurante in restaurantes" 
        :key="restaurante.id" 
        class="restaurante-card"
        :class="{ 'cerrado': restaurante.estado === 'Cerrado' }"
      >
        <!-- Estado Badge -->
        <div class="estado-badge" :class="restaurante.estado === 'Abierto' ? 'abierto' : 'cerrado'">
          <span class="status-dot"></span>
          {{ restaurante.estado }}
        </div>

        <!-- Información del Restaurante -->
        <div class="card-content">
          <h2 class="restaurante-nombre">{{ restaurante.nombre }}</h2>
          
          <div class="info-item">
            <span class="icon">📍</span>
            <span>{{ restaurante.direccion }}</span>
          </div>
          
          <div class="info-item">
            <span class="icon">📞</span>
            <span>{{ restaurante.telefono }}</span>
          </div>

          <!-- Estadísticas -->
          <div class="stats">
            <div class="stat-item">
              <span class="stat-number">{{ restaurante.categorias?.length || 0 }}</span>
              <span class="stat-label">Categorías</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <span class="stat-number">{{ restaurante.productos?.length || 0 }}</span>
              <span class="stat-label">Productos</span>
            </div>
          </div>

          <!-- Botón Ver Menú -->
          <button 
            @click="verMenu(restaurante.id)" 
            class="btn-menu"
            :disabled="restaurante.estado === 'Cerrado'"
          >
            <span class="btn-icon">🍽️</span>
            Ver Menú
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="restaurantes.length === 0" class="empty-state">
        <span class="empty-icon">🏪</span>
        <h3>No hay restaurantes disponibles</h3>
        <p>Vuelve pronto para ver nuestros restaurantes</p>
      </div>
    </div>
  </div>
</template>

<script>
import { getRestaurantes } from '@/services/catalogoService';

export default {
  name: 'RestaurantesLista',
  data() {
    return {
      restaurantes: [],
      loading: true,
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
        console.error('Error al cargar restaurantes:', error);
        this.error = 'No se pudieron cargar los restaurantes. Por favor, intenta de nuevo.';
      } finally {
        this.loading = false;
      }
    },
    verMenu(restauranteId) {
      // Usar this.$router que estará disponible después de configurar Vue Router
      this.$router.push({ 
        name: 'RestauranteMenu', 
        params: { id: restauranteId } 
      });
    }
  }
};
</script>

<style scoped>
.restaurantes-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.header {
  text-align: center;
  margin-bottom: 3rem;
}

.header h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #7f8c8d;
  font-size: 1.1rem;
}

/* Loading State */
.loading-container {
  text-align: center;
  padding: 4rem 2rem;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Error State */
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
  transition: background 0.3s;
}

.btn-retry:hover {
  background: #c0392b;
}

/* Restaurantes Grid */
.restaurantes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;
}

.restaurante-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
  position: relative;
}

.restaurante-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.restaurante-card.cerrado {
  opacity: 0.7;
}

.estado-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  z-index: 1;
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

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.card-content {
  padding: 2rem;
  padding-top: 3rem;
}

.restaurante-nombre {
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  color: #555;
}

.icon {
  font-size: 1.25rem;
}

.stats {
  display: flex;
  align-items: center;
  justify-content: space-around;
  margin: 1.5rem 0;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-number {
  font-size: 1.75rem;
  font-weight: bold;
  color: #3498db;
}

.stat-label {
  font-size: 0.875rem;
  color: #7f8c8d;
  margin-top: 0.25rem;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: #ddd;
}

.btn-menu {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: transform 0.2s, box-shadow 0.3s;
}

.btn-menu:hover:not(:disabled) {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-menu:disabled {
  background: #95a5a6;
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-icon {
  font-size: 1.25rem;
}

/* Empty State */
.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 4rem 2rem;
}

.empty-icon {
  font-size: 4rem;
  display: block;
  margin-bottom: 1rem;
}

.empty-state h3 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #7f8c8d;
}

/* Responsive */
@media (max-width: 768px) {
  .restaurantes-container {
    padding: 1rem;
  }

  .header h1 {
    font-size: 2rem;
  }

  .restaurantes-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}
</style>