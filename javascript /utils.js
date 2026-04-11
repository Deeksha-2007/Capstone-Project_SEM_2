import { app } from './setup.js';

app.showToast = function(message) {
    const toast = document.getElementById('toast');
    document.getElementById('toastMsg').innerText = message;
    toast.classList.add('show');
    toast.classList.remove('hidden');
    setTimeout(() => { 
        toast.classList.remove('show'); 
        toast.classList.add('hidden'); 
    }, 3000);
};