// server.js (main)
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config();

const authRoutes = require('./routes/auth');
const productsRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');

const app = express();
// J'ai vu que vous utilisiez API_BASE=3000 dans le frontend qui fonctionne
// Nous allons conserver le PORT par défaut à 3000 ici pour la cohérence locale.
const PORT = process.env.PORT || 3000; 

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// ⭐⭐⭐ AJOUT CRUCIAL : Configuration pour servir le dossier "images" ⭐⭐⭐
// Cela rend les images accessibles à l'URL : http://localhost:3000/images/nom_image.jpg
// Assurez-vous que le dossier "images" se trouve à la racine du dossier backend
app.use('/images', express.static(path.join(__dirname, 'images')));


// ⭐⭐ SERVIR LE FRONTEND (tel que configuré précédemment) ⭐⭐
// Ceci suppose que votre dossier frontend est au même niveau que le dossier backend
app.use(express.static(path.join(__dirname, '../frontend')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/cart', cartRoutes);

// Route test pour vérifier que le backend fonctionne
app.get('/api/test', (req, res) => {
  res.json({ 
    message: '✅ Backend is working!',
    timestamp: new Date().toISOString()
  });
});


app.listen(PORT, ()=> console.log(`🚀 Server running on http://localhost:${PORT}`));