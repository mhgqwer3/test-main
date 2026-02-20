// ============================================
// carts.js - Connected to Smart Bins API
// ============================================

// ── Auth Guard ──
if (typeof API !== 'undefined' && !API.isLoggedIn()) {
    window.location.href = '/GraduationProject/pages/login.html';
}

let cartsData = [];
let currentView = 'grid';
let currentFilters = { status: 'all', zone: 'all', search: '' };

// Initialize Carts Page
async function initCartsPage() {
    console.log('✅ Initializing Carts Management...');
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        const ti = document.getElementById('cartsThemeIcon');
        if (ti) ti.className = 'fas fa-sun';
    }
    const vi = document.getElementById('cartsViewIcon');
    if (vi) vi.className = currentView === 'grid' ? 'fas fa-th-large' : 'fas fa-list';

    await loadCartsData();
    setupSearch();
    animateStats();
}

// ── Fetch bins from API ──
async function loadCartsData() {
    try {
        const res = await API.listBins();
        if (res.status === 'success') {
            cartsData = mapBinsToCartsFormat(res.data);
        } else {
            console.warn('API returned error, falling back to empty list');
            cartsData = [];
        }
    } catch (e) {
        console.error('Failed to load bins:', e);
        cartsData = [];
    }
    renderCarts();
    updateStats();
}

// Map API bin fields → carts UI format
function mapBinsToCartsFormat(bins) {
    return bins.map(bin => ({
        id:          bin.bin_code,
        status:      bin.status || 'operational',
        zone:        bin.zone   || 'zone-a',
        location:    bin.location_name || 'Unknown',
        fillLevel:   bin.fill_level    ?? 0,
        battery:     bin.battery_level ?? 0,
        capacity:    bin.capacity      ?? 120,
        trips:       bin.total_trips   ?? 0,
        distance:    bin.total_distance ?? 0,
        uptime:      bin.uptime        ?? 100,
        lastService: bin.last_service  || 'N/A',
        nextService: bin.next_service  || 'N/A',
    }));
}

// Setup Search
function setupSearch() {
    const searchInput = document.getElementById('searchCart');
    if (searchInput) searchInput.addEventListener('input', handleSearch);
}

function handleSearch() {
    const si = document.getElementById('searchCart');
    if (si) { currentFilters.search = si.value; renderCarts(); }
}

// Render Carts
function renderCarts() {
    const container = document.getElementById('cartsContainer');
    if (!container) return;

    let filtered = cartsData.filter(cart => {
        const matchStatus = currentFilters.status === 'all' || cart.status === currentFilters.status;
        const matchZone   = currentFilters.zone   === 'all' || cart.zone   === currentFilters.zone;
        const matchSearch =
            cart.id.toLowerCase().includes(currentFilters.search.toLowerCase()) ||
            cart.location.toLowerCase().includes(currentFilters.search.toLowerCase());
        return matchStatus && matchZone && matchSearch;
    });

    if (filtered.length === 0) {
        container.innerHTML = `
            <div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:#6b7280;">
                <i class="fas fa-inbox" style="font-size:64px;margin-bottom:20px;opacity:0.3;"></i>
                <h3 style="font-size:18px;margin-bottom:8px;color:#1a1f3a;">No Carts Found</h3>
                <p style="font-size:14px;margin:0;">Try adjusting your filters or search query</p>
            </div>`;
        return;
    }

    container.className = currentView === 'grid' ? 'carts-grid' : 'carts-list';
    container.innerHTML = filtered.map(cart => createCartCard(cart)).join('');
}

function createCartCard(cart) {
    const fillClass    = cart.fillLevel > 80 ? 'danger' : cart.fillLevel > 50 ? 'warning' : '';
    const batteryClass = cart.battery   < 20 ? 'danger' : cart.battery   < 50 ? 'warning' : '';
    const zoneLabel    = cart.zone ? cart.zone.split('-').pop().toUpperCase() : '-';

    return `
        <div class="cart-card" data-cart-id="${cart.id}">
            <div class="cart-card-header">
                <div class="cart-id-badge"><i class="fas fa-robot"></i><span>${cart.id}</span></div>
                <div class="cart-status-row">
                    <span class="cart-status-badge ${cart.status}"><i class="fas fa-circle"></i>${cart.status.toUpperCase()}</span>
                    <span class="cart-zone">Zone ${zoneLabel}</span>
                </div>
            </div>
            <div class="cart-card-body">
                <div class="progress-item">
                    <div class="progress-header">
                        <span class="progress-label"><i class="fas fa-fill-drip"></i>Fill Level</span>
                        <span class="progress-value">${cart.fillLevel}%</span>
                    </div>
                    <div class="progress-bar-container"><div class="progress-bar ${fillClass}" style="width:${cart.fillLevel}%"></div></div>
                </div>
                <div class="progress-item">
                    <div class="progress-header">
                        <span class="progress-label"><i class="fas fa-battery-three-quarters"></i>Battery</span>
                        <span class="progress-value">${cart.battery}%</span>
                    </div>
                    <div class="progress-bar-container"><div class="progress-bar ${batteryClass}" style="width:${cart.battery}%"></div></div>
                </div>
                <div class="cart-stats">
                    <div class="cart-stat"><span class="cart-stat-value">${cart.trips}</span><span class="cart-stat-label">Trips</span></div>
                    <div class="cart-stat"><span class="cart-stat-value">${cart.distance}</span><span class="cart-stat-label">KM</span></div>
                    <div class="cart-stat"><span class="cart-stat-value">${cart.uptime}%</span><span class="cart-stat-label">Uptime</span></div>
                </div>
            </div>
            <div class="cart-card-actions">
                <button class="action-btn" onclick="viewCartDetails('${cart.id}')" title="View Details"><i class="fas fa-eye"></i>View</button>
                <button class="action-btn" onclick="trackCart('${cart.id}')" title="Track Cart"><i class="fas fa-location-dot"></i>Track</button>
                <button class="action-btn" onclick="editCart('${cart.id}')" title="Edit Cart"><i class="fas fa-edit"></i>Edit</button>
            </div>
        </div>`;
}

// Update Stats
function updateStats() {
    const stats = {
        operational: cartsData.filter(c => c.status === 'operational').length,
        maintenance:  cartsData.filter(c => c.status === 'maintenance').length,
        charging:     cartsData.filter(c => c.status === 'charging').length,
        offline:      cartsData.filter(c => c.status === 'offline').length,
        total:        cartsData.length
    };
    ['operational', 'maintenance', 'charging', 'offline', 'total'].forEach(k => {
        animateValue(k + 'Count', 0, stats[k], 1000);
    });
}

function animateValue(id, start, end, duration) {
    const el = document.getElementById(id); if (!el) return;
    let startTimestamp = null;
    const step = (ts) => {
        if (!startTimestamp) startTimestamp = ts;
        const progress = Math.min((ts - startTimestamp) / duration, 1);
        el.textContent = Math.floor(progress * (end - start) + start);
        if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
}

function animateStats() { setTimeout(updateStats, 300); }

// Topbar
function toggleCartsTheme() {
    document.body.classList.toggle('dark-mode');
    const ti = document.getElementById('cartsThemeIcon');
    const isDark = document.body.classList.contains('dark-mode');
    if (ti) ti.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

function toggleCartNotifications() {
    const d = document.getElementById('notificationsDropdown');
    if (d) d.classList.toggle('show');
}

function clearCartNotifications() {
    const l = document.querySelector('.notifications-list');
    if (l) l.innerHTML = '<p style="text-align:center;padding:30px;color:#6b7280;">No notifications</p>';
}

function toggleTopbarView() {
    const nextView = currentView === 'grid' ? 'list' : 'grid';
    toggleView(nextView);
    const vi = document.getElementById('cartsViewIcon');
    if (vi) vi.className = nextView === 'grid' ? 'fas fa-th-large' : 'fas fa-list';
}

function toggleView(view) {
    currentView = view;
    document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.querySelector(`[data-view="${view}"]`);
    if (activeBtn) activeBtn.classList.add('active');
    renderCarts();
}

function filterCarts() {
    const sf = document.getElementById('statusFilter');
    const zf = document.getElementById('zoneFilter');
    if (sf) currentFilters.status = sf.value;
    if (zf) currentFilters.zone   = zf.value;
    renderCarts();
}

// View Cart Details (modal)
function viewCartDetails(cartId) {
    const cart = cartsData.find(c => c.id === cartId);
    if (!cart) return;
    const modal = document.getElementById('cartModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody  = document.getElementById('modalBody');
    if (!modal || !modalTitle || !modalBody) return;
    modalTitle.textContent = `${cart.id} - Details`;
    modalBody.innerHTML = `
        <div style="display:grid;gap:24px;">
            <div>
                <h3 style="margin:0 0 16px 0;color:#1a1f3a;font-size:16px;font-weight:700;display:flex;align-items:center;gap:8px;">
                    <i class="fas fa-info-circle" style="color:#4873ff;"></i>General Information
                </h3>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;font-size:14px;background:rgba(248,250,252,.5);padding:16px;border-radius:12px;">
                    <div><span style="color:#6b7280;">Status:</span><strong style="display:block;color:#1a1f3a;margin-top:4px;text-transform:capitalize;">${cart.status}</strong></div>
                    <div><span style="color:#6b7280;">Zone:</span><strong style="display:block;color:#1a1f3a;margin-top:4px;">${cart.zone.toUpperCase()}</strong></div>
                    <div style="grid-column:1/-1"><span style="color:#6b7280;">Location:</span><strong style="display:block;color:#1a1f3a;margin-top:4px;">${cart.location}</strong></div>
                    <div><span style="color:#6b7280;">Capacity:</span><strong style="display:block;color:#1a1f3a;margin-top:4px;">${cart.capacity}L</strong></div>
                    <div><span style="color:#6b7280;">Total Distance:</span><strong style="display:block;color:#1a1f3a;margin-top:4px;">${cart.distance} km</strong></div>
                </div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                <div style="background:rgba(72,115,255,.05);padding:16px;border-radius:12px;border:1px solid rgba(72,115,255,.1);">
                    <div style="font-size:12px;color:#6b7280;margin-bottom:8px;font-weight:600;text-transform:uppercase;">Fill Level</div>
                    <div style="font-size:28px;font-weight:700;color:#4873ff;">${cart.fillLevel}%</div>
                </div>
                <div style="background:rgba(102,187,106,.05);padding:16px;border-radius:12px;border:1px solid rgba(102,187,106,.1);">
                    <div style="font-size:12px;color:#6b7280;margin-bottom:8px;font-weight:600;text-transform:uppercase;">Battery</div>
                    <div style="font-size:28px;font-weight:700;color:#66bb6a;">${cart.battery}%</div>
                </div>
                <div style="background:rgba(255,167,38,.05);padding:16px;border-radius:12px;border:1px solid rgba(255,167,38,.1);">
                    <div style="font-size:12px;color:#6b7280;margin-bottom:8px;font-weight:600;text-transform:uppercase;">Total Trips</div>
                    <div style="font-size:28px;font-weight:700;color:#ffa726;">${cart.trips}</div>
                </div>
                <div style="background:rgba(156,39,176,.05);padding:16px;border-radius:12px;border:1px solid rgba(156,39,176,.1);">
                    <div style="font-size:12px;color:#6b7280;margin-bottom:8px;font-weight:600;text-transform:uppercase;">Uptime</div>
                    <div style="font-size:28px;font-weight:700;color:#9c27b0;">${cart.uptime}%</div>
                </div>
            </div>
            <div style="display:flex;gap:12px;margin-top:8px;">
                <button class="primary-btn" onclick="editCart('${cart.id}');closeModal();" style="flex:1;"><i class="fas fa-edit"></i> Edit Cart</button>
                <button class="secondary-btn" onclick="trackCart('${cart.id}');closeModal();" style="flex:1;"><i class="fas fa-map-marker-alt"></i> Track Location</button>
            </div>
        </div>`;
    modal.classList.add('active');
}

// Edit Cart – update bin status via API
async function editCart(cartId) {
    const newStatus = prompt(`Change status for ${cartId}:\n\nOptions: operational | maintenance | charging | offline`);
    if (!newStatus) return;
    const valid = ['operational', 'maintenance', 'charging', 'offline'];
    if (!valid.includes(newStatus.trim())) {
        showToast('Invalid status. Choose: ' + valid.join(' | '), 'warning');
        return;
    }
    const res = await API.updateBinStatus(cartId, newStatus.trim());
    if (res.status === 'success') {
        showToast(`${cartId} status updated to ${newStatus}`, 'success');
        await loadCartsData();
    } else {
        showToast('Update failed: ' + res.message, 'error');
    }
}

function trackCart(cartId) { window.location.href = `/pages/tracking.html?cart=${cartId}`; }

// Add New Cart Modal
function openAddCartModal() {
    const modal = document.getElementById('cartModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody  = document.getElementById('modalBody');
    if (!modal) return;
    modalTitle.textContent = 'Add New Cart';
    modalBody.innerHTML = `
        <form onsubmit="addNewCart(event)" style="display:grid;gap:16px;">
            <div><label style="display:block;margin-bottom:6px;color:#1a1f3a;font-weight:600;font-size:13px;">Cart ID</label>
            <input type="text" id="newCartId" placeholder="BIN-XXX" required style="width:100%;padding:12px;border:1px solid rgba(72,115,255,.2);border-radius:10px;font-size:14px;"></div>
            <div><label style="display:block;margin-bottom:6px;color:#1a1f3a;font-weight:600;font-size:13px;">Location</label>
            <input type="text" id="newCartLocation" placeholder="Enter location" required style="width:100%;padding:12px;border:1px solid rgba(72,115,255,.2);border-radius:10px;font-size:14px;"></div>
            <div style="display:flex;gap:12px;margin-top:8px;">
                <button type="submit" class="primary-btn" style="flex:1;"><i class="fas fa-plus"></i> Add Cart</button>
                <button type="button" class="secondary-btn" onclick="closeModal()" style="flex:1;">Cancel</button>
            </div>
        </form>`;
    modal.classList.add('active');
}

function addNewCart(event) {
    event.preventDefault();
    const newId  = document.getElementById('newCartId').value;
    const newLoc = document.getElementById('newCartLocation').value;
    cartsData.push({ id: newId, status: 'operational', zone: 'zone-a', location: newLoc, fillLevel: 0, battery: 100, capacity: 120, trips: 0, distance: 0, uptime: 100, lastService: new Date().toISOString().split('T')[0], nextService: '' });
    renderCarts();
    updateStats();
    closeModal();
    showToast(`Cart ${newId} added!`, 'success');
}

async function refreshCarts(button) {
    const btn  = button || null;
    const icon = btn ? btn.querySelector('i') : null;
    if (icon) icon.classList.add('fa-spin');
    await loadCartsData();
    if (icon) icon.classList.remove('fa-spin');
    showToast('Carts data refreshed', 'success');
}

function exportCarts() {
    if (!cartsData.length) { showToast('No carts to export', 'warning'); return; }
    const headers = ['Cart ID', 'Status', 'Zone', 'Location', 'Fill Level (%)', 'Battery (%)', 'Capacity (L)', 'Trips', 'Distance (km)', 'Uptime (%)'];
    const rows = cartsData.map(c => [c.id, c.status, c.zone, c.location, c.fillLevel, c.battery, c.capacity, c.trips, c.distance, c.uptime]);
    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `Carts_Export_${new Date().toISOString().split('T')[0]}.csv`; a.click();
    window.URL.revokeObjectURL(url);
    showToast(`Exported ${cartsData.length} carts to CSV`, 'success');
}

function showToast(message, type = 'info') {
    const colors = { success: '#66bb6a', error: '#ff5252', warning: '#ffa726', info: '#4873ff' };
    const icons  = { success: 'check-circle', error: 'times-circle', warning: 'exclamation-triangle', info: 'info-circle' };
    const toast = document.createElement('div');
    toast.style.cssText = `position:fixed;top:20px;right:20px;background:${colors[type]};color:white;padding:16px 24px;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.2);z-index:100000;display:flex;align-items:center;gap:12px;font-size:14px;font-weight:600;animation:slideInRight .3s ease-out;`;
    toast.innerHTML = `<i class="fas fa-${icons[type]}" style="font-size:20px;"></i><span>${message}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.animation = 'slideOutRight .3s ease-in'; setTimeout(() => toast.remove(), 300); }, 3000);
}

function closeModal() {
    const modal = document.getElementById('cartModal');
    if (modal) modal.classList.remove('active');
}

window.addEventListener('click', e => { const m = document.getElementById('cartModal'); if (e.target === m) closeModal(); });

const style = document.createElement('style');
style.textContent = `@keyframes slideInRight{from{transform:translateX(400px);opacity:0}to{transform:translateX(0);opacity:1}}@keyframes slideOutRight{from{transform:translateX(0);opacity:1}to{transform:translateX(400px);opacity:0}}`;
document.head.appendChild(style);

document.addEventListener('DOMContentLoaded', function () {
    if (window.location.pathname.includes('carts.html')) {
        initCartsPage();
        document.addEventListener('click', function (event) {
            const d = document.getElementById('notificationsDropdown');
            const b = document.getElementById('notificationBtn');
            if (d && b && !d.contains(event.target) && !b.contains(event.target)) d.classList.remove('show');
        });
    }
});