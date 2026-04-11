import { app } from './setup.js';

app.showSection = function(sectionId) {
    const targetSection = document.getElementById(sectionId + 'Section');
    if (!targetSection) return;

    const isAlreadyActive = targetSection.classList.contains('active');
    document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
    targetSection.classList.add('active');

    if (sectionId === 'saved') this.renderSavedMeals();

    if (!isAlreadyActive) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};

app.renderHome = function() {
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
        plattersGrid.appendChild(this.createCard(formattedName, "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80", 'Curated Set', () => this.startPlatterBuilder(platterKey, formattedName)));
    });

    ['drink', 'dessert'].forEach(cat => {
        const title = cat === 'drink' ? 'Drinks' : 'Desserts';
        extrasGrid.appendChild(this.createCard(title, this.menuData[cat].image || fallbackImg, 'Add to Order', () => this.startSingleSelector(cat)));
    });
};

app.createCard = function(name, imageSrc, subtitle, onClick) {
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
};