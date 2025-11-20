<template>
  <div>
    <!-- Botón para abrir menú -->
    <button
      @click="toggleMenu"
      class="fixed top-4 left-4 z-50 bg-white shadow-md p-2 rounded-xl hover:shadow-lg transition"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
      </svg>
    </button>

    <!-- Overlay -->
    <div
      v-show="open"
      class="fixed inset-0 bg-black bg-opacity-30 z-40"
      @click="toggleMenu"
    ></div>

    <!-- Sidebar -->
    <aside
      :class="[
        'fixed top-0 left-0 z-50 h-full w-72 bg-white shadow-2xl transform transition-all duration-300',
        open ? 'translate-x-0' : '-translate-x-full'
      ]"
    >
      <!-- Header -->
      <div class="p-6 border-b border-gray-200 flex items-center gap-3">
        <div class="w-14 h-14 rounded-full bg-green-600 flex items-center justify-center text-white text-xl font-bold">
          {{ iniciales }}
        </div>
        <div>
          <p class="font-semibold text-gray-800">{{ user.nombre }}</p>
          <p class="text-sm text-gray-500">{{ user.email }}</p>
        </div>
      </div>

      <!-- Opciones -->
      <nav class="p-4 space-y-2">
        <button
          v-for="item in menuItems"
          :key="item.text"
          @click="item.action"
          class="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 transition text-gray-700 font-medium"
        >
          <component :is="item.icon" class="w-6 h-6 text-green-600"/>
          {{ item.text }}
        </button>
      </nav>

      <!-- Logout -->
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
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
//import { useAuthStore } from "@/stores/authStore";

// HeroIcons
import { UserIcon, ShoppingBagIcon, MapPinIcon, CreditCardIcon } from "@heroicons/vue/24/outline";

const router = useRouter();
//const auth = useAuthStore();

const open = ref(false);
const user = computed(() => auth.user || { nombre: "Invitado", email: "-----" });

const iniciales = computed(() => {
  if (!auth.user?.nombre) return "U";
  return auth.user.nombre.split(" ").map(e => e[0]).join("").toUpperCase();
});

function toggleMenu() {
  open.value = !open.value;
}

function logout() {
  auth.logout();
  router.push("/login");
}

const menuItems = [
  {
    text: "Mi Perfil",
    icon: UserIcon,
    action: () => router.push("/perfil"),
  },
  {
    text: "Mis Compras",
    icon: ShoppingBagIcon,
    action: () => router.push("/mis-compras"),
  },
  {
    text: "Direcciones",
    icon: MapPinIcon,
    action: () => router.push("/direcciones"),
  },
  {
    text: "Métodos de Pago",
    icon: CreditCardIcon,
    action: () => router.push("/metodos-pago"),
  },
];
</script>

<style scoped>
/* Animación suave */
aside {
  border-radius: 0 20px 20px 0;
}
</style>
