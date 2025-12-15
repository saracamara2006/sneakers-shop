// cart.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

function authMiddleware(req,res,next){
  const auth = req.headers.authorization;
  if(!auth) return res.status(401).json({ error:'No auth' });
  const token = auth.split(' ')[1];
  try{
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  }catch(e){ return res.status(401).json({ error:'Invalid token' }); }
}

// get cart
router.get('/', authMiddleware, async (req,res)=>{
  try{
    const userId = req.user.id;
    const [rows] = await pool.query(`
      SELECT c.id AS cart_id, v.id AS variant_id, p.brand, p.name AS product_name, v.color, v.size, v.price, v.image_url, c.qty, v.stock
      FROM cart_items c
      JOIN product_variants v ON v.id = c.variant_id
      JOIN products p ON p.id = v.product_id
      WHERE c.user_id = ?`, [userId]);
    res.json(rows);
  }catch(err){ console.error(err); res.status(500).json({ error:'Cart fetch failed' }); }
});

// ⭐⭐ MODIFIÉ : '/add' devient '/' ⭐⭐
router.post('/', authMiddleware, async (req,res)=>{
  try{
    const userId = req.user.id;
    const { variant_id, qty } = req.body;
    if(!variant_id) return res.status(400).json({ error:'variant_id required' });
    const [exists] = await pool.query('SELECT id, qty FROM cart_items WHERE user_id = ? AND variant_id = ?', [userId, variant_id]);
    if(exists.length){
      const newQty = exists[0].qty + (qty||1);
      await pool.query('UPDATE cart_items SET qty = ? WHERE id = ?', [newQty, exists[0].id]);
    } else {
      await pool.query('INSERT INTO cart_items (user_id, variant_id, qty) VALUES (?, ?, ?)', [userId, variant_id, qty||1]);
    }
    res.json({ ok:true });
  }catch(err){ console.error(err); res.status(500).json({ error:'Add to cart failed' }); }
});

// update qty
router.put('/:cartId', authMiddleware, async (req,res)=>{
  try{
    const userId = req.user.id;
    const cartId = req.params.cartId;
    const { qty } = req.body;
    await pool.query('UPDATE cart_items SET qty = ? WHERE id = ? AND user_id = ?', [qty, cartId, userId]);
    res.json({ ok:true });
  }catch(err){ console.error(err); res.status(500).json({ error:'Update failed' }); }
});

// delete item
router.delete('/:cartId', authMiddleware, async (req,res)=>{
  try{
    const userId = req.user.id;
    const cartId = req.params.cartId;
    await pool.query('DELETE FROM cart_items WHERE id = ? AND user_id = ?', [cartId, userId]);
    res.json({ ok:true });
  }catch(err){ console.error(err); res.status(500).json({ error:'Delete failed' }); }
});

// checkout -> returns whatsapp link or snap url
router.post('/checkout', authMiddleware, async (req,res)=>{
  try{
    const userId = req.user.id;
    const { contact_method, note } = req.body;
    const seller_whatsapp = process.env.SELLER_WHATSAPP || '221773203484';
    const seller_snap = process.env.SELLER_SNAP || 'https://www.snapchat.com/add/okomma';

    const [cart] = await pool.query(`
      SELECT p.brand, p.name as product_name, v.color, v.size, v.price, c.qty
      FROM cart_items c
      JOIN product_variants v ON v.id = c.variant_id
      JOIN products p ON p.id = v.product_id
      WHERE c.user_id = ?`, [userId]);
    if(cart.length === 0) return res.status(400).json({ error:'Cart empty' });
    const total = cart.reduce((s,i)=> s + (i.price * i.qty), 0);
    let msg = 'Commande depuis Sneakers%0A';
    cart.forEach(it => {
      msg += `- ${it.brand} ${it.product_name} | Couleur: ${it.color} | Taille: ${it.size} | Qty: ${it.qty} | Prix: ${it.price} FCFA%0A`;
    });
    msg += `%0ATotal: ${total.toLocaleString()} FCFA%0A`;
    msg += `%0ANotes: ${note || ''}`;
    if(contact_method === 'whatsapp'){
      const url = `https://wa.me/${seller_whatsapp}?text=${encodeURIComponent(msg)}`;
      return res.json({ checkout_link: url, total });
    } else {
      return res.json({ checkout_link: seller_snap, total });
    }
  }catch(err){ console.error(err); res.status(500).json({ error:'Checkout failed' }); }
});

module.exports = router;