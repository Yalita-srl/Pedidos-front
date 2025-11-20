<template>
  <div
    class="border border-gray-300 p-6 rounded-2xl shadow-md bg-white transition-all duration-300 hover:shadow-xl  hover:border-red-400"
  >
    <h2 class="text-2xl font-bold mb-6 text-gray-800 text-center">
      Información de la Tarjeta
    </h2>

    <form @submit.prevent="$emit('pagar')" class="space-y-5">

      <!-- Número de Tarjeta -->
      <div>
        <label class="block font-semibold text-gray-700 mb-1">Número de Tarjeta</label>

        <input
          type="text"
          v-model="card.number"
          @input="formatearNumero"
          maxlength="19"
          placeholder="0000 0000 0000 0000"
          class="w-full p-3 border rounded-xl bg-gray-50 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-300 outline-none transition-all"
        />
      </div>

      <!-- Expira + CVV -->
      <div class="grid grid-cols-2 gap-5">
        
        <!-- Expira -->
        <div>
          <label class="block font-semibold text-gray-700 mb-1">Expira</label>

          <input
            type="text"
            maxlength="5"
            v-model="card.exp"
            @input="formatearExp"
            placeholder="MM/AA"
            class="w-full p-3 border rounded-xl bg-gray-50 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-300 outline-none transition-all"
          />
        </div>

        <!-- CVV -->
        <div>
          <label class="block font-semibold text-gray-700 mb-1">CVV</label>

          <input
            type="password"
            maxlength="3"
            v-model="card.cvv"
            placeholder="123"
            class="w-full p-3 border rounded-xl bg-gray-50 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-300 outline-none transition-all"
          />
        </div>

      </div>

      <!-- Nombre -->
      <div>
        <label class="block font-semibold text-gray-700 mb-1">Nombre en la Tarjeta</label>

        <input
          type="text"
          v-model="card.name"
          placeholder="Juan Pérez"
          class="w-full p-3 border rounded-xl bg-gray-50 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-300 outline-none transition-all"
        />
      </div>

    </form>
  </div>
</template>

<script>
export default {
  name: "PaymentForm",
  data() {
    return {
      card: {
        number: "",
        exp: "",
        cvv: "",
        name: ""
      }
    };
  },

  methods: {
    formatearNumero() {
      this.card.number = this.card.number
        .replace(/\D/g, "")      // eliminar no dígitos
        .replace(/(.{4})/g, "$1 ") // cada 4 dígitos agregar espacio
        .trim();
    },

    formatearExp() {
      this.card.exp = this.card.exp
        .replace(/\D/g, "")  // solo números
        .replace(/(\d{2})(\d{1,2})/, "$1/$2")
        .slice(0, 5);
    }
  }
};
</script>
