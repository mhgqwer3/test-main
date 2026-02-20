// ============================================
// admin.js - Admin Tools
// ============================================

// ── Auth Guard ──
if (typeof API !== 'undefined' && !API.isLoggedIn()) {
    window.location.href = '/GraduationProject/pages/login.html';
}

// ── Logout ──
async function logoutUser() {
    await API.logout();
    API.clearSession();
    window.location.href = '/GraduationProject/pages/login.html';
}

let usersData = [];
let rolesData = [];
let logsData = [];
let backupData = [];
let currentTab = 'users';
let adminViewMode = 'normal'; // normal | compact

// Initialize Admin Page
function initAdminPage() {
    console.log('Initializing Admin Tools...');

    // Load saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        const themeIcon = document.getElementById('adminThemeIcon');
        if (themeIcon) {
            themeIcon.className = 'fas fa-sun';
        }
    }

    // Load saved view mode for admin tables
    const savedView = localStorage.getItem('adminViewMode');
    if (savedView === 'compact') {
        adminViewMode = 'compact';
        document.body.classList.add('admin-compact-view');
    }
    const viewIcon = document.getElementById('adminViewIcon');
    if (viewIcon) {
        viewIcon.className = adminViewMode === 'compact' ? 'fas fa-table' : 'fas fa-th-large';
    }

    loadUsersData();
    loadRolesData();
    loadLogsData();
    loadBackupData();
}

// Switch Tab
function switchTab(tabName) {
    currentTab = tabName;

    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`).classList.add('active');
}

// ============================================
// USER MANAGEMENT
// ============================================

function loadUsersData() {
    usersData = [
        {
            id: 'USR-001',
            name: 'Nader Elsayed',
            email: 'nader.elsayed@smartbins.com',
            role: 'admin',
            status: 'active',
            lastActive: '2 mins ago',
            avatar: 'https://ui-avatars.com/api/?name=Nader+Elsayed&background=4873ff&color=fff'
        },
        {
            id: 'USR-002',
            name: 'Alaa Ashraf',
            email: 'alaa.ashraf@smartbins.com',
            role: 'manager',
            status: 'active',
            lastActive: '15 mins ago',
            avatar: 'https://ui-avatars.com/api/?name=Alaa+Ashraf&background=66bb6a&color=fff'
        },
        {
            id: 'USR-003',
            name: 'Ahmed Adel',
            email: 'ahmed.adel@smartbins.com',
            role: 'operator',
            status: 'active',
            lastActive: '1 hour ago',
            avatar: 'https://ui-avatars.com/api/?name=Ahmed+Adel&background=ffa726&color=fff'
        },
        {
            id: 'USR-004',
            name: 'Omar Alqeeran',
            email: 'omar.alqeeran@smartbins.com',
            role: 'operator',
            status: 'inactive',
            lastActive: '2 days ago',
            avatar: 'https://ui-avatars.com/api/?name=Omar+Alqeeran&background=9e9e9e&color=fff'
        },
        {
            id: 'USR-005',
            name: 'Ahmed Eldesoky',
            email: 'ahmed.eldesoky@smartbins.com',
            role: 'viewer',
            status: 'active',
            lastActive: '30 mins ago',
            avatar: 'https://ui-avatars.com/api/?name=Ahmed+Eldesoky&background=4873ff&color=fff'
        },
        {
            id: 'USR-006',
            name: 'Mohammed Magdey',
            email: 'mohammed.magdey@smartbins.com',
            role: 'manager',
            status: 'suspended',
            lastActive: '5 days ago',
            avatar: 'https://ui-avatars.com/api/?name=Mohamed+Magdey&background=ff5252&color=fff'
        }
    ];

    renderUsers();
}

function renderUsers() {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;

    tbody.innerHTML = usersData.map(user => `
        <tr>
            <td>
                <input type="checkbox" class="user-checkbox" data-user-id="${user.id}">
            </td>
            <td>
                <div class="user-info-cell">
                    <img src="${user.avatar}" alt="${user.name}" class="user-avatar">
                    <div class="user-details">
                        <span class="user-name">${user.name}</span>
                        <span class="user-id">${user.id}</span>
                    </div>
                </div>
            </td>
            <td>${user.email}</td>
            <td><span class="role-badge ${user.role}">${user.role}</span></td>
            <td>
                <span class="status-badge ${user.status}">
                    <i class="fas fa-circle"></i>
                    ${user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                </span>
            </td>
            <td>${user.lastActive}</td>
            <td>
                <div class="table-actions">
                    <button class="action-icon-btn" onclick="editUser('${user.id}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-icon-btn" onclick="viewUserDetails('${user.id}')" title="View">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-icon-btn danger" onclick="deleteUser('${user.id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');

    console.log('✅ Users table rendered');
}

function toggleSelectAll() {
    const selectAll = document.getElementById('selectAll');
    const checkboxes = document.querySelectorAll('.user-checkbox');
    checkboxes.forEach(cb => cb.checked = selectAll.checked);
}

function openAddUserModal() {
    const modal = document.getElementById('adminModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    modalTitle.textContent = 'Add New User';
    modalBody.innerHTML = `
        <form onsubmit="addNewUser(event)" style="display: grid; gap: 16px;">
            <div>
                <label style="display: block; margin-bottom: 6px; color: #1a1f3a; font-weight: 500;">Full Name</label>
                <input type="text" id="userName" placeholder="Enter full name" required 
                       style="width: 100%; padding: 10px; border: 1px solid rgba(72, 115, 255, 0.2); border-radius: 8px; font-size: 14px;">
            </div>
            <div>
                <label style="display: block; margin-bottom: 6px; color: #1a1f3a; font-weight: 500;">Email</label>
                <input type="email" id="userEmail" placeholder="user@smartbins.com" required
                       style="width: 100%; padding: 10px; border: 1px solid rgba(72, 115, 255, 0.2); border-radius: 8px; font-size: 14px;">
            </div>
            <div>
                <label style="display: block; margin-bottom: 6px; color: #1a1f3a; font-weight: 500;">Role</label>
                <select id="userRole" required
                        style="width: 100%; padding: 10px; border: 1px solid rgba(72, 115, 255, 0.2); border-radius: 8px; font-size: 14px;">
                    <option value="">Select Role</option>
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="operator">Operator</option>
                    <option value="viewer">Viewer</option>
                </select>
            </div>
            <div>
                <label style="display: block; margin-bottom: 6px; color: #1a1f3a; font-weight: 500;">Password</label>
                <input type="password" id="userPassword" placeholder="Enter password" required
                       style="width: 100%; padding: 10px; border: 1px solid rgba(72, 115, 255, 0.2); border-radius: 8px; font-size: 14px;">
            </div>
            <div style="display: flex; gap: 12px; margin-top: 8px;">
                <button type="submit" class="primary-btn" style="flex: 1;">
                    <i class="fas fa-user-plus"></i>
                    Add User
                </button>
                <button type="button" class="secondary-btn" onclick="closeModal()" style="flex: 1;">
                    Cancel
                </button>
            </div>
        </form>
    `;

    modal.classList.add('active');
}

function addNewUser(event) {
    event.preventDefault();

    const newUser = {
        id: `USR-${String(usersData.length + 1).padStart(3, '0')}`,
        name: document.getElementById('userName').value,
        email: document.getElementById('userEmail').value,
        role: document.getElementById('userRole').value,
        status: 'active',
        lastActive: 'Just now',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(document.getElementById('userName').value)}&background=4873ff&color=fff`
    };

    usersData.push(newUser);
    renderUsers();
    closeModal();
    alert(`User ${newUser.name} added successfully!`);
}

function editUser(userId) {
    const user = usersData.find(u => u.id === userId);
    if (!user) return;

    alert(`Edit user: ${user.name}\n\nThis would open an edit form in production.`);
}

function viewUserDetails(userId) {
    const user = usersData.find(u => u.id === userId);
    if (!user) return;

    const modal = document.getElementById('adminModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    modalTitle.textContent = `User Details - ${user.name}`;
    modalBody.innerHTML = `
        <div style="display: grid; gap: 20px;">
            <div style="text-align: center;">
                <img src="${user.avatar}" alt="${user.name}" style="width: 80px; height: 80px; border-radius: 50%; margin-bottom: 12px;">
                <h3 style="margin: 0; color: #1a1f3a;">${user.name}</h3>
                <p style="margin: 4px 0; color: #6b7280;">${user.id}</p>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; font-size: 14px;">
                <div>
                    <span style="color: #6b7280;">Email:</span>
                    <strong style="display: block; color: #1a1f3a; margin-top: 4px;">${user.email}</strong>
                </div>
                <div>
                    <span style="color: #6b7280;">Role:</span>
                    <strong style="display: block; color: #1a1f3a; margin-top: 4px; text-transform: capitalize;">${user.role}</strong>
                </div>
                <div>
                    <span style="color: #6b7280;">Status:</span>
                    <strong style="display: block; color: #1a1f3a; margin-top: 4px; text-transform: capitalize;">${user.status}</strong>
                </div>
                <div>
                    <span style="color: #6b7280;">Last Active:</span>
                    <strong style="display: block; color: #1a1f3a; margin-top: 4px;">${user.lastActive}</strong>
                </div>
            </div>

            <div style="display: flex; gap: 12px; margin-top: 12px;">
                <button class="primary-btn" onclick="editUser('${user.id}'); closeModal();" style="flex: 1;">
                    <i class="fas fa-edit"></i>
                    Edit User
                </button>
                <button class="secondary-btn danger" onclick="deleteUser('${user.id}'); closeModal();" style="flex: 1; color: #ff5252; border-color: rgba(255, 82, 82, 0.3);">
                    <i class="fas fa-trash"></i>
                    Delete User
                </button>
            </div>
        </div>
    `;

    modal.classList.add('active');
}

function deleteUser(userId) {
    if (confirm('Are you sure you want to delete this user?')) {
        usersData = usersData.filter(u => u.id !== userId);
        renderUsers();
        alert('User deleted successfully!');
    }
}

function exportUsers() {
    const csv = convertToCSV(usersData);
    downloadCSV(csv, 'users-export.csv');
}

// ============================================
// ROLES & PERMISSIONS
// ============================================

function loadRolesData() {
    rolesData = [
        {
            id: 'role-admin',
            name: 'Administrator',
            users: 2,
            permissions: ['Full System Access', 'User Management', 'System Configuration', 'View All Data']
        },
        {
            id: 'role-manager',
            name: 'Manager',
            users: 3,
            permissions: ['Fleet Management', 'Reports Access', 'Schedule Management', 'View Analytics']
        },
        {
            id: 'role-operator',
            name: 'Operator',
            users: 8,
            permissions: ['View Carts', 'Update Status', 'View Trips', 'Basic Reports']
        },
        {
            id: 'role-viewer',
            name: 'Viewer',
            users: 5,
            permissions: ['View Dashboard', 'View Reports', 'View Logs']
        }
    ];

    renderRoles();
}

function renderRoles() {
    const container = document.getElementById('rolesGrid');
    if (!container) return;

    container.innerHTML = rolesData.map(role => `
        <div class="role-card">
            <div class="role-card-header">
                <div class="role-icon">
                    <i class="fas fa-user-shield"></i>
                </div>
                <div class="role-menu">
                    <button class="role-menu-btn">
                        <i class="fas fa-ellipsis-v"></i>
                    </button>
                </div>
            </div>
            <div class="role-name">${role.name}</div>
            <div class="role-users">${role.users} users assigned</div>
            <div class="role-permissions">
                ${role.permissions.map(perm => `
                    <div class="permission-item">
                        <i class="fas fa-check"></i>
                        <span>${perm}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');

    console.log('✅ Roles rendered');
}

function openAddRoleModal() {
    alert('Create new role feature coming soon!');
}

// ============================================
// SYSTEM LOGS
// ============================================

function loadLogsData() {
    logsData = [
        {
            id: 'log-001',
            type: 'info',
            message: 'System started successfully',
            time: '2 minutes ago',
            details: 'All services running normally'
        },
        {
            id: 'log-002',
            type: 'info',
            message: 'User "Ahmed Hassan" logged in',
            time: '5 minutes ago',
            details: 'Login from IP: 197.55.23.45'
        },
        {
            id: 'log-003',
            type: 'warning',
            message: 'BIN-007 battery level low (15%)',
            time: '12 minutes ago',
            details: 'Automatic charging initiated'
        },
        {
            id: 'log-004',
            type: 'error',
            message: 'Failed to connect to GPS service',
            time: '18 minutes ago',
            details: 'Retrying connection... (Attempt 2/5)'
        },
        {
            id: 'log-005',
            type: 'info',
            message: 'Backup completed successfully',
            time: '1 hour ago',
            details: 'Database backup saved to cloud storage'
        },
        {
            id: 'log-006',
            type: 'critical',
            message: 'Database connection lost',
            time: '2 hours ago',
            details: 'Connection restored after 30 seconds'
        },
        {
            id: 'log-007',
            type: 'warning',
            message: 'High server load detected',
            time: '3 hours ago',
            details: 'CPU usage: 85%, Memory: 78%'
        }
    ];

    renderLogs();
}

function renderLogs(filter = 'all') {
    const container = document.getElementById('logsContainer');
    if (!container) return;

    let filteredLogs = filter === 'all' ? logsData : logsData.filter(log => log.type === filter);

    if (filteredLogs.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 40px; color: #6b7280;">No logs found</div>';
        return;
    }

    container.innerHTML = filteredLogs.map(log => `
        <div class="log-entry ${log.type}">
            <div class="log-header">
                <span class="log-type ${log.type}">
                    <i class="fas fa-${getLogIcon(log.type)}"></i>
                    ${log.type}
                </span>
                <span class="log-time">${log.time}</span>
            </div>
            <div class="log-message">${log.message}</div>
            ${log.details ? `<div style="font-size: 12px; color: #6b7280; margin-top: 4px;">${log.details}</div>` : ''}
        </div>
    `).join('');

    console.log('✅ Logs rendered');
}

function getLogIcon(type) {
    const icons = {
        info: 'info-circle',
        warning: 'exclamation-triangle',
        error: 'exclamation-circle',
        critical: 'times-circle'
    };
    return icons[type] || 'circle';
}

function filterLogs() {
    const filter = document.getElementById('logTypeFilter').value;
    renderLogs(filter);
}

function clearLogs() {
    if (confirm('Are you sure you want to clear all logs?')) {
        logsData = [];
        renderLogs();
        alert('Logs cleared successfully!');
    }
}

function downloadLogs() {
    const logsText = logsData.map(log => 
        `[${log.time}] [${log.type.toUpperCase()}] ${log.message} - ${log.details || ''}`
    ).join('\n');
    
    const blob = new Blob([logsText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'system-logs.txt';
    a.click();
    window.URL.revokeObjectURL(url);
}

// ============================================
// BACKUP & RESTORE
// ============================================

function loadBackupData() {
    backupData = [
        {
            id: 'backup-001',
            name: 'Automatic Backup - Daily',
            date: '2024-01-29 03:00 AM',
            size: '245 MB',
            status: 'completed'
        },
        {
            id: 'backup-002',
            name: 'Manual Backup',
            date: '2024-01-28 02:30 PM',
            size: '243 MB',
            status: 'completed'
        },
        {
            id: 'backup-003',
            name: 'Automatic Backup - Daily',
            date: '2024-01-28 03:00 AM',
            size: '242 MB',
            status: 'completed'
        }
    ];

    renderBackupHistory();
}

function renderBackupHistory() {
    const container = document.getElementById('backupHistory');
    if (!container) return;

    container.innerHTML = backupData.map(backup => `
        <div class="backup-item">
            <div class="backup-info">
                <div class="backup-name">${backup.name}</div>
                <div class="backup-details">${backup.date} • ${backup.size}</div>
            </div>
            <div class="backup-actions">
                <button class="action-icon-btn" onclick="downloadBackup('${backup.id}')" title="Download">
                    <i class="fas fa-download"></i>
                </button>
                <button class="action-icon-btn" onclick="restoreBackup('${backup.id}')" title="Restore">
                    <i class="fas fa-cloud-arrow-down"></i>
                </button>
                <button class="action-icon-btn danger" onclick="deleteBackup('${backup.id}')" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function createBackup() {
    if (confirm('Create a new system backup?')) {
        alert('Creating backup... This may take a few minutes.');
        // Simulate backup creation
        setTimeout(() => {
            alert('Backup created successfully!');
            const newBackup = {
                id: `backup-${String(backupData.length + 1).padStart(3, '0')}`,
                name: 'Manual Backup',
                date: new Date().toLocaleString(),
                size: '246 MB',
                status: 'completed'
            };
            backupData.unshift(newBackup);
            renderBackupHistory();
        }, 2000);
    }
}

function openRestoreModal() {
    alert('Restore from backup feature coming soon!');
}

function configureAutoBackup() {
    alert('Configure automatic backup settings coming soon!');
}

function downloadBackup(backupId) {
    alert(`Downloading backup ${backupId}...`);
}

function restoreBackup(backupId) {
    if (confirm('Are you sure you want to restore from this backup? This will overwrite current data.')) {
        alert(`Restoring from backup ${backupId}...`);
    }
}

function deleteBackup(backupId) {
    if (confirm('Are you sure you want to delete this backup?')) {
        backupData = backupData.filter(b => b.id !== backupId);
        renderBackupHistory();
        alert('Backup deleted successfully!');
    }
}

// ============================================
// SYSTEM SETTINGS
// ============================================

function saveSettings() {
    alert('Settings saved successfully!');
}

// Topbar helpers
function toggleAdminNotifications() {
    const dropdown = document.getElementById('adminNotificationsDropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

function clearAdminNotifications() {
    const list = document.querySelector('.notifications-list');
    if (list) {
        list.innerHTML = '<div style="text-align:center;padding:20px;color:#6b7280;">No notifications</div>';
    }
}

function toggleAdminTheme() {
    document.body.classList.toggle('dark-mode');
    const icon = document.getElementById('adminThemeIcon');

    if (document.body.classList.contains('dark-mode')) {
        if (icon) icon.className = 'fas fa-sun';
        localStorage.setItem('theme', 'dark');
        console.log('Dark mode enabled (admin)');
    } else {
        if (icon) icon.className = 'fas fa-moon';
        localStorage.setItem('theme', 'light');
        console.log('Dark mode disabled (admin)');
    }
}

function toggleAdminView() {
    const icon = document.getElementById('adminViewIcon');

    if (adminViewMode === 'normal') {
        adminViewMode = 'compact';
        document.body.classList.add('admin-compact-view');
        if (icon) icon.className = 'fas fa-table';
        localStorage.setItem('adminViewMode', 'compact');
    } else {
        adminViewMode = 'normal';
        document.body.classList.remove('admin-compact-view');
        if (icon) icon.className = 'fas fa-th-large';
        localStorage.setItem('adminViewMode', 'normal');
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function convertToCSV(data) {
    if (data.length === 0) return '';
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(item => Object.values(item).join(','));
    return [headers, ...rows].join('\n');
}

function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
}

function closeModal() {
    const modal = document.getElementById('adminModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Close modal on outside click
window.addEventListener('click', (e) => {
    const modal = document.getElementById('adminModal');
    if (modal && e.target === modal) {
        closeModal();
    }
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('admin.html')) {
        initAdminPage();

        // Close notifications when clicking outside
        document.addEventListener('click', function(event) {
            const dropdown = document.getElementById('adminNotificationsDropdown');
            const btn = document.getElementById('adminNotificationBtn');
            if (dropdown && !dropdown.contains(event.target) &&
                btn && !btn.contains(event.target)) {
                dropdown.classList.remove('show');
            }
        });
    }
});