<template>
  <div>
    <!-- Botón hamburguesa -->
    <button
      @click="toggleMenu"
      :class="[
        'fixed top-4 z-60 bg-white shadow-md p-2 rounded-xl hover:shadow-lg transition-all duration-300 lg:hidden',
        open ? 'left-72' : 'left-4'
      ]"
    >
      <!-- Icono dependiente del estado -->
      <svg
        v-if="!open"
        xmlns="http://www.w3.org/2000/svg"
        class="w-7 h-7 text-gray-700"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <!-- HAMBURGUESA -->
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"/>
      </svg>

      <svg
        v-else
        xmlns="http://www.w3.org/2000/svg"
        class="w-7 h-7 text-gray-700"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <!-- ICONO X (cerrar) -->
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M6 18L18 6M6 6l12 12" />
      </svg>

    </button>

    <div
      v-show="open"
      class="fixed top-0 left-0 h-full w-10 bg-black bg-opacity-10 z-40"
      @click="toggleMenu"
    ></div>


    <!-- Sidebar -->
    <aside
      :class="[
        'h-screen bg-white shadow-2xl border-r border-gray-200 fixed lg:static top-0 left-0 z-50 transform transition-all duration-300 w-72',
        open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      ]"
    >

      <!-- HEADER -->
      <div class="p-5 border-b border-gray-200 flex items-center gap-2">
        <div class="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center text-white text-xl font-bold">
          {{ iniciales }}
        </div>
        <div>
          <p class="font-semibold text-gray-800">{{ userData.nombre }}</p>
          <p class="text-sm text-gray-500">{{ userData.email }}</p>
        </div>
      </div>

      <!-- OPCIONES DEL MENÚ -->
      <nav class="p-4 space-y-2">
        <button
          v-for="item in menuItems"
          :key="item.text"
          @click="item.action"
          class="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 transition text-gray-700 font-medium"
        >
          <component :is="item.icon" class="w-6 h-6 text-red-500"/>
          {{ item.text }}
        </button>
      </nav>

      <!-- CERRAR SESIÓN -->
      <div class="absolute bottom-0 w-full p-4 border-t border-gray-200">
        <button
          @click="logout"
          class="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 text-red-600 font-semibold transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1m0-10V5m0 0a2 2 0 012-2h4m0 0a2 2 0 012 2v14a2 2 0 01-2 2h-4a2 2 0 01-2-2v-1"/>
          </svg>
          Cerrar Sesión
        </button>
      </div>
    </aside>
     <!-- CARRITO -->
    <CarritoSidebar
    v-if="auth.isAuthenticated && auth.user?.role === 'USER'"
    @realizar-pedido="procesarPedidoGlobal"
    class="absolute top-0 right-0 z-50"
    />
  </div>
</template>

<script setup>
console.log("📌 NavBarUser montado");

import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { onUnmounted } from "vue";
import CarritoSidebar from '@/components/cliente/Carrito.vue';


// Heroicons
import { 
  UserIcon, 
  ShoppingBagIcon, 
  MapPinIcon, 
  CreditCardIcon, 
  HomeIcon
} from "@heroicons/vue/24/outline";

const router = useRouter();
const auth = useAuthStore();

const open = ref(false);

// Datos seguros del usuario
const userData = computed(() => {
  return auth.user
    ? { nombre: auth.user.name || "Usuario", email: auth.user.email }
    : { nombre: "Invitado", email: "----" };
});

// Iniciales
const iniciales = computed(() => {
  const name = userData.value.nombre;
  return name
    .split(" ")
    .map(w => w[0])
    .join("")
    .toUpperCase();
});
// Acciones del menú
const menuItems = [
  { text: "Inicio", icon: HomeIcon, action: () => router.push("/") },
  { text: "Mi Perfil", icon: UserIcon, action: () => router.push("/perfil") },
  { text: "Mis Compras", icon: ShoppingBagIcon, action: () => router.push("/mis-compras") },
  { text: "Direcciones", icon: MapPinIcon, action: () => router.push("/direcciones") },
  { text: "Métodos de Pago", icon: CreditCardIcon, action: () => router.push("/metodos-pago") },
];

function toggleMenu() {
  open.value = !open.value;
  
  // desplazamos el contenido
  if (open.value) {
    document.body.classList.add("menu-open");
  } else {
    document.body.classList.remove("menu-open");
  }
}

onUnmounted(() => {
  document.body.classList.remove("menu-open");
});

function logout() {
  auth.logout();
  router.push("/login");
}
function procesarPedidoGlobal(pedidoData) {
    console.log('Pedido global:', pedidoData);
    alert(`Pedido realizado!\nTotal: ${pedidoData.total}\n\nRedirigiendo al checkout...`);
  }
</script>

<style scoped>
aside {
  border-radius: 0 20px 20px 0;
}
</style>
