const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET variant list with filters
// Query: q, brand, color, size, sort=price_asc|price_desc
router.get('/', async (req,res)=>{
  try{
    const { q, brand, color, size, sort } = req.query;
    let sql = `SELECT p.id AS product_id, p.brand, p.name AS product_name, p.description,
               v.id AS variant_id, v.color, v.size, v.price, v.image_url, v.stock
               FROM product_variants v
               JOIN products p ON p.id = v.product_id
               WHERE v.image_url IS NOT NULL 
               AND v.image_url != '' 
               AND v.image_url != 'null'
               AND v.stock > 0`; // ⭐⭐ CORRECTION : Filtrer les images vides
    
    const params = [];
    if(q){ 
      sql += ' AND (p.name LIKE ? OR p.brand LIKE ? OR p.description LIKE ?)'; 
      params.push('%'+q+'%','%'+q+'%','%'+q+'%'); 
    }
    if(brand){ 
      sql += ' AND p.brand = ?'; 
      params.push(brand); 
    }
    if(color){ 
      sql += ' AND v.color = ?'; 
      params.push(color); 
    }
    if(size){ 
      sql += ' AND v.size = ?'; 
      params.push(size); 
    }
    
    if(sort === 'price_asc') sql += ' ORDER BY v.price ASC';
    else if(sort === 'price_desc') sql += ' ORDER BY v.price DESC';
    else sql += ' ORDER BY p.id ASC';
    
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  }catch(err){ 
    console.error(err); 
    res.status(500).json({ error:'Failed to fetch products' }); 
  }
});

// GET single product by product id (with variants)
router.get('/product/:id', async (req,res)=>{
  try{
    const id = req.params.id;
    const [rows] = await pool.query(`SELECT p.id as product_id, p.brand, p.name AS product_name, p.description, v.*
      FROM products p 
      JOIN product_variants v ON p.id=v.product_id 
      WHERE p.id = ? 
      AND v.image_url IS NOT NULL 
      AND v.image_url != '' 
      AND v.image_url != 'null'`, [id]); // ⭐⭐ CORRECTION : Filtrer les images
    res.json(rows);
  }catch(err){ 
    console.error(err); 
    res.status(500).json({ error:'Failed' }); 
  }
});

module.exports = router;