// ⭐⭐⭐ API_BASE conservé à 3000 comme demandé ⭐⭐⭐
const API_BASE = 'http://localhost:3000'; 
let productsData = [];
let groupedProducts = [];
// Initialisation du panier avec localStorage
let cart = JSON.parse(localStorage.getItem('koms_cart')) || []; 

// ===================================
// === LOGIQUE PANIER ET INTERACTIVITÉ ===
// ===================================

function saveCart() {
  localStorage.setItem('koms_cart', JSON.stringify(cart));
  updateCartDisplay();
}

function updateCartDisplay() {
  const cartCountEl = document.getElementById('cartCount');
  if (cartCountEl) {
    cartCountEl.textContent = cart.length;
  }
  renderCartModal();
}

// GESTION DE L'AFFICHAGE DU PANIER (MODALE)
function renderCartModal() {
  const container = document.getElementById('cartItemsContainer');
  const totalEl = document.getElementById('cartTotal');
  const checkoutBtn = document.getElementById('checkoutBtn');
  
  if (!container || !totalEl) return;

  container.innerHTML = '';
  let total = 0;

  if (cart.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px; color: var(--text-muted);">
        <i class="fas fa-shopping-cart" style="font-size: 48px; margin-bottom: 16px;"></i>
        <p>Votre panier est vide pour le moment.</p>
      </div>
    `;
    totalEl.textContent = '0 FCFA';
    if (checkoutBtn) checkoutBtn.disabled = true;
    return;
  }
  
  if (checkoutBtn) checkoutBtn.disabled = false;

  cart.forEach((item, index) => {
    total += item.price;
    
    const cartItemEl = document.createElement('div');
    cartItemEl.className = 'cart-item';
    cartItemEl.innerHTML = `
      <img src="${item.image_url}" alt="${item.name}" class="cart-item-img">
      <div class="cart-item-info">
        <div class="item-details">
          <h4>${item.brand} ${item.name}</h4>
          <p>
            Couleur: ${item.color} / Taille: ${item.size} 
            <span style="color:var(--secondary);font-weight:700">| ${item.price.toLocaleString()} FCFA</span>
          </p>
        </div>
      </div>
      <button class="remove-btn" data-index="${index}">
        <i class="fas fa-times"></i>
      </button>
    `;
    container.appendChild(cartItemEl);
  });
  
  totalEl.textContent = total.toLocaleString() + ' FCFA';

  // Ajout des écouteurs pour la suppression
  document.querySelectorAll('.remove-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      const index = parseInt(e.currentTarget.dataset.index);
      cart.splice(index, 1);
      saveCart();
    });
  });
}

// GÉNÉRATION MESSAGE WHATSAPP
document.getElementById('checkoutBtn')?.addEventListener('click', () => {
  if (cart.length === 0) return;

  let message = `Bonjour Koms Shoes ! Je souhaite commander les articles suivants :\n\n`;
  let total = 0;
  
  cart.forEach((item, index) => {
    message += `${index + 1}. ${item.brand} ${item.name}\n`;
    message += `   Couleur: ${item.color}, Taille: ${item.size}\n`;
    message += `   Prix: ${item.price.toLocaleString()} FCFA\n`;
    message += `   (Ref: ${item.product_id})\n\n`;
    total += item.price;
  });
  
  message += `Total estimé de la commande : ${total.toLocaleString()} FCFA.\n`;
  message += `Merci de confirmer la disponibilité et le prix total, y compris la livraison.`;

  const whatsappNumber = "221773203484";
  const encodedMessage = encodeURIComponent(message);
  const url = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
  
  window.open(url, '_blank');
  // Optionnel : Vider le panier après envoi de la commande
  // cart = [];
  // saveCart(); 
});

// GESTION DE LA MODALE
const modal = document.getElementById('cartModal');
const btn = document.getElementById('cartBtn');
const span = document.getElementsByClassName("close-btn")[0];

if (btn && modal && span) {
    btn.onclick = function() {
      modal.style.display = "block";
      renderCartModal();
    }
    
    span.onclick = function() {
      modal.style.display = "none";
    }
    
    window.onclick = function(event) {
      if (event.target == modal) {
        modal.style.display = "none";
      }
    }
}


// ===================================
// === LOGIQUE PRODUITS (Votre code existant + adaptations) ===
// ===================================

// init
window.addEventListener('load', async ()=>{
  await fetchProducts();
  buildFilters();
  renderProducts();
  updateCartDisplay(); // MAJ du compteur au chargement
});

async function fetchProducts(params = {}){
  const qs = new URLSearchParams(params).toString();
  
  // Utilisation d'un try/catch pour éviter le crash en cas d'API non disponible
  try {
    const res = await fetch(`${API_BASE}/api/products?${qs}`);
    if (!res.ok) {
        throw new Error(`Erreur HTTP: ${res.status}`);
    }
    productsData = await res.json();
  } catch (error) {
    console.error(`Erreur lors de la récupération des produits. Assurez-vous que l'API est sur ${API_BASE}.`, error);
    productsData = []; 
  }
  
  // Vérifier si les images existent réellement (VOTRE LOGIQUE CONSERVÉE)
  const productsWithValidImages = await Promise.all(
    productsData.map(async (v) => {
      if (!v.image_url || v.image_url.trim() === '' || v.image_url === 'null') {
        return null;
      }
      
      const imageExists = await checkImageExists(v.image_url);
      // Récupérer le prix pour l'affichage initial groupé
      if (imageExists) {
        v.price = v.price || 0; 
      }
      return imageExists ? v : null;
    })
  );
  
  const validProducts = productsWithValidImages.filter(Boolean);
  
  // group by product_id
  const map = {};
  validProducts.forEach(v => {
    if(!map[v.product_id]) {
      map[v.product_id] = { 
        product_id: v.product_id, 
        brand: v.brand, 
        name: v.product_name, 
        initial_image: v.image_url, 
        initial_price: v.price,
        variants: [] 
      };
    }
    map[v.product_id].variants.push(v);
  });
  groupedProducts = Object.values(map);
}

// Vérifier si une image existe (VOTRE LOGIQUE CONSERVÉE)
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
  if (brandSel) brandSel.innerHTML = `<option value="">Toutes les marques</option>` + [...brands].map(b=>`<option value="${b}">${b}</option>`).join('');
  
  const colorSel = document.getElementById('filterColor');
  if (colorSel) colorSel.innerHTML = `<option value="">Toutes les couleurs</option>` + [...colors].map(c=>`<option value="${c}">${c}</option>`).join('');
  
  const sizeSel = document.getElementById('filterSize');
  if (sizeSel) sizeSel.innerHTML = `<option value="">Toutes les tailles</option>` + [...sizes].map(s=>`<option value="${s}">${s}</option>`).join('');
}

document.getElementById('btnSearch')?.addEventListener('click', async ()=>{
  const q = document.getElementById('searchInput').value;
  const brand = document.getElementById('filterBrand').value;
  const color = document.getElementById('filterColor').value;
  const size = document.getElementById('filterSize').value;
  const sort = document.getElementById('sortPrice').value;
  await fetchProducts({ q, brand, color, size, sort });
  buildFilters();
  renderProducts();
});


// ⭐⭐⭐ MODIFICATION DE RENDERPRODUCTS POUR L'INTERACTIVITÉ ET LE PANIER ⭐⭐⭐
function renderProducts(){
  const grid = document.getElementById('productsGrid'); 
  if (!grid) return;
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
    
    // On regroupe les options disponibles
    const colors = [...new Set(validVariants.map(v => v.color))];
    const sizes = [...new Set(validVariants.map(v => v.size))];
    const basePrice = p.initial_price || 0;
    
    const el = document.createElement('div'); 
    el.className = 'card';
    el.dataset.productId = p.product_id; // AJOUT
    el.innerHTML = `
      <div class="thumb">
        <img id="img-${p.product_id}" src="${p.initial_image}" 
             alt="${p.brand} ${p.name}"
             onerror="this.style.display='none'; this.parentNode.style.background='#f8f9fa'; this.parentNode.innerHTML='<div style=color:#666;text-align:center>Image non disponible</div>'" />
      </div>
      <div style="padding:8px 4px">
        <h3 style="margin:0">${p.brand} ${p.name}</h3>
        <div style="color:#9aa0a6">${validVariants.length} variante${validVariants.length > 1 ? 's' : ''}</div>
        <div id="price-${p.product_id}" style="margin-top:6px;color:#ff2d55;font-weight:700;padding: 0 15px;">${basePrice.toLocaleString()} FCFA</div>
        <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap;padding: 0 15px;">
          <select id="color-${p.product_id}" data-type="color">${colors.map(c=>`<option value="${c}">${c}</option>`).join('')}</select>
          <select id="size-${p.product_id}" data-type="size">${sizes.map(s=>`<option value="${s}">${s}</option>`).join('')}</select>
        </div>
        <button id="add-to-cart-${p.product_id}" class="btn btn-primary" style="margin-top:15px; width:calc(100% - 30px); margin-left:15px; justify-content:center; padding:12px 0;">
            <i class="fas fa-cart-plus"></i> Ajouter au Panier
        </button>
      </div>`;
    grid.appendChild(el);
    
    // --- Logique d'interactivité et de panier ---
    const colorSelect = document.getElementById(`color-${p.product_id}`);
    const sizeSelect = document.getElementById(`size-${p.product_id}`);
    const addToCartBtn = document.getElementById(`add-to-cart-${p.product_id}`);
    
    // Fonction de mise à jour de la carte (image et prix)
    const updateCard = () => {
        const selectedColor = colorSelect.value;
        const selectedSize = sizeSelect.value;
        
        const matchingVariant = validVariants.find(v => 
            v.color === selectedColor && v.size === selectedSize
        );
        
        if (matchingVariant) {
            document.getElementById(`img-${p.product_id}`).src = matchingVariant.image_url;
            document.getElementById(`price-${p.product_id}`).textContent = matchingVariant.price.toLocaleString() + ' FCFA';
        } else {
             document.getElementById(`price-${p.product_id}`).textContent = 'Indisponible';
        }
    };
    
    if (colorSelect) colorSelect.addEventListener('change', updateCard);
    if (sizeSelect) sizeSelect.addEventListener('change', updateCard);
    
    // Écouteur pour l'ajout au panier
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', () => {
            const selectedColor = colorSelect.value;
            const selectedSize = sizeSelect.value;
            
            const itemToAdd = validVariants.find(v => 
                v.color === selectedColor && v.size === selectedSize
            );
            
            if (itemToAdd) {
                // Cloner l'objet avec le nom et la marque pour le panier
                cart.push({...itemToAdd, name: p.name, brand: p.brand}); 
                saveCart();
                alert(`${p.name} (C: ${selectedColor}, T: ${selectedSize}) ajouté au panier !`);
            } else {
                alert("Cette combinaison exacte n'est pas disponible.");
            }
        });
    }

    updateCard(); // Initialise l'affichage
  });
}