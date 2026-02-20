// ============================================
// login.js - Connects to auth.php backend
// ============================================

const loginForm    = document.getElementById('loginForm');
const errorMessage = document.getElementById('errorMessage');
const submitBtn    = loginForm ? loginForm.querySelector('button[type="submit"]') : null;

// ── Redirect if already logged in ──
if (API.isLoggedIn()) {
    window.location.href = '/GraduationProject/api_front/overview.html';
}

loginForm && loginForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const email    = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!email || !password) {
        showError('Please enter email and password.');
        return;
    }

    // Loading state
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
    }

    try {
        const res = await API.login(email, password);

        if (res.status === 'success') {
            // Save session data
            API.saveSession(res.user, res.token);

            // Redirect to dashboard
    window.location.href = '/GraduationProject/api_front/overview.html';       
        }
    else {
            showError(res.message || 'Invalid credentials. Please try again.');
        }
    } catch (err) {
        showError('Cannot connect to server. Check your connection.');
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Login';
        }
    }
});

function showError(msg) {
    if (!errorMessage) return;
    errorMessage.textContent = msg;
    errorMessage.classList.add('show');
    setTimeout(() => errorMessage.classList.remove('show'), 4000);
}