const products = [
    { id: 1, name: "Bruno Mars Shirt", image: "./baju.png?height=200&width=200", price: 29.99 },
    { id: 2, name: "Chris Brown Shirt", image: "./baju1.png?height=200&width=200", price: 29.99 },
    { id: 3, name: "Dua Lipa Shirt", image: "./baju2.png?height=200&width=200", price: 29.99 },
    { id: 4, name: "Bella Hadid Shirt", image: "./baju3.png?height=200&width=200", price: 29.99 },
    { id: 5, name: "Taylor Swift Shirt", image: "./baju4.png?height=200&width=200", price: 29.99 },
    { id: 6, name: "Nicki Minaj Shirt", image: "./baju5.png?height=200&width=200", price: 29.99 },
];

const cart = [];
const productGrid = document.getElementById('product-grid');
const cartButton = document.getElementById('cart-button');
const cartModal = document.getElementById('cart-modal');
const cartItems = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const cartCount = document.getElementById('cart-count');
const closeCart = document.getElementById('close-cart');
const searchInput = document.getElementById('search');
const checkoutButton = document.getElementById('checkout-button');

function renderProducts(productsToRender) {
    productGrid.innerHTML = '';
    productsToRender.forEach(product => {
        const productElement = document.createElement('div');
        productElement.className = 'border rounded-lg p-4 bg-white';
        productElement.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="w-full h-48 object-cover mb-4">
            <h3 class="text-lg font-semibold">${product.name}</h3>
            <p class="text-gray-600">$${product.price.toFixed(2)}</p>
            <button class="add-to-cart mt-2 w-full bg-gray-400 text-white px-4 py-2 rounded" data-id="${product.id}">
                Add to Cart
            </button>
        `;
        productGrid.appendChild(productElement);
    });
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        const cartItem = cart.find(item => item.id === productId);
        if (cartItem) {
            cartItem.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        updateCartCount();
        renderCart();
    }
}

function removeFromCart(productId) {
    const cartItem = cart.find(item => item.id === productId);
    if (cartItem) {
        cartItem.quantity -= 1;
        if (cartItem.quantity <= 0) {
            const index = cart.indexOf(cartItem);
            cart.splice(index, 1);
        }
        updateCartCount();
        renderCart();
    }
}

function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
}

function animateCartButton() {
    cartButton.classList.add('add-to-cart-animation');
    setTimeout(() => {
        cartButton.classList.remove('add-to-cart-animation');
    }, 300);
}

function renderCart() {
    cartItems.innerHTML = '';
    let total = 0;
    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'flex justify-between items-center cart-item-enter';
        cartItem.innerHTML = `
            <span>${item.name} (x${item.quantity})</span>
            <span>$${(item.price * item.quantity).toFixed(2)}</span>
            <div>
                <button onclick="removeFromCart(${item.id})">-</button>
                <button onclick="addToCart(${item.id})">+</button>
            </div>
        `;
        cartItems.appendChild(cartItem);
        setTimeout(() => cartItem.classList.add('cart-item-enter-active'), 10);
        total += item.price * item.quantity;
    });
    cartTotal.textContent = total.toFixed(2);
}

productGrid.addEventListener('click', (e) => {
    if (e.target.classList.contains('add-to-cart')) {
        const productId = parseInt(e.target.getAttribute('data-id'));
        addToCart(productId);
    }
});

cartButton.addEventListener('click', () => {
    renderCart();
    cartModal.classList.remove('hidden');
});

closeCart.addEventListener('click', () => {
    cartModal.classList.add('hidden');
});

searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm)
    );
    renderProducts(filteredProducts);
});

// Initial render
renderProducts(products);

function checkout() {
    if (cart.length === 0) {
        alert('Keranjang Anda kosong!');
        return;
    }
    alert('Checkout berhasil! Terima kasih telah berbelanja.');
    cart.length = 0; // Kosongkan keranjang
    updateCartCount();
    renderCart();
}

checkoutButton.addEventListener('click', checkout);

