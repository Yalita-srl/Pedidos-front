<template>
  <NotificationProvider />
  <div id="app" class="h-screen flex overflow-hidden">
    
    <!-- SIDEBAR CONDICIONAL POR ROL -->
    <div class="w-72" v-if="auth.isAuthenticated">
      <NavBarAdmin v-if="auth.user?.role === 'ADMIN'" />
      <NavBarUser v-else />
    </div>
    
    <!-- CONTENIDO DINÁMICO -->
    <div class="flex-1 overflow-y-auto bg-gray-50">
      <router-view />
    </div>
    
    <!-- CARRITO (solo para clientes) -->
    <CarritoSidebar
      v-if="auth.isAuthenticated && auth.user?.role !== 'ADMIN'"
      @realizar-pedido="procesarPedidoGlobal"
      class="absolute top-0 right-0 z-50"
    />
    
  </div>
</template>

<script>
import { useAuthStore } from "@/stores/auth";
import CarritoSidebar from '@/components/cliente/Carrito.vue';
import NavBarUser from '@/components/cliente/NavBarUser.vue';
import NavBarAdmin from '@/components/admin/NavBarAdmin.vue';
import NotificationProvider from "@/components/NotificationProvider.vue";

export default {
  name: 'App',
  components: {
    CarritoSidebar,
    NavBarUser,
    NavBarAdmin,
    NotificationProvider, 
  },
  setup() {
    const auth = useAuthStore();

    console.log("📌 App montado, usuario:",{
      isAuthenticated: auth.isAuthenticated,
      user: auth.user,
      role: auth.user?.role || 'N/A'
    });
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