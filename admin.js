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