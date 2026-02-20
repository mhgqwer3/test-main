const loginForm = document.getElementById('loginForm');
const errorMessage = document.getElementById('errorMessage');

loginForm.addEventListener('submit', function(e){
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (email === 'admin@autobins.com' && password === 'admin123') {
    // Save login state
    sessionStorage.setItem('isLoggedIn', 'true');
    sessionStorage.setItem('userEmail', email);
    
    // Redirect to dashboard
    window.location.href = '/pages/overview.html';
}
    else {
        errorMessage.classList.add("show");
        setTimeout(() => errorMessage.classList.remove("show"), 3000);
    }
});