const firebaseConfig = {
    apiKey: "AIzaSyCxrukHLdj-KTPNZlcDEd9VpVz8ewwmiK0",
    authDomain: "alma-pura-ced10.firebaseapp.com",
    projectId: "alma-pura-ced10",
    storageBucket: "alma-pura-ced10.firebasestorage.app",
    messagingSenderId: "815859897172",
    appId: "1:815859897172:web:d8bbe8158d439ed27f2ec1"
};
const IMGBB_API_KEY = "3052862c887588cf31e3baec2a6eb3f0";
const TELEFONO_WHATSAPP = "5493644000000"; // Reemplaza por tu número
const CLAVE_ADMIN = "1234"; 

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let esAdmin = false;
let productoEditandoId = null;

const btnAbrirAdmin = document.getElementById('btn-abrir-admin');
const btnCerrarAdmin = document.getElementById('btn-cerrar-admin');
const panelAdmin = document.getElementById('panel-admin');
const btnAgregar = document.getElementById('btn-agregar-producto');
const inputImagen = document.getElementById('img-file');
const inputTitulo = document.getElementById('input-titulo');
const inputPrecio = document.getElementById('input-precio');
const labelImagen = document.querySelector('.file-upload-label');

// CONTROL DE ACCESO
btnAbrirAdmin.addEventListener('click', () => {
    if (!esAdmin) {
        const password = prompt("Ingrese la contraseña de administrador:");
        if (password === CLAVE_ADMIN) {
            esAdmin = true;
            btnAbrirAdmin.innerText = "⚙️ Panel Admin";
            panelAdmin.classList.add('open');
            cargarProductos();
        } else if (password !== null) {
            alert("Contraseña incorrecta.");
        }
    } else {
        panelAdmin.classList.add('open');
    }
});

btnCerrarAdmin.addEventListener('click', () => {
    panelAdmin.classList.remove('open');
    resetearFormulario();
});

inputImagen.addEventListener('change', () => {
    if(inputImagen.files.length > 0) labelImagen.innerText = "✅ Foto seleccionada";
});

// GUARDAR O EDITAR PRODUCTO
btnAgregar.addEventListener('click', async () => {
    const archivo = inputImagen.files[0];
    const titulo = inputTitulo.value.trim();
    const precio = inputPrecio.value.trim();

    if (!titulo || !precio) {
        alert("Completa el título y el precio.");
        return;
    }

    btnAgregar.innerText = "Procesando...";
    btnAgregar.disabled = true;

    try {
        let urlImagen = null;

        if (archivo) {
            const formData = new FormData();
            formData.append("image", archivo);
            const respuestaImg = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
                method: "POST",
                body: formData
            });
            const datosImg = await respuestaImg.json();
            if (datosImg.success) urlImagen = datosImg.data.url;
        }

        if (productoEditandoId) {
            // MODO EDICIÓN
            const datosActualizar = {
                titulo: titulo,
                precio: Number(precio)
            };
            if (urlImagen) datosActualizar.imagenUrl = urlImagen;

            await db.collection("productos").doc(productoEditandoId).update(datosActualizar);
            alert("¡Producto actualizado!");
        } else {
            // MODO CREACIÓN
            if (!urlImagen) {
                alert("Selecciona una imagen para el nuevo producto.");
                btnAgregar.innerText = "Agregar Producto";
                btnAgregar.disabled = false;
                return;
            }
            await db.collection("productos").add({
                titulo: titulo,
                precio: Number(precio),
                imagenUrl: urlImagen,
                fecha: firebase.firestore.FieldValue.serverTimestamp()
            });
            alert("¡Producto publicado!");
        }

        resetearFormulario();
        panelAdmin.classList.remove('open');
        
    } catch (error) {
        console.error("Error:", error);
        alert("Error al guardar: " + error.message);
    } finally {
        btnAgregar.disabled = false;
    }
});

// CARGAR PRODUCTOS EN TIENDA
const gridProductos = document.getElementById('grid-productos');

function cargarProductos() {
    db.collection("productos").orderBy("fecha", "desc").onSnapshot((querySnapshot) => {
        gridProductos.innerHTML = ""; 
        
        if (querySnapshot.empty) {
            gridProductos.innerHTML = "<p style='grid-column:1/-1; text-align:center;'>No hay productos disponibles.</p>";
            return;
        }

        querySnapshot.forEach((doc) => {
            const producto = doc.data();
            const id = doc.id;
            
            const mensajeWA = encodeURIComponent(`Hola, me interesa encargar: ${producto.titulo} ($${producto.precio})`);
            const urlWA = `https://wa.me/${TELEFONO_WHATSAPP}?text=${mensajeWA}`;

            const accionesAdminHTML = esAdmin ? `
                <div class="admin-actions">
                    <button class="btn-edit" onclick="prepararEdicion('${id}', '${producto.titulo}', ${producto.precio})">✏️</button>
                    <button class="btn-del" onclick="eliminarProducto('${id}')">🗑️</button>
                </div>
            ` : '';

            const div = document.createElement('div');
            div.className = 'product-card';
            div.innerHTML = `
                ${accionesAdminHTML}
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

// PREPARAR EDICIÓN
window.prepararEdicion = (id, titulo, precio) => {
    productoEditandoId = id;
    inputTitulo.value = titulo;
    inputPrecio.value = precio;
    labelImagen.innerText = "📷 Cambiar foto (opcional)";
    btnAgregar.innerText = "Guardar Cambios";
    panelAdmin.classList.add('open');
};

// ELIMINAR PRODUCTO
window.eliminarProducto = async (id) => {
    if (confirm("¿Estás seguro de eliminar esta publicación?")) {
        await db.collection("productos").doc(id).delete();
    }
};

function resetearFormulario() {
    productoEditandoId = null;
    inputImagen.value = "";
    inputTitulo.value = "";
    inputPrecio.value = "";
    labelImagen.innerText = "📸 Seleccionar foto";
    btnAgregar.innerText = "Agregar Producto";
}

cargarProductos();
