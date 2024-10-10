let products = [];
let cart = [];
let currentPage = 1;
let itemsPerPage = 20; 
const categories = ['all', 'electronics', 'clothing', 'accessories', 'furniture', 'toys']; 

async function fetchProducts() {
    try {
        const sortBy = document.getElementById('sort-filter').value;
        const order = document.getElementById('sort-order').value;
        const categoryFilter = document.getElementById('category-filter').value;

        const response = await fetch(`https://dummyjson.com/products?sortBy=${sortBy}&order=${order}&limit=200`);
        const data = await response.json();
        products = data.products;

        const filteredProducts = categoryFilter === 'all' ? products : products.filter(product => product.category === categoryFilter);

        if (sortBy === 'rating') {
            if (order === 'asc') {
                filteredProducts.sort((a, b) => a.rating - b.rating);
            } else {
                filteredProducts.sort((a, b) => b.rating - a.rating);
            }
        } else {
            filteredProducts.sort((a, b) => {
                if (sortBy === 'title') {
                    return order === 'asc' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
                } else if (sortBy === 'price') {
                    return order === 'asc' ? a.price - b.price : b.price - a.price;
                }
            });
        }

        displayProducts(filteredProducts);
    } catch (error) {
        console.error('Error fetching products:', error);
        document.getElementById('products-grid').innerHTML = '<p>Error loading products. Please try again later.</p>';
    }
}

fetch('https://dummyjson.com/products/category-list')
    .then(res => res.json())
    .then(categories => {
        const categoryFilter = document.getElementById('category-filter');
        categoryFilter.innerHTML = '<option value="all">All</option>';

        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
            categoryFilter.appendChild(option);
        });
    });

function displayProducts(filteredProducts) {
    const productsGrid = document.getElementById('products-grid');
    productsGrid.innerHTML = '';
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;

    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = '<p>No products found.</p>';
        return;
    }

    const productsToDisplay = filteredProducts.slice(start, end);

    productsToDisplay.forEach(product => {
        const productElement = document.createElement('div');
        productElement.className = 'product-card';
        productElement.innerHTML = `
            <img src="${product.thumbnail}" alt="${product.title}">
            <h3>${product.title}</h3>
            <p class="product-rating">${'★'.repeat(Math.round(product.rating))}${'☆'.repeat(5 - Math.round(product.rating))}</p>
            <p>$ ${product.price.toLocaleString()}</p>
            <button onclick="addToCart(${product.id})">Add to Cart</button>
            <button onclick="showProductDetails(${product.id})">Details</button>
        `;
        productsGrid.appendChild(productElement);
    });
    updatePagination(filteredProducts.length);
}

function updatePagination(totalProducts) {
    const totalPages = Math.ceil(totalProducts / itemsPerPage);
    document.getElementById('current-page').textContent = `Page ${currentPage} of ${totalPages}`;
    document.getElementById('prev-page').disabled = currentPage === 1;
    document.getElementById('next-page').disabled = currentPage === totalPages;
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);
    
    const button = event.target;
    button.classList.add('add-to-cart-animation');

    setTimeout(() => {
        button.classList.remove('add-to-cart-animation');
    }, 500);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    updateCart();
}

function updateCart() {
    const cartItems = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    cartItems.innerHTML = '';
    cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);

    let totalPrice = 0;
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
        totalPrice += item.price * item.quantity;
    });

    const totalDisplay = document.createElement('div');
    totalDisplay.innerHTML = `
        <strong>Total Products: ${cartCount.textContent}</strong><br>
        <strong>Total Price: $${totalPrice.toLocaleString()}</strong>
    `;
    cartItems.appendChild(totalDisplay);
}

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

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCart();
}

document.getElementById('prev-page').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        displayProducts(products);
    }
});

document.getElementById('next-page').addEventListener('click', () => {
    const totalPages = Math.ceil(products.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        displayProducts(products);
    }
});

document.getElementById('category-filter').addEventListener('change', () => {
    currentPage = 1;
    fetchProducts();
});

document.getElementById('items-per-page').addEventListener('change', (event) => {
    itemsPerPage = parseInt(event.target.value, 10);
    currentPage = 1;
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
        const totalProducts = cart.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        alert(`Total Products: ${totalProducts}\nTotal Price: $${totalPrice.toLocaleString()}`);
    }
});

document.getElementById('search-button').addEventListener('click', performSearch);

document.getElementById('search-input').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        performSearch();
    }
});

function performSearch() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const filteredProducts = products.filter(product => 
        product.title.toLowerCase().startsWith(searchTerm) ||
        product.description.toLowerCase().startsWith(searchTerm)
    );
    currentPage = 1;
    displayProducts(filteredProducts);
    const categoryFilter = document.getElementById('category-filter').value;

    const filteredByCategory = categoryFilter === 'all' ? products : products.filter(product => product.category === categoryFilter);

    const searchedProducts = filteredByCategory.filter(product => product.title.toLowerCase().startsWith(searchTerm));

    displayProducts(searchedProducts);
}

async function init() {
    await fetchProducts();
    fetchCategories();
}

function fetchCategories() {
    fetch('https://dummyjson.com/products/category-list')
        .then(res => res.json())
        .then(categories => {
            const categoryFilter = document.getElementById('category-filter');
            categoryFilter.innerHTML = '<option value="all">All</option>';

            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
                categoryFilter.appendChild(option);
            });
        });
}

init();

document.getElementById('sort-filter').addEventListener('change', () => {
    currentPage = 1;
    fetchProducts();
});

document.getElementById('sort-order').addEventListener('change', () => {
    currentPage = 1;
    fetchProducts();
});

document.addEventListener('DOMContentLoaded', () => {
    const fadeInElements = document.querySelectorAll('.fade-in');
    fadeInElements.forEach(element => {
        element.classList.add('visible');
    });
});

document.getElementById('items-per-page').addEventListener('change', (event) => {
    itemsPerPage = parseInt(event.target.value, 10);
    currentPage = 1;
    fetchProducts();
});

async function showProductDetails(productId) {
    try {
        const response = await fetch(`https://dummyjson.com/products/${productId}`);
        const product = await response.json();


        document.getElementById('modal-title').textContent = product.title;
        document.getElementById('modal-description').textContent = product.description;
        document.getElementById('modal-price').textContent = `Price: $${product.price.toLocaleString()}`;
        document.getElementById('modal-category').textContent = `Category: ${product.category}`;

        document.getElementById('product-modal').style.display = 'block';
    } catch (error) {
        console.error('Error fetching product details:', error);
        alert('Error loading product details. Please try again later.');
    }
}

document.getElementById('close-modal').addEventListener('click', () => {
    document.getElementById('product-modal').style.display = 'none';
});

function autocomplete(input) {
    const autocompleteList = document.getElementById('autocomplete-list');
    autocompleteList.innerHTML = ''; 

    const searchTerm = input.value.toLowerCase();
    if (!searchTerm) return; 

    const filteredProducts = products.filter(product => 
        product.title.toLowerCase().startsWith(searchTerm) 
    );

    filteredProducts.forEach(product => {
        const suggestion = document.createElement('div');
        suggestion.textContent = product.title;
        suggestion.addEventListener('click', () => {
            input.value = product.title; 
            autocompleteList.innerHTML = ''; 
            performSearch(); 
        });
        autocompleteList.appendChild(suggestion);
    });
}

document.getElementById('search-input').addEventListener('input', function() {
    autocomplete(this);
});