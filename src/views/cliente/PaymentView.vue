<template>
  <div class="min-h-screen bg-gray-100 flex flex-col items-center pt-20">

    <h1 class="text-3xl font-bold mb-10 text-gray-800">
      Pago del Pedido
    </h1>

    <!-- Contenedor principal -->
    <div
      v-if="pedido"
      class="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 border border-gray-200"
    >
      <!-- Formulario -->
      <PaymentForm />

      <!-- Resumen -->
      <PaymentSummary :pedido="pedido" />
    </div>

    <!-- Si aún carga -->
    <div v-else class="text-gray-600 mt-10 text-lg">
      Cargando información del pedido...
    </div>

    <button
      v-if="pedido"
      @click="procesarPago"
      class="mt-8 px-12 py-3 bg-green-600 text-white font-semibold text-lg rounded-xl shadow-lg hover:bg-green-700 active:scale-95 transition-all"
    >
      Realizar Pago
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

import PaymentForm from "@/components/cliente/payment/PaymentForm.vue";
import PaymentSummary from "@/components/cliente/payment/PaymentSummary.vue";

import { obtenerOrdenPorId, actualizarEstadoOrden } from "@/services/orderService";
import { useCarritoStore } from "@/stores/carritoStore";

const route = useRoute();
const router = useRouter();
const carritoStore = useCarritoStore();

const pedido = ref(null);

onMounted(async () => {
  const id = route.query.id;

  if (!id) {
    alert("No se recibió ID de orden.");
    router.push("/");
    return;
  }

  console.log("🔍 Parámetros de ruta:", route.query);
  console.log("🔍 ID de orden recibido:", id);

  try {
    const data = await obtenerOrdenPorId(id);
    console.log("Orden cargada desde backend:", data);

    pedido.value = data; // asignamos la orden al ref
    console.log("Pedido final asignado al componente:", pedido.value);

  } catch (e) {
    console.error("❌ Error cargando orden:", e);
    alert("No se pudo cargar la orden");
    router.push("/");
  }
});

async function procesarPago() {
  if (!pedido.value) {
    alert("No hay orden para pagar");
    return;
  }

  const id = pedido.value.id;

  try {
    // 1. Cambiar el estado de la orden a pagado
    await actualizarEstadoOrden(id, "paid");

    // 2. Vaciar carrito
    carritoStore.limpiarCarrito();

    // 3. Mensaje de éxito
    alert("🎉 ¡Pago realizado con éxito! Tu pedido está en proceso.");

    // 4. Redirigir al home después de 1 segundo
    setTimeout(() => {
      router.push("/");
    }, 1000);

  } catch (error) {
    console.error("❌ Error al procesar el pago:", error);
    alert("No se pudo completar el pago.");
  }
}

</script>
