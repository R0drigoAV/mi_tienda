// Variables globales
let myImageWidget, myVideoWidget;
let currentMedia = []; // Array para múltiples medios
let productToDeleteIndex = null;

// Variables para edición
window.currentEditIndex = null;
window.uploadingForEdit = false;

// Configurar widgets de Cloudinary
function initCloudinary() {
    console.log("🔄 Inicializando Cloudinary...");
    
    try {
        // Widget para imágenes (ahora permite múltiples)
        myImageWidget = cloudinary.createUploadWidget({
            cloudName: 'dgio6hkz8',
            uploadPreset: 'Tienda',
            sources: ['local', 'camera'],
            multiple: true, // ✅ Permitir múltiples imágenes
            clientAllowedFormats: ['image'],
            maxFileSize: 5000000
        }, handleUploadResult);

        // Widget para videos
        myVideoWidget = cloudinary.createUploadWidget({
            cloudName: 'dgio6hkz8',
            uploadPreset: 'Tienda',
            sources: ['local'],
            multiple: true, // ✅ Permitir múltiples videos
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
    if (error) {
        console.error("❌ Error:", error);
        alert("Error al subir: " + error.message);
        return;
    }
    
    if (result && result.event === "success") {
        console.log("✅ Medio subido:", result.info);
        
        const mediaInfo = {
            url: result.info.secure_url,
            type: result.info.resource_type,
            publicId: result.info.public_id
        };
        
        if (window.uploadingForEdit) {
            // Agregar a la edición actual
            const products = JSON.parse(localStorage.getItem("products")) || [];
            const product = products[window.currentEditIndex];
            if (product) {
                if (!product.gallery) product.gallery = [];
                product.gallery.push(mediaInfo);
                localStorage.setItem("products", JSON.stringify(products));
                updateEditGallery();
                alert("✅ Medio agregado a la galería");
            }
        } else {
            // Agregar a la galería actual
            currentMedia.push(mediaInfo);
            updateGalleryPreview();
        }
    }
}

// Actualizar vista previa de la galería
function updateGalleryPreview() {
    const galleryContainer = document.getElementById('gallery-items');
    
    if (currentMedia.length === 0) {
        galleryContainer.innerHTML = '<p class="text-gray-500 text-sm">No hay medios agregados. Sube algunas imágenes o videos.</p>';
        return;
    }
    
    galleryContainer.innerHTML = '';
    
    currentMedia.forEach((media, index) => {
        const mediaElement = document.createElement('div');
        mediaElement.className = 'gallery-item relative';
        
        if (media.type === 'image') {
            mediaElement.innerHTML = `
                <img src="${media.url}" alt="Imagen ${index + 1}" class="media-thumbnail">
                <button class="delete-media" onclick="removeFromGallery(${index})">×</button>
            `;
        } else {
            // Para videos, crear una miniatura
            const videoId = media.url.split('/').pop().split('.')[0];
            const thumbnailUrl = `https://res.cloudinary.com/dgio6hkz8/video/upload/w_100,h_100,c_fill/${videoId}.jpg`;
            
            mediaElement.innerHTML = `
                <div class="video-thumbnail">
                    <img src="${thumbnailUrl}" alt="Video ${index + 1}" class="media-thumbnail">
                    <button class="delete-media" onclick="removeFromGallery(${index})">×</button>
                </div>
            `;
        }
        
        galleryContainer.appendChild(mediaElement);
    });
}

// Remover medio de la galería
function removeFromGallery(index) {
    currentMedia.splice(index, 1);
    updateGalleryPreview();
}

// Remover medio de la galería de edición
function removeFromEditGallery(index) {
    const products = JSON.parse(localStorage.getItem("products")) || [];
    const product = products[window.currentEditIndex];
    
    if (product && product.gallery) {
        product.gallery.splice(index, 1);
        localStorage.setItem("products", JSON.stringify(products));
        updateEditGallery();
    }
}

// Actualizar galería en edición
function updateEditGallery() {
    const galleryContainer = document.getElementById('edit-gallery-preview');
    const products = JSON.parse(localStorage.getItem("products")) || [];
    const product = products[window.currentEditIndex];
    
    galleryContainer.innerHTML = '';
    
    if (product && product.gallery && product.gallery.length > 0) {
        product.gallery.forEach((media, index) => {
            const mediaElement = document.createElement('div');
            mediaElement.className = 'gallery-item relative';
            
            if (media.type === 'image') {
                mediaElement.innerHTML = `
                    <img src="${media.url}" alt="Imagen ${index + 1}" class="media-thumbnail">
                    <button class="delete-media" onclick="removeFromEditGallery(${index})">×</button>
                `;
            } else {
                // Para videos, crear una miniatura
                const videoId = media.url.split('/').pop().split('.')[0];
                const thumbnailUrl = `https://res.cloudinary.com/dgio6hkz8/video/upload/w_100,h_100,c_fill/${videoId}.jpg`;
                
                mediaElement.innerHTML = `
                    <div class="video-thumbnail">
                        <img src="${thumbnailUrl}" alt="Video ${index + 1}" class="media-thumbnail">
                        <button class="delete-media" onclick="removeFromEditGallery(${index})">×</button>
                    </div>
                `;
            }
            
            galleryContainer.appendChild(mediaElement);
        });
    } else {
        galleryContainer.innerHTML = '<p class="text-gray-500 text-sm">No hay medios en la galería.</p>';
    }
}

// Guardar producto
function saveProduct(event) {
    event.preventDefault();
    console.log("💾 Intentando guardar producto...");
    
    if (currentMedia.length === 0) {
        alert("⚠️ Debes agregar al menos una imagen o video");
        return;
    }

    const product = {
        name: document.getElementById('product-name').value,
        description: document.getElementById('product-description').value,
        price: parseFloat(document.getElementById('product-price').value),
        quantity: parseInt(document.getElementById('product-quantity').value),
        gallery: [...currentMedia], // Copiar el array
        createdAt: new Date().toISOString()
    };

    // Validaciones
    if (!product.name || !product.description || product.price <= 0 || product.quantity <= 0) {
        alert("⚠️ Completa todos los campos correctamente");
        return;
    }

    // Guardar en localStorage
    let products = JSON.parse(localStorage.getItem("products")) || [];
    products.push(product);
    localStorage.setItem("products", JSON.stringify(products));

    console.log("✅ Producto guardado con galería:", product);
    alert("✅ Producto guardado con éxito!");
    
    // Limpiar formulario
    resetForm();
    loadProductsList();
}

// Resetear formulario
function resetForm() {
    document.getElementById('product-form').reset();
    currentMedia = [];
    updateGalleryPreview();
}

// Funciones para cambiar pestañas
function switchTab(tabName) {
    console.log("🔄 Cambiando a pestaña:", tabName);
    
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

// Cargar lista de productos
function loadProductsList() {
    const products = JSON.parse(localStorage.getItem("products")) || [];
    const container = document.getElementById('products-container');
    const countElement = document.getElementById('products-count');
    
    countElement.textContent = products.length;
    
    if (products.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <p>No hay productos guardados</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    products.forEach((product, index) => {
        const productDiv = document.createElement('div');
        productDiv.className = 'bg-gray-50 p-4 rounded-lg border';
        
        // Obtener la primera imagen de la galería para la miniatura
        const firstMedia = product.gallery && product.gallery.length > 0 ? product.gallery[0] : null;
        const mediaHtml = firstMedia ? 
            (firstMedia.type === 'image' ? 
                `<img src="${firstMedia.url}" alt="${product.name}" class="w-16 h-16 object-cover rounded">` :
                `<div class="w-16 h-16 bg-purple-500 rounded flex items-center justify-center text-white">🎥</div>`) :
            `<div class="w-16 h-16 bg-gray-300 rounded flex items-center justify-center">📷</div>`;
        
        productDiv.innerHTML = `
            <div class="flex items-start gap-4">
                <div class="flex-shrink-0">
                    ${mediaHtml}
                </div>
                <div class="flex-1">
                    <h4 class="font-semibold text-lg">${product.name}</h4>
                    <p class="text-gray-600">S/ ${product.price.toFixed(2)}</p>
                    <p class="text-sm text-gray-500">Medios: ${product.gallery ? product.gallery.length : 0}</p>
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

// Función para abrir modal de edición
function openEditModal(index) {
    const products = JSON.parse(localStorage.getItem("products")) || [];
    const product = products[index];
    
    if (!product) return;
    
    window.currentEditIndex = index;
    
    // Llenar el formulario
    document.getElementById('edit-index').value = index;
    document.getElementById('edit-name').value = product.name;
    document.getElementById('edit-description').value = product.description;
    document.getElementById('edit-price').value = product.price;
    document.getElementById('edit-quantity').value = product.quantity;
    
    // Actualizar galería
    updateEditGallery();
    
    // Mostrar modal
    document.getElementById('edit-modal').classList.remove('hidden');
}

// Función para abrir upload de imagen
function openImageUpload(forEdit = false) {
    if (myImageWidget) {
        window.uploadingForEdit = forEdit;
        myImageWidget.open();
    }
}

// Función para abrir upload de video
function openVideoUpload(forEdit = false) {
    if (myVideoWidget) {
        window.uploadingForEdit = forEdit;
        myVideoWidget.open();
    }
}

// Función para guardar cambios de edición
function saveProductEdit(event) {
    event.preventDefault();
    
    const index = document.getElementById('edit-index').value;
    const products = JSON.parse(localStorage.getItem("products")) || [];
    
    if (index >= 0 && index < products.length) {
        // Actualizar producto
        products[index].name = document.getElementById('edit-name').value;
        products[index].description = document.getElementById('edit-description').value;
        products[index].price = parseFloat(document.getElementById('edit-price').value);
        products[index].quantity = parseInt(document.getElementById('edit-quantity').value);
        products[index].updatedAt = new Date().toISOString();
        
        localStorage.setItem("products", JSON.stringify(products));
        alert("✅ Producto actualizado correctamente");
        
        closeEditModal();
        loadProductsList();
    }
}

// Función para cerrar modal de edición
function closeEditModal() {
    document.getElementById('edit-modal').classList.add('hidden');
    window.currentEditIndex = null;
    window.uploadingForEdit = false;
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
        loadProductsList();
    }
}

// Función para eliminar todos los productos
function deleteAllProducts() {
    if (confirm("¿Estás seguro de que quieres eliminar TODOS los productos? Esta acción no se puede deshacer.")) {
        localStorage.removeItem("products");
        alert("🗑️ Todos los productos han sido eliminados");
        loadProductsList();
    }
}

// Cuando el documento esté listo
document.addEventListener("DOMContentLoaded", function() {
    console.log("🚀 Panel Admin con galería cargado");
    
    // Inicializar Cloudinary
    if (typeof cloudinary !== 'undefined') {
        initCloudinary();
    } else {
        console.error("❌ Cloudinary no está cargado");
        alert("Error: Cloudinary no se cargó correctamente. Recarga la página.");
    }
    
    // Configurar event listeners
    document.getElementById('upload_image').onclick = function() {
        openImageUpload(false);
    };
    
    document.getElementById('upload_video').onclick = function() {
        openVideoUpload(false);
    };
    
    document.getElementById('product-form').onsubmit = saveProduct;
    document.getElementById('edit-product-form').onsubmit = saveProductEdit;
    
    // Cerrar modales al hacer clic fuera
    document.getElementById('edit-modal').onclick = function(e) {
        if (e.target === this) closeEditModal();
    };
    
    document.getElementById('confirm-modal').onclick = function(e) {
        if (e.target === this) closeConfirmModal();
    };
    
    console.log("✅ Todos los event listeners configurados");
});

// Hacer funciones globales
window.removeFromGallery = removeFromGallery;
window.removeFromEditGallery = removeFromEditGallery;
window.openEditModal = openEditModal;
window.openDeleteModal = openDeleteModal;
window.closeEditModal = closeEditModal;
window.closeConfirmModal = closeConfirmModal;
window.confirmDelete = confirmDelete;
window.deleteAllProducts = deleteAllProducts;
window.switchTab = switchTab;
window.openImageUpload = openImageUpload;
window.openVideoUpload = openVideoUpload;