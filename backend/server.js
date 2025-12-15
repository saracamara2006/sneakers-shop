// server.js (main)
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path'); // AJOUT
dotenv.config();

const authRoutes = require('./routes/auth');
const productsRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// ⭐⭐ AJOUT - SERVIR LE FRONTEND ⭐⭐
app.use(express.static(path.join(__dirname, '../frontend')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/cart', cartRoutes);

// ⭐⭐ AJOUT - Route test pour vérifier que le backend fonctionne
app.get('/api/test', (req, res) => {
  res.json({ 
    message: '✅ Backend is working!',
    timestamp: new Date().toISOString()
  });
});

// ⭐⭐ CHANGEMENT - Port modifié à 5000 pour éviter le conflit
const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=> console.log(`🚀 Server running on http://localhost:${PORT}`));