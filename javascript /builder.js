import { app } from './setup.js';

app.startCustomBuilder = function(category) {
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
};

app.startPlatterBuilder = function(platterKey, platterName) {
    this.builderState = { category: platterName, type: 'platter', subType: platterKey, currentStep: 0, selections: {} };
    const data = this.menuData.platters[platterKey];
    this.builderState.config = [{ title: `Customize ${platterName}`, key: 'items', type: 'checkbox', options: data.items }];
    this.renderBuilderStep();
};

app.startSingleSelector = function(category) {
    this.builderState = { category: category, type: 'single', subType: '', currentStep: 0, selections: {} };
    const data = this.menuData[category];
    this.builderState.config = [{ title: `Select ${category}`, key: 'item', type: 'radio', options: data.options }];
    this.renderBuilderStep();
};

app.renderBuilderStep = function() {
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
};

app.processBuilderStep = function() {
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
};

app.generateSummary = function() {
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
};