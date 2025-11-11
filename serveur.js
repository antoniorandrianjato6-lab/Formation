// serveur.js
const express = require('express');
const path = require('path');
const app = express();

//Dossier des fichiers du jeu
app.use(express.static(path.join(__dirname)));

// Route Principale
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Démarrer le serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port http://localhost:${PORT}`);
});