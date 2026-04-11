import { app } from './setup.js';

app.init = async function() {
    this.initTheme();
    this.bindEvents();
    this.loadLocalStorage();
    await this.fetchMenuData();
    this.renderHome();
};

app.initTheme = function() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        document.getElementById('themeIcon').innerText = '🌙';
    }
};

app.toggleTheme = function() {
    const isLight = document.body.classList.toggle('light-mode');
    document.getElementById('themeIcon').innerText = isLight ? '🌙' : '☀️';
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
};

app.bindEvents = function() {
    document.getElementById('searchInput').addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        document.querySelectorAll('.card').forEach(card => {
            const name = card.dataset.name.toLowerCase();
            if (name.includes(query)) card.removeAttribute('data-hidden');
            else card.setAttribute('data-hidden', 'true');
        });
    });
};

app.loadLocalStorage = function() {
    const storedCart = localStorage.getItem('cart');
    const storedSaved = localStorage.getItem('savedMeals');
    if (storedCart) this.cart = JSON.parse(storedCart);
    if (storedSaved) this.savedMeals = JSON.parse(storedSaved);
    this.updateCartUI();
};
app.fetchMenuData = async function() {
    const res = await fetch("./data.json");
    this.menuData = await res.json();
    console.log("MENU DATA:", this.menuData);
};