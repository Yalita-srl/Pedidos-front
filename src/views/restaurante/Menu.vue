<template>
  <div class="menu-management">
    <RestaurantHeader />
    
    <div class="container">
      <div class="management-header">
        <h1>Gestión de Menú</h1>
        <button @click="showAddProductModal = true" class="btn-primary">
          + Agregar Producto
        </button>
      </div>

      <!-- Estadísticas -->
      <div class="stats-grid">
        <div class="stat-card">
          <h3>Total Productos</h3>
          <p class="stat-number">{{ totalProducts }}</p>
        </div>
        <div class="stat-card">
          <h3>Productos Disponibles</h3>
          <p class="stat-number available">{{ availableProducts }}</p>
        </div>
        <div class="stat-card">
          <h3>Productos No Disponibles</h3>
          <p class="stat-number unavailable">{{ unavailableProducts }}</p>
        </div>
        <div class="stat-card">
          <h3>Categorías</h3>
          <p class="stat-number">{{ restaurant.categorias.length }}</p>
        </div>
      </div>

      <!-- Gestión de Categorías -->
      <div class="categories-section">
        <div class="section-header">
          <h2>Categorías</h2>
          <button @click="showAddCategoryModal = true" class="btn-secondary">
            + Nueva Categoría
          </button>
        </div>
        
        <div class="categories-list">
          <div 
            v-for="categoria in restaurant.categorias" 
            :key="categoria.id"
            class="category-item"
          >
            <span>{{ categoria.nombre }}</span>
            <div class="category-actions">
              <button @click="editCategory(categoria)" class="btn-edit">✏️</button>
              <button @click="deleteCategory(categoria.id)" class="btn-delete">🗑️</button>
            </div>
          </div>
          
          <div v-if="restaurant.categorias.length === 0" class="empty-categories">
            <p>No hay categorías creadas</p>
          </div>
        </div>
      </div>

      <!-- Lista de Productos -->
      <div class="products-section">
        <div class="section-header">
          <h2>Productos</h2>
          <div class="product-filters">
            <select v-model="productFilter" @change="filterProducts">
              <option value="all">Todos los productos</option>
              <option value="available">Solo disponibles</option>
              <option value="unavailable">Solo no disponibles</option>
            </select>
          </div>
        </div>

        <div class="products-table">
          <table>
            <thead>
              <tr>
                <th>Imagen</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Descripción</th>
                <th>Precio</th>
                <th>Disponible</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="producto in filteredProducts" 
                :key="producto.id"
                :class="{ 'unavailable-row': !producto.disponible }"
              >
                <td>
                  <div class="product-image-small">
                    <img 
                      v-if="producto.imagen" 
                      :src="getImageUrl(producto.imagen)" 
                      :alt="producto.nombre"
                    />
                    <div v-else class="no-image-small">📷</div>
                  </div>
                </td>
                <td>{{ producto.nombre }}</td>
                <td>
                  {{ getCategoryName(producto.categoria_id) }}
                </td>
                <td class="description-cell">
                  {{ producto.descripcion }}
                </td>
                <td>${{ producto.precio }}</td>
                <td>
                  <label class="switch">
                    <input 
                      type="checkbox" 
                      :checked="producto.disponible"
                      @change="toggleAvailability(producto)"
                    >
                    <span class="slider"></span>
                  </label>
                </td>
                <td>
                  <div class="action-buttons">
                    <button 
                      @click="editProduct(producto)" 
                      class="btn-edit"
                      title="Editar producto"
                    >
                      ✏️
                    </button>
                    <button 
                      @click="deleteProduct(producto.id)" 
                      class="btn-delete"
                      title="Eliminar producto"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          
          <div v-if="filteredProducts.length === 0" class="empty-products">
            <p>No hay productos que coincidan con el filtro</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Agregar/Editar Producto -->
    <div v-if="showAddProductModal" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ editingProduct ? 'Editar Producto' : 'Agregar Nuevo Producto' }}</h3>
          <button @click="closeModal" class="close-btn">×</button>
        </div>
        
        <div class="modal-body">
          <form @submit.prevent="saveProduct">
            <div class="form-group">
              <label>Nombre del Producto *</label>
              <input 
                type="text" 
                v-model="productForm.nombre" 
                required 
                placeholder="Ej: Hamburguesa Especial"
              />
            </div>
            
            <div class="form-group">
              <label>Categoría *</label>
              <select v-model="productForm.categoria_id" required>
                <option value="">Seleccionar categoría</option>
                <option 
                  v-for="categoria in restaurant.categorias" 
                  :key="categoria.id" 
                  :value="categoria.id"
                >
                  {{ categoria.nombre }}
                </option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Descripción</label>
              <textarea 
                v-model="productForm.descripcion" 
                placeholder="Descripción del producto..."
                rows="3"
              ></textarea>
            </div>
            
            <div class="form-group">
              <label>Precio *</label>
              <input 
                type="number" 
                v-model="productForm.precio" 
                step="0.01" 
                min="0" 
                required 
                placeholder="0.00"
              />
            </div>
            
            <div class="form-group">
              <label>Imagen</label>
              <input 
                type="file" 
                @change="handleImageUpload" 
                accept="image/*"
              />
              <div v-if="productForm.imagen_preview" class="image-preview">
                <img :src="productForm.imagen_preview" alt="Preview" />
              </div>
            </div>
            
            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="productForm.disponible" />
                Producto disponible
              </label>
            </div>
            
            <div class="form-actions">
              <button type="button" @click="closeModal" class="btn-cancel">
                Cancelar
              </button>
              <button type="submit" class="btn-primary">
                {{ editingProduct ? 'Actualizar' : 'Crear' }} Producto
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal Agregar/Editar Categoría -->
    <div v-if="showAddCategoryModal" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ editingCategory ? 'Editar Categoría' : 'Nueva Categoría' }}</h3>
          <button @click="closeCategoryModal" class="close-btn">×</button>
        </div>
        
        <div class="modal-body">
          <form @submit.prevent="saveCategory">
            <div class="form-group">
              <label>Nombre de la Categoría *</label>
              <input 
                type="text" 
                v-model="categoryForm.nombre" 
                required 
                placeholder="Ej: Entradas, Bebidas, Postres..."
              />
            </div>
            
            <div class="form-actions">
              <button type="button" @click="closeCategoryModal" class="btn-cancel">
                Cancelar
              </button>
              <button type="submit" class="btn-primary">
                {{ editingCategory ? 'Actualizar' : 'Crear' }} Categoría
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRestaurantStore } from '@/store/restaurant'
import RestaurantHeader from '@/components/restaurant/RestaurantHeader.vue'

export default {
  name: 'MenuManagement',
  components: {
    RestaurantHeader
  },
  setup() {
    const restaurantStore = useRestaurantStore()
    
    const restaurant = ref({
      categorias: [],
      productos: []
    })
    const showAddProductModal = ref(false)
    const showAddCategoryModal = ref(false)
    const editingProduct = ref(null)
    const editingCategory = ref(null)
    const productFilter = ref('all')

    // Formularios
    const productForm = ref({
      nombre: '',
      categoria_id: '',
      descripcion: '',
      precio: '',
      disponible: true,
      imagen: null,
      imagen_preview: null
    })

    const categoryForm = ref({
      nombre: ''
    })

    // Cargar datos del restaurante
    const loadRestaurantData = async () => {
      try {
        // En una app real, esto vendría de tu API
        const response = await restaurantStore.getCurrentRestaurant()
        restaurant.value = response.data
      } catch (error) {
        console.error('Error loading restaurant data:', error)
      }
    }

    // Computed properties para estadísticas
    const totalProducts = computed(() => restaurant.value.productos.length)
    const availableProducts = computed(() => 
      restaurant.value.productos.filter(p => p.disponible).length
    )
    const unavailableProducts = computed(() => 
      restaurant.value.productos.filter(p => !p.disponible).length
    )

    // Filtrar productos
    const filteredProducts = computed(() => {
      switch (productFilter.value) {
        case 'available':
          return restaurant.value.productos.filter(p => p.disponible)
        case 'unavailable':
          return restaurant.value.productos.filter(p => !p.disponible)
        default:
          return restaurant.value.productos
      }
    })

    // Obtener nombre de categoría
    const getCategoryName = (categoryId) => {
      const category = restaurant.value.categorias.find(c => c.id === categoryId)
      return category ? category.nombre : 'Sin categoría'
    }

    // URL de imagen
    const getImageUrl = (imagePath) => {
      return `http://localhost:8000/storage/${imagePath}`
    }

    // Métodos para productos
    const addProduct = () => {
      editingProduct.value = null
      resetProductForm()
      showAddProductModal.value = true
    }

    const editProduct = (producto) => {
      editingProduct.value = producto
      productForm.value = {
        nombre: producto.nombre,
        categoria_id: producto.categoria_id,
        descripcion: producto.descripcion,
        precio: producto.precio,
        disponible: producto.disponible,
        imagen: null,
        imagen_preview: producto.imagen ? getImageUrl(producto.imagen) : null
      }
      showAddProductModal.value = true
    }

    const saveProduct = async () => {
      try {
        const formData = new FormData()
        Object.keys(productForm.value).forEach(key => {
          if (key !== 'imagen_preview') {
            formData.append(key, productForm.value[key])
          }
        })

        if (editingProduct.value) {
          // Actualizar producto existente
          await restaurantStore.updateProduct(editingProduct.value.id, formData)
        } else {
          // Crear nuevo producto
          await restaurantStore.createProduct(formData)
        }

        closeModal()
        await loadRestaurantData()
      } catch (error) {
        console.error('Error saving product:', error)
      }
    }

    const deleteProduct = async (productId) => {
      if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
        try {
          await restaurantStore.deleteProduct(productId)
          await loadRestaurantData()
        } catch (error) {
          console.error('Error deleting product:', error)
        }
      }
    }

    const toggleAvailability = async (producto) => {
      try {
        await restaurantStore.updateProduct(producto.id, {
          disponible: !producto.disponible
        })
        await loadRestaurantData()
      } catch (error) {
        console.error('Error toggling availability:', error)
      }
    }

    // Métodos para categorías
    const addCategory = () => {
      editingCategory.value = null
      resetCategoryForm()
      showAddCategoryModal.value = true
    }

    const editCategory = (categoria) => {
      editingCategory.value = categoria
      categoryForm.value.nombre = categoria.nombre
      showAddCategoryModal.value = true
    }

    const saveCategory = async () => {
      try {
        if (editingCategory.value) {
          await restaurantStore.updateCategory(editingCategory.value.id, categoryForm.value)
        } else {
          await restaurantStore.createCategory(categoryForm.value)
        }

        closeCategoryModal()
        await loadRestaurantData()
      } catch (error) {
        console.error('Error saving category:', error)
      }
    }

    const deleteCategory = async (categoryId) => {
      if (confirm('¿Estás seguro de que quieres eliminar esta categoría? Los productos en esta categoría quedarán sin categoría.')) {
        try {
          await restaurantStore.deleteCategory(categoryId)
          await loadRestaurantData()
        } catch (error) {
          console.error('Error deleting category:', error)
        }
      }
    }

    // Utilidades
    const handleImageUpload = (event) => {
      const file = event.target.files[0]
      if (file) {
        productForm.value.imagen = file
        productForm.value.imagen_preview = URL.createObjectURL(file)
      }
    }

    const resetProductForm = () => {
      productForm.value = {
        nombre: '',
        categoria_id: '',
        descripcion: '',
        precio: '',
        disponible: true,
        imagen: null,
        imagen_preview: null
      }
    }

    const resetCategoryForm = () => {
      categoryForm.value = { nombre: '' }
    }

    const closeModal = () => {
      showAddProductModal.value = false
      editingProduct.value = null
      resetProductForm()
    }

    const closeCategoryModal = () => {
      showAddCategoryModal.value = false
      editingCategory.value = null
      resetCategoryForm()
    }

    const filterProducts = () => {
      // El filtro se aplica automáticamente mediante computed property
    }

    onMounted(() => {
      loadRestaurantData()
    })

    return {
      restaurant,
      showAddProductModal,
      showAddCategoryModal,
      editingProduct,
      editingCategory,
      productFilter,
      productForm,
      categoryForm,
      totalProducts,
      availableProducts,
      unavailableProducts,
      filteredProducts,
      addProduct,
      editProduct,
      saveProduct,
      deleteProduct,
      toggleAvailability,
      addCategory,
      editCategory,
      saveCategory,
      deleteCategory,
      getCategoryName,
      getImageUrl,
      handleImageUpload,
      closeModal,
      closeCategoryModal,
      filterProducts
    }
  }
}
</script>

<style scoped>
.menu-management {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.management-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.management-header h1 {
  color: #333;
  margin: 0;
}

.btn-primary {
  background: #007bff;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
}

.btn-primary:hover {
  background: #0056b3;
}

/* Estadísticas */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.stat-number {
  font-size: 32px;
  font-weight: bold;
  margin: 10px 0 0 0;
}

.stat-number.available {
  color: #28a745;
}

.stat-number.unavailable {
  color: #dc3545;
}

/* Secciones */
.categories-section, .products-section {
  background: white;
  padding: 25px;
  border-radius: 8px;
  margin-bottom: 30px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  margin: 0;
  color: #333;
}

.btn-secondary {
  background: #6c757d;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 5px;
  cursor: pointer;
}

/* Lista de categorías */
.categories-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
}

.category-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 5px;
  border-left: 4px solid #007bff;
}

.category-actions {
  display: flex;
  gap: 10px;
}

.btn-edit, .btn-delete {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  padding: 5px;
}

.btn-edit:hover {
  color: #007bff;
}

.btn-delete:hover {
  color: #dc3545;
}

/* Tabla de productos */
.products-table {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

th, td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #dee2e6;
}

th {
  background: #f8f9fa;
  font-weight: 600;
  color: #495057;
}

.unavailable-row {
  background: #f8f9fa;
  opacity: 0.6;
}

.product-image-small {
  width: 50px;
  height: 50px;
  border-radius: 5px;
  overflow: hidden;
}

.product-image-small img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image-small {
  width: 100%;
  height: 100%;
  background: #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.description-cell {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Switch para disponibilidad */
.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #28a745;
}

input:checked + .slider:before {
  transform: translateX(26px);
}

.action-buttons {
  display: flex;
  gap: 10px;
}

/* Modales */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #dee2e6;
}

.modal-header h3 {
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6c757d;
}

.modal-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  color: #495057;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 16px;
}

.form-group textarea {
  resize: vertical;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: normal;
}

.checkbox-label input {
  width: auto;
}

.image-preview {
  margin-top: 10px;
}

.image-preview img {
  max-width: 100%;
  max-height: 200px;
  border-radius: 5px;
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 30px;
}

.btn-cancel {
  background: #6c757d;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
}

.btn-cancel:hover {
  background: #545b62;
}

.empty-categories, .empty-products {
  text-align: center;
  padding: 40px;
  color: #6c757d;
  grid-column: 1 / -1;
}

@media (max-width: 768px) {
  .management-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }
  
  .section-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .categories-list {
    grid-template-columns: 1fr;
  }
  
  .modal {
    width: 95%;
    margin: 20px;
  }
}
</style>