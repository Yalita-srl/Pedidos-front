<template>
  <div class="max-w-7xl mx-auto px-6 py-8">

    <!-- Banner / Header (componente reutilizable) -->
    <RestaurantBanner
      :nombre="restaurante?.nombre || 'Restaurante'"
      :direccion="restaurante?.direccion || ''"
      :telefono="restaurante?.telefono || ''"
      :estado="restaurante?.estado || 'Cerrado'"
      :imagen="restaurante?.imagen ?? '/img/logo-yala.png'"
      :showBack="true"
      @volver="volver"
    />

    <!-- Aviso de multi-restaurante (si aplica) -->
    <RestaurantMultiStoreWarning v-if="tieneProductosDeOtrosRestaurantes" />

    <!-- Tabs de categorías -->
    <div v-if="restaurante && restaurante.categorias?.length" class="mb-6">
      <RestaurantCategoryTabs
        :categorias="restaurante.categorias"
        :categoriaSeleccionada="categoriaSeleccionada"
        @update:categoria="categoriaSeleccionada = $event"
      />
    </div>

    <!-- Contenido principal -->
    <div>
      <h2 class="text-2xl font-semibold text-gray-800 mb-4">
        {{ tituloSeccion }}
        <span class="text-sm text-gray-500 font-normal ml-2">({{ productosFiltrados.length }} productos)</span>
      </h2>

      <RestaurantProductGrid>
        <template v-if="productosFiltrados.length > 0">
          <RestaurantProductCard
            v-for="producto in productosFiltrados"
            :key="producto.id"
            :producto="producto"
            :cantidad="getCantidadProducto(producto.id)"
            :cantidadEnCarrito="cantidadEnCarrito(producto.id)"
            @incrementar="incrementarCantidad(producto)"
            @decrementar="decrementarCantidad(producto)"
            @agregar="agregarAlCarrito(producto)"
          />
        </template>

        <template v-else>
          <RestaurantEmptyState
            titulo="No hay productos"
            mensaje="No hay productos disponibles en esta categoría."
          />
        </template>
      </RestaurantProductGrid>
    </div>

    <!-- Carrito lateral reutilizable -->
    <CarritoSidebar
      :abierto="carritoVisible"
      @abrir="onCarritoAbierto"
      @cerrar="onCarritoCerrado"
      @realizar-pedido="onRealizarPedido"
      class="!z-[1200]"
    />

  </div>
</template>

<script setup>

import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useCarritoStore } from "@/stores/carritoStore";
import { getRestaurante } from "@/services/catalogoService";
import useNotification from "@/composables/useNotification";

/* Componentes (todos en components/cliente/menu/) */
import RestaurantBanner from "@/components/cliente/menu/RestaurantBanner.vue";
import RestaurantCategoryTabs from "@/components/cliente/menu/RestaurantCategoryTabs.vue";
import RestaurantProductCard from "@/components/cliente/menu/RestaurantProductCard.vue";
import RestaurantProductGrid from "@/components/cliente/menu/RestaurantProductGrid.vue";
import RestaurantEmptyState from "@/components/cliente/menu/RestaurantEmptyState.vue";
import RestaurantMultiStoreWarning from "@/components/cliente/menu/RestaurantMultiStoreWarning.vue";

/* Componente de carrito (ya existente en tu proyecto) */
import CarritoSidebar from "@/components/cliente/Carrito.vue";

/* Router & stores */
const router = useRouter();
const route = useRoute();
const carritoStore = useCarritoStore();

/* Local state */
const restaurante = ref(null);
const loading = ref(true);
const error = ref(null);

const categoriaSeleccionada = ref(null);
const { push } = useNotification();
const cantidades = ref({});

/* Control del carrito lateral (para abrir/cerrar desde la vista) */
const carritoVisible = ref(false);

/* -------------------------------------------------------------------------- */
/*  CARGA DEL RESTAURANTE                                                      */
/* -------------------------------------------------------------------------- */
onMounted(() => {
  fetchRestaurante();
});

async function fetchRestaurante() {
  loading.value = true;
  error.value = null;
  try {
    const id = route.params.id;
    const resp = await getRestaurante(id);
    restaurante.value = resp.data;

    // Inicializar cantidades con lo que haya en el carrito para este restaurante
    if (restaurante.value?.productos?.length) {
      restaurante.value.productos.forEach((p) => {
        const q = carritoStore.cantidadProducto(p.id) || 0;
        if (q > 0) cantidades.value[p.id] = q;
      });
    }
  } catch (err) {
    console.error(err);
    error.value = "No se pudo cargar el restaurante. Intenta más tarde.";
  } finally {
    loading.value = false;
  }
}

/* -------------------------------------------------------------------------- */
/*  FILTRADO / UTILIDADES                                                       */
/* -------------------------------------------------------------------------- */

const productosFiltrados = computed(() => {
  if (!restaurante.value?.productos) return [];

  if (categoriaSeleccionada.value === null) {
    return restaurante.value.productos;
  }

  return restaurante.value.productos.filter(
    (p) => p.categoria_id === categoriaSeleccionada.value
  );
});

const tituloSeccion = computed(() => {
  if (!restaurante.value) return "Menú";
  if (categoriaSeleccionada.value === null) return "Nuestro Menú";
  const cat = restaurante.value.categorias?.find(c => c.id === categoriaSeleccionada.value);
  return cat ? cat.nombre : "Menú";
});

/* -------------------------------------------------------------------------- */
/*  CANTIDADES: helpers                                                        */
/* -------------------------------------------------------------------------- */

function getCantidadProducto(productoId) {
  // prioridad: cantidades temporales -> cantidad en carrito -> 0
  return cantidades.value[productoId] ?? carritoStore.cantidadProducto(productoId) ?? 0;
}

function cantidadEnCarrito(productoId) {
  return carritoStore.cantidadProducto(productoId) ?? 0;
}

function incrementarCantidad(producto) {
  const id = producto.id;
  if (!cantidades.value[id]) cantidades.value[id] = cantidadEnCarrito(id) || 0;
  cantidades.value[id] = (cantidades.value[id] || 0) + 1;
}

function decrementarCantidad(producto) {
  const id = producto.id;
  if (!cantidades.value[id]) cantidades.value[id] = cantidadEnCarrito(id) || 0;
  if ((cantidades.value[id] || 0) > 0) cantidades.value[id] = cantidades.value[id] - 1;
}

/* -------------------------------------------------------------------------- */
/*  CARrito: agregar / abrir / cerrar                                           */
/* -------------------------------------------------------------------------- */

function agregarAlCarrito(producto) {
  const id = producto.id;
  const cantidad = getCantidadProducto(id);

  if (cantidad <= 0) {
    push({
      message: "Selecciona una cantidad antes de agregar.",
      type: "error"
    });
    return;
  }

  const restauranteInfo = {
    id: restaurante.value.id,
    nombre: restaurante.value.nombre,
    direccion: restaurante.value.direccion,
    telefono: restaurante.value.telefono
  };

  carritoStore.agregarProducto(producto, cantidad, restauranteInfo);

  // Opcional: Resetear cantidades
  cantidades.value[id] = 0;

  // 🔥 AQUI sale tu banner bonito
  push({
    message: `Producto añadido: ${producto.nombre}`,
    type: "success",
    duration: 2500
  });

  // abrir el carrito para feedback visual
  carritoVisible.value = true;
}

/* -------------------------------------------------------------------------- */
/*  Helpers UI / navegación                                                    */
/* -------------------------------------------------------------------------- */

function volver() {
  router.push({ name: "Restaurantes" });
}

/* Eventos del carrito (recibidos desde CarritoSidebar) */
function onCarritoAbierto() {
  carritoVisible.value = true;
}
function onCarritoCerrado() {
  carritoVisible.value = false;
}

/* Evento cuando se complete el pedido (delegado desde CarritoSidebar) */
function onRealizarPedido(pedidoData) {
  console.log("Pedido realizado:", pedidoData);
  carritoVisible.value = false;
}

/* -------------------------------------------------------------------------- */
/*  Computed booleans útiles                                                    */
/* -------------------------------------------------------------------------- */

const tieneProductosDeEsteRestaurante = computed(() =>
  carritoStore.items.some(item => item.restaurante.id === restaurante.value?.id)
);

const totalItemsDeEsteRestaurante = computed(() =>
  carritoStore.items
    .filter(item => item.restaurante.id === restaurante.value?.id)
    .reduce((sum, it) => sum + it.cantidad, 0)
);

const tieneProductosDeOtrosRestaurantes = computed(() =>
  carritoStore.items.some(item => item.restaurante.id !== restaurante.value?.id)
);

/* -------------------------------------------------------------------------- */
/*  UTIL: construir url de imagen (puedes adaptar si tu API cambia)            */
/* -------------------------------------------------------------------------- */
function getImagenUrl(path) {
  if (!path) return "/img/logo-yala.png";
  // Adjustar base si fuera necesario (consistencia con el resto del proyecto)
  return `http://localhost:8000/storage/${path}`;
}

</script>

<style scoped>

.menu-container {
  /* placeholder si antes usabas esta clase */
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
