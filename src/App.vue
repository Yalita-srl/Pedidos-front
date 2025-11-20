<template>
  <div id="app">
    <NavBarUser v-if="auth.isAuthenticated" />
    <router-view></router-view>
    <CarritoSidebar @realizar-pedido="procesarPedidoGlobal" />
  </div>
</template>

<script>
import { useAuthStore } from "@/stores/auth";
import CarritoSidebar from '@/components/cliente/Carrito.vue';
import NavBarUser from '@/components/cliente/NavBarUser.vue';

export default {
  name: 'App',
  components: {
    CarritoSidebar,
    NavBarUser
  },
  setup() {
    const auth = useAuthStore();
    return { auth };
  },
  methods: {
    procesarPedidoGlobal(pedidoData) {
      console.log('Pedido global:', pedidoData);
      alert(`Pedido realizado!\nTotal: ${pedidoData.total}\n\nRedirigiendo al checkout...`);
    }
  }
};
</script>
