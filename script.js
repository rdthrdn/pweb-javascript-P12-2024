let products = [];
let cart = [];
let currentPage = 1;
let itemsPerPage = 20; // Default items per page
const categories = ['all', 'electronics', 'clothing', 'accessories', 'furniture', 'toys']; // Kategori yang sesuai

// Fetch products from API
async function fetchProducts() {
    try {
        const sortBy = document.getElementById('sort-filter').value;
        const order = document.getElementById('sort-order').value;
        const categoryFilter = document.getElementById('category-filter').value;

        // Fetch products with sorting and filtering
        const response = await fetch(`https://dummyjson.com/products?sortBy=${sortBy}&order=${order}&limit=200`);
        const data = await response.json();
        products = data.products;

        // Filter products by category
        const filteredProducts = categoryFilter === 'all' ? products : products.filter(product => product.category === categoryFilter);

        // Update display with filtered products
        displayProducts(filteredProducts);
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
function displayProducts(filteredProducts) {
    const productsGrid = document.getElementById('products-grid');
    productsGrid.innerHTML = '';
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;

    // Pastikan filteredProducts tidak kosong
    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = '<p>No products found.</p>'; // Menampilkan pesan jika tidak ada produk
        return;
    }

    const productsToDisplay = filteredProducts.slice(start, end);

    productsToDisplay.forEach(product => {
        const productElement = document.createElement('div');
        productElement.className = 'product-card';
        productElement.innerHTML = `
            <img src="${product.thumbnail}" alt="${product.title}">
            <h3>${product.title}</h3>
            <p>$ ${product.price.toLocaleString()}</p>
            <button onclick="addToCart(${product.id})">Add to Cart</button>
            <button onclick="showProductDetails(${product.id})">Details</button> <!-- Tombol Details -->
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
    
    // Menambahkan animasi ke elemen tombol
    const button = event.target; // Mendapatkan elemen tombol yang ditekan
    button.classList.add('add-to-cart-animation'); // Menambahkan kelas animasi

    setTimeout(() => {
        button.classList.remove('add-to-cart-animation'); // Menghapus kelas setelah animasi selesai
    }, 500); // Durasi animasi sama dengan durasi CSS

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

    let totalPrice = 0; // Inisialisasi total harga
    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <span>${item.title} (${item.quantity})</span>
            <span>$ ${(item.price * item.quantity).toLocaleString()}</span>
            <button onclick="removeFromCart(${item.id})">Remove</button>
            <button onclick="updateQuantity(${item.id}, -1)">-</button>
            <button onclick="updateQuantity(${item.id}, 1)">+</button>
        `;
        cartItems.appendChild(cartItem);
        totalPrice += item.price * item.quantity; // Hitung total harga
    });

    // Tampilkan total produk dan total harga
    const totalDisplay = document.createElement('div');
    totalDisplay.innerHTML = `
        <strong>Total Products: ${cartCount.textContent}</strong><br>
        <strong>Total Price: $${totalPrice.toLocaleString()}</strong>
    `;
    cartItems.appendChild(totalDisplay);
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
        displayProducts(products); // Pastikan untuk mengirimkan produk yang benar
    }
});

document.getElementById('next-page').addEventListener('click', () => {
    const totalPages = Math.ceil(products.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        displayProducts(products); // Pastikan untuk mengirimkan produk yang benar
    }
});

// Filter by category
document.getElementById('category-filter').addEventListener('change', () => {
    currentPage = 1; // Reset to first page when category changes
    fetchProducts(); // Fetch products with new category
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
        const totalProducts = cart.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        alert(`Total Products: ${totalProducts}\nTotal Price: $${totalPrice.toLocaleString()}`);
        // Di sini Anda bisa menambahkan logika checkout lebih lanjut, seperti mengirim data ke server
    }
});

// Event listener untuk tombol pencarian
document.getElementById('search-button').addEventListener('click', () => {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const filteredProducts = products.filter(product => 
        product.title.toLowerCase().startsWith(searchTerm) || // Menggunakan startsWith untuk mencocokkan huruf awal
        product.description.toLowerCase().startsWith(searchTerm) // Jika ingin juga mencocokkan deskripsi
    );
    currentPage = 1; // Reset ke halaman pertama
    displayProducts(filteredProducts); // Tampilkan produk yang difilter
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

// Event Listener for Sort
document.getElementById('sort-filter').addEventListener('change', () => {
    currentPage = 1; // Reset to first page when sort changes
    fetchProducts(); // Fetch products with new sort
});

document.getElementById('sort-order').addEventListener('change', () => {
    currentPage = 1; // Reset to first page when sort order changes
    fetchProducts(); // Fetch products with new sort order
});

// Add animation on page load
document.addEventListener('DOMContentLoaded', () => {
    const fadeInElements = document.querySelectorAll('.fade-in');
    fadeInElements.forEach(element => {
        element.classList.add('visible');
    });
});

document.getElementById('items-per-page').addEventListener('change', (event) => {
    itemsPerPage = parseInt(event.target.value, 10);
    currentPage = 1; // Reset to first page when items per page changes
    fetchProducts(); // Fetch products again to apply the new items per page setting
});

// ... existing code ...

async function showProductDetails(productId) {
    try {
        const response = await fetch(`https://dummyjson.com/products/${productId}`);
        const product = await response.json();

        // Tampilkan detail produk
        alert(`
            Title: ${product.title}
            Description: ${product.description}
            Price: $${product.price.toLocaleString()}
            Category: ${product.category}
        `);

        // Update modal content
        document.getElementById('modal-title').textContent = product.title;
        document.getElementById('modal-description').textContent = product.description;
        document.getElementById('modal-price').textContent = `Price: $${product.price.toLocaleString()}`;
        document.getElementById('modal-category').textContent = `Category: ${product.category}`;

        // Show modal
        document.getElementById('product-modal').classList.remove('hidden');
    } catch (error) {
        console.error('Error fetching product details:', error);
        alert('Error loading product details. Please try again later.');
    }
}

// Close modal
document.getElementById('close-modal').addEventListener('click', () => {
    document.getElementById('product-modal').classList.add('hidden');
});

// ... existing code ...