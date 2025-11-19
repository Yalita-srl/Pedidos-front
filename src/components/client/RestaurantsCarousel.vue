<template>
  <div class="mb-8">
    <h2 class="text-2xl md:text-3xl font-bold text-gray-800 mb-4">{{ titulo }}</h2>
    <div class="relative">
      <button 
        @click="scrollLeft" 
        class="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white p-2 rounded-full shadow-md text-gray-600 hover:text-blue-500 transition-all"
        aria-label="Anterior"
      >
        ‹
      </button>
      <div ref="track" class="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-2 scrollbar-hide">
        <RestaurantCard
          v-for="restaurante in restaurantes"
          :key="restaurante.id"
          :restaurante="restaurante"
          @ver-menu="$emit('ver-menu', $event)"
        />
      </div>
      <button 
        @click="scrollRight" 
        class="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white p-2 rounded-full shadow-md text-gray-600 hover:text-blue-500 transition-all"
        aria-label="Siguiente"
      >
        ›
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import RestaurantCard from '@/components/client/RestaurantCard.vue';

defineProps({
  titulo: String,
  restaurantes: Array
});
defineEmits(['ver-menu']);

const track = ref(null);

onMounted(() => {
  if (track.value) track.value.scrollLeft = 0;
});

function scrollLeft() {
  if (track.value) track.value.scrollBy({ left: -400, behavior: 'smooth' });
}

function scrollRight() {
  if (track.value) track.value.scrollBy({ left: 400, behavior: 'smooth' });
}
</script>