<template>
  <div class="relative max-w-md mx-auto mb-6">
    <input
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      type="text"
      placeholder="Buscar restaurantes por nombre o dirección..."
      class="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-full text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
    />
    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: String,
    default: ''
  }
});

defineEmits(['update:modelValue']);
</script>