<template>
  <div v-if="categorias.length > 0" class="mb-6">
    <h3 class="text-lg font-semibold text-gray-800 mb-3 text-center">Filtrar por tipo de comida</h3>
    <div class="flex flex-wrap justify-center gap-3 overflow-x-auto pb-2">
      <button
        @click="updateCategoria(null)"
        class="px-4 py-2 bg-white text-gray-600 border-2 border-gray-300 rounded-full text-sm font-medium hover:border-blue-500 hover:text-blue-500 transition-all whitespace-nowrap"
        :class="{ 'bg-blue-500 text-white border-blue-500': filtroCategoria === null }"
      >
        Todos
      </button>
      <button
        v-for="cat in categorias"
        :key="cat"
        @click="updateCategoria(cat)"
        class="px-4 py-2 bg-white text-gray-600 border-2 border-gray-300 rounded-full text-sm font-medium hover:border-blue-500 hover:text-blue-500 transition-all whitespace-nowrap"
        :class="{ 'bg-blue-500 text-white border-blue-500': filtroCategoria === cat }"
      >
        {{ cat }}
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  categorias: Array,
  filtroCategoria: [String, null]
});
defineEmits(['update:filtro-categoria']);

function updateCategoria(cat) {
  emit('update:filtro-categoria', cat);
}
</script>