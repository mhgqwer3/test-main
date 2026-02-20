// ============================================
// alerts.js - Connected to Smart Bins API
// ============================================

// ── Auth Guard ──
if (typeof API !== 'undefined' && !API.isLoggedIn()) {
    window.location.href = '/GraduationProject/pages/login.html';
}

let currentFilter = 'all';
let selectedAlertId = null;
let localAlertsData = []; // cache from API

// Initialize page
async function initAlertsPage() {
    console.log('Initializing Alerts page...');
    setupEventListeners();
    await fetchAndRenderAlerts();
    animateStats();
    setInterval(fetchAndRenderAlerts, 30000);
}

// ── Fetch alerts from API ──
async function fetchAndRenderAlerts() {
    try {
        const res = await API.listAlerts('all'); // all statuses
        if (res.status === 'success') {
            localAlertsData = mapApiAlerts(res.data);
            renderAlerts();
            animateStats();
        }
    } catch (e) {
        console.warn('Could not fetch alerts from API:', e);
    }
}

// Map API alert fields → frontend format
function mapApiAlerts(apiAlerts) {
    return apiAlerts.map(a => ({
        id:          a.alert_id?.toString() || a.id?.toString(),
        type:        a.alert_type || 'info',
        title:       a.title,
        description: a.message,
        binId:       a.bin_code || 'System',
        location:    a.location_name || 'System',
        priority:    priorityLabel(a.priority),
        timestamp:   new Date(a.created_at),
        status:      a.status || 'active',
        unread:      a.status === 'active'
    }));
}

function priorityLabel(p) {
    if (!p) return 'Low';
    if (p >= 8) return 'High';
    if (p >= 5) return 'Medium';
    return 'Low';
}

// Setup event listeners
function setupEventListeners() {
    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.addEventListener('click', function () {
            document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.filter;
            renderAlerts();
        });
    });

    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.addEventListener('input', function () { renderAlerts(this.value); });

    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) statusFilter.addEventListener('change', () => renderAlerts());
}

// Render alerts
function renderAlerts(searchQuery = '') {
    let filtered = localAlertsData.filter(alert => {
        if (currentFilter !== 'all' && alert.type !== currentFilter) return false;
        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter && statusFilter.value !== 'all' && alert.status !== statusFilter.value) return false;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            return alert.title.toLowerCase().includes(q) ||
                alert.description.toLowerCase().includes(q) ||
                alert.binId.toLowerCase().includes(q);
        }
        return true;
    });

    const active       = filtered.filter(a => a.status === 'active');
    const acknowledged = filtered.filter(a => a.status === 'acknowledged');
    const resolved     = filtered.filter(a => a.status === 'resolved');

    renderAlertsList('activeAlertsList', active);
    renderAlertsList('acknowledgedAlertsList', acknowledged);
    renderAlertsList('resolvedAlertsList', resolved);

    updateSectionCount('activeAlertsCount', active.length);
    updateSectionCount('acknowledgedCount', acknowledged.length);
    updateSectionCount('resolvedAlertsCount', resolved.length);
}

function renderAlertsList(containerId, alerts) {
    const container = document.getElementById(containerId);
    if (!container) return;
    if (alerts.length === 0) {
        container.innerHTML = `<div class="empty-state"><i class="fas fa-inbox"></i><h3>No alerts found</h3><p>All clear in this category</p></div>`;
        return;
    }
    container.innerHTML = alerts.map(alert => `
        <div class="alert-item ${alert.type} ${alert.unread ? 'unread' : ''}" onclick="showAlertDetails('${alert.id}')">
            <div class="alert-icon-wrapper"><div class="alert-icon"><i class="fas fa-${getAlertIcon(alert.type)}"></i></div></div>
            <div class="alert-content">
                <div class="alert-header">
                    <h4 class="alert-title">${alert.title}</h4>
                    <div class="alert-time"><i class="fas fa-clock"></i> ${formatTimeAgo(alert.timestamp)}</div>
                </div>
                <p class="alert-description">${alert.description}</p>
                <div class="alert-meta">
                    ${alert.binId !== 'System' && alert.binId !== 'All' ? `<span class="alert-badge bin"><i class="fas fa-robot"></i> ${alert.binId}</span>` : ''}
                    ${alert.location !== 'System' ? `<span class="alert-badge location"><i class="fas fa-map-marker-alt"></i> ${alert.location}</span>` : ''}
                    ${alert.priority !== 'Low' ? `<span class="alert-badge priority"><i class="fas fa-flag"></i> ${alert.priority} Priority</span>` : ''}
                </div>
                ${alert.status === 'active' ? `
                <div class="alert-actions" onclick="event.stopPropagation()">
                    <button class="alert-action-btn primary" onclick="acknowledgeAlertQuick('${alert.id}')"><i class="fas fa-check"></i> Acknowledge</button>
                    <button class="alert-action-btn success" onclick="resolveAlertQuick('${alert.id}')"><i class="fas fa-check-double"></i> Resolve</button>
                </div>` : ''}
            </div>
        </div>
    `).join('');
}

function getAlertIcon(type) {
    return { critical: 'exclamation-circle', warning: 'exclamation-triangle', info: 'info-circle', success: 'check-circle' }[type] || 'bell';
}

function formatTimeAgo(timestamp) {
    const diff = Math.floor((new Date() - new Date(timestamp)) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
}

function updateSectionCount(elementId, count) {
    const el = document.getElementById(elementId);
    if (el) el.textContent = count;
}

// Show alert details modal
function showAlertDetails(alertId) {
    const alert = localAlertsData.find(a => a.id === alertId);
    if (!alert) return;
    selectedAlertId = alertId;
    alert.unread = false;

    const modalBody = document.getElementById('alertModalBody');
    if (!modalBody) return;
    modalBody.innerHTML = `
        <div class="detail-section">
            <h3><i class="fas fa-info-circle"></i> Alert Information</h3>
            <div class="detail-grid">
                <div class="detail-item"><div class="detail-label">Alert ID</div><div class="detail-value">${alert.id}</div></div>
                <div class="detail-item"><div class="detail-label">Type</div><div class="detail-value"><span class="alert-badge ${alert.type}">${capitalizeFirst(alert.type)}</span></div></div>
                <div class="detail-item"><div class="detail-label">Priority</div><div class="detail-value">${alert.priority}</div></div>
                <div class="detail-item"><div class="detail-label">Status</div><div class="detail-value">${capitalizeFirst(alert.status)}</div></div>
                <div class="detail-item"><div class="detail-label">Bin ID</div><div class="detail-value">${alert.binId}</div></div>
                <div class="detail-item"><div class="detail-label">Time</div><div class="detail-value">${formatDateTime(alert.timestamp)}</div></div>
            </div>
        </div>
        <div class="detail-section">
            <h3><i class="fas fa-align-left"></i> Description</h3>
            <p style="color:#4b5563;line-height:1.6;">${alert.description}</p>
        </div>
    `;
    document.getElementById('alertModal').classList.add('show');
}

function formatDateTime(date) {
    return new Date(date).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function capitalizeFirst(str) { return str.charAt(0).toUpperCase() + str.slice(1); }

function closeModal() {
    const m = document.getElementById('alertModal');
    if (m) m.classList.remove('show');
    renderAlerts();
}

// Acknowledge / Resolve from modal
function acknowledgeAlert() {
    if (!selectedAlertId) return;
    const alert = localAlertsData.find(a => a.id === selectedAlertId);
    if (alert) { alert.status = 'acknowledged'; alert.unread = false; }
    closeModal();
    showNotification('Alert acknowledged successfully', 'success');
}

function resolveAlert() {
    if (!selectedAlertId) return;
    const alert = localAlertsData.find(a => a.id === selectedAlertId);
    if (alert) { alert.status = 'resolved'; }
    closeModal();
    showNotification('Alert resolved successfully', 'success');
}

// Quick actions
function acknowledgeAlertQuick(alertId) {
    const alert = localAlertsData.find(a => a.id === alertId);
    if (alert) { alert.status = 'acknowledged'; alert.unread = false; }
    renderAlerts();
    showNotification('Alert acknowledged', 'success');
}

function resolveAlertQuick(alertId) {
    const alert = localAlertsData.find(a => a.id === alertId);
    if (alert) { alert.status = 'resolved'; }
    renderAlerts();
    showNotification('Alert resolved', 'success');
}

function markAllAsRead() {
    localAlertsData.forEach(a => a.unread = false);
    renderAlerts();
    showNotification('All alerts marked as read', 'success');
}

async function refreshAlerts() {
    await fetchAndRenderAlerts();
    showNotification('Alerts refreshed', 'info');
}

// Stats
function updateAlertCounts() {
    const c = { critical: 0, warning: 0, info: 0 };
    localAlertsData.filter(a => a.status === 'active').forEach(a => { if (a.type in c) c[a.type]++; });
    const resolved = localAlertsData.filter(a => a.status === 'resolved').length;
    ['critical', 'warning', 'info'].forEach(t => {
        const el = document.getElementById(t + 'Count');
        if (el) el.textContent = c[t];
    });
    const rc = document.getElementById('resolvedCount');
    if (rc) rc.textContent = resolved;
}

function animateStats() {
    const critical = localAlertsData.filter(a => a.type === 'critical' && a.status === 'active').length;
    const warning  = localAlertsData.filter(a => a.type === 'warning'  && a.status === 'active').length;
    const info     = localAlertsData.filter(a => a.type === 'info'     && a.status === 'active').length;
    const resolved = localAlertsData.filter(a => a.status === 'resolved').length;
    animateValue('criticalCount', 0, critical, 1000);
    animateValue('warningCount',  0, warning,  1000);
    animateValue('infoCount',     0, info,     1000);
    animateValue('resolvedCount', 0, resolved, 1000);
}

function animateValue(id, start, end, duration) {
    const obj = document.getElementById(id);
    if (!obj) return;
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.textContent = Math.floor(progress * (end - start) + start);
        if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
}

function toggleSection(header) { header.closest('.alerts-section').classList.toggle('collapsed'); }
function openConfigModal() { const m = document.getElementById('configModal'); if (m) m.classList.add('show'); }
function closeConfigModal() { const m = document.getElementById('configModal'); if (m) m.classList.remove('show'); }
function saveSettings() { showNotification('Settings saved', 'success'); closeConfigModal(); }

function showNotification(message, type = 'info') { console.log(`[${type}] ${message}`); }

window.addEventListener('click', function (e) {
    if (e.target.id === 'alertModal') closeModal();
    if (e.target.id === 'configModal') closeConfigModal();
});

// ── Topbar ──
function toggleNotifications() {
    const d = document.getElementById('notificationsDropdown');
    if (d) d.classList.toggle('show');
}
function clearNotifications() {
    const l = document.querySelector('.notifications-list');
    if (l) l.innerHTML = '<div style="text-align:center;padding:20px;color:#6b7280;">No notifications</div>';
}
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const icon = document.getElementById('themeIcon');
    const isDark = document.body.classList.contains('dark-mode');
    if (icon) icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}
function exportAlerts() {
    const data = { exportDate: new Date().toISOString(), alerts: localAlertsData };
    const uri = 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
    const a = document.createElement('a');
    a.href = uri; a.download = `alerts-export-${new Date().toISOString().split('T')[0]}.json`; a.click();
}
function showToast(title, message, type = 'info') {
    const c = document.getElementById('toastContainer'); if (!c) return;
    const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', warning: 'fa-exclamation-triangle', info: 'fa-info-circle' };
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.innerHTML = `<div class="toast-icon"><i class="fas ${icons[type]}"></i></div><div class="toast-content"><div class="toast-title">${title}</div><div class="toast-message">${message}</div></div><button class="toast-close" onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>`;
    c.appendChild(t);
    setTimeout(() => { t.style.animation = 'toastSlideOut 0.3s ease'; setTimeout(() => t.remove(), 300); }, 5000);
}

document.addEventListener('DOMContentLoaded', function () {
    if (window.location.pathname.includes('alerts.html')) initAlertsPage();
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') document.body.classList.add('dark-mode');
});