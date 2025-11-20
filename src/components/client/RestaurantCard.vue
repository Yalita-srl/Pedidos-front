<template>
  <div 
    class="cursor-pointer rounded-xl overflow-hidden bg-white shadow hover:shadow-lg transition"
    @click="$emit('click')"
  >
    <img 
      :src="restaurante.imagen || '../../public/img/banner-restaurante.avif'"
      class="w-full h-36 object-cover"
    />

    <div class="p-3">
      <h3 class="font-semibold text-lg">{{ restaurante.nombre }}</h3>
      <p class="text-sm text-gray-500">{{ restaurante.direccion }}</p>

      <div class="flex items-center gap-2 mt-2 text-gray-600 text-sm">
        <span class="px-2 py-1 bg-gray-100 rounded-lg text-xs">
          {{ restaurante.tiempoEntrega || '20-30 min' }}
        </span>
        <span class="px-2 py-1 bg-gray-100 rounded-lg text-xs">
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
