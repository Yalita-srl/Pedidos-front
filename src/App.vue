<template>
  <NotificationProvider />
  <div id="app" class="h-screen flex overflow-hidden">
    
    <!-- SIDEBAR FIJO -->
    <div class="w-72">
      <NavBarUser v-if="auth.isAuthenticated" />
    </div>
    
    <!-- CONTENIDO DINÁMICO -->
    <div class="flex-1 overflow-y-auto bg-gray-50">
      <router-view />
    </div>
    
    <!-- CARRITO -->
    <!-- <CarritoSidebar
    @realizar-pedido="procesarPedidoGlobal"
    class="absolute top-0 right-0 z-50"
    /> -->
    
  </div>
</template>

<script>
import { useAuthStore } from "@/stores/auth";
// import CarritoSidebar from '@/components/cliente/Carrito.vue';
import NavBarUser from '@/components/cliente/NavBarUser.vue';
import NotificationProvider from "@/components/NotificationProvider.vue";

export default {
  name: 'App',
  components: {
    // CarritoSidebar,
    NavBarUser,
    NotificationProvider, 
  },
  setup() {
    const auth = useAuthStore();
    return { auth };
  },
  // methods: {
  //   procesarPedidoGlobal(pedidoData) {
  //     console.log('Pedido global:', pedidoData);
  //     alert(`Pedido realizado!\nTotal: ${pedidoData.total}\n\nRedirigiendo al checkout...`);
  //   }
  // }
};
</script>
