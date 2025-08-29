// Configurar widget de Cloudinary
var myWidget = cloudinary.createUploadWidget({
  cloudName: 'dgio6hkz8', // tu cloud_name
  uploadPreset: 'ml_default' // preset por defecto
}, (error, result) => {
  if (!error && result && result.event === "success") {
    console.log("Imagen subida:", result.info);

    // Mostrar vista previa
    document.getElementById("preview").classList.remove("hidden");
    document.getElementById("preview-img").src = result.info.secure_url;
    document.getElementById("preview-url").textContent = result.info.secure_url;

    // Guardamos temporalmente la URL en localStorage
    localStorage.setItem("lastUploadedImage", result.info.secure_url);
  }
});

// Botón para abrir el widget
document.getElementById("upload_widget").addEventListener("click", function(){
  myWidget.open();
}, false);

// Guardar producto
document.getElementById("save_product").addEventListener("click", function() {
  const url = localStorage.getItem("lastUploadedImage");
  if (url) {
    let products = JSON.parse(localStorage.getItem("products")) || [];
    products.push({ image: url });
    localStorage.setItem("products", JSON.stringify(products));
    alert("Producto guardado con éxito 🚀");
    
    // Limpiar vista previa
    document.getElementById("preview").classList.add("hidden");
    localStorage.removeItem("lastUploadedImage");
  } else {
    alert("Primero sube una imagen 📷");
  }
});

