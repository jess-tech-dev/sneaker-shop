import fetch from 'node-fetch';

// Prix réels stockés côté serveur (Sécurité)
const SERVER_PRODUCTS = {
    "nike-air-2023": { price: 85.00, name: "Air Max Classic 23" },
    "adidas-forum-2023": { price: 75.00, name: "Forum Low Street" }
};

export default async function handler(req, res) {
    // On accepte uniquement les requêtes POST
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Méthode non autorisée' });
    }

    try {
        const { items } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'Le panier est vide' });
        }

        // 1. Recalcul du total côté serveur pour éviter les fraudes
        let totalAmount = 0;
        items.forEach(item => {
            const serverProduct = SERVER_PRODUCTS[item.id];
            if (serverProduct) {
                totalAmount += serverProduct.price * item.quantity;
            }
        });

        // 2. Configuration des identifiants MaxiCash (à configurer sur ton hébergeur)
        const MAXICASH_MERCHANT_ID = process.env.MAXICASH_MERCHANT_ID || "votre_merchant_id_temporaire";
        const MAXICASH_PASSWORD = process.env.MAXICASH_PASSWORD || "votre_password_temporaire";
        
        // Mode Test (Sandbox) ou Production MaxiCash
        const maxicashUrl = "https://api.maxicashapp.com/paywithmaxicash"; 

        // 3. Préparation du payload selon la documentation de l'API MaxiCash
        const paymentData = {
            "MerchantID": MAXICASH_MERCHANT_ID,
            "MerchantPassword": MAXICASH_PASSWORD,
            "Amount": totalAmount * 100, // Souvent en centimes selon l'API ou directement le montant (à ajuster selon ta devise de test)
            "Currency": "USD",
            "Telephone": "", // Peut être laissé vide pour que le client le saisisse sur la passerelle
            "Language": "fr",
            "Reference": `ORDER-${Date.now()}`, // Référence unique de commande
            "Accepturl": `https://${req.headers.host}/success.html`,
            "Cancelurl": `https://${req.headers.host}/cancel.html`,
            "Declineurl": `https://${req.headers.host}/decline.html`,
            "Notifyurl": `https://${req.headers.host}/api/callback` // Endpoint pour valider la commande en arrière-plan
        };

        // 4. Envoi de la demande à MaxiCash
        const response = await fetch(maxicashUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(paymentData)
        });

        const result = await response.json();

        // 5. Récupération du lien de paiement généré par MaxiCash
        if (result.status === "success" || result.payurl) {
            // Renvoie l'URL de redirection au Front-end
            return res.status(200).json({ url: result.payurl });
        } else {
            return res.status(500).json({ 
                message: "Échec de l'initialisation chez MaxiCash", 
                details: result.message 
            });
        }

    } catch (error) {
        console.error("Erreur Checkout:", error);
        return res.status(500).json({ message: "Erreur interne du serveur", error: error.message });
    }
}
