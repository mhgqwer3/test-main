// ============================================
// trips.js - Connected to Smart Bins API
// ============================================

// ── Auth Guard ──
if (typeof API !== 'undefined' && typeof API.isLoggedIn === 'function' && !API.isLoggedIn()) {
    window.location.href = '/pages/login.html';
}

let tripsDataLocal = [];
let currentFilter  = 'all';
let currentPage    = 1;
const itemsPerPage = 8;
let selectedTrips  = [];
let tripsViewMode  = 'table';

// Initialize page
async function initTripsPage() {
    console.log('Initializing Trips & Logs page...');

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        const ti = document.getElementById('tripsThemeIcon');
        if (ti) ti.className = 'fas fa-sun';
    }

    const savedView = localStorage.getItem('tripsViewMode');
    if (savedView === 'compact') {
        tripsViewMode = 'compact';
        document.body.classList.add('trips-compact-view');
    }
    const vi = document.getElementById('tripsViewIcon');
    if (vi) vi.className = tripsViewMode === 'compact' ? 'fas fa-table' : 'fas fa-th-large';

    await fetchTrips();
    setupEventListeners();
    updatePagination();
    animateStats();
}

// ── Fetch trips from API ──
async function fetchTrips() {
    try {
        const res = await API.listTrips('all');
        if (res.status === 'success') {
            tripsDataLocal = mapApiTrips(res.data);
        }
    } catch (e) {
        console.warn('Could not fetch trips from API:', e);
        tripsDataLocal = [];
    }
    renderTripsTable();
    updatePagination();
}

// Map API trip fields → frontend format
function mapApiTrips(trips) {
    return trips.map(t => ({
        id:           t.trip_code || t.trip_id?.toString(),
        binId:        t.bin_code  || 'N/A',
        routeFrom:    t.start_location || 'N/A',
        routeTo:      t.end_location   || 'Collection Center',
        startTime:    t.start_time,
        endTime:      t.end_time || null,
        duration:     t.duration_minutes || calcDuration(t.start_time, t.end_time),
        distance:     parseFloat(t.distance_km || 0).toFixed(1),
        fillLevel:    t.fill_level_start ?? 0,
        status:       t.status || 'completed',
        batteryStart: t.battery_start ?? 100,
        batteryEnd:   t.battery_end   ?? 100,
        wasteCollected: t.waste_collected_kg ?? 0,
        events: t.events ? parseEvents(t.events) : []
    }));
}

function parseEvents(events) {
    if (typeof events === 'string') {
        try {
            return JSON.parse(events);
        } catch (e) {
            console.warn('Failed to parse events:', e);
            return [];
        }
    }
    return Array.isArray(events) ? events : [];
}

function calcDuration(start, end) {
    if (!start || !end) return 0;
    return Math.round((new Date(end) - new Date(start)) / 60000);
}

function escapeHtml(text) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(text).replace(/[&<>"']/g, m => map[m]);
}

// Setup event listeners
function setupEventListeners() {
    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.addEventListener('click', function () {
            document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.filter;
            currentPage = 1;
            renderTripsTable();
            updatePagination();
        });
    });

    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.addEventListener('input', function () { currentPage = 1; renderTripsTable(this.value); updatePagination(); });

    const binFilter  = document.getElementById('binFilter');
    if (binFilter) binFilter.addEventListener('change', () => { currentPage = 1; renderTripsTable(); updatePagination(); });

    const selectAll = document.getElementById('selectAll');
    if (selectAll) selectAll.addEventListener('change', function () {
        document.querySelectorAll('.trips-table tbody input[type="checkbox"]').forEach(cb => cb.checked = this.checked);
    });
}

function getFilteredTrips(searchQuery = '') {
    let filtered = tripsDataLocal.filter(trip => {
        if (currentFilter !== 'all' && trip.status !== currentFilter) return false;
        const bf = document.getElementById('binFilter');
        if (bf && bf.value !== 'all' && trip.binId.toLowerCase() !== bf.value) return false;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            return trip.id.toLowerCase().includes(q) || trip.binId.toLowerCase().includes(q) ||
                   trip.routeFrom.toLowerCase().includes(q) || trip.routeTo.toLowerCase().includes(q);
        }
        return true;
    });
    return filtered;
}

function renderTripsTable(searchQuery = '') {
    const tableBody = document.getElementById('tripsTableBody');
    if (!tableBody) return;
    const filteredTrips = getFilteredTrips(searchQuery);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const pageData   = filteredTrips.slice(startIndex, startIndex + itemsPerPage);

    const ss = document.getElementById('showingStart');
    const se = document.getElementById('showingEnd');
    const tr = document.getElementById('totalRecords');
    if (ss) ss.textContent = filteredTrips.length > 0 ? startIndex + 1 : 0;
    if (se) se.textContent = Math.min(startIndex + itemsPerPage, filteredTrips.length);
    if (tr) tr.textContent = filteredTrips.length;

    if (pageData.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="10" style="text-align:center;padding:40px;color:#6b7280;"><i class="fas fa-inbox" style="font-size:48px;margin-bottom:16px;opacity:0.3;"></i><div>No trips found</div></td></tr>`;
        return;
    }

    tableBody.innerHTML = pageData.map(trip => `
        <tr>
            <td><input type="checkbox" ${selectedTrips.includes(trip.id) ? 'checked' : ''} onchange="toggleTripSelection('${escapeHtml(trip.id)}')"></td>
            <td><span class="trip-id" onclick="showTripDetails('${escapeHtml(trip.id)}')">${escapeHtml(trip.id)}</span></td>
            <td><span class="bin-badge"><i class="fas fa-robot"></i>${trip.binId}</span></td>
            <td>
                <div class="route-info">
                    <div class="route-from"><i class="fas fa-circle"></i>${trip.routeFrom}</div>
                    <div class="route-to"><i class="fas fa-arrow-down"></i>${trip.routeTo}</div>
                </div>
            </td>
            <td>${formatDateTime(trip.startTime)}</td>
            <td><span class="duration-badge"><i class="fas fa-clock"></i>${trip.duration} min</span></td>
            <td><span class="distance-badge"><i class="fas fa-road"></i>${trip.distance} km</span></td>
            <td>
                <div class="fill-progress">
                    <div class="fill-progress-bar"><div class="fill-progress-fill" style="width:${trip.fillLevel}%"></div></div>
                    <div class="fill-progress-text">${trip.fillLevel}%</div>
                </div>
            </td>
            <td><span class="trip-status ${trip.status}"><i class="fas fa-${getStatusIcon(trip.status)}"></i>${capitalizeFirst(trip.status)}</span></td>
            <td>
                <div class="trip-actions">
                    <button class="action-icon-btn" onclick="showTripDetails('${trip.id}')" title="View Details"><i class="fas fa-eye"></i></button>
                    <button class="action-icon-btn" onclick="downloadTripReport('${trip.id}')" title="Download Report"><i class="fas fa-download"></i></button>
                </div>
            </td>
        </tr>
    `).join('');
}

function toggleTripSelection(tripId) {
    if (selectedTrips.includes(tripId)) selectedTrips = selectedTrips.filter(id => id !== tripId);
    else selectedTrips.push(tripId);
}

function updatePagination() {
    const container = document.getElementById('paginationContainer');
    if (!container) return;
    const total = Math.ceil(getFilteredTrips().length / itemsPerPage);
    if (total <= 1) { container.innerHTML = ''; return; }

    let html = `<button class="page-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})"><i class="fas fa-chevron-left"></i></button>`;
    for (let i = Math.max(1, currentPage - 2); i <= Math.min(total, currentPage + 2); i++) {
        html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
    }
    html += `<button class="page-btn" ${currentPage === total ? 'disabled' : ''} onclick="changePage(${currentPage + 1})"><i class="fas fa-chevron-right"></i></button>`;
    container.innerHTML = html;
}

function changePage(page) {
    const total = Math.ceil(getFilteredTrips().length / itemsPerPage);
    if (page < 1 || page > total) return;
    currentPage = page;
    renderTripsTable();
    updatePagination();
}

function getStatusIcon(status) {
    return { completed: 'check-circle', active: 'spinner fa-spin', failed: 'times-circle', pending: 'clock' }[status] || 'circle';
}
function capitalizeFirst(str) { return str.charAt(0).toUpperCase() + str.slice(1); }
function formatDateTime(dateStr) {
    return new Date(dateStr).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function showTripDetails(tripId) {
    const trip = tripsDataLocal.find(t => t.id === tripId);
    if (!trip) return;
    const modal     = document.getElementById('tripModal');
    const modalBody = document.getElementById('modalBody');
    if (!modal || !modalBody) return;

    modalBody.innerHTML = `
        <div class="detail-grid">
            <div class="detail-item"><div class="detail-label">Trip ID</div><div class="detail-value">${trip.id}</div></div>
            <div class="detail-item"><div class="detail-label">Bin ID</div><div class="detail-value"><span class="bin-badge"><i class="fas fa-robot"></i>${trip.binId}</span></div></div>
            <div class="detail-item"><div class="detail-label">Start Time</div><div class="detail-value">${formatDateTime(trip.startTime)}</div></div>
            <div class="detail-item"><div class="detail-label">End Time</div><div class="detail-value">${trip.endTime ? formatDateTime(trip.endTime) : 'In Progress'}</div></div>
            <div class="detail-item"><div class="detail-label">Duration</div><div class="detail-value">${trip.duration} min</div></div>
            <div class="detail-item"><div class="detail-label">Distance</div><div class="detail-value">${trip.distance} km</div></div>
            <div class="detail-item"><div class="detail-label">Fill Level</div><div class="detail-value">${trip.fillLevel}%</div></div>
            <div class="detail-item"><div class="detail-label">Status</div><div class="detail-value"><span class="trip-status ${trip.status}"><i class="fas fa-${getStatusIcon(trip.status)}"></i>${capitalizeFirst(trip.status)}</span></div></div>
            <div class="detail-item"><div class="detail-label">Battery Start</div><div class="detail-value">${trip.batteryStart}%</div></div>
            <div class="detail-item"><div class="detail-label">Battery End</div><div class="detail-value">${trip.batteryEnd}%</div></div>
            <div class="detail-item"><div class="detail-label">Waste Collected</div><div class="detail-value">${trip.wasteCollected} kg</div></div>
            <div class="detail-item"><div class="detail-label">Route From</div><div class="detail-value">${trip.routeFrom}</div></div>
        </div>
        ${trip.events && trip.events.length ? `
        <div class="timeline">
            <div class="timeline-title">Trip Timeline</div>
            ${trip.events.map(ev => `
                <div class="timeline-item">
                    <div class="timeline-icon"><i class="fas fa-check"></i></div>
                    <div class="timeline-content">
                        <div class="timeline-time">${ev.time}</div>
                        <div class="timeline-text">${ev.event}</div>
                    </div>
                </div>`).join('')}
        </div>` : ''}
    `;
    modal.classList.add('show');
}

function downloadTripReport(tripId) {
    const trip = tripsDataLocal.find(t => t.id === tripId);
    if (!trip) return;
    const report = `TRIP REPORT\n===========\nTrip ID: ${trip.id}\nBin ID: ${trip.binId}\nDate: ${formatDateTime(trip.startTime)}\n\nROUTE\n-----\nFrom: ${trip.routeFrom}\nTo: ${trip.routeTo}\nDistance: ${trip.distance} km\nDuration: ${trip.duration} min\n\nPERFORMANCE\n-----------\nFill Level: ${trip.fillLevel}%\nBattery: ${trip.batteryStart}% → ${trip.batteryEnd}%\nWaste Collected: ${trip.wasteCollected} kg\n\nSTATUS: ${trip.status.toUpperCase()}\n\nGenerated: ${new Date().toLocaleString()}`;
    const blob = new Blob([report], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${trip.id}_Report.txt`; a.click();
    window.URL.revokeObjectURL(url);
}

function closeModal() { const m = document.getElementById('tripModal'); if (m) m.classList.remove('show'); }
window.addEventListener('click', e => { const m = document.getElementById('tripModal'); if (e.target === m) closeModal(); });

function animateValue(id, start, end, duration) {
    const obj = document.getElementById(id); if (!obj) return;
    let startTimestamp = null;
    const step = (ts) => {
        if (!startTimestamp) startTimestamp = ts;
        const progress = Math.min((ts - startTimestamp) / duration, 1);
        obj.textContent = Math.floor(progress * (end - start) + start).toLocaleString();
        if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
}

function animateStats() {
    const completed = tripsDataLocal.filter(t => t.status === 'completed').length;
    const active    = tripsDataLocal.filter(t => t.status === 'active').length;
    animateValue('totalTrips',     0, tripsDataLocal.length, 1200);
    animateValue('completedTrips', 0, completed, 1200);
    animateValue('activeTrips',    0, active, 1000);
}

// Topbar
function toggleTripsTheme() {
    document.body.classList.toggle('dark-mode');
    const ti = document.getElementById('tripsThemeIcon');
    const isDark = document.body.classList.contains('dark-mode');
    if (ti) ti.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

function toggleTripsView() {
    const vi = document.getElementById('tripsViewIcon');
    if (tripsViewMode === 'table') {
        tripsViewMode = 'compact'; document.body.classList.add('trips-compact-view');
        if (vi) vi.className = 'fas fa-table'; localStorage.setItem('tripsViewMode', 'compact');
    } else {
        tripsViewMode = 'table'; document.body.classList.remove('trips-compact-view');
        if (vi) vi.className = 'fas fa-th-large'; localStorage.setItem('tripsViewMode', 'table');
    }
}

function toggleTripsNotifications() { const d = document.getElementById('tripsNotificationsDropdown'); if (d) d.classList.toggle('show'); }
function clearTripsNotifications() { const l = document.querySelector('.notifications-list'); if (l) l.innerHTML = '<p style="text-align:center;padding:30px;color:#6b7280;">No notifications</p>'; }

async function refreshTrips(button) {
    const icon = button ? button.querySelector('i') : null;
    if (icon) icon.classList.add('fa-spin');
    await fetchTrips();
    animateStats();
    if (icon) icon.classList.remove('fa-spin');
    showToast('Trips refreshed successfully', 'success');
}

function exportToCSV() {
    const filtered = getFilteredTrips();
    if (!filtered.length) { alert('No trips to export'); return; }
    const headers = ['Trip ID', 'Bin ID', 'Route From', 'Route To', 'Start Time', 'Duration (min)', 'Distance (km)', 'Fill Level (%)', 'Status', 'Battery Start (%)', 'Battery End (%)', 'Waste (kg)'];
    const rows = filtered.map(t => [t.id, t.binId, t.routeFrom, t.routeTo, t.startTime, t.duration, t.distance, t.fillLevel, t.status, t.batteryStart, t.batteryEnd, t.wasteCollected]);
    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `Trips_${new Date().toISOString().split('T')[0]}.csv`; a.click();
    window.URL.revokeObjectURL(url);
    showToast(`Exported ${filtered.length} trips`, 'success');
}

function showToast(message, type = 'info') {
    const colors = { success: '#66bb6a', error: '#ff5252', warning: '#ffa726', info: '#4873ff' };
    const toast = document.createElement('div');
    toast.style.cssText = `position:fixed;top:20px;right:20px;background:${colors[type]};color:white;padding:16px 24px;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.2);z-index:100000;display:flex;align-items:center;gap:12px;font-size:14px;font-weight:600;animation:slideInRight .3s ease-out;`;
    toast.innerHTML = `<i class="fas fa-check-circle" style="font-size:20px;"></i><span>${message}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.animation = 'slideOutRight .3s ease-in'; setTimeout(() => toast.remove(), 300); }, 3000);
}

document.addEventListener('DOMContentLoaded', function () {
    if (window.location.pathname.includes('trips.html')) {
        initTripsPage();
        document.addEventListener('click', function (event) {
            const d = document.getElementById('tripsNotificationsDropdown');
            const b = document.getElementById('tripsNotificationBtn');
            if (d && b && !d.contains(event.target) && !b.contains(event.target)) d.classList.remove('show');
        });
    }
});

window.addEventListener('load', function () {
    if (window.location.pathname.includes('trips.html')) setTimeout(animateStats, 300);
});