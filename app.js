import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getFirestore, collection, addDoc, deleteDoc, doc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyCxrukHldj-KTPNZlcdEd9vpVz8ewwmiK8",
  authDomain: "alma-pura-ced18.firebaseapp.com",
  projectId: "alma-pura-ced18",
  storageBucket: "alma-pura-ced18.firebasestorage.app",
  messagingSenderId: "815859897172",
  appId: "1:815859897172:web:d8bbe8158d439ed27f2ec1",
  measurementId: "G-FQJ8PZLRVV"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

let products = [];
let cart = [];
let isAdmin = false;
const VENDEDOR_PHONE = "5491100000000"; // Reemplaza por tu número

onSnapshot(collection(db, "products"), (snapshot) => {
    products = snapshot.docs.map(doc => ({ firebaseId: doc.id, ...doc.data() }));
    renderProducts();
});

function renderProducts() {
    const grid = document.getElementById('product-grid');
    grid.innerHTML = '';
    
    if(products.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #666;">No hay productos disponibles por ahora.</p>';
        return;
    }

    products.forEach(p => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img src="${p.img}" class="product-img" onclick="window.openProduct('${p.firebaseId}')">
            <div class="product-info" onclick="window.openProduct('${p.firebaseId}')">
                <div class="product-title">${p.title}</div>
                <div class="product-price">$${p.price}</div>
            </div>
            ${isAdmin ? `<div class="admin-actions" style="display:block"><button class="btn-del" onclick="window.deleteProduct('${p.firebaseId}')">X</button></div>` : ''}
        `;
        grid.appendChild(card);
    });
}

window.openProduct = (id) => {
    const p = products.find(prod => prod.firebaseId === id);
    if(!p) return;

    document.getElementById('modal-img').src = p.img;
    document.getElementById('modal-title').textContent = p.title;
    document.getElementById('modal-desc').textContent = p.desc;
    document.getElementById('modal-price').textContent = `$${p.price}`;
    
    document.getElementById('modal-add-btn').onclick = () => window.addToCart(p);
    document.getElementById('product-modal').style.display = 'flex';
}

window.closeModals = () => {
    document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
}

window.addToCart = (product) => {
    const item = cart.find(i => i.firebaseId === product.firebaseId);
    if (item) item.qty++;
    else cart.push({ ...product, qty: 1 });
    updateCartUI();
    window.closeModals();
}

function updateCartUI() {
    document.getElementById('cart-count').innerText = cart.reduce((acc, i) => acc + i.qty, 0);
    const cartItems = document.getElementById('cart-items');
    cartItems.innerHTML = '';
    let total = 0;
    
    cart.forEach(item => {
        total += item.price * item.qty;
        cartItems.innerHTML += `
            <div class="cart-item">
                <div class="cart-item-info">
                    <b>${item.title}</b> <br> $${item.price} x ${item.qty}
                </div>
                <div class="cart-item-controls">
                    <button onclick="window.changeQty('${item.firebaseId}', -1)">-</button>
                    <span>${item.qty}</span>
                    <button onclick="window.changeQty('${item.firebaseId}', 1)">+</button>
                </div>
            </div>
        `;
    });
    document.getElementById('cart-total').innerText = total;
}

window.changeQty = (id, delta) => {
    const item = cart.find(i => i.firebaseId === id);
    if (item) {
        item.qty += delta;
        if (item.qty <= 0) cart = cart.filter(i => i.firebaseId !== id);
    }
    updateCartUI();
}

window.toggleCart = () => {
    document.getElementById('cart-panel').classList.toggle('open');
}

window.checkout = () => {
    if (cart.length === 0) return alert('El carrito está vacío');
    let text = "¡Hola! Quiero hacer este pedido:%0A%0A";
    let total = 0;
    cart.forEach(item => {
        text += `- ${item.qty}x ${item.title} ($${item.price * item.qty})%0A`;
        total += item.price * item.qty;
    });
    text += `%0A*Total: $${total}*`;
    window.open(`https://wa.me/${VENDEDOR_PHONE}?text=${text}`, '_blank');
}

window.triggerAdmin = () => {
    document.getElementById('admin-modal').style.display = 'flex';
}

window.loginAdmin = () => {
    const pass = document.getElementById('admin-pass').value;
    if (pass === '1234') { 
        isAdmin = true;
        document.getElementById('admin-login-view').style.display = 'none';
        document.getElementById('admin-dashboard-view').style.display = 'block';
        renderProducts();
        listenToSales();
    } else {
        alert('Contraseña incorrecta');
    }
}

window.addProduct = async () => {
    const fileInput = document.getElementById('new-img-file');
    const title = document.getElementById('new-title').value;
    const desc = document.getElementById('new-desc').value;
    const price = parseInt(document.getElementById('new-price').value);

    if (!fileInput.files.length || !title || !price) {
        return alert("Por favor, completa el título, el precio y selecciona una foto.");
    }

    const btn = document.getElementById('btn-add-product');
    btn.innerText = "Subiendo imagen...";
    btn.disabled = true;

    try {
        const file = fileInput.files[0];
        const storageReference = ref(storage, 'productos/' + Date.now() + '_' + file.name);
        await uploadBytes(storageReference, file);
        
        const imgUrl = await getDownloadURL(storageReference);

        await addDoc(collection(db, "products"), { 
            title: title, 
            desc: desc, 
            price: price, 
            img: imgUrl 
        });

        alert('¡Producto agregado con éxito!');
        
        fileInput.value = '';
        document.getElementById('new-title').value = '';
        document.getElementById('new-desc').value = '';
        document.getElementById('new-price').value = '';
    } catch (error) {
        console.error("Error al subir el producto:", error);
        alert("Hubo un error al guardar el producto.");
    } finally {
        btn.innerText = "Agregar Producto";
        btn.disabled = false;
    }
}

window.deleteProduct = async (id) => {
    if(confirm('¿Estás seguro de eliminar este producto?')) {
        try {
            await deleteDoc(doc(db, "products", id));
        } catch(error) {
            console.error("Error al eliminar:", error);
            alert("No se pudo eliminar el producto.");
        }
    }
}

window.addSale = async () => {
    const client = document.getElementById('sale-client').value;
    const amount = parseFloat(document.getElementById('sale-amount').value);

    if (!client || !amount) return alert("Por favor, ingresa el cliente y el monto.");

    try {
        await addDoc(collection(db, "sales"), {
            client: client,
            amount: amount,
            date: new Date().toISOString()
        });

        document.getElementById('sale-client').value = '';
        document.getElementById('sale-amount').value = '';
    } catch (error) {
        console.error("Error al registrar venta:", error);
    }
}

function listenToSales() {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    onSnapshot(collection(db, "sales"), (snapshot) => {
        let monthTotal = 0;
        const salesList = document.getElementById('sales-list');
        salesList.innerHTML = '';

        snapshot.forEach(docSnap => {
            const sale = docSnap.data();
            const saleDate = new Date(sale.date);

            if (saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear) {
                monthTotal += sale.amount;
                salesList.innerHTML += `
                    <li>
                        <span><b>${sale.client}</b></span> 
                        <span>$${sale.amount}</span>
                    </li>
                `;
            }
        });

        document.getElementById('month-total').innerText = monthTotal;
    });
}
