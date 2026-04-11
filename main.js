console.log("MAIN JS LOADED");
import { app } from './javascript /setup.js';
import './javascript /utils.js';
import './javascript /core.js';
import './javascript /ui.js';
import './javascript /builder.js';
import './javascript /cart.js';
import './javascript /favorites.js';

// Attach app to window so HTML inline event handlers (like onclick="app.toggleCart()") still work
window.app = app;

window.addEventListener('DOMContentLoaded', () => {
    app.init();
});