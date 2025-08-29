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
    console.log("📨 Resultado de subida:", result);
    
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
            mediaElement.innerHTML = `
                <div class="video-thumbnail">
                    <img src="${media.url.replace('/upload/', '/upload/w_100,h_100,c_fill/')}" 
                         alt="Video ${index + 1}" class="media-thumbnail">
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
                mediaElement.innerHTML = `
                    <div class="video-thumbnail">
                        <img src="${media.url.replace('/upload/', '/upload/w_100,h_100,c_fill/')}" 
                             alt="Video ${index + 1}" class="media-thumbnail">
                        <button class="delete-media" onclick="removeFromEditGallery(${index})">×</button>
                    </div>
                `;
            }
            
            galleryContainer.appendChild(mediaElement);
        });
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
        gallery: currentMedia, // ✅ Guardar array de medios
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

// Resto del código se mantiene similar, pero actualizado para usar gallery en lugar de media individual
// [Las funciones switchTab, loadProductsList, openEditModal, etc. se mantienen pero actualizadas para usar gallery]

// Resetear formulario
function resetForm() {
    document.getElementById('product-form').reset();
    currentMedia = [];
    updateGalleryPreview();
}

// Cuando el documento esté listo
document.addEventListener("DOMContentLoaded", function() {
    console.log("🚀 Panel Admin con galería cargado");
    
    // Inicializar Cloudinary
    if (typeof cloudinary !== 'undefined') {
        initCloudinary();
    }
    
    // Configurar event listeners
    document.getElementById('upload_image').onclick = function() {
        window.uploadingForEdit = false;
        if (myImageWidget) myImageWidget.open();
    };
    
    document.getElementById('upload_video').onclick = function() {
        window.uploadingForEdit = false;
        if (myVideoWidget) myVideoWidget.open();
    };
    
    document.getElementById('product-form').onsubmit = saveProduct;
    document.getElementById('edit-product-form').onsubmit = saveProductEdit;
    
    // Configurar pestañas
    document.getElementById('tab-add').onclick = function() { 
        switchTab('add'); 
    };
    
    document.getElementById('tab-manage').onclick = function() { 
        switchTab('manage'); 
    };
    
    console.log("✅ Todos los event listeners configurados");
});

// Funciones globales
window.removeFromGallery = removeFromGallery;
window.removeFromEditGallery = removeFromEditGallery;
// ... resto de funciones globales