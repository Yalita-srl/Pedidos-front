<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold text-gray-800 mb-6">Dashboard Admin</h1>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white p-6 rounded-lg shadow">
        <h3 class="text-lg font-semibold text-gray-700">Total de Pedidos</h3>
        <p class="text-3xl font-bold text-red-600">150</p>
      </div>
      <div class="bg-white p-6 rounded-lg shadow">
        <h3 class="text-lg font-semibold text-gray-700">Usuarios Registrados</h3>
        <p class="text-3xl font-bold text-red-600">89</p>
      </div>
      <div class="bg-white p-6 rounded-lg shadow">
        <h3 class="text-lg font-semibold text-gray-700">Restaurantes Activos</h3>
        <p class="text-3xl font-bold text-red-600">12</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AdminDashboard'
}
</script>