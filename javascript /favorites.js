import { app } from './setup.js';

app.saveMeal = function() {
    this.savedMeals.push(this.builderState.finalMeal);
    localStorage.setItem('savedMeals', JSON.stringify(this.savedMeals));
    this.showToast('Meal saved to favorites!');
};

app.renderSavedMeals = function() {
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
        // Note: Using a helper for the onclick to avoid complexity in template strings
        card.innerHTML = `
            <div style="flex-grow: 1;">
                <h3 style="font-size: 1.4rem; font-weight:700; margin-bottom: 0.5rem;">${meal.name}</h3>
                <p style="color:var(--text-muted); font-size:0.95rem; line-height:1.5; margin-bottom:1rem;">${meal.details}</p>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
                <span style="font-size:1.5rem; font-weight:800; color:var(--primary);">₹${meal.price}</span>
            </div>
            <div style="display:flex; gap:10px;">
                <button class="reorder-btn primary-btn" style="flex:1; padding:0.8rem;">Reorder</button>
                <button class="delete-btn secondary-btn" style="padding:0.8rem; border-color: rgba(239, 68, 68, 0.3); color: #ef4444;">✕</button>
            </div>
        `;
        
        card.querySelector('.reorder-btn').onclick = () => app.addToCart(meal);
        card.querySelector('.delete-btn').onclick = () => app.deleteSavedMeal(index);
        
        grid.appendChild(card);
    });
};

app.deleteSavedMeal = function(index) {
    this.savedMeals.splice(index, 1);
    localStorage.setItem('savedMeals', JSON.stringify(this.savedMeals));
    this.renderSavedMeals();
    this.showToast('Removed from favorites.');
};