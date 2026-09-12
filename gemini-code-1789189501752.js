// --- ESTADO DE LA APLICACIÓN ---
let products = JSON.parse(localStorage.getItem('catalog_products')) || [
    { id: 1, title: 'Remera Oversize', desc: 'Algodón premium. Talles S, M, L. Blanco/Negro.', price: 15000, img: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=400&q=80' },
    { id: 2, title: 'Pantalón Cargo', desc: 'Gris oscuro. Tela ripstop resistente.', price: 28000, img: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=400&q=80' }
];
let cart = [];
let isAdmin = false;

// Al estar en Argentina, aseguramos el formato +54 9 para el enlace de WhatsApp
const VENDEDOR_PHONE = "5491100000000"; // Reemplaza con tu número (código de área sin 0 y número sin 15)

// --- INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    checkAdminMode();
});

// --- LÓGICA DEL CLIENTE (RENDER Y CARRITO) ---
function renderProducts() {
    const grid = document.getElementById('product-grid');
    grid.innerHTML = '';
    products.forEach(p => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img src="${p.img}" class="product-img" onclick="openProduct(${p.id})">
            <div class="product-info" onclick="openProduct(${p.id})">
                <div class="product-title">${p.title}</div>
                <div class="product-price">$${p.price}</div>
            </div>
            ${isAdmin ? `<div class="admin-actions" style="display:block"><button class="btn-del" onclick="deleteProduct(${p.id})">X</button></div>` : ''}
        `;
        grid.appendChild(card);
    });
}

function openProduct(id) {
    const p = products.find(prod => prod.id === id);
    document.getElementById('modal-img').src = p.img;
    document.getElementById('modal-title').textContent = p.title;
    document.getElementById('modal-desc').textContent = p.desc;
    document.getElementById('modal-price').textContent = `$${p.price}`;
    
    const addBtn = document.getElementById('modal-add-btn');
    addBtn.onclick = () => addToCart(p);
    
    document.getElementById('product-modal').style.display = 'flex';
}

function closeModals() {
    document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
}

function addToCart(product) {
    const item = cart.find(i => i.id === product.id);
    if (item) item.qty++;
    else cart.push({ ...product, qty: 1 });
    
    updateCartUI();
    closeModals();
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
                    <button onclick="changeQty(${item.id}, -1)">-</button>
                    <span>${item.qty}</span>
                    <button onclick="changeQty(${item.id}, 1)">+</button>
                </div>
            </div>
        `;
    });
    document.getElementById('cart-total').innerText = total;
}

function changeQty(id, delta) {
    const item = cart.find(i => i.id === id);
    if (item) {
        item.qty += delta;
        if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
    }
    updateCartUI();
}

function toggleCart() {
    const panel = document.getElementById('cart-panel');
    panel.classList.toggle('open');
}

function checkout() {
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

// --- LÓGICA DEL ADMINISTRADOR (CRUD Y LOGIN) ---
function checkAdminMode() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('admin') === 'true') {
        document.getElementById('admin-modal').style.display = 'flex';
    }
}

function loginAdmin() {
    const pass = document.getElementById('admin-pass').value;
    if (pass === '1234') { // Contraseña simple para el ejemplo
        isAdmin = true;
        document.getElementById('admin-login-view').style.display = 'none';
        document.getElementById('admin-dashboard-view').style.display = 'block';
        renderProducts(); // Re-render para mostrar botones de borrar
    } else {
        alert('Contraseña incorrecta');
    }
}

function addProduct() {
    const newProd = {
        id: Date.now(),
        img: document.getElementById('new-img').value || 'https://via.placeholder.com/400',
        title: document.getElementById('new-title').value,
        desc: document.getElementById('new-desc').value,
        price: parseInt(document.getElementById('new-price').value)
    };
    products.push(newProd);
    saveCatalog();
    renderProducts();
    alert('Producto agregado');
}

function deleteProduct(id) {
    if(confirm('¿Eliminar este producto?')) {
        products = products.filter(p => p.id !== id);
        saveCatalog();
        renderProducts();
    }
}

function saveCatalog() {
    localStorage.setItem('catalog_products', JSON.stringify(products));
}