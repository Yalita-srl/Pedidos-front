<template>
  <div 
    class="flex flex-col w-80 bg-white rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden cursor-pointer snap-start"
    :class="{ 'opacity-70 cursor-not-allowed': restaurante.estado === 'Cerrado' }"
    @click="!restaurante.estado === 'Cerrado' && $emit('ver-menu', restaurante.id)"
  >
    <!-- Imagen (opcional) -->
    <div class="relative h-48 bg-gray-100 overflow-hidden">
      <img
        v-if="restaurante.imagen"
        :src="getImagenUrl(restaurante.imagen)"
        :alt="restaurante.nombre"
        class="w-full h-full object-cover"
        @error="handleImageError"
      />
      <div v-else class="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
        <span class="text-6xl opacity-50">🏪</span>
      </div>
    </div>
    
    <!-- Badge de Estado -->
    <div 
      class="absolute top-2 right-2 px-3 py-1 rounded-full text-sm font-semibold z-10"
      :class="restaurante.estado === 'Abierto' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
    >
      <span class="inline-block w-2 h-2 rounded-full mr-1" :class="restaurante.estado === 'Abierto' ? 'bg-green-500 animate-pulse' : 'bg-red-500'"></span>
      {{ restaurante.estado }}
    </div>
    
    <!-- Contenido -->
    <div class="p-6 flex flex-col flex-grow">
      <h3 class="text-xl font-bold text-gray-800 mb-3 line-clamp-2">{{ restaurante.nombre }}</h3>
      <div class="space-y-2 mb-4 text-sm text-gray-600">
        <div class="flex items-center gap-2">
          <span>📍</span>
          <span class="truncate">{{ restaurante.direccion }}</span>
        </div>
        <div class="flex items-center gap-2">
          <span>📞</span>
          {{ restaurante.telefono }}
        </div>
      </div>
      
      <!-- Stats -->
      <!-- <div class="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-lg mb-4">
        <div class="text-center">
          <div class="text-lg font-bold text-blue-600">{{ restaurante.categorias?.length || 0 }}</div>
          <div class="text-xs text-gray-500">Categorías</div>
        </div>
        <div class="w-px h-8 bg-gray-300"></div>
        <div class="text-center">
          <div class="text-lg font-bold text-blue-600">{{ restaurante.productos?.length || 0 }}</div>
          <div class="text-xs text-gray-500">Productos</div>
        </div>
      </div> -->
      
      <!-- Botón (solo si abierto; sino, mensaje) -->
      <button 
        @onclick.stop="$emit('ver-menu', restaurante.id)"
        v-if="restaurante.estado === 'Abierto'"
        class="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all"
      >
        <span class="mr-2">🍽️</span>
        Ver Menú
      </button>
      <div v-else class="w-full py-3 text-center text-gray-500 text-sm bg-gray-100 rounded-lg">
        Cerrado temporalmente
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  restaurante: Object
});
defineEmits(['ver-menu']);

const getImagenUrl = (imagen) => `http://localhost:8000/storage/${imagen}`;

const handleImageError = (event) => {
  event.target.style.display = 'none';
};

function verMenu(restauranteId) {
  this.$router.push({
    name: 'RestauranteMenu',
    params: { id: restauranteId }
  });
}
</script>