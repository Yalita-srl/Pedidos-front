<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <div class="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
      <div class="text-center">
        <h1 class="text-3xl font-bold text-gray-800">Iniciar Sesión</h1>

        <p class="mt-2 text-gray-600">Bienvenido a YALA Delivery</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-6">
        <div>
          <label for="email" class="text-sm font-medium text-gray-700"
            >Email</label
          >

          <input
            v-model="email"
            id="email"
            type="email"
            required
            class="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
          />
        </div>

        <div>
          <label for="password" class="text-sm font-medium text-gray-700"
            >Contraseña</label
          >

          <input
            v-model="password"
            id="password"
            type="password"
            required
            class="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
          />
        </div>

        <div v-if="error" class="text-red-500 text-sm text-center">
          {{ error }}
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading"
            class="w-full py-2 px-4 font-semibold text-white bg-red-500 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
          >
            <span v-if="loading">Ingresando...</span>

            <span v-else>Ingresar</span>
          </button>
        </div>
      </form>

      <div class="text-center">
        <router-link to="/" class="text-sm text-red-500 hover:underline"
          >Volver al inicio</router-link
        >
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

import { useAuthStore } from "@/stores/auth";

const email = ref("");

const password = ref("");

const error = ref(null);

const loading = ref(false);

const authStore = useAuthStore();

async function handleLogin() {
  error.value = null;

  loading.value = true;

  try {
    await authStore.login(email.value, password.value);

    // La redirección se maneja en el store
  } catch (err) {
    error.value = "Credenciales incorrectas. Por favor, inténtalo de nuevo.";
  } finally {
    loading.value = false;
  }
}
</script>
