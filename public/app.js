// Initialisation du panier depuis le stockage local
let cart = JSON.parse(localStorage.getItem('cart')) || {};

// Charger l'état graphique initial au démarrage
updateCartUI();

function toggleCart(open) {
    const sidebar = document.getElementById('cart-sidebar');
    if (open) {
        sidebar.classList.remove('hidden');
    } else {
        sidebar.classList.add('hidden');
    }
}

function addToCart(id, name, price) {
    if (cart[id]) {
        cart[id].quantity += 1;
    } else {
        cart[id] = { name: name, price: price, quantity: 1 };
    }
    saveCart();
    updateCartUI();
    toggleCart(true); // Ouvre automatiquement le panier à l'ajout
}

function updateQuantity(id, change) {
    if (!cart[id]) return;
    cart[id].quantity += change;
    if (cart[id].quantity <= 0) {
        delete cart[id];
    }
    saveCart();
    updateCartUI();
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartUI() {
    const container = document.getElementById('cart-items-container');
    const badge = document.getElementById('cart-badge');
    const totalElement = document.getElementById('cart-total');
    
    if (!container) return;
    
    container.innerHTML = '';
    let total = 0;
    let itemCount = 0;
    
    const keys = Object.keys(cart);
    
    if (keys.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12 text-gray-400">
                <i class="fa-solid fa-basket-shopping text-4xl mb-3 block"></i>
                <p class="text-sm">Votre panier est vide</p>
            </div>
        `;
    } else {
        keys.forEach(id => {
            const item = cart[id];
            total += item.price * item.quantity;
            itemCount += item.quantity;
            
            container.innerHTML += `
                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div>
                        <h4 class="font-bold text-sm text-gray-900">${item.name}</h4>
                        <p class="text-xs text-emerald-600 font-semibold">${item.price.toFixed(2)} $</p>
                    </div>
                    <div class="flex items-center space-x-2.5 bg-white border rounded-lg p-1 shadow-sm">
                        <button onclick="updateQuantity('${id}', -1)" class="w-6 h-6 text-xs bg-gray-100 rounded hover:bg-gray-200 font-bold">-</button>
                        <span class="text-sm font-bold w-4 text-center">${item.quantity}</span>
                        <button onclick="updateQuantity('${id}', 1)" class="w-6 h-6 text-xs bg-gray-100 rounded hover:bg-gray-200 font-bold">+</button>
                    </div>
                </div>
            `;
        });
    }
    
    // Mettre à jour le badge et les totaux
    totalElement.innerText = `${total.toFixed(2)} $`;
    if (itemCount > 0) {
        badge.innerText = itemCount;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
}

function processCheckout() {
    const cartKeys = Object.keys(cart);
    if (cartKeys.length === 0) {
        alert("Votre panier est vide !");
        return;
    }

    // Récupérer le mode sélectionné dans la liste radio
    const selectedMethod = document.querySelector('input[name="payment-method"]:checked').value;
    const checkoutBtn = document.getElementById('checkout-btn');
    
    checkoutBtn.disabled = true;
    checkoutBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-2"></i> Traitement de ${selectedMethod}...`;

    // Petit délai de traitement fictif de 1.2s, puis redirection directe
    setTimeout(() => {
        window.location.href = `success.html?method=${encodeURIComponent(selectedMethod)}`;
    }, 1200);
}
