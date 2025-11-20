<template>
  <div class="admin-productos-container">
    <!-- Botón Volver -->
    <div class="page-header">
      <button @click="volver" class="back-btn">
        <i class="fas fa-arrow-left"></i>
      </button>
      <h1>
        {{ restaurante?.nombre || 'Cargando...' }}
        <span class="estado-badge" :class="restaurante?.estado === 'Abierto' ? 'abierto' : 'cerrado'">
          {{ restaurante?.estado }}
        </span>
      </h1>
      <button @click="abrirModalProducto()" class="btn-primary">
        <i class="fas fa-plus"></i> Nuevo Producto
      </button>
    </div>

    <!-- Loading / Error -->
    <div v-if="loading" class="loading">
      <i class="fas fa-spinner fa-spin"></i> Cargando menú...
    </div>
    <div v-else-if="error" class="error">
      <i class="fas fa-exclamation-triangle"></i> {{ error }}
      <button @click="cargarDatos" class="btn-retry">Reintentar</button>
    </div>

    <!-- Contenido principal -->
    <div v-else class="main-content">
      <!-- Info rápida -->
      <div class="restaurante-info">
        <div class="info-item">
          <i class="fas fa-map-marker-alt"></i> {{ restaurante.direccion }}
        </div>
        <div class="info-item">
          <i class="fas fa-phone"></i> {{ restaurante.telefono }}
        </div>
      </div>

      <!-- Filtros + Gestión de Categorías -->
      <div class="categorias-section">
        <div class="section-header">
          <h3>Categorías del Menú</h3>
          <button @click="abrirModalCategoria()" class="btn-add">
            <i class="fas fa-plus"></i> Nueva categoría
          </button>
        </div>

        <div v-if="!categorias.length" class="empty-categories">
          <p>No hay categorías creadas aún</p>
          <small>Las categorías ayudan a organizar tus productos</small>
        </div>

        <div v-else class="categorias-tabs">
          <button
            @click="categoriaSeleccionada = null"
            :class="{ active: categoriaSeleccionada === null }"
            class="tab-btn"
          >
            Todas las categorías
          </button>
          <button
            v-for="cat in categorias"
            :key="cat.id"
            @click="categoriaSeleccionada = cat.id"
            :class="{ active: categoriaSeleccionada === cat.id }"
            class="tab-btn"
          >
            {{ cat.nombre }}
            <div class="acciones-categoria">
              <button @click.stop="editarCategoria(cat)" class="btn-icon small">Editar
                <i class="fas fa-edit"></i> 
              </button>
              
            </div>
          </button>
        </div>
      </div>

      <!-- Lista de productos -->
      <div class="productos-section">
        <div class="section-title">
          <h2>
            {{ categoriaSeleccionada ? nombreCategoriaSeleccionada : 'Todos los productos' }}
          </h2>
          <span class="count">({{ productosFiltrados.length }})</span>
        </div>

        <div v-if="productosFiltrados.length === 0" class="empty-products">
          <i class="fas fa-utensils fa-3x"></i>
          <p>No hay productos en esta categoría</p>
        </div>

        <div v-else class="productos-grid">
          <div
            v-for="producto in productosFiltrados"
            :key="producto.id"
            class="producto-card"
          >
            <div class="imagen-container">
              <img
                v-if="producto.imagen"
                :src="getImagenUrl(producto.imagen)"
                alt=""
                @error="e => e.target.src = '/placeholder-food.jpg'"
              />
              <div v-else class="placeholder">
                <i class="fas fa-image"></i>
              </div>
            </div>

            <div class="info">
              <h3>{{ producto.nombre }}</h3>
              <p class="precio">Bs. {{ formatoPrecio(producto.precio) }}</p>
              <p class="descripcion">{{ producto.descripcion || 'Sin descripción' }}</p>

              <div class="acciones">
                <button @click="editarProducto(producto)" class="btn-edit">
                  <i class="fas fa-edit"></i> Editar
                </button>
                <button @click="eliminarProducto(producto.id)" class="btn-delete">
                  <i class="fas fa-trash"></i> Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modales -->
    <ProductoModal
      v-if="modalProducto.abierto"
      :producto="modalProducto.datos || {} "
      :categorias="categorias"
      :restauranteId="restaurante?.id"
      @cerrar="modalProducto.abierto = false"
      @guardado="guardarProducto"
    />

    <CategoriaModal
      v-if="modalCategoria.abierto"
      :categoria="modalCategoria.datos"
      :restauranteId="restaurante.id"
      @cerrar="modalCategoria.abierto = false"
      @guardado="guardarCategoria"
    />

    <!-- Mensajes flotantes -->
    <transition name="fade">
      <div v-if="mensaje" class="alert success">
        <i class="fas fa-check-circle"></i> {{ mensaje }}
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  getRestaurante, 
  getCategoriasPorRestaurante, 
  getProductosPorRestaurante,
  createProducto,
  updateProducto,
  deleteProducto,
  createCategoriaMenu,
  updateCategoriaMenu,
  deleteCategoriaMenu
} from '@/services/catalogoService'
import ProductoModal from '@/components/restaurante/ProductoModal.vue'
import CategoriaModal from '@/components/restaurante/CategoriaModal.vue'

const route = useRoute()
const router = useRouter()

// Estados reactivos
const restaurante = ref(null)
const categorias = ref([])
const productos = ref([])
const loading = ref(true)
const error = ref('')
const mensaje = ref('')
const categoriaSeleccionada = ref(null)

// Estados de los modales
const modalProducto = ref({ abierto: false, datos: null })
const modalCategoria = ref({ abierto: false, datos: null })

// Computed
const productosFiltrados = computed(() => {
  if (!categoriaSeleccionada.value) return productos.value
  return productos.value.filter(p => p.categoria_id === categoriaSeleccionada.value)
})

const nombreCategoriaSeleccionada = computed(() => {
  if (!categoriaSeleccionada.value) return 'Todas las categorías'
  const cat = categorias.value.find(c => c.id === categoriaSeleccionada.value)
  return cat ? cat.nombre : 'Categoría'
})

// Métodos
const cargarDatos = async () => {
  loading.value = true
  error.value = ''
  try {
    const restauranteId = route.params.id
    const [restData, catData, prodData] = await Promise.all([
      getRestaurante(restauranteId),
      getCategoriasPorRestaurante(restauranteId),
      getProductosPorRestaurante(restauranteId)
    ])
    
    restaurante.value = restData.data
    categorias.value = catData.data || []
    productos.value = prodData.data || []
    
  } catch (err) {
    console.error('Error al cargar datos:', err)
    error.value = 'Error al cargar los datos del restaurante'
  } finally {
    loading.value = false
  }
}

// Operaciones de Productos
const abrirModalProducto = (producto = null) => {
  modalProducto.value = { 
    abierto: true, 
    datos: producto ? { ...producto } : null 
  }
}


  const guardarProducto = async (productoData) => {
    console.log('Datos recibidos en guardarProducto:', productoData)
  if (!productoData || typeof productoData !== 'object') {
    console.error('Datos del producto no válidos', productoData)
    return
  }
  
  try {
    const formData = new FormData()
    
    // Agregar campos al FormData
    Object.keys(productoData).forEach(key => {
  if (key === 'imagen' && productoData[key] instanceof File) {
    formData.append('imagen', productoData[key])
  } else if (key !== 'id' && productoData[key] !== null) {
    formData.append(key, productoData[key])
  }
})

    if (productoData.id) {
      await updateProducto(productoData.id, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      mensaje.value = 'Producto actualizado correctamente'
    } else {
      formData.append('restaurante_id', restaurante.value.id)
      await createProducto(formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      mensaje.value = 'Producto creado correctamente'
    }
    
    modalProducto.value.abierto = false
    await cargarDatos()
    setTimeout(() => mensaje.value = '', 3000)
  } catch (err) {
    console.error('Error al guardar producto:', err)
    error.value = 'Error al guardar el producto'
    mensaje.value = 'Error al guardar el producto'
  }
}

const eliminarProducto = async (id) => {
  if (!confirm('¿Estás seguro de eliminar este producto?')) return
  try {
    await deleteProducto(id)
    mensaje.value = 'Producto eliminado correctamente'
    await cargarDatos()
  } catch (err) {
    console.error('Error al eliminar producto:', err)
    mensaje.value = 'Error al eliminar el producto'
  }
}

// Operaciones de Categorías
const abrirModalCategoria = (categoria = null) => {
  modalCategoria.value = { 
    abierto: true, 
    datos: categoria ? { ...categoria } : null 
  }
}

const guardarCategoria = async (categoriaData) => {
  try {
    if (categoriaData.id) {
      await updateCategoriaMenu(categoriaData.id, categoriaData)
      mensaje.value = 'Categoría actualizada correctamente'
    } else {
      await createCategoriaMenu({
        ...categoriaData,
        restaurante_id: restaurante.value.id
      })
      mensaje.value = 'Categoría creada correctamente'
    }
    
    modalCategoria.value.abierto = false
    await cargarDatos()
    setTimeout(() => mensaje.value = '', 3000)
  } catch (err) {
    console.error('Error al guardar categoría:', err)
    error.value = 'Error al guardar la categoría'
    mensaje.value = 'Error al guardar la categoría'
  }
}

const eliminarCategoria = async (id) => {
  if (!confirm('¿Estás seguro de eliminar esta categoría? Esto también eliminará todos los productos asociados.')) return
  try {
    await deleteCategoriaMenu(id)
    mensaje.value = 'Categoría eliminada correctamente'
    categoriaSeleccionada.value = null
    await cargarDatos()
  } catch (err) {
    console.error('Error al eliminar categoría:', err)
    mensaje.value = 'Error al eliminar la categoría'
  }
}

// Utilidades
const getImagenUrl = (img) => {
  if (!img) return '/placeholder-food.jpg'
  return img.startsWith('http') ? img : `http://localhost:8000/storage/${img}`
}

const formatoPrecio = (precio) => {
  return parseFloat(precio).toFixed(2)
}

const volver = () => {
  router.push('/mis-restaurantes')
}
const editarProducto = (producto) => {
  abrirModalProducto(producto)
}


const editarCategoria = (categoria) => {
  abrirModalCategoria(categoria)
}

// Ciclo de vida
onMounted(cargarDatos)
</script>

<style scoped>
.admin-productos-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
}

.back-btn {
  background: transparent;
  border: 2px solid #007bff;
  color: #007bff;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  font-size: 1.3rem;
  cursor: pointer;
  transition: all 0.3s;
}

.back-btn:hover {
  background: #007bff;
  color: white;
}

.page-header h1 {
  margin: 0;
  font-size: 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.estado-badge {
  padding: 0.5rem 1rem;
  border-radius: 30px;
  font-size: 0.9rem;
  font-weight: 600;
}

.estado-badge.abierto { background: #d4edda; color: #155724; }
.estado-badge.cerrado { background: #f8d7da; color: #721c24; }

.btn-primary {
  background: #007bff;
  color: white;
  border: none;
  padding: 0.9rem 1.8rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary:hover { background: #0056b3; }

.restaurante-info {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  color: #555;
  font-size: 1.1rem;
}

.info-item { display: flex; align-items: center; gap: 0.5rem; }

/* Categorías */
.categorias-section {
  background: #f8f9ff;
  padding: 2rem;
  border-radius: 16px;
  margin-bottom: 2.5rem;
  border: 2px dashed #d0d4ff;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.section-header h3 {
  margin: 0;
  font-size: 1.5rem;
  color: #2d3748;
}

.btn-add {
  background: #667eea;
  color: white;
  border: none;
  padding: 0.7rem 1.4rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
}

.btn-add:hover { background: #5a6fd8; }

.empty-categories {
  text-align: center;
  color: #718096;
  padding: 2rem;
}

.categorias-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.tab-btn {
  padding: 0.8rem 1.5rem;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 30px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tab-btn:hover { border-color: #667eea; }
.tab-btn.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.acciones-categoria {
  display: flex;
  gap: 0.5rem;
  margin-left: 0.5rem;
}

.btn-icon.small {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
}

.btn-icon.small { background: #e3f2fd; color: #1976d2; }
.btn-icon.small.danger { background: #ffebee; color: #c62828; }

/* Productos */
.productos-section .section-title {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.section-title h2 { margin: 0; font-size: 1.8rem; color: #2d3748; }
.count { color: #718096; font-size: 1.1rem; }

.empty-products {
  text-align: center;
  padding: 4rem 2rem;
  color: #718096;
}

.productos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;
}

.producto-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0,0,0,0.08);
  transition: all 0.3s;
}

.producto-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 25px rgba(0,0,0,0.15);
}

.imagen-container {
  height: 200px;
  overflow: hidden;
  background: #f1f5f9;
}

.imagen-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.placeholder {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-size: 3rem;
}

.info {
  padding: 1.5rem;
}

.info h3 {
  margin: 0 0 0.5rem;
  font-size: 1.3rem;
  color: #1e293b;
}

.precio {
  font-size: 1.5rem;
  font-weight: bold;
  color: #007bff;
  margin: 0.5rem 0;
}

.descripcion {
  color: #64748b;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.acciones {
  display: flex;
  gap: 1rem;
}

.btn-edit, .btn-delete {
  flex: 1;
  padding: 0.8rem;
  border-radius: 10px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.btn-edit {
  background: #e3f2fd;
  color: #1976d2;
  border: 1.5px solid #bbdefb;
}

.btn-edit:hover { background: #bbdefb; }

.btn-delete {
  background: #ffebee;
  color: #c62828;
  border: 1.5px solid #ffcdd2;
}

.btn-delete:hover { background: #ffcdd2; }

/* Mensajes */
.alert {
  position: fixed;
  top: 20px;
  right: 20px;
  background: #10b981;
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  z-index: 1000;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  animation: slideIn 0.4s ease;
}

@keyframes slideIn {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* Responsive */
@media (max-width: 768px) {
  .page-header { flex-direction: column; align-items: stretch; text-align: center; }
  .categorias-tabs { overflow-x: auto; padding-bottom: 0.5rem; }
  .tab-btn { white-space: nowrap; }
  .acciones { flex-direction: column; }
}
/* === CATEGORÍAS - BOTONES EDITAR MEJORADOS === */
.categorias-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
}

.tab-btn {
  padding: 0.8rem 1.5rem;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 30px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  position: relative;
  min-height: 48px;
}

.tab-btn:hover {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

.tab-btn.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

/* Contenedor de acciones (solo editar) */
.acciones-categoria {
  opacity: 0;
  transition: opacity 0.25s ease;
  pointer-events: none; /* Evita que interfiera con el click del tab */
}

/* Mostrar al hacer hover o si está activa */
.tab-btn:hover .acciones-categoria,
.tab-btn.active .acciones-categoria {
  opacity: 1;
  pointer-events: all;
}

/* Botón Editar - ÚNICO */
.acciones-categoria .btn-editar-cat {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #e0f2fe;
  color: #0369a1;
  border: none;
  font-size: 0.95rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s ease;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

.acciones-categoria .btn-editar-cat:hover {
  background: #0ea5e9;
  color: white;
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 6px 16px rgba(14, 165, 233, 0.3);
}

/* Cuando la categoría está activa, el botón se ve más fuerte */
.tab-btn.active .btn-editar-cat {
  background: white;
  color: #667eea;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
}

.tab-btn.active .btn-editar-cat:hover {
  background: #667eea;
  color: white;
}
</style>