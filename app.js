const firebaseConfig = {
    apiKey: "AIzaSyCxrukHLdj-KTPNZlcDEd9VpVz8ewwmiK0",
    authDomain: "alma-pura-ced10.firebaseapp.com",
    projectId: "alma-pura-ced10",
    storageBucket: "alma-pura-ced10.firebasestorage.app",
    messagingSenderId: "815859897172",
    appId: "1:815859897172:web:d8bbe8158d439ed27f2ec1"
};
const IMGBB_API_KEY = "3052862c887588cf31e3baec2a6eb3f0";

// CONFIGURA AQUÍ TU TELÉFONO DE WHATSAPP (con código de país)
const TELEFONO_WHATSAPP = "5493644000000"; 
const CLAVE_ADMIN = "1234"; // Cambia esta contraseña por la que quieras

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const btnAbrirAdmin = document.getElementById('btn-abrir-admin');
const btnCerrarAdmin = document.getElementById('btn-cerrar-admin');
const panelAdmin = document.getElementById('panel-admin');

// 1. CONTROL DE ACCESO CON CONTRASEÑA
btnAbrirAdmin.addEventListener('click', () => {
    const password = prompt("Ingrese la contraseña de administrador:");
    if (password === CLAVE_ADMIN) {
        panelAdmin.classList.add('open');
    } else if (password !== null) {
        alert("Contraseña incorrecta.");
    }
});

btnCerrarAdmin.addEventListener('click', () => panelAdmin.classList.remove('open'));

// 2. AGREGAR PRODUCTO
const btnAgregar = document.getElementById('btn-agregar-producto');
const inputImagen = document.getElementById('img-file');
const inputTitulo = document.getElementById('input-titulo');
const inputPrecio = document.getElementById('input-precio');
const labelImagen = document.querySelector('.file-upload-label');

inputImagen.addEventListener('change', () => {
    if(inputImagen.files.length > 0) labelImagen.innerText = "✅ Foto seleccionada";
});

btnAgregar.addEventListener('click', async () => {
    const archivo = inputImagen.files[0];
    const titulo = inputTitulo.value;
    const precio = inputPrecio.value;

    if (!archivo || !titulo || !precio) {
        alert("Completa todos los campos y selecciona una imagen.");
        return;
    }

    btnAgregar.innerText = "Subiendo imagen...";
    btnAgregar.disabled = true;

    try {
        const formData = new FormData();
        formData.append("image", archivo);
        
        const respuestaImg = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
            method: "POST",
            body: formData
        });
        const datosImg = await respuestaImg.json();
        
        if (!datosImg.success) throw new Error("Error en servidor de imágenes");
        
        await db.collection("productos").add({
            titulo: titulo,
            precio: Number(precio),
            imagenUrl: datosImg.data.url,
            fecha: firebase.firestore.FieldValue.serverTimestamp()
        });

        alert("¡Producto publicado correctamente!");
        inputImagen.value = "";
        labelImagen.innerText = "📸 Seleccionar foto";
        inputTitulo.value = "";
        inputPrecio.value = "";
        panelAdmin.classList.remove('open');
        
    } catch (error) {
        console.error("Error detallado:", error);
        alert("Error al guardar: " + error.message);
    } finally {
        btnAgregar.innerText = "Agregar Producto";
        btnAgregar.disabled = false;
    }
});

// 3. MOSTRAR TIENDA Y BOTÓN WHATSAPP
const gridProductos = document.getElementById('grid-productos');

function cargarProductos() {
    db.collection("productos").orderBy("fecha", "desc").onSnapshot((querySnapshot) => {
        gridProductos.innerHTML = ""; 
        
        if (querySnapshot.empty) {
            gridProductos.innerHTML = "<p style='grid-column:1/-1; text-align:center;'>No hay productos cargados todavía.</p>";
            return;
        }

        querySnapshot.forEach((doc) => {
            const producto = doc.data();
            const id = doc.id;
            
            const mensajeWA = encodeURIComponent(`Hola, me interesa encargar: ${producto.titulo} ($${producto.precio})`);
            const urlWA = `https://wa.me/${TELEFONO_WHATSAPP}?text=${mensajeWA}`;

            const div = document.createElement('div');
            div.className = 'product-card';
            div.innerHTML = `
                <div class="admin-actions">
                    <button class="btn-del" onclick="eliminarProducto('${id}')">🗑️</button>
                </div>
                <img src="${producto.imagenUrl}" alt="${producto.titulo}" class="product-img">
                <div class="product-info">
                    <h3 class="product-title">${producto.titulo}</h3>
                    <p class="product-price">$${producto.precio}</p>
                    <a href="${urlWA}" target="_blank" class="btn-wa">📲 Pedir por WhatsApp</a>
                </div>
            `;
            gridProductos.appendChild(div);
        });
    });
}

async function eliminarProducto(id) {
    if(confirm("¿Eliminar este producto?")) {
        await db.collection("productos").doc(id).delete();
    }
}

cargarProductos();
