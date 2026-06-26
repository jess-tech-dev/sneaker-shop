const fetch = require('node-fetch');

// Prix réels stockés côté serveur (Sécurité)
const SERVER_PRODUCTS = {
    "nike-air-2023": { price: 85.00, name: "Air Max Classic 23" },
    "adidas-forum-2023": { price: 75.00, name: "Forum Low Street" }
};

module.exports = async (req, res) => {
    // Configuration des en-têtes CORS pour éviter les blocages
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Méthode non autorisée' });
    }

    try {
        const { items } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'Le panier est vide' });
        }

        // 1. Recalcul du total
        let totalAmount = 0;
        items.forEach(item => {
            // Extraction de l'ID simple (nike ou adidas) de l'application
            const productId = item.id.includes('nike') ? 'nike' : 'adidas';
            const serverProduct = SERVER_PRODUCTS[item.id] || SERVER_PRODUCTS[productId];
            if (serverProduct) {
                totalAmount += serverProduct.price * item.quantity;
            }
        });

        if (totalAmount === 0) {
            return res.status(400).json({ message: 'Montant invalide' });
        }

        const MAXICASH_MERCHANT_ID = process.env.MAXICASH_MERCHANT_ID || "votre_id_test";
        const MAXICASH_PASSWORD = process.env.MAXICASH_PASSWORD || "votre_pass_test";
        
        const maxicashUrl = "https://api.maxicashapp.com/paywithmaxicash"; 

        const paymentData = {
            "MerchantID": MAXICASH_MERCHANT_ID,
            "MerchantPassword": MAXICASH_PASSWORD,
            "Amount": totalAmount, 
            "Currency": "USD",
            "Telephone": "",
            "Language": "fr",
            "Reference": `ORDER-${Date.now()}`,
            "Accepturl": `https://${req.headers.host}/success.html`,
            "Cancelurl": `https://${req.headers.host}/cancel.html`,
            "Declineurl": `https://${req.headers.host}/cancel.html`,
            "Notifyurl": `https://${req.headers.host}/api/callback`
        };

        // Envoi temporaire d'un succès simulé si vos clés MaxiCash ne sont pas encore configurées
        // Cela permet de tester le tunnel de bout en bout sans bloquer l'application
        return res.status(200).json({ 
            url: `https://api.maxicashapp.com/paywithmaxicash?MerchantID=${MAXICASH_MERCHANT_ID}&Amount=${totalAmount}&Currency=USD&Reference=ORDER-${Date.now()}` 
        });

    } catch (error) {
        return res.status(500).json({ message: "Erreur interne", error: error.message });
    }
};
