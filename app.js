// Cargar productos guardados en localStorage
document.addEventListener("DOMContentLoaded", () => {
  let products = JSON.parse(localStorage.getItem("products")) || [];
  const productList = document.getElementById("product-list");

  products.forEach(p => {
    let div = document.createElement("div");
    div.className = "bg-white rounded-2xl shadow-lg overflow-hidden p-4";
    div.innerHTML = `
      <img src="${p.image}" alt="Producto" class="w-full h-48 object-cover rounded-lg">
      <p class="mt-2 text-center text-gray-700">Producto</p>
    `;
    productList.appendChild(div);
  });
});


