// 1. TUS CLAVES DE ACCESO REALES
const firebaseConfig = {
    apiKey: "AIzaSyCxrukHLdj-KTPNZlcDEd9VpVz8ewwmiK0",
    authDomain: "alma-pura-ced10.firebaseapp.com",
    projectId: "alma-pura-ced10",
    storageBucket: "alma-pura-ced10.firebasestorage.app",
    messagingSenderId: "815859897172",
    appId: "1:815859897172:web:d8bbe8158d439ed27f2ec1",
    measurementId: "G-FQJ8PZLRVV"
};
const IMGBB_API_KEY = "3052862c887588cf31e3baec2a6eb3f0";

// 2. INICIALIZAR FIREBASE
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// 3. ABRIR Y CERRAR EL PANEL DE ADMINISTRADOR
const btnAbrirAdmin = document.getElementById('btn-abrir-admin');
const btnCerrarAdmin = document.getElementById('btn-cerrar-admin');
const panelAdmin = document.getElementById('panel-admin');

btnAbrirAdmin.addEventListener('click', () => panelAdmin.classList.add('open'));
btnCerrarAdmin.addEventListener('click', () => panelAdmin.classList.remove('open'));

// 4. LÓGICA PARA AGREGAR UN PRODUCTO NUEVO
const btnAgregar = document.getElementById('btn-agregar-producto');
const inputImagen = document.getElementById('img-file');
const inputTitulo = document.getElementById('input-titulo');
const inputPrecio = document.getElementById('input-precio');
const labelImagen = document.querySelector('.file-upload-label');

// Cambiar el texto cuando se elige una foto
inputImagen.addEventListener('change', () => {
    if(inputImagen.files.length > 0) {
        labelImagen.innerText = "✅ Foto seleccionada";
    }
});

btnAgregar.addEventListener('click', async () => {
    const archivo = inputImagen.files[0];
    const titulo = inputTitulo.value;
    const precio = inputPrecio.value;

    if (!archivo || !titulo || !precio) {
        alert("Por favor completa todos los campos y selecciona una imagen.");
        return;
    }

    btnAgregar.innerText = "Subiendo imagen... paciencia";
    btnAgregar.disabled = true;

    try {
        // A) Subir a ImgBB
        const formData = new FormData();
        formData.append("image", archivo);
        
        const respuestaImg = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
            method: "POST",
            body: formData
        });
        const datosImg = await respuestaImg.json();
        
        if (!datosImg.success) throw new Error("Error en ImgBB");
        
        const urlImagen = datosImg.data.url;

        btnAgregar.innerText = "Guardando datos...";

        // B) Guardar en Firestore
        await db.collection("productos").add({
            titulo: titulo,
            precio: Number(precio),
            imagenUrl: urlImagen,
            fecha: firebase.firestore.FieldValue.serverTimestamp()
        });

        alert("¡Producto agregado con éxito!");
        
        // Limpiar el formulario
        inputImagen.value = "";
        labelImagen.innerText = "📸 Seleccionar foto";
        inputTitulo.value = "";
        inputPrecio.value = "";
        panelAdmin.classList.remove('open'); // Cerramos el panel al terminar
        
    } catch (error) {
        console.error("Error: ", error);
        alert("Hubo un error al subir el producto.");
    } finally {
        btnAgregar.innerText = "Agregar Producto";
        btnAgregar.disabled = false;
    }
});

// 5. LÓGICA PARA MOSTRAR LOS PRODUCTOS EN LA WEB
const gridProductos = document.getElementById('grid-productos');

function cargarProductos() {
    db.collection("productos").orderBy("fecha", "desc").onSnapshot((querySnapshot) => {
        gridProductos.innerHTML = ""; 
        
        if (querySnapshot.empty) {
            gridProductos.innerHTML = "<p>No hay prendas disponibles por ahora.</p>";
            return;
        }

        querySnapshot.forEach((doc) => {
            const producto = doc.data();
            const id = doc.id;

            const div = document.createElement('div');
            div.className = 'product-card';
            div.innerHTML = `
                <div class="admin-actions">
                    <button class="btn-edit" onclick="alert('Editar en desarrollo')">✏️</button>
                    <button class="btn-del" onclick="eliminarProducto('${id}')">🗑️</button>
                </div>
                <img src="${producto.imagenUrl}" alt="${producto.titulo}" class="product-img">
                <div class="product-info">
                    <h3 class="product-title">${producto.titulo}</h3>
                    <p class="product-price">$${producto.precio}</p>
                </div>
            `;
            gridProductos.appendChild(div);
        });
    });
}

// Función básica para eliminar (la conectamos a Firestore)
async function eliminarProducto(id) {
    if(confirm("¿Estás seguro de eliminar esta prenda?")) {
        await db.collection("productos").doc(id).delete();
    }
}

cargarProductos();
