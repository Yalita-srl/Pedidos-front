<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div class="w-full max-w-sm">

      <!-- LOGO / NOMBRE -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-extrabold text-red-500 tracking-tight">
          YALA
        </h1>
        <p class="text-gray-500 mt-1">Delivery App</p>
      </div>

      <!-- CARD -->
      <div class="bg-white shadow-xl rounded-3xl p-8 space-y-6">

        <h2 class="text-2xl font-bold text-gray-800 text-center">
          Iniciar sesión
        </h2>

        <p class="text-center text-gray-500 text-sm mb-2">
          ¡Qué bueno verte de nuevo!
        </p>

        <form @submit.prevent="handleLogin" class="space-y-6">

          <!-- EMAIL -->
          <div>
            <label class="text-sm font-semibold text-gray-700">Email</label>
            <input
              v-model="email"
              type="email"
              required
              class="mt-1 w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-800 bg-white shadow-sm focus:right-2 focus:ring-red-500/40 outline-none transition-all"
              placeholder="usuario@gmail.com"
            />
          </div>

          <!-- PASSWORD -->
          <div>
            <label class="text-sm font-semibold text-gray-700">
              Contraseña
            </label>
            <input
              v-model="password"
              type="password"
              required
              class="mt-1 w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-800 bg-white shadow-sm focus:right-2 focus:ring-red-500/40 outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          <!-- ERROR -->
          <div v-if="error" class="text-center text-red-500 text-sm font-medium">
            {{ error }}
          </div>

          <!-- BOTÓN PRINCIPAL -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full py-3 rounded-xl text-white font-bold text-lg bg-red-500 hover:bg-red-600 transition-all disabled:opacity-50 shadow-md"
          >
            <span v-if="loading">Ingresando...</span>
            <span v-else>Ingresar</span>
          </button>
        </form>

        <div class="text-center">
          <router-link
            to="/"
            class="text-red-500 text-sm font-medium hover:underline"
          >
            Registrate aquí
          </router-link>
        </div>
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
  } catch (err) {
    error.value = "Credenciales incorrectas. Por favor, inténtalo nuevamente.";
  } finally {
    loading.value = false;
  }
}
</script>
