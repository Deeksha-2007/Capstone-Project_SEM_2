const originalFetch = globalThis.fetch;

globalThis.fetch = async function (url) {

    if (url === "https://test.api.com/products") {
        return originalFetch("./data.json");
    }
    return originalFetch(url);
};

const app = {
    menuData: null,
    cart: [],
    savedMeals: [],

    builderState: {
        category: '', type: '', subType: '',
        config: [], currentStep: 0, selections: {},
    },

    async init() {
        this.initTheme();
        this.bindEvents();
        this.loadLocalStorage();
        await this.fetchMenuData();
        this.renderHome();
    },

    initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        if (savedTheme === 'light') {
            document.body.classList.add('light-mode');
            document.getElementById('themeIcon').innerText = '🌙';
        }
    },

    toggleTheme() {
        const isLight = document.body.classList.toggle('light-mode');
        document.getElementById('themeIcon').innerText = isLight ? '🌙' : '☀️';
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
    },

    bindEvents() {
        document.getElementById('searchInput').addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            document.querySelectorAll('.card').forEach(card => {
                const name = card.dataset.name.toLowerCase();
                if (name.includes(query)) card.removeAttribute('data-hidden');
                else card.setAttribute('data-hidden', 'true');
            });
        });
    },

    loadLocalStorage() {
        const storedCart = localStorage.getItem('cart');
        const storedSaved = localStorage.getItem('savedMeals');
        if (storedCart) this.cart = JSON.parse(storedCart);
        if (storedSaved) this.savedMeals = JSON.parse(storedSaved);
        this.updateCartUI();
    },

    async fetchMenuData() {
        const res = await fetch("https://test.api.com/products");
        this.menuData = await res.json();
    },

    showSection(sectionId) {
        const targetSection = document.getElementById(sectionId + 'Section');
        if (!targetSection) return;

        const isAlreadyActive = targetSection.classList.contains('active');

        document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
        targetSection.classList.add('active');

        if (sectionId === 'saved') this.renderSavedMeals();


        if (!isAlreadyActive) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    },

    renderHome() {
        const customGrid = document.getElementById('customFoodGrid');
        const plattersGrid = document.getElementById('plattersGrid');
        const extrasGrid = document.getElementById('extrasGrid');

        customGrid.innerHTML = ''; plattersGrid.innerHTML = ''; extrasGrid.innerHTML = '';
        const fallbackImg = "https://images.unsplash.com/photo-1493770348161-369560ae357d?q=80&w=800";

        ['pizza', 'pasta', 'burger'].forEach(cat => {
            customGrid.appendChild(this.createCard(cat, this.menuData[cat].image || fallbackImg, 'Build Custom', () => this.startCustomBuilder(cat)));
        });

        Object.keys(this.menuData.platters).forEach(platterKey => {
            const formattedName = platterKey.replace(/([A-Z])/g, ' $1').trim() + ' Platter';

            const image = this.menuData.platters[platterKey].image;

            plattersGrid.appendChild(this.createCard(
                formattedName,
                image,
                'Curated Set',
                () => this.startPlatterBuilder(platterKey, formattedName)
            ));
        });

        ['drink', 'dessert'].forEach(cat => {
            const title = cat === 'drink' ? 'Drinks' : 'Desserts';
            extrasGrid.appendChild(this.createCard(title, this.menuData[cat].image || fallbackImg, 'Add to Order', () => this.startSingleSelector(cat)));
        });
    },

    createCard(name, imageSrc, subtitle, onClick) {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.name = name;
        card.onclick = onClick;
        card.innerHTML = `
            <div class="card-img-wrapper"><img src="${imageSrc}" alt="${name}"></div>
            <div class="card-content">
                <h3>${name}</h3>
                <p>${subtitle}</p>
                <div class="price-tag">Customize →</div>
            </div>
        `;
        return card;
    },

    startCustomBuilder(category) {
        this.builderState = { category, type: 'custom', subType: '', currentStep: 0, selections: {} };
        const data = this.menuData[category];
        if (category === 'pizza') {
            this.builderState.config = [
                { title: 'Choose Your Base', key: 'base', type: 'radio', options: data.baseOptions },
                { title: 'Select Toppings', key: 'toppings', type: 'checkbox', options: data.toppings }
            ];
        } else if (category === 'pasta') {
            this.builderState.config = [
                { title: 'Choose Pasta Shape', key: 'shape', type: 'radio', options: data.shapes },
                { title: 'Select Base Sauce', key: 'sauce', type: 'radio', options: data.sauces },
                { title: 'Add Fresh Veggies', key: 'veggies', type: 'checkbox', options: data.veggies }
            ];
        } else if (category === 'burger') {
            this.builderState.config = [
                { title: 'Select Bun Type', key: 'bun', type: 'radio', options: data.buns },
                { title: 'Choose Your Patty', key: 'patty', type: 'radio', options: data.patty },
                { title: 'Add Fresh Greens', key: 'veggies', type: 'checkbox', options: data.veggies }
            ];
        }
        this.renderBuilderStep();
    },

    startPlatterBuilder(platterKey, platterName) {
        this.builderState = { category: platterName, type: 'platter', subType: platterKey, currentStep: 0, selections: {} };
        const data = this.menuData.platters[platterKey];
        this.builderState.config = [{ title: `Customize ${platterName}`, key: 'items', type: 'checkbox', options: data.items }];
        this.renderBuilderStep();
    },

    startSingleSelector(category) {
        this.builderState = { category: category, type: 'single', subType: '', currentStep: 0, selections: {} };
        const data = this.menuData[category];
        this.builderState.config = [{ title: `Select ${category}`, key: 'item', type: 'radio', options: data.options }];
        this.renderBuilderStep();
    },

    renderBuilderStep() {
        const stepConfig = this.builderState.config[this.builderState.currentStep];
        document.getElementById('builderTitle').innerText = stepConfig.title;

        const container = document.getElementById('builderContent');
        container.innerHTML = '';

        stepConfig.options.forEach(opt => {
            const row = document.createElement('label');
            row.className = 'option-card';

            const imgSrc = opt.image || `https://placehold.co/150x150/ff5722/ffffff?text=${encodeURIComponent(opt.name.charAt(0))}`;

            row.innerHTML = `
                <input type="${stepConfig.type}" name="${stepConfig.key}" value="${opt.name}" data-price="${opt.price}" class="hidden-input">
                <div class="check-icon">✓</div>
                <img src="${imgSrc}" alt="${opt.name}">
                <div class="opt-name">${opt.name}</div>
                <div class="opt-price">+ ₹${opt.price}</div>
            `;
            container.appendChild(row);
        });

        const nextBtn = document.getElementById('nextStepBtn');
        const isLastStep = this.builderState.currentStep === this.builderState.config.length - 1;
        nextBtn.innerHTML = isLastStep ? 'Finish Setup' : 'Continue';
        nextBtn.onclick = () => this.processBuilderStep();

        this.showSection('builder');
    },

    processBuilderStep() {
        const stepConfig = this.builderState.config[this.builderState.currentStep];
        const inputs = document.querySelectorAll(`input[name="${stepConfig.key}"]:checked`);

        if (inputs.length === 0) {
            this.showToast('Please select an option to continue.');
            return;
        }

        const selected = Array.from(inputs).map(inp => ({ name: inp.value, price: parseInt(inp.dataset.price) }));
        this.builderState.selections[stepConfig.key] = stepConfig.type === 'radio' ? selected[0] : selected;

        if (this.builderState.currentStep < this.builderState.config.length - 1) {
            this.builderState.currentStep++;
            this.renderBuilderStep();
        } else {
            this.generateSummary();
        }
    },

    generateSummary() {
        let finalMessage = "", totalPrice = 0, mealName = "", detailsString = "";
        const state = this.builderState;

        const calcPrice = (obj) => {
            if (Array.isArray(obj)) obj.forEach(item => totalPrice += item.price);
            else if (obj.price) totalPrice += obj.price;
            else Object.values(obj).forEach(val => calcPrice(val));
        };
        calcPrice(state.selections);

        if (state.type === 'custom') {
            finalMessage = `Your customized ${state.category} is ready!`;
            mealName = `Artisan ${state.category}`;
            const allOpts = [];
            Object.values(state.selections).forEach(val => {
                if (Array.isArray(val)) val.forEach(v => allOpts.push(v.name));
                else allOpts.push(val.name);
            });
            detailsString = allOpts.join(' • ');
        } else if (state.type === 'platter') {
            const itemNames = state.selections.items.map(i => i.name).join(' • ');
            finalMessage = `${state.category} <br> <span style="font-size:1.1rem; font-weight:400; color:var(--text-muted); display:block; margin-top:8px;">${itemNames}</span>`;
            mealName = state.category;
            detailsString = itemNames;
        } else if (state.type === 'single') {
            const item = state.selections.item.name;
            finalMessage = `${item}`;
            mealName = item;
            detailsString = 'A la carte';
        }

        this.builderState.finalMeal = { id: Date.now(), name: mealName, details: detailsString, price: totalPrice };
        document.getElementById('summaryMessage').innerHTML = finalMessage;
        document.getElementById('summaryTotal').innerText = `₹${totalPrice}`;
        this.showSection('summary');
    },

    toggleCart() {
        document.getElementById('cartDrawer').classList.toggle('active');
        document.getElementById('cartOverlay').classList.toggle('active');
    },

    addToCart(mealObj = null) {
        const mealToCart = mealObj || this.builderState.finalMeal;
        this.cart.push(mealToCart);
        localStorage.setItem('cart', JSON.stringify(this.cart));
        this.updateCartUI();
        this.showToast('Item added to your cart!');
        if (!mealObj) this.showSection('home');
    },

    updateCartUI() {
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
    },

    placeOrder() {
        if (this.cart.length === 0) return this.showToast('Your cart is empty!');
        this.toggleCart();
        document.getElementById('orderModalOverlay').classList.add('active');
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#ff5722', '#ff8a00', '#e52e71'] });
        this.cart = [];
        localStorage.setItem('cart', JSON.stringify(this.cart));
        this.updateCartUI();
    },

    closeOrderModal() {
        document.getElementById('orderModalOverlay').classList.remove('active');
    },

    saveMeal() {
        this.savedMeals.push(this.builderState.finalMeal);
        localStorage.setItem('savedMeals', JSON.stringify(this.savedMeals));
        this.showToast('Meal saved to favorites!');
    },

    renderSavedMeals() {
        const grid = document.getElementById('savedMealsGrid');
        grid.innerHTML = '';
        if (this.savedMeals.length === 0) {
            grid.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding: 4rem; background: var(--surface-main); border-radius:var(--radius-lg); color:var(--text-muted);">No favorites saved yet. Start exploring the menu!</div>';
            return;
        }
        this.savedMeals.forEach((meal, index) => {
            const card = document.createElement('div');
            card.className = 'card';
            card.style.padding = '1.5rem';
            card.innerHTML = `
                <div style="flex-grow: 1;">
                    <h3 style="font-size: 1.4rem; font-weight:700; margin-bottom: 0.5rem;">${meal.name}</h3>
                    <p style="color:var(--text-muted); font-size:0.95rem; line-height:1.5; margin-bottom:1rem;">${meal.details}</p>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
                    <span style="font-size:1.5rem; font-weight:800; color:var(--primary);">₹${meal.price}</span>
                </div>
                <div style="display:flex; gap:10px;">
                    <button class="primary-btn" style="flex:1; padding:0.8rem;" onclick="app.addToCart(${JSON.stringify(meal).replace(/"/g, '&quot;')})">Reorder</button>
                    <button class="secondary-btn" style="padding:0.8rem; border-color: rgba(239, 68, 68, 0.3); color: #ef4444;" onclick="app.deleteSavedMeal(${index})">✕</button>
                </div>
            `;
            grid.appendChild(card);
        });
    },

    deleteSavedMeal(index) {
        this.savedMeals.splice(index, 1);
        localStorage.setItem('savedMeals', JSON.stringify(this.savedMeals));
        this.renderSavedMeals();
        this.showToast('Removed from favorites.');
    },

    showToast(message) {
        const toast = document.getElementById('toast');
        document.getElementById('toastMsg').innerText = message;
        toast.classList.add('show');
        toast.classList.remove('hidden');
        setTimeout(() => { toast.classList.remove('show'); toast.classList.add('hidden'); }, 3000);
    }
};

window.addEventListener('DOMContentLoaded', () => app.init());