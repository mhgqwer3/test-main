// ============================================
// tracking.js - Connected to Smart Bins API
// ============================================

// ── Auth Guard ──
if (typeof API !== 'undefined' && !API.isLoggedIn()) {
    window.location.href = '/pages/login.html';
}

let map;
let markers     = {};
let binData     = [];
let currentFilter = 'all';
let currentSort   = 'id';
let selectedBinId = null;
let darkMode      = false;
let mapTileLayer  = null;

// Initialize Tracking Page
async function initTrackingPage() {
    console.log('Initializing Live Tracking...');
    loadThemePreference();
    initializeMap();
    await loadBinsData();
    setupFilterButtons();
    setupSearch();
    startAutoRefresh();
    setupEventListeners();
    simulateMovement();
}

function loadThemePreference() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        darkMode = true;
        document.body.classList.add('dark-mode');
        updateThemeIcon();
    }
}

function setupEventListeners() {
    document.addEventListener('click', function (e) {
        const dropdown = document.getElementById('notificationsDropdown');
        const btn = document.getElementById('notificationBtn');
        if (dropdown && btn && !dropdown.contains(e.target) && !btn.contains(e.target)) {
            dropdown.classList.remove('show');
        }
    });
    const modal = document.getElementById('binModal');
    if (modal) modal.addEventListener('click', function (e) { if (e.target === modal) closeBinModal(); });
}

// Initialize Leaflet Map
function initializeMap() {
    map = L.map('map').setView([31.0409, 31.3785], 13);
    updateMapTiles();
    console.log('✅ Map initialized');
}

function updateMapTiles() {
    if (mapTileLayer) map.removeLayer(mapTileLayer);
    mapTileLayer = L.tileLayer(
        darkMode
            ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
            : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        { attribution: '© OpenStreetMap contributors', maxZoom: 18 }
    ).addTo(map);
}

// ── Fetch bin GPS data from API ──
async function loadBinsData() {
    try {
        const res = await API.listBins();
        if (res.status === 'success') {
            binData = mapApiBinsToTracking(res.data);
        }
    } catch (e) {
        console.warn('Could not fetch bins from API:', e);
    }
    renderBinsOnMap();
    renderBinsList();
    updateStats();
}

// Map API bin fields → tracking UI format
function mapApiBinsToTracking(bins) {
    const statusMap = {
        operational: 'active',
        full:        'active',
        charging:    'idle',
        maintenance: 'idle',
        offline:     'offline'
    };
    return bins.map(bin => ({
        id:          bin.bin_code,
        status:      statusMap[bin.status] || 'idle',
        location:    bin.location_name || 'Unknown',
        lat:         parseFloat(bin.latitude)      || 31.0409 + (Math.random() - 0.5) * 0.05,
        lng:         parseFloat(bin.longitude)     || 31.3785 + (Math.random() - 0.5) * 0.05,
        fillLevel:   bin.fill_level    ?? 0,
        battery:     bin.battery_level ?? 0,
        speed:       0,
        lastUpdate:  new Date(bin.updated_at || Date.now())
    }));
}

// Render Bins on Map
function renderBinsOnMap() {
    Object.values(markers).forEach(m => map.removeLayer(m));
    markers = {};

    binData.forEach(bin => {
        const iconColor  = getStatusColor(bin.status);
        const borderColor = darkMode ? '#1a1f3a' : 'white';

        const icon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="background:${iconColor};width:32px;height:32px;border-radius:50%;border:3px solid ${borderColor};box-shadow:0 3px 12px rgba(0,0,0,${darkMode ? '0.5' : '0.3'});display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:12px;">${bin.id.split('-')[1] || '?'}</div>`,
            iconSize: [32, 32], iconAnchor: [16, 16]
        });

        const marker = L.marker([bin.lat, bin.lng], { icon })
            .addTo(map)
            .bindPopup(createPopupContent(bin), { className: 'custom-popup' });

        markers[bin.id] = marker;
        marker.on('click', () => highlightBinCard(bin.id));
    });
}

function createPopupContent(bin) {
    return `
        <div class="popup-header"><i class="fas fa-robot"></i><span class="popup-title">${bin.id}</span></div>
        <div class="popup-info">
            <div class="popup-info-item"><span>Status:</span><strong style="color:${getStatusColor(bin.status)};">${bin.status.toUpperCase()}</strong></div>
            <div class="popup-info-item"><span>Location:</span><strong>${bin.location}</strong></div>
            <div class="popup-info-item"><span>Fill Level:</span><strong>${bin.fillLevel}%</strong></div>
            <div class="popup-info-item"><span>Battery:</span><strong>${bin.battery}%</strong></div>
            <div class="popup-info-item"><span>Speed:</span><strong>${bin.speed} km/h</strong></div>
        </div>`;
}

// Render Bins List
function renderBinsList() {
    const binsList = document.getElementById('binsList');
    if (!binsList) return;

    let filtered = binData.filter(b => currentFilter === 'all' || b.status === currentFilter);
    filtered = sortBinsArray(filtered, currentSort);

    if (filtered.length === 0) {
        binsList.innerHTML = `<div class="empty-state"><i class="fas fa-inbox"></i><p>No bins found</p></div>`;
        return;
    }

    binsList.innerHTML = filtered.map(bin => `
        <div class="bin-card" data-bin-id="${bin.id}" data-status="${bin.status}">
            <div class="bin-card-header">
                <div class="bin-id"><i class="fas fa-robot"></i><span>${bin.id}</span></div>
                <span class="status-badge ${bin.status}"><i class="fas fa-${getStatusIcon(bin.status)}"></i>${bin.status.charAt(0).toUpperCase() + bin.status.slice(1)}</span>
            </div>
            <div class="bin-card-body">
                <div class="bin-info-row"><div class="info-item"><i class="fas fa-map-marker-alt"></i><span>${bin.location}</span></div></div>
                <div class="bin-info-row">
                    <div class="info-item"><i class="fas fa-fill"></i><span>Fill: <strong>${bin.fillLevel}%</strong></span></div>
                    <div class="info-item"><i class="fas fa-battery-${getBatteryIcon(bin.battery)}"></i><span>Battery: <strong>${bin.battery}%</strong></span></div>
                </div>
                <div class="bin-info-row">
                    <div class="info-item"><i class="fas fa-gauge-high"></i><span>Speed: <strong>${bin.speed} km/h</strong></span></div>
                    <div class="info-item"><i class="fas fa-clock"></i><span>Updated: <strong>${formatTimeAgo(bin.lastUpdate)}</strong></span></div>
                </div>
            </div>
            <div class="bin-card-footer">
                <button class="action-btn" onclick="focusBin('${bin.id}')"><i class="fas fa-location-arrow"></i>Locate</button>
                <button class="action-btn" onclick="viewBinDetails('${bin.id}')"><i class="fas fa-info-circle"></i>Details</button>
            </div>
        </div>
    `).join('');

    const bc = document.getElementById('binsCount');
    if (bc) bc.textContent = filtered.length;
}

function sortBinsArray(bins, sortBy) {
    return bins.sort((a, b) => {
        switch (sortBy) {
            case 'fill':    return b.fillLevel - a.fillLevel;
            case 'battery': return b.battery   - a.battery;
            case 'status':  return a.status.localeCompare(b.status);
            default:        return a.id.localeCompare(b.id);
        }
    });
}

function sortBins() {
    const s = document.getElementById('sortSelect');
    if (s) { currentSort = s.value; renderBinsList(); }
}

function updateStats() {
    const active  = binData.filter(b => b.status === 'active').length;
    const moving  = binData.filter(b => b.status === 'moving').length;
    const idle    = binData.filter(b => b.status === 'idle').length;
    const offline = binData.filter(b => b.status === 'offline').length;

    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    set('activeBinsCount',  active + moving + idle);
    set('movingBinsCount',  moving);
    set('idleBinsCount',    idle);
    set('offlineBinsCount', offline);
}

// Helpers
function getStatusColor(status) {
    return { active: '#66bb6a', moving: '#4873ff', idle: '#ffa726', offline: '#ff5252' }[status] || '#6b7280';
}
function getStatusIcon(status) {
    return { active: 'circle', moving: 'arrow-right', idle: 'pause', offline: 'circle-xmark' }[status] || 'circle';
}
function getBatteryIcon(b) { if (b >= 80) return 'full'; if (b >= 60) return 'three-quarters'; if (b >= 40) return 'half'; if (b >= 20) return 'quarter'; return 'empty'; }
function formatTimeAgo(date) {
    const diff = Math.floor((new Date() - new Date(date)) / 1000);
    if (diff < 60) return 'Just now'; if (diff < 3600) return `${Math.floor(diff/60)}m ago`; if (diff < 86400) return `${Math.floor(diff/3600)}h ago`; return `${Math.floor(diff/86400)}d ago`;
}

function focusBin(binId) {
    const bin = binData.find(b => b.id === binId);
    if (!bin) return;
    map.setView([bin.lat, bin.lng], 15, { animate: true, duration: 1 });
    if (markers[binId]) markers[binId].openPopup();
    highlightBinCard(binId);
    showToast(`Focused on ${binId}`, 'info');
}

function highlightBinCard(binId) {
    document.querySelectorAll('.bin-card').forEach(card => { card.style.border = '1px solid rgba(72,115,255,0.15)'; });
    const card = document.querySelector(`[data-bin-id="${binId}"]`);
    if (card) { card.style.border = '2px solid #4873ff'; card.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
}

function viewBinDetails(binId) {
    const bin = binData.find(b => b.id === binId);
    if (!bin) return;
    selectedBinId = binId;
    const modalBody = document.getElementById('binModalBody');
    if (!modalBody) return;
    modalBody.innerHTML = `
        <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:20px;margin-bottom:20px;">
            <div style="display:flex;flex-direction:column;gap:6px;"><span style="font-size:12px;color:#6b7280;font-weight:600;text-transform:uppercase;">Bin ID</span><span style="font-size:16px;color:#1a1f3a;font-weight:700;">${bin.id}</span></div>
            <div style="display:flex;flex-direction:column;gap:6px;"><span style="font-size:12px;color:#6b7280;font-weight:600;text-transform:uppercase;">Status</span><span class="status-badge ${bin.status}">${bin.status.toUpperCase()}</span></div>
            <div style="display:flex;flex-direction:column;gap:6px;"><span style="font-size:12px;color:#6b7280;font-weight:600;text-transform:uppercase;">Location</span><span style="font-size:14px;color:#1a1f3a;font-weight:600;">${bin.location}</span></div>
            <div style="display:flex;flex-direction:column;gap:6px;"><span style="font-size:12px;color:#6b7280;font-weight:600;text-transform:uppercase;">Last Update</span><span style="font-size:14px;color:#1a1f3a;font-weight:600;">${formatTimeAgo(bin.lastUpdate)}</span></div>
            <div style="display:flex;flex-direction:column;gap:6px;"><span style="font-size:12px;color:#6b7280;font-weight:600;text-transform:uppercase;">Fill Level</span><span style="font-size:14px;color:#1a1f3a;font-weight:600;">${bin.fillLevel}%</span></div>
            <div style="display:flex;flex-direction:column;gap:6px;"><span style="font-size:12px;color:#6b7280;font-weight:600;text-transform:uppercase;">Battery</span><span style="font-size:14px;color:#1a1f3a;font-weight:600;">${bin.battery}%</span></div>
            <div style="display:flex;flex-direction:column;gap:6px;"><span style="font-size:12px;color:#6b7280;font-weight:600;text-transform:uppercase;">Coordinates</span><span style="font-size:12px;color:#1a1f3a;font-weight:600;">${bin.lat.toFixed(4)}, ${bin.lng.toFixed(4)}</span></div>
        </div>`;
    document.getElementById('binModal').classList.add('show');
}

function closeBinModal() { document.getElementById('binModal').classList.remove('show'); selectedBinId = null; }
function trackBin() { if (selectedBinId) { closeBinModal(); focusBin(selectedBinId); } }
function centerMap() {
    if (!binData.length) return;
    map.fitBounds(L.latLngBounds(binData.map(b => [b.lat, b.lng])), { padding: [50, 50] });
}
function toggleFullscreen() {
    const mc = document.querySelector('.map-container');
    if (!document.fullscreenElement) { mc.requestFullscreen().then(() => setTimeout(() => map.invalidateSize(), 100)); }
    else { document.exitFullscreen().then(() => setTimeout(() => map.invalidateSize(), 100)); }
}
function toggleHeatmap() { showToast('Heatmap view coming soon!', 'info'); }

function setupFilterButtons() {
    document.querySelectorAll('.filter-btn[data-filter]').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn[data-filter]').forEach(b => b.classList.remove('active'));
            button.classList.add('active');
            currentFilter = button.getAttribute('data-filter');
            renderBinsList();
        });
    });
}

function setupSearch() {
    const si = document.getElementById('searchBin');
    if (!si) return;
    si.addEventListener('input', e => {
        const term = e.target.value.toLowerCase();
        document.querySelectorAll('.bin-card').forEach(card => {
            const id = card.getAttribute('data-bin-id').toLowerCase();
            card.style.display = (id.includes(term) || card.textContent.toLowerCase().includes(term)) ? 'block' : 'none';
        });
    });
}

async function refreshTracking() {
    await loadBinsData();
    showToast('Tracking data refreshed', 'success');
}

function startAutoRefresh() { setInterval(loadBinsData, 30000); }

// Simulate movement for bins with 'moving' status
function simulateMovement() {
    setInterval(() => {
        binData.forEach(bin => {
            if (bin.status === 'moving') {
                bin.lat += (Math.random() - 0.5) * 0.001;
                bin.lng += (Math.random() - 0.5) * 0.001;
                if (markers[bin.id]) markers[bin.id].setLatLng([bin.lat, bin.lng]);
            }
        });
    }, 5000);
}

// Topbar
function toggleNotifications() { const d = document.getElementById('notificationsDropdown'); if (d) d.classList.toggle('show'); }
function clearNotifications() { const l = document.querySelector('.notifications-list'); if (l) l.innerHTML = '<div class="empty-state"><i class="fas fa-bell"></i><p>No notifications</p></div>'; }

function toggleTheme() {
    darkMode = !darkMode;
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    updateThemeIcon();
    updateMapTiles();
    renderBinsOnMap();
    showToast(darkMode ? 'Dark mode enabled' : 'Light mode enabled', 'success');
}

function updateThemeIcon() {
    const ti = document.getElementById('themeIcon');
    if (ti) ti.className = darkMode ? 'fas fa-sun' : 'fas fa-moon';
}

function exportBinsData() {
    const csv = convertToCSV(binData);
    downloadCSV(csv, 'bins-tracking-data.csv');
    showToast('Data exported successfully', 'success');
}

function convertToCSV(data) {
    const headers = ['Bin ID', 'Status', 'Location', 'Fill Level', 'Battery', 'Speed', 'Last Update'];
    const rows = data.map(b => [b.id, b.status, b.location, b.fillLevel + '%', b.battery + '%', b.speed + ' km/h', b.lastUpdate.toLocaleString()]);
    return [headers, ...rows].map(r => r.join(',')).join('\n');
}

function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a'); a.setAttribute('hidden', ''); a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const icon = { success: 'check-circle', error: 'exclamation-circle', info: 'info-circle', warning: 'exclamation-triangle' }[type] || 'info-circle';
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fas fa-${icon}"></i><span class="toast-message">${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => { toast.style.animation = 'slideOutRight .3s ease'; setTimeout(() => toast.remove(), 300); }, 3000);
}

document.addEventListener('DOMContentLoaded', function () {
    if (window.location.pathname.includes('tracking.html')) initTrackingPage();
});

window.addEventListener('resize', () => { if (map) setTimeout(() => map.invalidateSize(), 100); });