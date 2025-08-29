// admin.js - Versión mejorada con detección de errores
console.log("Iniciando admin.js...");

// Verificar si Cloudinary está cargado
function checkCloudinaryLoaded() {
    if (typeof cloudinary === 'undefined') {
        console.error("❌ Cloudinary no se cargó correctamente");
        alert("Error: Cloudinary no se cargó. Recarga la página.");
        return false;
    }
    console.log("✅ Cloudinary cargado correctamente");
    return true;
}

// Configurar widget de Cloudinary
function setupCloudinary() {
    if (!checkCloudinaryLoaded()) return null;
    
    try {
        const widget = cloudinary.createUploadWidget({
            cloudName: 'dgio6hkz8',
            uploadPreset: 'Tienda'
        }, (error, result) => {
            if (error) {
                console.error("Error en Cloudinary:", error);
                alert("Error al subir imagen: " + error.message);
                return;
            }
            
            if (result && result.event === "success") {
                console.log("✅ Imagen subida:", result.info);
                showPreview(result.info.secure_url);
            }
        });
        
        console.log("✅ Widget de Cloudinary creado");
        return widget;
    } catch (error) {
        console.error("❌ Error al crear widget:", error);
        alert("Error técnico: " + error.message);
        return null;
    }
}

// Mostrar vista previa
function showPreview(imageUrl) {
    document.getElementById("preview").classList.remove("hidden");
    document.getElementById("preview-img").src = imageUrl;
    document.getElementById("preview-url").textContent = imageUrl;
    localStorage.setItem("lastUploadedImage", imageUrl);
}

// Guardar producto
function saveProduct() {
    const url = localStorage.getItem("lastUploadedImage");
    if (url) {
        let products = JSON.parse(localStorage.getItem("products")) || [];
        products.push({ 
            image: url,
            createdAt: new Date().toISOString()
        });
        localStorage.setItem("products", JSON.stringify(products));
        alert("✅ Producto guardado con éxito!");
        
        // Limpiar vista previa
        document.getElementById("preview").classList.add("hidden");
        localStorage.removeItem("lastUploadedImage");
    } else {
        alert("⚠️ Primero sube una imagen");
    }
}

// Cuando la página cargue
document.addEventListener("DOMContentLoaded", function() {
    console.log("📋 Panel Admin cargado");
    
    let myWidget = setupCloudinary();
    
    // Botón para subir
    document.getElementById("upload_widget").addEventListener("click", function() {
        if (myWidget) {
            console.log("🖼️ Abriendo widget de Cloudinary...");
            myWidget.open();
        } else {
            alert("❌ Cloudinary no está disponible. Recarga la página.");
        }
    });
    
    // Botón para guardar
    document.getElementById("save_product").addEventListener("click", saveProduct);
    
    // Verificar si hay imagen en temporal
    const lastImage = localStorage.getItem("lastUploadedImage");
    if (lastImage) {
        showPreview(lastImage);
    }
});