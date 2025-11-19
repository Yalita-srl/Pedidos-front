<!-- App.vue -->
<template>
  <div id="app">
    <router-view></router-view>
    <CarritoSidebar 
      @realizar-pedido="procesarPedidoGlobal"
    />
  </div>
</template>

<script>
import CarritoSidebar from '@/components/cliente/Carrito.vue';

export default {
  name: 'App',
  components: {
    CarritoSidebar
  },
  methods: {
    procesarPedidoGlobal(pedidoData) {
      console.log('Pedido global:', pedidoData);
      // Aquí puedes redirigir a la página de checkout
      // o mostrar un modal de confirmación
      alert(`Pedido realizado!\nTotal: ${pedidoData.total}\n\nRedirigiendo al checkout...`);
    }
  }
};
</script>

<style>
#app {
  width: 100%;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>