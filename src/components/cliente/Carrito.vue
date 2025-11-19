<template>
  <div>
    <!-- Carrito Lateral -->
    <div class="carrito-sidebar" :class="{ 'carrito-abierto': carritoVisible }">
      <div class="carrito-header">
        <h3>Mi Pedido</h3>
        <div v-if="carritoStore.tieneMultiplesRestaurantes" class="multi-restaurante-badge">
          {{ Object.keys(carritoStore.itemsPorRestaurante).length }} restaurantes
        </div>
        <button @click="cerrarCarrito" class="btn-cerrar-carrito">
          <span class="icon-close">×</span>
        </button>
      </div>
      
      <div class="carrito-content">
        <div v-if="carritoStore.items.length > 0" class="carrito-items">
          <div 
            v-for="grupo in carritoStore.itemsPorRestaurante" 
            :key="grupo.restaurante.id"
            class="restaurante-grupo"
          >
            <div class="restaurante-header-grupo">
              <h4 class="restaurante-nombre">{{ grupo.restaurante.nombre }}</h4>
              <span class="restaurante-subtotal">
                Subtotal: {{ formatoMoneda(grupo.subtotal) }}
              </span>
            </div>
            
            <div class="productos-restaurante">
              <div 
                v-for="item in grupo.items" 
                :key="item.producto.id"
                class="carrito-item"
              >
                <div class="item-info">
                  <h4 class="item-nombre">{{ item.producto.nombre }}</h4>
                  <p class="item-precio">{{ formatoMoneda(item.producto.precio) }} x {{ item.cantidad }}</p>
                  <p class="item-subtotal">
                    {{ formatoMoneda(item.producto.precio * item.cantidad) }}
                  </p>
                </div>
                <div class="item-controls">
                  <div class="cantidad-controls-mini">
                    <button 
                      @click="decrementarCantidad(item)" 
                      class="cantidad-btn-mini"
                    >
                      -
                    </button>
                    <span class="cantidad-display-mini">{{ item.cantidad }}</span>
                    <button 
                      @click="incrementarCantidad(item)" 
                      class="cantidad-btn-mini"
                    >
                      +
                    </button>
                  </div>
                  <button 
                    @click="eliminarItem(item)" 
                    class="btn-eliminar"
                    title="Eliminar del carrito"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div v-else class="carrito-vacio">
          <span class="carrito-vacio-icon">🛒</span>
          <p>Tu carrito está vacío</p>
          <p class="carrito-vacio-sub">Añade productos de cualquier restaurante</p>
        </div>
        
        <div v-if="carritoStore.items.length > 0" class="carrito-resumen">
          <div class="resumen-linea">
            <span>Subtotal:</span>
            <span>{{ formatoMoneda(carritoStore.subtotal) }}</span>
          </div>
          
          <div v-if="carritoStore.tieneMultiplesRestaurantes" class="aviso-multi-restaurante">
            <span class="aviso-icon">ℹ️</span>
            <span>Pedido con {{ Object.keys(carritoStore.itemsPorRestaurante).length }} restaurantes</span>
          </div>
          
          <div class="resumen-linea">
            <span>Envío:</span>
            <span>{{ formatoMoneda(calcularEnvio()) }}</span>
          </div>
          
          <div class="resumen-linea total">
            <span>Total:</span>
            <span>{{ formatoMoneda(total) }}</span>
          </div>
          
          <button class="btn-pedir" @click="realizarPedido">
            Realizar Pedido - {{ formatoMoneda(total) }}
          </button>
        </div>
      </div>
    </div>
    
    <div 
      v-if="carritoVisible && mostrarOverlay" 
      class="carrito-overlay" 
      @click="cerrarCarrito"
    ></div>
    
    <button 
      class="btn-carrito-flotante"
      @click="abrirCarrito"
      :title="tooltipCarrito"
    >
      <span class="carrito-icon">🛒</span>
      <span v-if="carritoStore.totalItems > 0" class="carrito-badge">
        {{ carritoStore.totalItems }}
      </span>
    </button>
  </div>
</template>

<script>
import { useCarritoStore } from '@/stores/carritoStore';

export default {
  name: 'CarritoSidebar',
  props: {
    mostrarOverlay: {
      type: Boolean,
      default: true
    }
  },
  setup() {
    const carritoStore = useCarritoStore();
    return { carritoStore };
  },
  data() {
    return {
      carritoVisible: false
    };
  },
  computed: {
    total() {
      return this.carritoStore.subtotal + this.calcularEnvio();
    },
    
    tooltipCarrito() {
      if (this.carritoStore.items.length === 0) {
        return 'Carrito vacío';
      }
      
      const grupos = this.carritoStore.itemsPorRestaurante;
      return Object.values(grupos).map(grupo => 
        `${grupo.restaurante.nombre}: ${grupo.items.reduce((sum, item) => sum + item.cantidad, 0)} items`
      ).join('\n');
    }
  },
  methods: {
    abrirCarrito() {
      this.carritoVisible = true;
    },
    
    cerrarCarrito() {
      this.carritoVisible = false;
    },
    
    incrementarCantidad(item) {
      this.carritoStore.actualizarCantidad(item.producto.id, item.cantidad + 1);
    },
    
    decrementarCantidad(item) {
      this.carritoStore.actualizarCantidad(item.producto.id, item.cantidad - 1);
    },
    
    eliminarItem(item) {
      this.carritoStore.eliminarProducto(item.producto.id);
    },
    
    realizarPedido() {
      // Emitir evento para que el componente padre maneje el pedido
      this.$emit('realizar-pedido', {
        items: this.carritoStore.items,
        restaurantes: Object.values(this.carritoStore.itemsPorRestaurante).map(g => g.restaurante),
        subtotal: this.carritoStore.subtotal,
        envio: this.calcularEnvio(),
        total: this.total
      });
    },
    
    calcularEnvio() {
      if (this.carritoStore.subtotal === 0) return 0;
      
      const numRestaurantes = Object.keys(this.carritoStore.itemsPorRestaurante).length;
      const envioBase = 15;
      const envioAdicional = 5;
      
      return numRestaurantes === 1 ? envioBase : envioBase + (envioAdicional * (numRestaurantes - 1));
    },
    
    formatoMoneda(valor) {
      return `Bs. ${parseFloat(valor).toFixed(2)}`;
    }
  }
};
</script>

<style scoped>
/* Los estilos se mantienen igual */
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

.multi-restaurante-badge {
  background: #ff9800;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

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
  align-items: flex-start;
  padding: 1rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.item-info {
  flex: 1;
  margin-right: 1rem;
}

.item-nombre {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  color: #2c3e50;
}

.item-precio {
  margin: 0 0 0.25rem 0;
  font-size: 0.9rem;
  color: #667eea;
  font-weight: 600;
}

.item-subtotal {
  margin: 0;
  font-size: 0.85rem;
  color: #7f8c8d;
}

.item-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
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
  padding: 0.25rem;
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

.carrito-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

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

@media (max-width: 768px) {
  .carrito-sidebar {
    width: 100%;
    right: -100%;
  }
  
  .btn-carrito-flotante {
    bottom: 1rem;
    right: 1rem;
  }
  .multi-restaurante-badge {
  background: #ff9800;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-left: 0.5rem;
}

.restaurante-grupo {
  margin-bottom: 1.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.restaurante-header-grupo {
  background: #f5f5f5;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e0e0e0;
}

.restaurante-nombre {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  color: #2c3e50;
  font-weight: 600;
}

.restaurante-subtotal {
  font-size: 0.85rem;
  color: #667eea;
  font-weight: 600;
}

.productos-restaurante {
  padding: 0.5rem;
}

.carrito-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.carrito-item:last-child {
  border-bottom: none;
}

.aviso-multi-restaurante {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 4px;
  padding: 0.5rem;
  margin: 0.75rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #856404;
}

.aviso-icon {
  font-size: 1rem;
}

.btn-pedir:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-pedir:disabled:hover {
  background: #4CAF50;
  transform: none;
}
}
</style>