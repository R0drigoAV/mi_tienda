// Cargar productos guardados en localStorage
document.addEventListener("DOMContentLoaded", () => {
    console.log("🛍️ Iniciando carga de productos...");
    
    // Función para obtener productos con manejo de errores
    function getProducts() {
        try {
            const productsData = localStorage.getItem("products");
            if (!productsData) return [];
            
            const products = JSON.parse(productsData);
            console.log("✅ Productos obtenidos:", products.length);
            return Array.isArray(products) ? products : [];
        } catch (error) {
            console.error("❌ Error al parsear productos:", error);
            return [];
        }
    }

    const products = getProducts();
    const productList = document.getElementById("product-list");

    // Verificar contenedor
    if (!productList) {
        console.error("❌ No se encontró el elemento con id 'product-list'");
        return;
    }

    // Si no hay productos, mostrar mensaje
    if (products.length === 0) {
        console.log("ℹ️ No hay productos, mostrando mensaje vacío");
        productList.innerHTML = `
            <div class="text-center py-12 col-span-full">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 class="mt-4 text-lg font-medium text-gray-900">No hay productos</h3>
                <p class="mt-1 text-gray-500">Agrega algunos productos desde el panel de administración.</p>
                <div class="mt-6">
                    <a href="admin.html" class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                        Ir al Panel de Administración
                    </a>
                </div>
            </div>
        `;
        return;
    }

    console.log("🎨 Renderizando productos...");
    renderProducts(products);
});

// Función para renderizar productos
function renderProducts(products) {
    const productList = document.getElementById("product-list");
    productList.innerHTML = ''; // Limpiar contenedor
    
    let productsWithGallery = 0;
    
    products.forEach((product, index) => {
        // Verificar si el producto tiene gallery y no está vacío
        const hasGallery = product.gallery && Array.isArray(product.gallery) && product.gallery.length > 0;
        
        if (!hasGallery) {
            console.warn("⚠️ Producto sin gallery válida:", product);
            return; // Saltar este producto
        }
        
        productsWithGallery++;
        
        // Usar la primera imagen de la galería como miniatura
        const firstMedia = product.gallery[0];
        
        let div = document.createElement("div");
        div.className = "bg-white rounded-2xl shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105 product-card";
        
        // Determinar si es imagen o video
        const mediaContent = firstMedia.type === 'video' ? 
            `<div class="relative">
                <video class="w-full h-48 object-cover" controls>
                    <source src="${firstMedia.url}" type="video/mp4">
                </video>
                <span class="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">VIDEO</span>
            </div>` :
            `<img src="${firstMedia.url}" alt="${product.name}" class="w-full h-48 object-cover">`;
        
        div.innerHTML = `
            ${mediaContent}
            <div class="p-4">
                <h3 class="text-lg font-medium text-gray-900 truncate">${product.name || 'Sin nombre'}</h3>
                <p class="text-gray-600 text-sm mt-1 line-clamp-2">${product.description || 'Sin descripción'}</p>
                
                <div class="flex justify-between items-center mt-3">
                    <span class="text-2xl font-bold text-green-600">S/ ${product.price ? product.price.toFixed(2) : '0.00'}</span>
                    ${product.quantity > 0 ? 
                        `<span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">En stock: ${product.quantity}</span>` :
                        `<span class="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">Agotado</span>`
                    }
                </div>
                
                <div class="mt-4">
                    <a href="product.html?index=${index}" class="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg block text-center">
                        Ver Detalles
                    </a>
                </div>
                
                <!-- Indicador de galería múltiple -->
                ${product.gallery.length > 1 ? 
                    `<div class="mt-2 text-center">
                        <span class="text-xs text-gray-500">+${product.gallery.length - 1} medio${product.gallery.length > 2 ? 's' : ''} más</span>
                    </div>` : ''
                }
            </div>
        `;
        productList.appendChild(div);
    });
    
    console.log(`✅ ${productsWithGallery} productos renderizados correctamente`);
    
    // Si no hay productos con gallery válida
    if (productsWithGallery === 0) {
        productList.innerHTML = `
            <div class="text-center py-12 col-span-full">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h3 class="mt-4 text-lg font-medium text-gray-900">Problema con los productos</h3>
                <p class="mt-1 text-gray-500">Los productos no tienen una galería válida.</p>
                <div class="mt-6">
                    <a href="admin.html" class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                        Ir al Panel de Administración
                    </a>
                </div>
            </div>
        `;
    }
}

// Función para migrar productos antiguos a la nueva estructura
function migrateOldProducts() {
    console.log("🔄 Verificando migración de productos...");
    
    const products = JSON.parse(localStorage.getItem("products")) || [];
    let migrated = false;
    
    products.forEach(product => {
        // Si el producto tiene la estructura antigua (media) pero no gallery
        if (product.media && !product.gallery) {
            console.log("🔄 Migrando producto antiguo:", product.name);
            
            // Crear gallery a partir de los datos antiguos
            product.gallery = [{
                url: product.media,
                type: product.mediaType || 'image',
                publicId: product.publicId || Math.random().toString(36).substring(2)
            }];
            
            // Opcional: eliminar propiedades antiguas
            delete product.media;
            delete product.mediaType;
            delete product.publicId;
            
            migrated = true;
        }
    });
    
    if (migrated) {
        localStorage.setItem("products", JSON.stringify(products));
        console.log("✅ Productos migrados. Recargando...");
        setTimeout(() => window.location.reload(), 1000);
    }
}

// Ejecutar migración al cargar
setTimeout(migrateOldProducts, 500);

// Función para forzar recarga si es necesario
setTimeout(() => {
    const products = JSON.parse(localStorage.getItem("products")) || [];
    const productList = document.getElementById("product-list");
    
    if (products.length > 0 && productList && productList.innerHTML.includes("No hay productos")) {
        console.log("🔄 Recargando para mostrar productos...");
        window.location.reload();
    }
}, 2000);
