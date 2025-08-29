// Variables globales
let myImageWidget, myVideoWidget;
let currentMediaUrl = '';
let currentMediaType = '';
let productToDeleteIndex = null;

// Configurar widgets de Cloudinary
function initCloudinary() {
    console.log("🔄 Inicializando Cloudinary...");
    
    try {
        // Widget para imágenes
        myImageWidget = cloudinary.createUploadWidget({
            cloudName: 'dgio6hkz8',
            uploadPreset: 'Tienda',
            sources: ['local', 'camera'],
            multiple: false,
            clientAllowedFormats: ['image'],
            maxFileSize: 5000000
        }, handleUploadResult);

        // Widget para videos
        myVideoWidget = cloudinary.createUploadWidget({
            cloudName: 'dgio6hkz8',
            uploadPreset: 'Tienda',
            sources: ['local'],
            multiple: false,
            clientAllowedFormats: ['video'],
            maxFileSize: 20000000,
            resourceType: 'video'
        }, handleUploadResult);

        console.log("✅ Cloudinary inicializado correctamente");
        return true;
    } catch (error) {
        console.error("❌ Error al inicializar Cloudinary:", error);
        alert("Error al cargar Cloudinary. Recarga la página.");
        return false;
    }
}

// Manejar resultado de subida
function handleUploadResult(error, result) {
    console.log("📨 Resultado de subida:", result);
    
    if (error) {
        console.error("❌ Error:", error);
        alert("Error al subir: " + error.message);
        return;
    }
    
    if (result && result.event === "success") {
        console.log("✅ Medio subido:", result.info);
        currentMediaUrl = result.info.secure_url;
        currentMediaType = result.info.resource_type;
        showPreview(result.info);
    }
}

// Mostrar vista previa
function showPreview(fileInfo) {
    const previewContainer = document.getElementById('preview-media');
    const previewSection = document.getElementById('preview');
    const previewUrl = document.getElementById('preview-url');
    
    previewSection.classList.remove('hidden');
    previewUrl.textContent = fileInfo.secure_url;
    
    if (fileInfo.resource_type === 'image') {
        previewContainer.innerHTML = `
            <img src="${fileInfo.secure_url}" alt="Vista previa" 
                 class="w-48 h-48 object-contain mx-auto rounded-lg">
            <p class="text-sm text-gray-500 mt-2">Imagen</p>
        `;
    } else if (fileInfo.resource_type === 'video') {
        previewContainer.innerHTML = `
            <video controls class="w-full max-h-48 rounded-lg mx-auto">
                <source src="${fileInfo.secure_url}" type="video/mp4">
                Tu navegador no soporta videos.
            </video>
            <p class="text-sm text-gray-500 mt-2">Video</p>
        `;
    }
}

// Guardar producto
function saveProduct(event) {
    event.preventDefault();
    console.log("💾 Intentando guardar producto...");
    
    if (!currentMediaUrl) {
        alert("⚠️ Primero sube una imagen o video");
        return;
    }

    const product = {
        name: document.getElementById('product-name').value,
        description: document.getElementById('product-description').value,
        price: parseFloat(document.getElementById('product-price').value),
        quantity: parseInt(document.getElementById('product-quantity').value),
        media: currentMediaUrl,
        mediaType: currentMediaType,
        createdAt: new Date().toISOString()
    };

    console.log("📦 Producto a guardar:", product);

    // Validaciones
    if (!product.name || !product.description || product.price <= 0 || product.quantity <= 0) {
        alert("⚠️ Completa todos los campos correctamente");
        return;
    }

    // Guardar en localStorage
    let products = JSON.parse(localStorage.getItem("products")) || [];
    products.push(product);
    localStorage.setItem("products", JSON.stringify(products));

    console.log("✅ Productos en localStorage:", products);
    alert("✅ Producto guardado con éxito!");
    
    // Limpiar formulario
    resetForm();
    // Actualizar la lista de productos en la pestaña de gestión
    loadProductsList();
}

// Resetear formulario
function resetForm() {
    document.getElementById('product-form').reset();
    document.getElementById('preview').classList.add('hidden');
    currentMediaUrl = '';
    currentMediaType = '';
}

// Cargar lista de productos en la pestaña de gestión
function loadProductsList() {
    const products = JSON.parse(localStorage.getItem("products")) || [];
    const container = document.getElementById('products-container');
    const countElement = document.getElementById('products-count');
    
    console.log("📋 Cargando lista de productos:", products.length);
    countElement.textContent = products.length;
    
    if (products.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-16" />
                </svg>
                <p>No hay productos guardados</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    products.forEach((product, index) => {
        const productDiv = document.createElement('div');
        productDiv.className = 'product-item bg-gray-50 p-4 rounded-lg border';
        productDiv.innerHTML = `
            <div class="flex items-start gap-4">
                <div class="flex-shrink-0">
                    ${product.mediaType === 'video' ? 
                        `<video src="${product.media}" class="w-16 h-16 object-cover rounded" controls></video>` :
                        `<img src="${product.media}" alt="${product.name}" class="w-16 h-16 object-cover rounded">`
                    }
                </div>
                <div class="flex-1">
                    <h4 class="font-semibold text-lg">${product.name}</h4>
                    <p class="text-gray-600 text-sm">${product.description.substring(0, 50)}${product.description.length > 50 ? '...' : ''}</p>
                    <div class="flex justify-between items-center mt-2">
                        <span class="text-green-600 font-bold">S/ ${product.price.toFixed(2)}</span>
                        <span class="text-sm ${product.quantity > 0 ? 'text-green-600' : 'text-red-600'}">
                            Stock: ${product.quantity}
                        </span>
                    </div>
                </div>
                <div class="flex gap-2">
                    <button onclick="openEditModal(${index})" class="text-blue-500 hover:text-blue-700 p-2" title="Editar">
                        ✏️
                    </button>
                    <button onclick="openDeleteModal(${index})" class="text-red-500 hover:text-red-700 p-2" title="Eliminar">
                        🗑️
                    </button>
                </div>
            </div>
        `;
        container.appendChild(productDiv);
    });
}

// Funciones para cambiar pestañas
function switchTab(tabName) {
    // Desactivar todas las pestañas
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Activar la pestaña seleccionada
    document.getElementById(`content-${tabName}`).classList.add('active');
    document.getElementById(`tab-${tabName}`).classList.add('active');
    
    // Si es la pestaña de gestión, cargar productos
    if (tabName === 'manage') {
        loadProductsList();
    }
}

// Funciones de modales (editar y eliminar) - Mantener las mismas del código anterior
function openEditModal(index) {
    const products = JSON.parse(localStorage.getItem("products")) || [];
    const product = products[index];
    
    if (!product) return;
    
    document.getElementById('edit-index').value = index;
    document.getElementById('edit-name').value = product.name;
    document.getElementById('edit-description').value = product.description;
    document.getElementById('edit-price').value = product.price;
    document.getElementById('edit-quantity').value = product.quantity;
    
    const mediaPreview = document.getElementById('edit-media-preview');
    if (product.mediaType === 'video') {
        mediaPreview.innerHTML = `
            <video controls class="w-32 h-32 mx-auto">
                <source src="${product.media}" type="video/mp4">
            </video>
            <p class="text-sm text-gray-500">Video actual</p>
        `;
    } else {
        mediaPreview.innerHTML = `
            <img src="${product.media}" alt="Imagen actual" class="w-32 h-32 object-contain mx-auto">
            <p class="text-sm text-gray-500">Imagen actual</p>
        `;
    }
    
    document.getElementById('edit-modal').classList.remove('hidden');
}

function closeEditModal() {
    document.getElementById('edit-modal').classList.add('hidden');
}

function saveProductEdit(event) {
    event.preventDefault();
    
    const index = document.getElementById('edit-index').value;
    const products = JSON.parse(localStorage.getItem("products")) || [];
    
    if (index >= 0 && index < products.length) {
        products[index] = {
            ...products[index],
            name: document.getElementById('edit-name').value,
            description: document.getElementById('edit-description').value,
            price: parseFloat(document.getElementById('edit-price').value),
            quantity: parseInt(document.getElementById('edit-quantity').value),
            updatedAt: new Date().toISOString()
        };
        
        localStorage.setItem("products", JSON.stringify(products));
        alert("✅ Producto actualizado correctamente");
        
        closeEditModal();
        loadProductsList();
    }
}

function openDeleteModal(index) {
    productToDeleteIndex = index;
    document.getElementById('confirm-modal').classList.remove('hidden');
}

function closeConfirmModal() {
    productToDeleteIndex = null;
    document.getElementById('confirm-modal').classList.add('hidden');
}

function confirmDelete() {
    if (productToDeleteIndex !== null) {
        const products = JSON.parse(localStorage.getItem("products")) || [];
        products.splice(productToDeleteIndex, 1);
        localStorage.setItem("products", JSON.stringify(products));
        
        alert("🗑️ Producto eliminado correctamente");
        closeConfirmModal();
        loadProductsList();
    }
}

function deleteAllProducts() {
    if (confirm("¿Estás seguro de que quieres eliminar TODOS los productos? Esta acción no se puede deshacer.")) {
        localStorage.removeItem("products");
        alert("🗑️ Todos los productos han sido eliminados");
        loadProductsList();
    }
}

// Cuando el documento esté listo
document.addEventListener("DOMContentLoaded", function() {
    console.log("🚀 Panel Admin mejorado cargado");
    
    // Inicializar Cloudinary
    if (typeof cloudinary !== 'undefined') {
        initCloudinary();
    } else {
        console.error("❌ Cloudinary no está cargado");
        alert("Error: Cloudinary no se cargó correctamente. Recarga la página.");
    }
    
    // Event listeners
    document.getElementById('upload_image').addEventListener('click', () => {
        if (myImageWidget) myImageWidget.open();
    });
    
    document.getElementById('upload_video').addEventListener('click', () => {
        if (myVideoWidget) myVideoWidget.open();
    });
    
    document.getElementById('product-form').addEventListener('submit', saveProduct);
    document.getElementById('edit-product-form').addEventListener('submit', saveProductEdit);
    
    // Event listeners para pestañas
    document.getElementById('tab-add').addEventListener('click', () => switchTab('add'));
    document.getElementById('tab-manage').addEventListener('click', () => switchTab('manage'));
    
    // Cerrar modales al hacer clic fuera
    document.getElementById('edit-modal').addEventListener('click', function(e) {
        if (e.target === this) closeEditModal();
    });
    
    document.getElementById('confirm-modal').addEventListener('click', function(e) {
        if (e.target === this) closeConfirmModal();
    });
    
    console.log("✅ Event listeners configurados correctamente");
});

// Hacer funciones globales
window.openEditModal = openEditModal;
window.openDeleteModal = openDeleteModal;
window.closeEditModal = closeEditModal;
window.closeConfirmModal = closeConfirmModal;
window.confirmDelete = confirmDelete;
window.deleteAllProducts = deleteAllProducts;
window.switchTab = switchTab;