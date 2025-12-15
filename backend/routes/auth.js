// auth.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

// register
router.post('/register', async (req,res)=>{
  try{
    const { name, email, password, phone } = req.body;
    if(!email || !password) return res.status(400).json({ error: 'Email & password required' });
    const [exists] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if(exists.length) return res.status(400).json({ error: 'User exists' });
    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query('INSERT INTO users (name,email,password_hash,phone) VALUES (?,?,?,?)', [name||null,email,hash,phone||null]);
    const id = result.insertId;
    const token = jwt.sign({ id, email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token });
  }catch(err){ console.error(err); res.status(500).json({ error:'Register failed' }); }
});

// login
router.post('/login', async (req,res)=>{
  try{
    const { email, password } = req.body;
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if(rows.length===0) return res.status(400).json({ error: 'User not found' });
    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if(!ok) return res.status(400).json({ error:'Wrong password' });
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token });
  }catch(err){ console.error(err); res.status(500).json({ error:'Login failed' }); }
});

module.exports = router;
