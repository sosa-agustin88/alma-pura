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
let carrito = [];

// Elementos DOM
const btnAbrirAdmin = document.getElementById('btn-abrir-admin');
const btnCerrarAdmin = document.getElementById('btn-cerrar-admin');
const panelAdmin = document.getElementById('panel-admin');
const btnAgregar = document.getElementById('btn-agregar-producto');
const inputImagen = document.getElementById('img-file');
const inputTitulo = document.getElementById('input-titulo');
const inputPrecio = document.getElementById('input-precio');
const labelImagen = document.querySelector('.file-upload-label');
const gridProductos = document.getElementById('grid-productos');

// Elementos Carrito
const btnCarritoFlotante = document.getElementById('btn-carrito-flotante');
const modalCarrito = document.getElementById('modal-carrito');
const btnCerrarCarrito = document.getElementById('btn-cerrar-carrito');
const cartItemsContainer = document.getElementById('cart-items');
const cartCountSpan = document.getElementById('cart-count');
const cartTotalPriceSpan = document.getElementById('cart-total-price');
const btnEnviarPedidoWA = document.getElementById('btn-enviar-pedido-wa');

// GESTIÓN DEL PANEL ADMIN
btnAbrirAdmin.addEventListener('click', () => {
    if (!esAdmin) {
        const password = prompt("Ingrese la contraseña de administrador:");
        if (password === CLAVE_ADMIN) {
            esAdmin = true;
            btnAbrirAdmin.innerText = "⚙️ Panel";
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

// ABM PRODUCTOS
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
            const datosActualizar = { titulo: titulo, precio: Number(precio) };
            if (urlImagen) datosActualizar.imagenUrl = urlImagen;
            await db.collection("productos").doc(productoEditandoId).update(datosActualizar);
            alert("¡Producto actualizado!");
        } else {
            if (!urlImagen) {
                alert("Selecciona una imagen para el producto.");
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
        alert("Error: " + error.message);
    } finally {
        btnAgregar.disabled = false;
    }
});

// CARGAR CATALOGO
function cargarProductos() {
    db.collection("productos").orderBy("fecha", "desc").onSnapshot((querySnapshot) => {
        gridProductos.innerHTML = "";
        
        if (querySnapshot.empty) {
            gridProductos.innerHTML = "<p style='grid-column:1/-1; text-align:center;'>No hay productos disponibles.</p>";
            return;
        }

        querySnapshot.forEach((doc) => {
            const p = doc.data();
            const id = doc.id;

            const accionesAdmin = esAdmin ? `
                <div class="admin-actions">
                    <button class="btn-edit" onclick="prepararEdicion('${id}', '${p.titulo}', ${p.precio})">✏️</button>
                    <button class="btn-del" onclick="eliminarProducto('${id}')">🗑️</button>
                </div>
            ` : '';

            const div = document.createElement('div');
            div.className = 'product-card';
            div.innerHTML = `
                ${accionesAdmin}
                <img src="${p.imagenUrl}" alt="${p.titulo}" class="product-img">
                <div class="product-info">
                    <h3 class="product-title">${p.titulo}</h3>
                    <p class="product-price">$${p.precio}</p>
                    <button class="btn-add-cart" onclick="agregarAlCarrito('${p.titulo}', ${p.precio})">🛒 Agregar</button>
                </div>
            `;
            gridProductos.appendChild(div);
        });
    });
}

// LÓGICA DEL CARRITO
window.agregarAlCarrito = (titulo, precio) => {
    carrito.push({ titulo, precio });
    actualizarCarritoUI();
};

function actualizarCarritoUI() {
    cartCountSpan.innerText = carrito.length;
    cartItemsContainer.innerHTML = "";
    let total = 0;

    carrito.forEach((prod, index) => {
        total += prod.precio;
        const itemDiv = document.createElement('div');
        itemDiv.className = 'cart-item';
        itemDiv.innerHTML = `
            <span>${prod.titulo} - $${prod.precio}</span>
            <button onclick="quitarDelCarrito(${index})" style="border:none; background:none; cursor:pointer;">❌</button>
        `;
        cartItemsContainer.appendChild(itemDiv);
    });

    cartTotalPriceSpan.innerText = total;
}

window.quitarDelCarrito = (index) => {
    carrito.splice(index, 1);
    actualizarCarritoUI();
};

btnCarritoFlotante.addEventListener('click', () => modalCarrito.classList.add('open'));
btnCerrarCarrito.addEventListener('click', () => modalCarrito.classList.remove('open'));

btnEnviarPedidoWA.addEventListener('click', () => {
    if (carrito.length === 0) {
        alert("El carrito está vacío.");
        return;
    }
    let texto = "Hola, me gustaría encargar los siguientes productos:\n\n";
    let total = 0;
    carrito.forEach(p => {
        texto += `- ${p.titulo}: $${p.precio}\n`;
        total += p.precio;
    });
    texto += `\n*Total: $${total}*`;

    const urlWA = `https://wa.me/${TELEFONO_WHATSAPP}?text=${encodeURIComponent(texto)}`;
    window.open(urlWA, '_blank');
});

// FUNCIONES ADMIN EDICION/BORRADO
window.prepararEdicion = (id, titulo, precio) => {
    productoEditandoId = id;
    inputTitulo.value = titulo;
    inputPrecio.value = precio;
    labelImagen.innerText = "📷 Cambiar foto (opcional)";
    btnAgregar.innerText = "Guardar Cambios";
    panelAdmin.classList.add('open');
};

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
