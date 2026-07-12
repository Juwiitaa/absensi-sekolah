const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyge3Is9gm24r_5nbXnkRlPEyJfOE42SkF1zPVjZTBOETVkotYsHAerjKigcUXJ0OM/exec";

const loginForm = document.getElementById('loginForm');
const message = document.getElementById('message');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const pin = document.getElementById('pin').value;
    const btnLogin = document.getElementById('btnLogin');

    btnLogin.innerText = "Memproses...";
    btnLogin.disabled = true;
    message.classList.add('hidden');

    try {
        const response = await fetch(WEB_APP_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: 'login',
                username: username,
                pin: pin
            })
        });

        const result = await response.json();

        if (result.status === 'success') {
            
            localStorage.setItem('namaGuru', result.nama);
            localStorage.setItem('role', result.role);
            
            window.location.href = 'dashboard.html';
        } else {
            message.classList.remove('hidden');
            btnLogin.innerText = "Masuk";
            btnLogin.disabled = false;
        }
    } catch (error) {
        alert('Terjadi kesalahan koneksi ke server cloud!');
        btnLogin.innerText = "Masuk";
        btnLogin.disabled = false;
    }
});