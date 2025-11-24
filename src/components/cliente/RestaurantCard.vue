<template>
  <div
    :class="[
      'rounded-2xl bg-white overflow-hidden shadow-md transition-all',
      restaurante.estado === 'Abierto'
        ? 'cursor-pointer hover:shadow-xl'
        : 'cursor-not-allowed opacity-75'
    ]"
    @click="restaurante.estado === 'Abierto' && $emit('click')"
  >

    <!-- CONTENEDOR FIJO PARA EVITAR DISTORSIÓN -->
    <div class="relative w-full aspect-[16/9] overflow-hidden">

      <!-- IMAGEN SIEMPRE PROPORCIONAL -->
      <img
        :src="restaurante.imagen || '/img/banner-restaurante.avif'"
        class="absolute inset-0 w-full h-full object-cover"
      />

      <!-- BADGE ESTADO (siempre adelante) -->
      <span
        class="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold shadow-lg z-20"
        :class="restaurante.estado === 'Abierto'
          ? 'bg-green-600 text-white'
          : 'bg-red-600 text-white'"
      >
        {{ restaurante.estado }}
      </span>

      <!-- overlay SOLO si cerrado (no tapa el badge) -->
      <div
        v-if="restaurante.estado === 'Cerrado'"
        class="absolute inset-0 bg-black/40 backdrop-blur-[1px] z-10"
      ></div>

    </div>

    <!-- INFORMACIÓN -->
    <div class="p-4 space-y-1.5">
      <h3 class="font-semibold text-lg text-gray-900 leading-tight">
        {{ restaurante.nombre }}
      </h3>

      <p class="text-sm text-gray-500">
        {{ restaurante.direccion }}
      </p>

      <div class="flex items-center gap-2 pt-2">

        <span class="px-2 py-1 bg-gray-100 rounded-lg text-xs font-medium text-gray-800">
          {{ restaurante.tiempoEntrega || "20–30 min" }}
        </span>

        <span class="px-2 py-1 bg-gray-100 rounded-lg text-xs font-medium text-gray-800">
          {{ restaurante.costoEnvio || "Envío desde 5 Bs" }}
        </span>

      </div>
    </div>

  </div>
</template>

<script setup>
defineProps({
  restaurante: Object
});
</script>
