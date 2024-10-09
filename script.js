let products = [];
let cart = [];
let currentPage = 1;
let itemsPerPage = 20; // Default items per page
const categories = ['all', 'electronics', 'clothing', 'accessories', 'furniture', 'toys']; // Kategori yang sesuai

// Fetch products from API
async function fetchProducts() {
    try {
        const response = await fetch('https://dummyjson.com/products?limit=300');
        const data = await response.json();
        products = data.products;
        displayProducts();
    } catch (error) {
        console.error('Error fetching products:', error);
        document.getElementById('products-grid').innerHTML = '<p>Error loading products. Please try again later.</p>';
    }
}

// Fetch categories and populate dropdown
fetch('https://dummyjson.com/products/category-list')
    .then(res => res.json())
    .then(categories => {
        const categoryFilter = document.getElementById('category-filter');
        // Clear existing options
        categoryFilter.innerHTML = '<option value="all">All</option>'; // Menambahkan opsi "All" kembali

        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
            categoryFilter.appendChild(option);
        });
    });

// Display products
function displayProducts() {
    const productsGrid = document.getElementById('products-grid');
    productsGrid.innerHTML = '';
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const categoryFilter = document.getElementById('category-filter').value;

    // Filter products by category
    const filteredProducts = categoryFilter === 'all' ? products : products.filter(product => product.category === categoryFilter);
    
    console.log('Selected Category:', categoryFilter);
    console.log('Filtered Products:', filteredProducts);

    const productsToDisplay = filteredProducts.slice(start, end);

    productsToDisplay.forEach(product => {
        const priceInRupiah = Math.floor(Math.random() * (100000 - 20000 + 1)) + 20000; // Rentang 20.000 - 100.000
        const productElement = document.createElement('div');
        productElement.className = 'product-card';
        productElement.innerHTML = `
            <img src="${product.thumbnail}" alt="${product.title}">
            <h3>${product.title}</h3>
            <p>Rp ${priceInRupiah.toLocaleString()}</p> <!-- Mengubah format harga -->
            <button onclick="addToCart(${product.id})">Add to Cart</button>
        `;
        productsGrid.appendChild(productElement);
    });
    updatePagination(filteredProducts.length);
}

// Update pagination
function updatePagination(totalProducts) {
    const totalPages = Math.ceil(totalProducts / itemsPerPage);
    document.getElementById('current-page').textContent = `Page ${currentPage} of ${totalPages}`;
    document.getElementById('prev-page').disabled = currentPage === 1;
    document.getElementById('next-page').disabled = currentPage === totalPages;
}

// Add item to cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    updateCart();
}

// Update cart display
function updateCart() {
    const cartItems = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    cartItems.innerHTML = '';
    cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);

    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <span>${item.title} (${item.quantity})</span>
            <span>Rp ${(item.price * item.quantity).toLocaleString()}</span>
            <button onclick="removeFromCart(${item.id})">Remove</button>
            <button onclick="updateQuantity(${item.id}, 1)">+</button>
            <button onclick="updateQuantity(${item.id}, -1)">-</button>
        `;
        cartItems.appendChild(cartItem);
    });
}

// Update quantity of items in cart
function updateQuantity(productId, change) {
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += change;
        if (existingItem.quantity <= 0) {
            removeFromCart(productId);
        } else {
            updateCart();
        }
    }
}

// Remove item from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCart();
}

// Event Listeners
document.getElementById('prev-page').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        displayProducts();
    }
});

document.getElementById('next-page').addEventListener('click', () => {
    const totalPages = Math.ceil(products.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        displayProducts();
    }
});

// Filter by category
document.getElementById('category-filter').addEventListener('change', () => {
    currentPage = 1; // Reset to first page when category changes
    displayProducts();
});

// Change number of items per page
document.getElementById('items-per-page').addEventListener('change', (event) => {
    itemsPerPage = parseInt(event.target.value, 10);
    currentPage = 1; // Reset to first page when items per page changes
    displayProducts();
});

document.getElementById('cart-button').addEventListener('click', () => {
    document.getElementById('cart-overlay').classList.remove('hidden');
});

document.getElementById('close-cart').addEventListener('click', () => {
    document.getElementById('cart-overlay').classList.add('hidden');
});

document.getElementById('checkout-button').addEventListener('click', () => {
    if (cart.length === 0) {
        alert('Your cart is empty!');
    } else {
        alert('Checkout functionality is not fully implemented in this demo.');
        // Here you can add further checkout logic, such as sending data to a server
    }
});

document.getElementById('search-button').addEventListener('click', () => {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    products = products.filter(product => 
        product.title.toLowerCase().includes(searchTerm) || 
        product.description.toLowerCase().includes(searchTerm)
    );
    currentPage = 1;
    displayProducts();
});

// Initialize
async function init() {
    await fetchProducts(); // Fetch products first
    fetchCategories(); // Then fetch categories
}

function fetchCategories() {
    fetch('https://dummyjson.com/products/category-list')
        .then(res => res.json())
        .then(categories => {
            const categoryFilter = document.getElementById('category-filter');
            categoryFilter.innerHTML = '<option value="all">All</option>'; // Reset options

            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
                categoryFilter.appendChild(option);
            });
        });
}

// Call init on page load
init();