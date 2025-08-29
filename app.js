// Cargar productos guardados en localStorage
document.addEventListener("DOMContentLoaded", () => {
  let products = JSON.parse(localStorage.getItem("products")) || [];
  const productList = document.getElementById("product-list");

  // Si no hay productos, mostrar mensaje
  if (products.length === 0) {
    productList.innerHTML = `
      <div class="text-center py-12">
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
  products.forEach((p, index) => {
    let div = document.createElement("div");
    div.className = "bg-white rounded-2xl shadow-lg overflow-hidden";
    div.innerHTML = `
      <img src="${p.image}" alt="Producto ${index + 1}" class="w-full h-48 object-cover">
      <div class="p-4">
        <h3 class="text-lg font-medium text-gray-900">Producto ${index + 1}</h3>
        <div class="mt-4">
          <a href="product.html?index=${index}" class="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg block text-center">
            Ver Detalles
          </a>
        </div>
      </div>
    `;
    productList.appendChild(div);
  });
});


