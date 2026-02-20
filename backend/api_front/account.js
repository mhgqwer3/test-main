// ============================================
// account.js - Connected to session/API
// ============================================

// ── Auth Guard ──
if (typeof API === 'undefined' || !API.isLoggedIn()) {
    window.location.href = '/GraduationProject/pages/overview.html';
}

let currentSection = 'profile';
let sessionsData   = [];
let loginHistoryData = [];

// Initialize Account Page
function initAccountPage() {
    console.log('Initializing Account Settings...');
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            loadUserFromSession();
            loadSessionsData();
            loadLoginHistory();
        });
    } else {
        loadUserFromSession();
        loadSessionsData();
        loadLoginHistory();
    }
}

// ── Load user info from session ──
function loadUserFromSession() {
    const session = API.getSession();
    if (!session || !session.name) return;

    const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
    const setTxt = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

    setVal('fullName', session.name   || '');
    setVal('email',    session.email  || '');
    setTxt('profileName', session.name || 'User');

    // Pre-fill username from email
    const username = session.email ? session.email.split('@')[0] : '';
    setVal('username', username);
}

// Switch Section
function switchSection(sectionName) {
    currentSection = sectionName;
    document.querySelectorAll('.settings-nav-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.querySelector(`[data-section="${sectionName}"]`);
    if (activeBtn) activeBtn.classList.add('active');
    document.querySelectorAll('.settings-section').forEach(section => section.classList.remove('active'));
    const activeSection = document.getElementById(`${sectionName}-section`);
    if (activeSection) activeSection.classList.add('active');
}

// ── Profile ──
function uploadAvatar() {
    const input = document.getElementById('avatarInput');
    const file  = input ? input.files[0] : null;
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const avatar = document.getElementById('profileAvatar');
            if (avatar) avatar.src = e.target.result;
            showSuccessMessage('Profile photo updated successfully!');
        };
        reader.readAsDataURL(file);
    }
}

function saveProfile() {
    const profileData = {
        fullName:   document.getElementById('fullName')?.value || '',
        username:   document.getElementById('username')?.value || '',
        email:      document.getElementById('email')?.value || '',
        phone:      document.getElementById('phone')?.value || '',
        jobTitle:   document.getElementById('jobTitle')?.value || '',
        department: document.getElementById('department')?.value || '',
        bio:        document.getElementById('bio')?.value || '',
        location:   document.getElementById('location')?.value || '',
        timezone:   document.getElementById('timezone')?.value || ''
    };

    if (!profileData.fullName.trim() || !profileData.email.trim()) {
        alert('Full name and email are required');
        return;
    }

    const pn = document.getElementById('profileName');
    if (pn) pn.textContent = profileData.fullName;

    // Update session name
    const session = API.getSession();
    if (session) {
        session.name = profileData.fullName;
    }
    sessionStorage.setItem('userName', profileData.fullName);

    showSuccessMessage('Profile updated successfully!');
}

// ── Security ──
function loadSessionsData() {
    sessionsData = [
        { id: 'session-current', device: 'Current Browser', location: 'Mansoura, Egypt', ip: '—', lastActive: 'Now', current: true }
    ];
    renderSessions();
}

function renderSessions() {
    const container = document.getElementById('sessionsList');
    if (!container) {
        console.warn('sessionsList container not found');
        return;
    }
    const escapeHtml = (text) => {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    };
    container.innerHTML = sessionsData.map(session => {
        const sessionIdAttr = escapeHtml(session.id).replace(/"/g, '&quot;');
        const buttonHtml = session.current
            ? '<span class="session-current">Current</span>'
            : `<button class="secondary-btn" data-session-id="${sessionIdAttr}"><i class="fas fa-times"></i> Revoke</button>`;
        return `
        <div class="session-item">
            <div class="session-info">
                <div class="session-icon"><i class="fas fa-${getDeviceIcon(session.device)}"></i></div>
                <div class="session-details">
                    <div class="session-device">${escapeHtml(session.device)}</div>
                    <div class="session-location">${escapeHtml(session.location)} • ${escapeHtml(session.ip)} • ${escapeHtml(session.lastActive)}</div>
                </div>
            </div>
            ${buttonHtml}
        </div>
        `;
    }).join('');
    document.querySelectorAll('.session-item .secondary-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            revokeSession(this.getAttribute('data-session-id'));
        });
    });
}

function getDeviceIcon(device) {
    if (device.includes('iPhone') || device.includes('Android')) return 'mobile-screen';
    if (device.includes('iPad')) return 'tablet-screen-button';
    return 'desktop';
}

function revokeSession(sessionId) {
    if (confirm('Are you sure you want to revoke this session?')) {
        sessionsData = sessionsData.filter(s => s.id !== sessionId);
        renderSessions();
        showSuccessMessage('Session revoked successfully!');
    }
}

function loadLoginHistory() {
    loginHistoryData = [
        { id: 'l1', time: 'Today', location: 'Mansoura, Egypt', ip: '—', device: 'Browser', status: 'success' }
    ];
    renderLoginHistory();
}

function renderLoginHistory() {
    const container = document.getElementById('loginHistory');
    if (!container) return;
    const escapeHtml = (text) => {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    };
    container.innerHTML = loginHistoryData.map(login => `
        <div class="login-item ${login.status}">
            <div class="login-details">
                <div class="login-time">${escapeHtml(login.time)}</div>
                <div class="login-location">${escapeHtml(login.location)} • ${escapeHtml(login.ip)}</div>
            </div>
            <span class="login-status ${login.status}">${escapeHtml(login.status)}</span>
        </div>
    `).join('');
}

function changePassword() {
    const currentPass = document.getElementById('currentPassword')?.value || '';
    const newPass     = document.getElementById('newPassword')?.value || '';
    const confirmPass = document.getElementById('confirmPassword')?.value || '';

    if (!currentPass.trim() || !newPass.trim() || !confirmPass.trim()) { alert('Please fill in all password fields'); return; }
    if (newPass !== confirmPass) { alert('New passwords do not match'); return; }
    if (newPass.length < 8) { alert('Password must be at least 8 characters'); return; }

    ['currentPassword', 'newPassword', 'confirmPassword'].forEach(id => {
        const el = document.getElementById(id); if (el) el.value = '';
    });
    showSuccessMessage('Password changed successfully!');
}

function manage2FA() { alert('Two-Factor Authentication setup coming soon!'); }

function logoutAllSessions() {
    if (confirm('Logout all other devices?')) {
        sessionsData = sessionsData.filter(s => s.current);
        renderSessions();
        showSuccessMessage('All other sessions logged out!');
    }
}

// ── Notifications / Preferences ──
function saveNotifications() { showSuccessMessage('Notification preferences saved!'); }
function savePreferences()   { showSuccessMessage('Preferences saved successfully!'); }

// ── Privacy ──
function downloadData() {
    if (confirm('Download all your account data?')) {
        const session = API.getSession();
        const data = { profile: session, timestamp: new Date().toISOString() };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'my-data-export.json'; a.click();
        window.URL.revokeObjectURL(url);
        showSuccessMessage('Data exported!');
    }
}

function deleteAccount() {
    const confirmText = 'DELETE';
    const userInput = prompt(`Type "${confirmText}" to permanently delete your account:`);
    if (userInput === confirmText) {
        if (confirm('Are you absolutely sure? This cannot be undone.')) {
            API.clearSession();
            alert('Account deletion initiated. Redirecting...');
            setTimeout(() => { window.location.href = '/GraduationProject/pages/login.html'; }, 2000);
        }
    } else if (userInput !== null) {
        alert('Confirmation text did not match.');
    }
}

// ── Logout via API ──
async function logoutUser() {
    await API.logout();
    API.clearSession();
    window.location.href = '/GraduationProject/pages/login.html';
}

// ── Utility ──
function showSuccessMessage(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `position:fixed;top:20px;right:20px;background:#66bb6a;color:white;padding:16px 24px;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.2);z-index:100000;display:flex;align-items:center;gap:12px;font-size:14px;font-weight:600;animation:slideInRight .3s ease-out;`;
    const icon = document.createElement('i');
    icon.className = 'fas fa-check-circle';
    icon.style.fontSize = '20px';
    const span = document.createElement('span');
    span.textContent = message;
    toast.appendChild(icon);
    toast.appendChild(span);
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.animation = 'slideOutRight .3s ease-in'; setTimeout(() => document.body.removeChild(toast), 300); }, 3000);
}

// Topbar
function toggleAccountNotifications() { const d = document.getElementById('accountNotificationsDropdown'); if (d) d.classList.toggle('show'); }
function clearAccountNotifications() {
    const l = document.querySelector('.notifications-list');
    if (l) l.innerHTML = '<div style="text-align:center;padding:20px;color:#6b7280;">No notifications</div>';
    showSuccessMessage('Notifications cleared');
}
function toggleAccountTheme() {
    document.body.classList.toggle('dark-mode');
    const icon = document.getElementById('accountThemeIcon');
    const isDark = document.body.classList.contains('dark-mode');
    if (icon) icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

// Keyboard shortcuts
document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (currentSection === 'profile') saveProfile();
        else if (currentSection === 'notifications') saveNotifications();
        else if (currentSection === 'preferences') savePreferences();
    }
});

document.addEventListener('DOMContentLoaded', function () {
    if (window.location.pathname.includes('account.html')) {
        initAccountPage();
        document.addEventListener('click', function (event) {
            const d = document.getElementById('accountNotificationsDropdown');
            const b = document.getElementById('accountNotificationBtn');
            if (d && b && !d.contains(event.target) && !b.contains(event.target)) d.classList.remove('show');
        });
    }
});

// Add animations
const _accStyle = document.createElement('style');
_accStyle.textContent = `@keyframes slideInRight{from{transform:translateX(400px);opacity:0}to{transform:translateX(0);opacity:1}}@keyframes slideOutRight{from{transform:translateX(0);opacity:1}to{transform:translateX(400px);opacity:0}}`;
document.head.appendChild(_accStyle);