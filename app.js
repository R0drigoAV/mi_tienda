// Cargar productos guardados en localStorage
document.addEventListener("DOMContentLoaded", () => {
    console.log("🛍️ Cargando tienda...");
    
    let products = [];
    try {
        const productsData = localStorage.getItem("products");
        console.log("📦 Datos crudos de localStorage:", productsData);
        
        products = JSON.parse(productsData) || [];
        console.log("✅ Productos parseados:", products);
    } catch (error) {
        console.error("❌ Error al cargar productos:", error);
        products = [];
    }

    const productList = document.getElementById("product-list");
    console.log("🎯 Contenedor de productos:", productList);

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

    // Mostrar productos
    console.log("🎨 Renderizando productos...");
    productList.innerHTML = ''; // Limpiar contenedor
    
    products.forEach((product, index) => {
        console.log("📋 Producto", index, product);
        
        // Validar que el producto tenga todos los campos necesarios
        if (!product.gallery || product.gallery.length === 0 || !product.name) {
            console.warn("⚠️ Producto incompleto:", product);
            return;
        }

        // Usar la primera imagen de la galería
        const firstMedia = product.gallery[0];
        
        let div = document.createElement("div");
        div.className = "bg-white rounded-2xl shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105 product-card";
        
        // Determinar si es imagen o video
        const mediaContent = firstMedia.type === 'video' ? 
            `<video class="w-full h-48 object-cover" controls>
                <source src="${firstMedia.url}" type="video/mp4">
            </video>` :
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
            </div>
        `;
        productList.appendChild(div);
    });
    
    console.log("✅ Productos renderizados correctamente");
});

// Función para forzar recarga si es necesario
function checkAndReloadProducts() {
    const products = JSON.parse(localStorage.getItem("products")) || [];
    if (products.length > 0 && document.getElementById("product-list").innerHTML.includes("No hay productos")) {
        console.log("🔄 Recargando para mostrar productos...");
        window.location.reload();
    }
}

// Verificar cada segundo durante 5 segundos
setTimeout(checkAndReloadProducts, 1000);
setTimeout(checkAndReloadProducts, 3000);
setTimeout(checkAndReloadProducts, 5000);
