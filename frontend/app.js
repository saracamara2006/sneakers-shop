const API_BASE = 'http://localhost:3000';
let productsData = [];
let groupedProducts = [];

// init
window.addEventListener('load', async ()=>{
  await fetchProducts();
  buildFilters();
  renderProducts();
});

async function fetchProducts(params = {}){
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/api/products?${qs}`);
  productsData = await res.json();
  
  // Vérifier si les images existent réellement
  const productsWithValidImages = await Promise.all(
    productsData.map(async (v) => {
      if (!v.image_url || v.image_url.trim() === '' || v.image_url === 'null') {
        return null;
      }
      
      const imageExists = await checkImageExists(v.image_url);
      return imageExists ? v : null;
    })
  );
  
  const validProducts = productsWithValidImages.filter(Boolean);
  console.log(`Produits avec images valides: ${validProducts.length}/${productsData.length}`);

  // group by product_id
  const map = {};
  validProducts.forEach(v => {
    if(!map[v.product_id]) {
      map[v.product_id] = { 
        product_id: v.product_id, 
        brand: v.brand, 
        name: v.product_name, 
        variants: [] 
      };
    }
    map[v.product_id].variants.push(v);
  });
  groupedProducts = Object.values(map);
}

// Vérifier si une image existe
function checkImageExists(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

function buildFilters(){
  const brands = new Set(), colors = new Set(), sizes = new Set();
  productsData.forEach(v => { 
    if(v.brand) brands.add(v.brand); 
    if(v.color) colors.add(v.color); 
    if(v.size) sizes.add(v.size); 
  });
  
  const brandSel = document.getElementById('filterBrand');
  brandSel.innerHTML = `<option value="">Toutes les marques</option>` + [...brands].map(b=>`<option value="${b}">${b}</option>`).join('');
  
  const colorSel = document.getElementById('filterColor');
  colorSel.innerHTML = `<option value="">Toutes les couleurs</option>` + [...colors].map(c=>`<option value="${c}">${c}</option>`).join('');
  
  const sizeSel = document.getElementById('filterSize');
  sizeSel.innerHTML = `<option value="">Toutes les tailles</option>` + [...sizes].map(s=>`<option value="${s}">${s}</option>`).join('');
}

document.getElementById('btnSearch').addEventListener('click', async ()=>{
  const q = document.getElementById('searchInput').value;
  const brand = document.getElementById('filterBrand').value;
  const color = document.getElementById('filterColor').value;
  const size = document.getElementById('filterSize').value;
  const sort = document.getElementById('sortPrice').value;
  await fetchProducts({ q, brand, color, size, sort });
  buildFilters();
  renderProducts();
});

function renderProducts(){
  const grid = document.getElementById('productsGrid'); 
  grid.innerHTML = '';
  
  if (groupedProducts.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #666;">
        <i class="fas fa-search" style="font-size: 48px; margin-bottom: 16px;"></i>
        <h3>Aucun produit trouvé</h3>
        <p>Aucun produit avec image disponible pour le moment.</p>
      </div>
    `;
    return;
  }
  
  groupedProducts.forEach(p => {
    const validVariants = p.variants.filter(v => 
      v.image_url && v.image_url.trim() !== '' && v.image_url !== 'null'
    );
    
    const colors = [...new Set(validVariants.map(v => v.color))];
    const sizes = [...new Set(validVariants.map(v => v.size))];
    const basePrice = validVariants[0]?.price || 0;
    
    const el = document.createElement('div'); 
    el.className = 'card';
    el.innerHTML = `
      <div class="thumb">
        <img src="${validVariants[0]?.image_url}" 
             alt="${p.brand} ${p.name}"
             onerror="this.style.display='none'; this.parentNode.style.background='#f8f9fa'; this.parentNode.innerHTML='<div style=color:#666;text-align:center>Image non disponible</div>'" />
      </div>
      <div style="padding:8px 4px">
        <h3 style="margin:0">${p.brand} ${p.name}</h3>
        <div style="color:#9aa0a6">${validVariants.length} variante${validVariants.length > 1 ? 's' : ''}</div>
        <div style="margin-top:6px;color:#ff2d55;font-weight:700">${basePrice.toLocaleString()} FCFA</div>
        <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap">
          <select id="color-${p.product_id}">${colors.map(c=>`<option value="${c}">${c}</option>`).join('')}</select>
          <select id="size-${p.product_id}">${sizes.map(s=>`<option value="${s}">${s}</option>`).join('')}</select>
        </div>
      </div>`;
    grid.appendChild(el);
  });
}
