// ============================================
// account.js - Account Settings
// ============================================

let currentSection = 'profile';
let sessionsData = [];
let loginHistoryData = [];

// Initialize Account Page
function initAccountPage() {
    console.log('Initializing Account Settings...');
    loadSessionsData();
    loadLoginHistory();
}

// Switch Section
function switchSection(sectionName) {
    currentSection = sectionName;

    // Update navigation buttons
    document.querySelectorAll('.settings-nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

    // Update section content
    document.querySelectorAll('.settings-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(`${sectionName}-section`).classList.add('active');
}

// ============================================
// PROFILE SECTION
// ============================================

function uploadAvatar() {
    const input = document.getElementById('avatarInput');
    const file = input.files[0];
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('profileAvatar').src = e.target.result;
            alert('Profile photo updated successfully!');
        };
        reader.readAsDataURL(file);
    }
}

function saveProfile() {
    const profileData = {
        fullName: document.getElementById('fullName').value,
        username: document.getElementById('username').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        jobTitle: document.getElementById('jobTitle').value,
        department: document.getElementById('department').value,
        bio: document.getElementById('bio').value,
        location: document.getElementById('location').value,
        timezone: document.getElementById('timezone').value
    };

    console.log('Saving profile:', profileData);
    
    // Update profile name in header
    document.getElementById('profileName').textContent = profileData.fullName;
    
    // Show success message
    showSuccessMessage('Profile updated successfully!');
}

// ============================================
// SECURITY SECTION
// ============================================

function loadSessionsData() {
    sessionsData = [
        {
            id: 'session-001',
            device: 'Chrome on Windows',
            location: 'Cairo, Egypt',
            ip: '197.55.23.45',
            lastActive: '2 minutes ago',
            current: true
        },
        {
            id: 'session-002',
            device: 'Safari on iPhone',
            location: 'Cairo, Egypt',
            ip: '197.55.23.46',
            lastActive: '1 day ago',
            current: false
        },
        {
            id: 'session-003',
            device: 'Chrome on Android',
            location: 'Alexandria, Egypt',
            ip: '197.55.24.12',
            lastActive: '3 days ago',
            current: false
        }
    ];

    renderSessions();
}

function renderSessions() {
    const container = document.getElementById('sessionsList');
    if (!container) return;

    container.innerHTML = sessionsData.map(session => `
        <div class="session-item">
            <div class="session-info">
                <div class="session-icon">
                    <i class="fas fa-${getDeviceIcon(session.device)}"></i>
                </div>
                <div class="session-details">
                    <div class="session-device">${session.device}</div>
                    <div class="session-location">${session.location} • ${session.ip} • ${session.lastActive}</div>
                </div>
            </div>
            ${session.current ? 
                '<span class="session-current">Current</span>' : 
                `<button class="secondary-btn" onclick="revokeSession('${session.id}')"><i class="fas fa-times"></i> Revoke</button>`
            }
        </div>
    `).join('');
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
        {
            id: 'login-001',
            time: 'Today at 10:30 AM',
            location: 'Cairo, Egypt',
            ip: '197.55.23.45',
            device: 'Chrome on Windows',
            status: 'success'
        },
        {
            id: 'login-002',
            time: 'Yesterday at 3:45 PM',
            location: 'Cairo, Egypt',
            ip: '197.55.23.45',
            device: 'Safari on iPhone',
            status: 'success'
        },
        {
            id: 'login-003',
            time: 'Jan 27 at 9:20 AM',
            location: 'Alexandria, Egypt',
            ip: '197.55.24.12',
            device: 'Chrome on Android',
            status: 'success'
        },
        {
            id: 'login-004',
            time: 'Jan 26 at 11:15 PM',
            location: 'Unknown Location',
            ip: '185.23.45.67',
            device: 'Firefox on Linux',
            status: 'failed'
        },
        {
            id: 'login-005',
            time: 'Jan 25 at 8:00 AM',
            location: 'Cairo, Egypt',
            ip: '197.55.23.45',
            device: 'Chrome on Windows',
            status: 'success'
        }
    ];

    renderLoginHistory();
}

function renderLoginHistory() {
    const container = document.getElementById('loginHistory');
    if (!container) return;

    container.innerHTML = loginHistoryData.map(login => `
        <div class="login-item ${login.status}">
            <div class="login-details">
                <div class="login-time">${login.time}</div>
                <div class="login-location">${login.location} • ${login.ip}</div>
            </div>
            <span class="login-status ${login.status}">${login.status}</span>
        </div>
    `).join('');
}

function changePassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (!currentPassword || !newPassword || !confirmPassword) {
        alert('Please fill in all password fields');
        return;
    }

    if (newPassword !== confirmPassword) {
        alert('New passwords do not match');
        return;
    }

    if (newPassword.length < 8) {
        alert('Password must be at least 8 characters long');
        return;
    }

    // Simulate password change
    console.log('Changing password...');
    
    // Clear inputs
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
    
    showSuccessMessage('Password changed successfully!');
}

function manage2FA() {
    alert('Two-Factor Authentication Management\n\nFeatures:\n• QR Code Setup\n• Backup Codes\n• Recovery Options\n\nThis feature will be available soon!');
}

function logoutAllSessions() {
    if (confirm('Are you sure you want to logout all devices except this one?')) {
        sessionsData = sessionsData.filter(s => s.current);
        renderSessions();
        showSuccessMessage('All other sessions have been logged out!');
    }
}

// ============================================
// NOTIFICATIONS SECTION
// ============================================

function saveNotifications() {
    const notifications = document.querySelectorAll('#notifications-section input[type="checkbox"]');
    const settings = Array.from(notifications).map(input => ({
        checked: input.checked
    }));

    console.log('Saving notification preferences:', settings);
    showSuccessMessage('Notification preferences saved successfully!');
}

// ============================================
// PREFERENCES SECTION
// ============================================

function savePreferences() {
    const preferences = {
        theme: document.querySelector('#preferences-section select').value,
        // Add more preferences as needed
    };

    console.log('Saving preferences:', preferences);
    showSuccessMessage('Preferences saved successfully!');
}

// Color picker functionality
document.addEventListener('DOMContentLoaded', function() {
    const colorOptions = document.querySelectorAll('.color-option');
    
    colorOptions.forEach(option => {
        option.addEventListener('click', function() {
            colorOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
        });
    });
});

// ============================================
// PRIVACY SECTION
// ============================================

function downloadData() {
    if (confirm('Download all your personal data?\n\nThis will generate a file containing all your account information, settings, and activity history.')) {
        // Simulate data download
        showSuccessMessage('Your data export is being prepared. You will receive an email when it\'s ready to download.');
        
        // In production, this would trigger an API call to generate the data export
        setTimeout(() => {
            const data = {
                profile: {
                    name: document.getElementById('fullName').value,
                    email: document.getElementById('email').value,
                    // ... other profile data
                },
                timestamp: new Date().toISOString()
            };
            
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'my-data-export.json';
            a.click();
            window.URL.revokeObjectURL(url);
        }, 1000);
    }
}

function deleteAccount() {
    const confirmText = 'DELETE';
    const userInput = prompt(
        `⚠️ WARNING: This action is PERMANENT and IRREVERSIBLE!\n\n` +
        `Deleting your account will:\n` +
        `• Permanently delete all your data\n` +
        `• Remove all your permissions and access\n` +
        `• Cancel all subscriptions\n` +
        `• This cannot be undone\n\n` +
        `Type "${confirmText}" to confirm account deletion:`
    );

    if (userInput === confirmText) {
        const finalConfirm = confirm(
            'Are you absolutely sure? This is your last chance to cancel.\n\n' +
            'Your account will be permanently deleted and cannot be recovered.'
        );

        if (finalConfirm) {
            // Simulate account deletion
            alert('Account deletion initiated.\n\nYou will be logged out in 5 seconds.');
            setTimeout(() => {
                sessionStorage.clear();
                localStorage.clear();
                window.location.href = '/pages/login.html';
            }, 5000);
        }
    } else if (userInput !== null) {
        alert('Account deletion cancelled. The confirmation text did not match.');
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function showSuccessMessage(message) {
    // Create toast notification
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #66bb6a;
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        z-index: 100000;
        display: flex;
        align-items: center;
        gap: 12px;
        font-family: "Segoe UI", sans-serif;
        font-size: 14px;
        font-weight: 600;
        animation: slideInRight 0.3s ease-out;
    `;
    
    toast.innerHTML = `
        <i class="fas fa-check-circle" style="font-size: 20px;"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => {
            document.body.removeChild(toast);
            document.head.removeChild(style);
        }, 300);
    }, 3000);
}

// ============================================
// TOPBAR HELPERS (notifications, theme, view)
// ============================================

function toggleAccountNotifications() {
    const dropdown = document.getElementById('accountNotificationsDropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

function clearAccountNotifications() {
    const list = document.querySelector('.notifications-list');
    if (list) {
        list.innerHTML = '<div style="text-align:center;padding:20px;color:#6b7280;">No notifications</div>';
    }
    showSuccessMessage('Notification list cleared');
}

function toggleAccountTheme() {
    document.body.classList.toggle('dark-mode');
    const icon = document.getElementById('accountThemeIcon');

    if (document.body.classList.contains('dark-mode')) {
        if (icon) icon.className = 'fas fa-sun';
        localStorage.setItem('theme', 'dark');
        showSuccessMessage('Dark mode enabled');
    } else {
        if (icon) icon.className = 'fas fa-moon';
        localStorage.setItem('theme', 'light');
        showSuccessMessage('Dark mode disabled');
    }
}

function toggleAccountView() {
    const icon = document.getElementById('accountViewIcon');

    if (accountViewMode === 'normal') {
        accountViewMode = 'compact';
        document.body.classList.add('account-compact-view');
        if (icon) icon.className = 'fas fa-table';
        localStorage.setItem('accountViewMode', 'compact');
    } else {
        accountViewMode = 'normal';
        document.body.classList.remove('account-compact-view');
        if (icon) icon.className = 'fas fa-th-large';
        localStorage.setItem('accountViewMode', 'normal');
    }
}

// ============================================
// KEYBOARD SHORTCUTS
// ============================================

document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + S to save (depending on active section)
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        
        switch(currentSection) {
            case 'profile':
                saveProfile();
                break;
            case 'notifications':
                saveNotifications();
                break;
            case 'preferences':
                savePreferences();
                break;
        }
    }
});

// ============================================
// INITIALIZE ON PAGE LOAD
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('account.html')) {
        initAccountPage();

        // Close notifications when clicking outside
        document.addEventListener('click', function(event) {
            const dropdown = document.getElementById('accountNotificationsDropdown');
            const btn = document.getElementById('accountNotificationBtn');
            if (dropdown && !dropdown.contains(event.target) &&
                btn && !btn.contains(event.target)) {
                dropdown.classList.remove('show');
            }
        });
    }
});

// Auto-save draft (for profile section)
let autoSaveTimer;
const profileInputs = ['fullName', 'username', 'email', 'phone', 'jobTitle', 'bio', 'location'];

profileInputs.forEach(inputId => {
    const input = document.getElementById(inputId);
    if (input) {
        input.addEventListener('input', function() {
            clearTimeout(autoSaveTimer);
            autoSaveTimer = setTimeout(() => {
                // Auto-save to localStorage
                const draftData = {};
                profileInputs.forEach(id => {
                    const el = document.getElementById(id);
                    if (el) draftData[id] = el.value;
                });
                localStorage.setItem('profileDraft', JSON.stringify(draftData));
                console.log('Draft saved automatically');
            }, 2000);
        });
    }
});

// Load draft on page load
window.addEventListener('load', function() {
    const draft = localStorage.getItem('profileDraft');
    if (draft) {
        const draftData = JSON.parse(draft);
        Object.keys(draftData).forEach(key => {
            const input = document.getElementById(key);
            if (input && input.value === '') {
                input.value = draftData[key];
            }
        });
    }
});