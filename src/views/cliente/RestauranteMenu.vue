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
    <div v-else-if="restaurante" class="main-content">
      <!-- Header del Restaurante -->
      <div class="restaurante-header">
        <div class="header-content">
          <div class="header-top">
            <h1>{{ restaurante.nombre }}</h1>
            <div v-if="tieneProductosDeEsteRestaurante" class="carrito-activo-badge">
              <span class="badge-icon">🛒</span>
              Tienes {{ totalItemsDeEsteRestaurante }} items en tu pedido
            </div>
          </div>
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

      <!-- Aviso de múltiples restaurantes -->
      <div v-if="tieneProductosDeOtrosRestaurantes" class="aviso-otros-restaurantes">
        <div class="aviso-content">
          <span class="aviso-icon">ℹ️</span>
          <div class="aviso-text">
            <strong>Tu pedido actual incluye productos de otros restaurantes</strong>
            <p>Puedes seguir añadiendo productos de este restaurante a tu pedido existente</p>
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
            :class="{ 
              'no-disponible': !producto.disponible, 
              'en-carrito': estaEnCarrito(producto.id) 
            }"
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
              
              <!-- Badge de producto en carrito -->
              <div v-if="estaEnCarrito(producto.id)" class="badge-en-carrito">
                En pedido: {{ cantidadEnCarrito(producto.id) }}
              </div>
            </div>

            <!-- Información del Producto -->
            <div class="producto-info">
              <div class="producto-header">
                <h3 class="producto-nombre">{{ producto.nombre }}</h3>
                <span class="producto-precio">Bs. {{ formatPrice(producto.precio) }}</span>
              </div>
              
              <p class="producto-descripcion">{{ producto.descripcion }}</p>
              
              <!-- Controles de Cantidad -->
              <div class="producto-controls" v-if="producto.disponible">
                <div class="cantidad-controls">
                  <button 
                    @click="decrementarCantidad(producto)" 
                    class="cantidad-btn"
                    :disabled="getCantidadProducto(producto.id) === 0"
                  >
                    -
                  </button>
                  <span class="cantidad-display">{{ getCantidadProducto(producto.id) }}</span>
                  <button 
                    @click="incrementarCantidad(producto)" 
                    class="cantidad-btn"
                  >
                    +
                  </button>
                </div>
                <button 
                  @click="agregarAlCarrito(producto)" 
                  class="btn-agregar"
                  :disabled="getCantidadProducto(producto.id) === 0"
                >
                  <span class="icon-cart">🛒</span>
                  {{ estaEnCarrito(producto.id) ? 'Actualizar' : 'Añadir al pedido' }}
                </button>
              </div>
              
              <div v-else class="producto-no-disponible">
                <span class="no-disponible-text">Producto no disponible</span>
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

    <!-- Componente del Carrito Reutilizable -->
    <CarritoSidebar
      :abierto="carritoVisible"
      @abrir="onCarritoAbierto"
      @cerrar="onCarritoCerrado"
      @realizar-pedido="realizarPedido"
    />
  </div>
</template>

<script>
import { getRestaurante } from '@/services/catalogoService';
import { useRouter, useRoute } from 'vue-router';
import { useCarritoStore } from '@/stores/carritoStore';
import CarritoSidebar from '@/components/cliente/Carrito.vue';

export default {
  name: 'RestauranteMenu',
  components: {
    CarritoSidebar
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const carritoStore = useCarritoStore();
    return { router, route, carritoStore };
  },
  data() {
    return {
      restaurante: null,
      loading: true,
      error: null,
      categoriaSeleccionada: null,
      carritoVisible: false,
      cantidades: {}
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
    },
    
    tieneProductosDeEsteRestaurante() {
      return this.carritoStore.items.some(item => 
        item.restaurante.id === this.restaurante?.id
      );
    },
    
    totalItemsDeEsteRestaurante() {
      return this.carritoStore.items
        .filter(item => item.restaurante.id === this.restaurante?.id)
        .reduce((total, item) => total + item.cantidad, 0);
    },
    
    tieneProductosDeOtrosRestaurantes() {
      return this.carritoStore.items.some(item => 
        item.restaurante.id !== this.restaurante?.id
      );
    },
    
    otrosRestaurantesEnCarrito() {
      return this.carritoStore.restaurantesEnCarrito.filter(
        restaurante => restaurante.id !== this.restaurante?.id
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
      this.router.push({ name: 'Restaurantes' });
    },
    
    getNombreCategoria(categoriaId) {
      if (!this.restaurante || !this.restaurante.categorias) return '';
      const categoria = this.restaurante.categorias.find(c => c.id === categoriaId);
      return categoria ? categoria.nombre : 'Sin categoría';
    },
    
    getImagenUrl(imagen) {
      return `http://localhost:8000/storage/${imagen}`;
    },
    
    handleImageError(event) {
      event.target.style.display = 'none';
      event.target.parentElement.innerHTML = '<div class="imagen-placeholder"><span class="placeholder-icon">🍽️</span></div>';
    },
    
    formatPrice(precio) {
      return parseFloat(precio).toFixed(2);
    },
    
    // Métodos para manejar las cantidades temporales
    getCantidadProducto(productoId) {
      return this.cantidades[productoId] || this.cantidadEnCarrito(productoId) || 0;
    },
    
    incrementarCantidad(producto) {
      if (!this.cantidades[producto.id]) {
        this.cantidades[producto.id] = this.cantidadEnCarrito(producto.id) || 0;
      }
      this.cantidades[producto.id]++;
    },
    
    decrementarCantidad(producto) {
      if (!this.cantidades[producto.id]) {
        this.cantidades[producto.id] = this.cantidadEnCarrito(producto.id) || 0;
      }
      if (this.cantidades[producto.id] > 0) {
        this.cantidades[producto.id]--;
      }
    },
    
    // Métodos para el carrito único
    agregarAlCarrito(producto) {
      const cantidad = this.getCantidadProducto(producto.id);
      
      if (cantidad <= 0) {
        alert('Por favor, selecciona al menos 1 producto');
        return;
      }
      
      this.carritoStore.agregarProducto(
        producto, 
        cantidad, 
        {
          id: this.restaurante.id,
          nombre: this.restaurante.nombre,
          direccion: this.restaurante.direccion,
          telefono: this.restaurante.telefono
        }
      );
      
      // Resetear la cantidad temporal
      this.cantidades[producto.id] = 0;
      
      // Mostrar el carrito automáticamente
      this.carritoVisible = true;
    },
    
    estaEnCarrito(productoId) {
      return this.carritoStore.productoEnCarrito(productoId);
    },
    
    cantidadEnCarrito(productoId) {
      return this.carritoStore.cantidadProducto(productoId);
    },
    
    // Métodos para eventos del carrito
    onCarritoAbierto() {
      this.carritoVisible = true;
    },
    
    onCarritoCerrado() {
      this.carritoVisible = false;
    },
    
    // Métodos para realizar pedidos
    realizarPedido(pedidoData) {
      console.log('Datos del pedido completo:', pedidoData);
      
      const numRestaurantes = pedidoData.restaurantes.length;
      let mensaje = `¡Pedido realizado con éxito!\n\n`;
      
      if (numRestaurantes > 1) {
        mensaje += `Tu pedido incluye productos de ${numRestaurantes} restaurantes:\n`;
        pedidoData.restaurantes.forEach(rest => {
          mensaje += `• ${rest.nombre}\n`;
        });
        mensaje += `\n`;
      }
      
      mensaje += `Total: Bs. ${this.formatPrice(pedidoData.total)}\n\n`;
      mensaje += `Gracias por tu compra.`;
      
      alert(mensaje);
      
      // Limpiar carrito después del pedido
      this.carritoStore.limpiarCarrito();
      this.carritoVisible = false;
    }
  }
};
</script>

<style scoped>
.menu-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  position: relative;
}

.main-content {
  transition: transform 0.3s ease;
}

.carrito-abierto .main-content {
  transform: translateX(-20px);
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

/* Controles de cantidad y añadir al carrito */
.producto-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
}

.cantidad-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.cantidad-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid #667eea;
  background: white;
  color: #667eea;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.cantidad-btn:hover:not(:disabled) {
  background: #667eea;
  color: white;
}

.cantidad-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cantidad-display {
  font-size: 1.2rem;
  font-weight: bold;
  min-width: 30px;
  text-align: center;
}

.btn-agregar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-agregar:hover:not(:disabled) {
  background: #388E3C;
  transform: translateY(-2px);
}

.btn-agregar:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.producto-no-disponible {
  margin-top: 1rem;
  text-align: center;
}

.no-disponible-text {
  color: #e74c3c;
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

/* Carrito Lateral */
.carrito-sidebar {
  position: fixed;
  top: 0;
  right: -400px;
  width: 380px;
  height: 100vh;
  background: white;
  box-shadow: -5px 0 15px rgba(0, 0, 0, 0.1);
  transition: right 0.3s ease;
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.carrito-sidebar.carrito-abierto {
  right: 0;
}

.carrito-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
}

.carrito-header h3 {
  margin: 0;
  color: #2c3e50;
}

.btn-cerrar-carrito {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #7f8c8d;
  transition: color 0.2s;
}

.btn-cerrar-carrito:hover {
  color: #e74c3c;
}

.carrito-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.carrito-items {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.carrito-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.item-info {
  flex: 1;
}

.item-nombre {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  color: #2c3e50;
}

.item-precio {
  margin: 0;
  font-size: 0.9rem;
  color: #667eea;
  font-weight: 600;
}

.item-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.cantidad-controls-mini {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.cantidad-btn-mini {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 1px solid #667eea;
  background: white;
  color: #667eea;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cantidad-btn-mini:hover {
  background: #667eea;
  color: white;
}

.cantidad-display-mini {
  font-size: 0.9rem;
  font-weight: bold;
  min-width: 20px;
  text-align: center;
}

.btn-eliminar {
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  color: #e74c3c;
  transition: transform 0.2s;
}

.btn-eliminar:hover {
  transform: scale(1.2);
}

.carrito-vacio {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
}

.carrito-vacio-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.carrito-vacio p {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
}

.carrito-vacio-sub {
  color: #7f8c8d !important;
  font-size: 0.9rem;
}

.carrito-resumen {
  padding: 1.5rem;
  border-top: 1px solid #eee;
  background: #f9f9f9;
}

.resumen-linea {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.resumen-linea.total {
  font-weight: bold;
  font-size: 1.2rem;
  border-top: 1px solid #ddd;
  padding-top: 0.75rem;
  margin-top: 0.75rem;
}

.btn-pedir {
  width: 100%;
  padding: 1rem;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  margin-top: 1rem;
  transition: background 0.3s;
}

.btn-pedir:hover {
  background: #388E3C;
}

/* Overlay del carrito */
.carrito-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

/* Botón flotante del carrito */
.btn-carrito-flotante {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #667eea;
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  z-index: 998;
  transition: all 0.3s;
}

.btn-carrito-flotante:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.5);
}

.carrito-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #e74c3c;
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: bold;
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

  .carrito-sidebar {
    width: 100%;
    right: -100%;
  }

  .producto-controls {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .cantidad-controls {
    justify-content: center;
  }

  .btn-carrito-flotante {
    bottom: 1rem;
    right: 1rem;
  }

  .btn-pedir.personalizado {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.btn-pedir.personalizado:hover {
  background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
}
.aviso-otros-restaurantes {
  background: #e3f2fd;
  border: 1px solid #bbdefb;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.aviso-content {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.aviso-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.aviso-text {
  flex: 1;
}

.aviso-text strong {
  color: #1976d2;
  display: block;
  margin-bottom: 0.25rem;
}

.aviso-text p {
  margin: 0;
  color: #546e7a;
  font-size: 0.9rem;
}
}
</style>