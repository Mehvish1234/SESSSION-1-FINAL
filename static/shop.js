// Shop functionality for Flask e-commerce app
let products = [];
let cart = [];

// DOM Elements
const productsGrid = document.getElementById('productsGrid');
const cartIcon = document.getElementById('cartIcon');
const cartSidebar = document.getElementById('cartSidebar');
const cartOverlay = document.getElementById('cartOverlay');
const closeCart = document.getElementById('closeCart');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const cartCount = document.querySelector('.cart-count');
const mobileFilterToggle = document.getElementById('mobileFilterToggle');
const filtersPanel = document.getElementById('filters');
const closeFilters = document.getElementById('closeFilters');
const filterOverlay = document.getElementById('filterOverlay');

// Initialize the shop
async function initShop() {
    await loadProducts();
    await loadCart();
    setupEventListeners();
}

// Load products from Flask API
async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        products = await response.json();
        displayProducts(products);
    } catch (error) {
        console.error('Error loading products:', error);
        showNotification('Error loading products', 'error');
    }
}

// Load cart from Flask API
async function loadCart() {
    try {
        const response = await fetch('/api/cart');
        if (response.ok) {
            const cartData = await response.json();
            cart = cartData;
            updateCart();
        }
    } catch (error) {
        console.error('Error loading cart:', error);
    }
}

// Display products
function displayProducts(productsToShow) {
    productsGrid.innerHTML = productsToShow.map(product => `
        <div class="product-card">
            <div class="product-image">
                <img src="${product.image_url || 'https://via.placeholder.com/300x200'}" alt="${product.name}">
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <div class="product-category">${product.category}</div>
                <button class="add-to-cart" onclick="addToCart(${product.id})" 
                        ${!product.in_stock ? 'disabled' : ''}>
                    <i class="fas fa-shopping-cart"></i>
                    ${product.in_stock ? 'Add to Cart' : 'Out of Stock'}
                </button>
            </div>
        </div>
    `).join('');
}

// Add to cart
async function addToCart(productId) {
    try {
        const response = await fetch('/api/cart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                product_id: productId,
                quantity: 1
            })
        });

        if (response.ok) {
            const product = products.find(p => p.id === productId);
            showNotification(`${product.name} added to cart!`);
            await loadCart(); // Reload cart to get updated data
        } else if (response.status === 401) {
            showNotification('Please log in to add items to cart', 'error');
            window.location.href = '/login';
        } else {
            showNotification('Error adding item to cart', 'error');
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
        showNotification('Error adding item to cart', 'error');
    }
}

// Update cart display
function updateCart() {
    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;

    // Update cart items
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.product.image_url || 'https://via.placeholder.com/60x60'}" 
                 alt="${item.product.name}" width="60">
            <div class="cart-item-details">
                <h4>${item.product.name}</h4>
                <div class="cart-item-price">$${item.product.price.toFixed(2)}</div>
                <div class="cart-item-quantity">
                    <button onclick="updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                </div>
            </div>
            <button class="remove-item" onclick="removeFromCart(${item.id})">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');

    // Update total
    const total = cart.reduce((sum, item) => sum + item.total, 0);
    cartTotal.textContent = `$${total.toFixed(2)}`;
}

// Update item quantity
async function updateQuantity(cartItemId, newQuantity) {
    if (newQuantity < 1) {
        await removeFromCart(cartItemId);
        return;
    }
    
    try {
        const response = await fetch(`/api/cart/${cartItemId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                quantity: newQuantity
            })
        });

        if (response.ok) {
            showNotification('Cart updated successfully');
            await loadCart(); // Reload cart to get updated data
        } else if (response.status === 401) {
            showNotification('Please log in to update cart', 'error');
            window.location.href = '/login';
        } else {
            showNotification('Error updating cart', 'error');
        }
    } catch (error) {
        console.error('Error updating quantity:', error);
        showNotification('Error updating cart', 'error');
    }
}

// Remove from cart
async function removeFromCart(cartItemId) {
    try {
        const response = await fetch(`/api/cart/${cartItemId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showNotification('Item removed from cart');
            await loadCart(); // Reload cart to get updated data
        } else if (response.status === 401) {
            showNotification('Please log in to remove items', 'error');
            window.location.href = '/login';
        } else {
            showNotification('Error removing item', 'error');
        }
    } catch (error) {
        console.error('Error removing from cart:', error);
        showNotification('Error removing item', 'error');
    }
}

// Show/hide cart
function toggleCart() {
    cartSidebar.classList.toggle('active');
    cartOverlay.classList.toggle('active');
}

// Filter products
async function filterProducts() {
    const selectedCategories = Array.from(document.querySelectorAll('.filter-options input:checked'))
        .map(input => input.value);
    const minPrice = parseFloat(document.getElementById('minPrice').value) || 0;
    const maxPrice = parseFloat(document.getElementById('maxPrice').value) || 1000;

    // Build query parameters
    const params = new URLSearchParams();
    if (selectedCategories.length > 0 && !selectedCategories.includes('all')) {
        params.append('category', selectedCategories[0]); // Take first selected category
    }
    if (minPrice > 0) params.append('min_price', minPrice);
    if (maxPrice < 1000) params.append('max_price', maxPrice);

    try {
        const response = await fetch(`/api/products?${params}`);
        const filteredProducts = await response.json();
        displayProducts(filteredProducts);
    } catch (error) {
        console.error('Error filtering products:', error);
    }
}

// Sort products
async function sortProducts(sortBy) {
    try {
        const response = await fetch(`/api/products?sort=${sortBy}`);
        const sortedProducts = await response.json();
        displayProducts(sortedProducts);
    } catch (error) {
        console.error('Error sorting products:', error);
    }
}

// Setup event listeners
function setupEventListeners() {
    // Cart events
    cartIcon.addEventListener('click', toggleCart);
    closeCart.addEventListener('click', toggleCart);
    cartOverlay.addEventListener('click', toggleCart);

    // Filter events
    mobileFilterToggle.addEventListener('click', toggleFilters);
    closeFilters.addEventListener('click', toggleFilters);
    filterOverlay.addEventListener('click', toggleFilters);

    // Apply filters button
    document.querySelector('.apply-filters').addEventListener('click', filterProducts);

    // Sort dropdown
    document.getElementById('sortProducts').addEventListener('change', (e) => {
        sortProducts(e.target.value);
    });

    // Price range slider
    const priceRange = document.getElementById('priceRange');
    const maxPriceInput = document.getElementById('maxPrice');
    
    priceRange.addEventListener('input', (e) => {
        maxPriceInput.value = e.target.value;
    });

    // Category checkboxes
    document.querySelectorAll('.filter-options input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            if (e.target.value === 'all') {
                // If "All" is checked, uncheck others
                if (e.target.checked) {
                    document.querySelectorAll('.filter-options input[type="checkbox"]:not([value="all"])').forEach(cb => {
                        cb.checked = false;
                    });
                }
            } else {
                // If any specific category is checked, uncheck "All"
                if (e.target.checked) {
                    document.querySelector('.filter-options input[value="all"]').checked = false;
                }
            }
        });
    });
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? '#e74c3c' : '#27ae60'};
        color: white;
        padding: 15px 25px;
        border-radius: 5px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Toggle filters panel (mobile)
function toggleFilters() {
    filtersPanel.classList.toggle('show');
    filterOverlay.classList.toggle('active');
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Initialize shop when page loads
document.addEventListener('DOMContentLoaded', initShop); 