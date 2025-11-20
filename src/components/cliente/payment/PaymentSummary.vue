<template>
  <div class="border border-gray-300 p-6 rounded-2xl shadow-md bg-white hover:shadow-xl  hover:border-red-400">
    <h2 class="text-2xl font-bold mb-4 text-gray-800">Resumen del Pedido</h2>

    <div v-if="pedido" class="space-y-2 text-gray-700">
      <p><strong>Subtotal:</strong> Bs. {{ subtotal }}</p>
      <p><strong>Envío:</strong> Bs. {{ envio }}</p>

      <hr class="my-3">

      <p class="text-xl font-bold">
        Total a pagar: Bs. {{ total }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  pedido: Object,
  default: () => ({})
});
console.log("🟦 Pedido recibido en PaymentSummary:", props.pedido);
// subtotal dinámico
const subtotal = computed(() => {
  if (!props.pedido?.items) return 0;
  return props.pedido.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
});

// envío fijo (puedes conectarlo más adelante al backend)
const envio = computed(() => 5);

// total
const total = computed(() => subtotal.value + envio.value);
</script>
