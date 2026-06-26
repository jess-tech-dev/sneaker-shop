module.exports = async (req, res) => {
    // Gestion du CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Méthode non autorisée' });
    }

    // On génère directement un lien de redirection de test
    const totalAmount = 160; // Montant fictif pour le test
    const testUrl = `https://api.maxicashapp.com/paywithmaxicash?MerchantID=test&Amount=${totalAmount}&Currency=USD&Reference=ORDER-${Date.now()}`;

    return res.status(200).json({ url: testUrl });
};

// api/checkout.js

const MAXICASH_MERCHANT_ID = "votre_merchant_id_reel"; // Remplacez par votre ID réel
const MAXICASH_PASSWORD = "votre_password_reel"; // Remplacez par votre mot de passe réel

// ... reste du code ...
