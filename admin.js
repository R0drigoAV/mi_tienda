// Variables globales
let myImageWidget, myVideoWidget;
let currentMediaUrl = '';
let currentMediaType = '';

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
    updateProductsList();
}

// Resetear formulario
function resetForm() {
    document.getElementById('product-form').reset();
    document.getElementById('preview').classList.add('hidden');
    currentMediaUrl = '';
    currentMediaType = '';
}

// Mostrar lista de productos
function updateProductsList() {
    const products = JSON.parse(localStorage.getItem("products")) || [];
    const container = document.getElementById('products-container');
    const listSection = document.getElementById('products-list');
    
    console.log("📋 Actualizando lista de productos:", products.length);
    
    if (products.length === 0) {
        listSection.classList.add('hidden');
        return;
    }
    
    listSection.classList.remove('hidden');
    container.innerHTML = '';
    
    products.forEach((product, index) => {
        const productDiv = document.createElement('div');
        productDiv.className = 'bg-gray-50 p-3 rounded-lg border';
        productDiv.innerHTML = `
            <div class="flex justify-between items-start">
                <div class="flex-1">
                    <h4 class="font-semibold">${product.name}</h4>
                    <p class="text-sm text-gray-600">S/ ${product.price.toFixed(2)}</p>
                    <p class="text-sm text-gray-500">Stock: ${product.quantity}</p>
                </div>
                <button onclick="deleteProduct(${index})" class="text-red-500 hover:text-red-700 ml-2">
                    🗑️
                </button>
            </div>
        `;
        container.appendChild(productDiv);
    });
}

// Eliminar producto
function deleteProduct(index) {
    if (confirm("¿Estás seguro de eliminar este producto?")) {
        let products = JSON.parse(localStorage.getItem("products")) || [];
        products.splice(index, 1);
        localStorage.setItem("products", JSON.stringify(products));
        updateProductsList();
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
        console.log("📸 Abriendo widget de imágenes...");
        if (myImageWidget) myImageWidget.open();
    });
    
    document.getElementById('upload_video').addEventListener('click', () => {
        console.log("🎥 Abriendo widget de videos...");
        if (myVideoWidget) myVideoWidget.open();
    });
    
    document.getElementById('product-form').addEventListener('submit', saveProduct);
    
    // Cargar lista de productos
    updateProductsList();
    
    console.log("✅ Event listeners configurados correctamente");
});

// Función global para eliminar productos
window.deleteProduct = deleteProduct;

// Variables para modales
let productToDeleteIndex = null;

// Función para abrir modal de edición
function openEditModal(index) {
    const products = JSON.parse(localStorage.getItem("products")) || [];
    const product = products[index];
    
    if (!product) return;
    
    // Llenar el formulario con los datos del producto
    document.getElementById('edit-index').value = index;
    document.getElementById('edit-name').value = product.name;
    document.getElementById('edit-description').value = product.description;
    document.getElementById('edit-price').value = product.price;
    document.getElementById('edit-quantity').value = product.quantity;
    
    // Mostrar vista previa del media
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
    
    // Mostrar modal
    document.getElementById('edit-modal').classList.remove('hidden');
}

// Función para cerrar modal de edición
function closeEditModal() {
    document.getElementById('edit-modal').classList.add('hidden');
}

// Función para guardar cambios de edición
function saveProductEdit(event) {
    event.preventDefault();
    
    const index = document.getElementById('edit-index').value;
    const products = JSON.parse(localStorage.getItem("products")) || [];
    
    if (index >= 0 && index < products.length) {
        // Actualizar producto
        products[index] = {
            ...products[index], // Mantener media y mediaType
            name: document.getElementById('edit-name').value,
            description: document.getElementById('edit-description').value,
            price: parseFloat(document.getElementById('edit-price').value),
            quantity: parseInt(document.getElementById('edit-quantity').value),
            updatedAt: new Date().toISOString()
        };
        
        localStorage.setItem("products", JSON.stringify(products));
        alert("✅ Producto actualizado correctamente");
        
        closeEditModal();
        updateProductsList();
    }
}

// Función para abrir modal de confirmación de eliminación
function openDeleteModal(index) {
    productToDeleteIndex = index;
    document.getElementById('confirm-modal').classList.remove('hidden');
}

// Función para cerrar modal de confirmación
function closeConfirmModal() {
    productToDeleteIndex = null;
    document.getElementById('confirm-modal').classList.add('hidden');
}

// Función para confirmar eliminación
function confirmDelete() {
    if (productToDeleteIndex !== null) {
        const products = JSON.parse(localStorage.getItem("products")) || [];
        products.splice(productToDeleteIndex, 1);
        localStorage.setItem("products", JSON.stringify(products));
        
        alert("🗑️ Producto eliminado correctamente");
        closeConfirmModal();
        updateProductsList();
    }
}

// Función para eliminar todos los productos
function deleteAllProducts() {
    if (confirm("¿Estás seguro de que quieres eliminar TODOS los productos? Esta acción no se puede deshacer.")) {
        localStorage.removeItem("products");
        alert("🗑️ Todos los productos han sido eliminados");
        updateProductsList();
    }
}

// Actualizar la función updateProductsList para incluir botones de edición y eliminación
function updateProductsList() {
    const products = JSON.parse(localStorage.getItem("products")) || [];
    const container = document.getElementById('products-container');
    const listSection = document.getElementById('products-list');
    
    console.log("📋 Actualizando lista de productos:", products.length);
    
    if (products.length === 0) {
        listSection.classList.add('hidden');
        return;
    }
    
    listSection.classList.remove('hidden');
    container.innerHTML = '';
    
    products.forEach((product, index) => {
        const productDiv = document.createElement('div');
        productDiv.className = 'bg-gray-50 p-4 rounded-lg border';
        productDiv.innerHTML = `
            <div class="flex justify-between items-start mb-3">
                <div class="flex-1">
                    <h4 class="font-semibold text-lg">${product.name}</h4>
                    <p class="text-gray-600">S/ ${product.price.toFixed(2)}</p>
                    <p class="text-sm text-gray-500">Stock: ${product.quantity}</p>
                    <p class="text-xs text-gray-400">Agregado: ${new Date(product.createdAt).toLocaleDateString()}</p>
                </div>
                <div class="flex gap-2">
                    <button onclick="openEditModal(${index})" class="text-blue-500 hover:text-blue-700" title="Editar">
                        ✏️
                    </button>
                    <button onclick="openDeleteModal(${index})" class="text-red-500 hover:text-red-700" title="Eliminar">
                        🗑️
                    </button>
                </div>
            </div>
            <div class="text-center">
                ${product.mediaType === 'video' ? 
                    `<video src="${product.media}" class="w-20 h-20 object-cover mx-auto rounded" controls></video>` :
                    `<img src="${product.media}" alt="${product.name}" class="w-20 h-20 object-cover mx-auto rounded">`
                }
            </div>
        `;
        container.appendChild(productDiv);
    });
    
    // Agregar botón para eliminar todos los productos si hay más de 1
    if (products.length > 0) {
        const deleteAllBtn = document.createElement('button');
        deleteAllBtn.className = 'w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg mt-4';
        deleteAllBtn.innerHTML = '🗑️ Eliminar Todos los Productos';
        deleteAllBtn.onclick = deleteAllProducts;
        container.appendChild(deleteAllBtn);
    }
}

// Agregar event listener para el formulario de edición
document.addEventListener("DOMContentLoaded", function() {
    // ... código existente ...
    
    // Agregar event listener para el formulario de edición
    document.getElementById('edit-product-form').addEventListener('submit', saveProductEdit);
    
    // Cerrar modales al hacer clic fuera
    document.getElementById('edit-modal').addEventListener('click', function(e) {
        if (e.target === this) closeEditModal();
    });
    
    document.getElementById('confirm-modal').addEventListener('click', function(e) {
        if (e.target === this) closeConfirmModal();
    });
});

// Hacer funciones globales para que funcionen en los botones
window.openEditModal = openEditModal;
window.openDeleteModal = openDeleteModal;
window.closeEditModal = closeEditModal;
window.closeConfirmModal = closeConfirmModal;
window.confirmDelete = confirmDelete;
window.deleteAllProducts = deleteAllProducts;