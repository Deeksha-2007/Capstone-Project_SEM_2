import { app } from './setup.js';

app.toggleCart = function() {
    document.getElementById('cartDrawer').classList.toggle('active');
    document.getElementById('cartOverlay').classList.toggle('active');
};

app.addToCart = function(mealObj = null) {
    const mealToCart = mealObj || this.builderState.finalMeal;
    this.cart.push(mealToCart);
    localStorage.setItem('cart', JSON.stringify(this.cart));
    this.updateCartUI();
    this.showToast('Item added to your cart!');
    if (!mealObj) this.showSection('home');
};

app.updateCartUI = function() {
    document.getElementById('cartCount').innerText = this.cart.length;
    const container = document.getElementById('cartItemsContainer');
    container.innerHTML = '';

    if (this.cart.length === 0) {
        container.innerHTML = '<p style="color:var(--text-muted); text-align:center; margin-top:2rem;">Your cart is empty.</p>';
        document.getElementById('cartTotalDisplay').innerText = '₹0';
        return;
    }

    const groupedCart = {};
    let grandTotal = 0;

    this.cart.forEach(item => {
        const key = item.name + '|' + item.details;
        if (!groupedCart[key]) groupedCart[key] = { ...item, qty: 1 };
        else groupedCart[key].qty++;
        grandTotal += item.price;
    });

    Object.values(groupedCart).forEach(item => {
        const el = document.createElement('div');
        el.className = 'cart-item';
        el.innerHTML = `
            <div class="cart-item-details">
                <h4>${item.name}</h4>
                <p>${item.details}</p>
            </div>
            <div class="cart-item-price-qty">
                <span class="qty">Qty: ${item.qty}</span>
                <span class="price">₹${item.price * item.qty}</span>
            </div>
        `;
        container.appendChild(el);
    });
    document.getElementById('cartTotalDisplay').innerText = `₹${grandTotal}`;
};

app.placeOrder = function() {
    if (this.cart.length === 0) return this.showToast('Your cart is empty!');
    this.toggleCart();
    document.getElementById('orderModalOverlay').classList.add('active');
    // Assumes confetti is loaded globally in HTML
    if (typeof confetti === 'function') {
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#ff5722', '#ff8a00', '#e52e71'] });
    }
    this.cart = [];
    localStorage.setItem('cart', JSON.stringify(this.cart));
    this.updateCartUI();
};

app.closeOrderModal = function() {
    document.getElementById('orderModalOverlay').classList.remove('active');
};