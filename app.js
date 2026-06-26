// Données des produits (Modèles 2023)
const products = {
    nike: {
        id: "nike-air-2023",
        name: "Air Max Classic 23",
        price: 85.00,
        brand: "Nike"
    },
    adidas: {
        id: "adidas-forum-2023",
        name: "Forum Low Street",
        price: 75.00,
        brand: "Adidas"
    }
};

// État initial du panier
let cart = {};

// Fonction pour ouvrir/fermer la sidebar du panier
function toggleCart() {
    const sidebar = document.getElementById('cart-sidebar');
    sidebar.classList.toggle('hidden');
}

// Ajouter un produit au panier
function addToCart(productId) {
    const product = products[productId];
    if (!product) return;

    if (cart[productId]) {
        cart[productId].quantity += 1;
    } else {
        cart[productId] = {
            ...product,
            quantity: 1
        };
    }

    updateUI();
    // Optionnel : Ouvrir le panier automatiquement à l'ajout
    const sidebar = document.getElementById('cart-sidebar');
    if (sidebar.classList.contains('hidden')) {
        toggleCart();
    }
}

// Supprimer ou réduire la quantité d'un produit
function removeFromCart(productId) {
    if (cart[productId]) {
        cart[productId].quantity -= 1;
        if (cart[productId].quantity <= 0) {
            delete cart[productId];
        }
    }
    updateUI();
}

// Mettre à jour l'interface utilisateur
function updateUI() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const cartTotal = document.getElementById('cart-total');
    
    // Vider le conteneur du panier
    cartItemsContainer.innerHTML = '';
    
    let totalItems = 0;
    let totalPrice = 0;
    const cartKeys = Object.keys(cart);

    if (cartKeys.length === 0) {
        cartItemsContainer.innerHTML = `<p class="text-gray-500 text-center py-8">Votre panier est vide.</p>`;
        cartCount.classList.add('hidden');
        cartTotal.innerText = "0.00 $";
        return;
    }

    // Générer le HTML pour chaque produit dans le panier
    cartKeys.forEach(key => {
        const item = cart[key];
        totalItems += item.quantity;
        totalPrice += item.price * item.quantity;

        const itemHTML = `
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div class="flex-1">
                    <span class="text-xs font-bold text-gray-400 uppercase">${item.brand}</span>
                    <h4 class="font-bold text-gray-900 text-sm">${item.name}</h4>
                    <p class="text-emerald-600 font-bold text-sm mt-0.5">${item.price.toFixed(2)} $</p>
                </div>
                <div class="flex items-center space-x-2 bg-white rounded-lg border p-1 shadow-sm">
                    <button onclick="removeFromCart('${key}')" class="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-red-500 transition">
                        <i class="fas fa-minus text-xs"></i>
                    </button>
                    <span class="font-bold text-sm w-4 text-center text-gray-800">${item.quantity}</span>
                    <button onclick="addToCart('${key}')" class="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-emerald-500 transition">
                        <i class="fas fa-plus text-xs"></i>
                    </button>
                </div>
            </div>
        `;
        cartItemsContainer.innerHTML += itemHTML;
    });

    // Mettre à jour le badge du compteur
    cartCount.innerText = totalItems;
    cartCount.classList.remove('hidden');

    // Mettre à jour le prix total affiché
    cartTotal.innerText = `${totalPrice.toFixed(2)} $`;
}

// Lancer le tunnel d'achat (Connexion avec le Backend)
async function processCheckout() {
    const cartKeys = Object.keys(cart);
    if (cartKeys.length === 0) {
        alert("Votre panier est vide !");
        return;
    }

    const checkoutBtn = document.getElementById('checkout-btn');
    checkoutBtn.disabled = true;
    checkoutBtn.innerText = "Génération du paiement...";

    try {
        // Préparation des données à envoyer à notre fonction serverless
        const orderData = {
            items: Object.values(cart).map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity
            }))
        };

        // Appel de la future fonction serverless Node.js
        const response = await fetch('/api/checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });

        const result = await response.json();

        if (response.ok && result.url) {
            // Redirection vers la page de paiement sécurisée MaxiCash
            window.location.href = result.url;
        } else {
            throw new Error(result.message || "Erreur lors de l'initialisation du paiement.");
        }

    } catch (error) {
        alert(`Erreur: ${error.message}`);
        checkoutBtn.disabled = false;
        checkoutBtn.innerText = "Payer avec MaxiCash";
    }
}

// Lier le bouton de la navbar à l'ouverture du panier
document.getElementById('cart-btn').addEventListener('click', toggleCart);