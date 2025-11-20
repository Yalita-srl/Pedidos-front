<template>
  <div
    class="cursor-pointer rounded-2xl overflow-hidden bg-white shadow-[0_2px_12px_rgba(0,0,0,0.05)]
           hover:shadow-[0_6px_20px_rgba(0,0,0,0.12)] transition-all duration-200"
    @click="$emit('click')"
  >

    <!-- CONTENEDOR IMAGEN -->
    <div class="relative">
      <img
        :src="restaurante.imagen || '/img/banner-restaurante.avif'"
        class="w-full h-40 object-cover"
        loading="lazy"
      />

      <!-- BADGE ESTADO -->
      <span
        v-if="restaurante.estado"
        class="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold shadow
               backdrop-blur-md"
        :class="restaurante.estado === 'Abierto'
                ? 'bg-green-500/90 text-white'
                : 'bg-red-500/90 text-white'"
      >
        {{ restaurante.estado }}
      </span>

      <!-- OVERLAY OSCURO SI ESTÁ CERRADO -->
      <div
        v-if="restaurante.estado === 'Cerrado'"
        class="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
      ></div>
    </div>

    <!-- INFO -->
    <div class="p-4">
      <h3 class="font-semibold text-lg text-gray-800 leading-snug">
        {{ restaurante.nombre }}
      </h3>

      <p class="text-sm text-gray-500 mt-0.5">
        {{ restaurante.direccion }}
      </p>

      <!-- ETIQUETAS -->
      <div class="flex items-center gap-2 mt-3 text-sm text-gray-600">

        <span class="px-2.5 py-1 bg-gray-100 rounded-lg text-xs font-medium">
          {{ restaurante.tiempoEntrega || '20–30 min' }}
        </span>

        <span class="px-2.5 py-1 bg-gray-100 rounded-lg text-xs font-medium">
          {{ restaurante.costoEnvio || 'Envío desde 5 Bs' }}
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
