// ============================================
// carts.js - Carts Management (Enhanced & Fixed)
// ============================================

let cartsData = [];
let currentView = 'grid';
let currentFilters = {
    status: 'all',
    zone: 'all',
    search: ''
};

// Initialize Carts Page
function initCartsPage() {
    console.log('✅ Initializing Carts Management...');
    
    // Load saved theme preference (shared with overview behavior)
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        const themeIcon = document.getElementById('cartsThemeIcon');
        if (themeIcon) {
            themeIcon.className = 'fas fa-sun';
        }
    }

    loadCartsData();
    setupSearch();
    animateStats();

    // Sync topbar view icon with current view
    const viewIcon = document.getElementById('cartsViewIcon');
    if (viewIcon) {
        viewIcon.className = currentView === 'grid' ? 'fas fa-th-large' : 'fas fa-list';
    }
}

// Sample Carts Data
function loadCartsData() {
    cartsData = [
        {
            id: 'BIN-001',
            status: 'operational',
            zone: 'zone-a',
            location: 'Al Gomhoria St, Mansoura',
            fillLevel: 85,
            battery: 72,
            capacity: 120,
            trips: 145,
            distance: 342,
            uptime: 98.5,
            lastService: '2024-01-15',
            nextService: '2024-02-15'
        },
        {
            id: 'BIN-002',
            status: 'charging',
            zone: 'zone-b',
            location: 'Al Mashaya Area, Mansoura',
            fillLevel: 45,
            battery: 35,
            capacity: 120,
            trips: 132,
            distance: 298,
            uptime: 97.2,
            lastService: '2024-01-10',
            nextService: '2024-02-10'
        },
        {
            id: 'BIN-003',
            status: 'operational',
            zone: 'zone-c',
            location: 'Toriel District, Mansoura',
            fillLevel: 92,
            battery: 88,
            capacity: 120,
            trips: 167,
            distance: 401,
            uptime: 99.1,
            lastService: '2024-01-20',
            nextService: '2024-02-20'
        },
        {
            id: 'BIN-004',
            status: 'maintenance',
            zone: 'zone-d',
            location: 'Al Matar Area, Mansoura',
            fillLevel: 0,
            battery: 0,
            capacity: 120,
            trips: 98,
            distance: 234,
            uptime: 85.3,
            lastService: '2024-01-05',
            nextService: '2024-01-28'
        },
        {
            id: 'BIN-005',
            status: 'operational',
            zone: 'zone-e',
            location: 'Mit Khamis, Mansoura',
            fillLevel: 68,
            battery: 80,
            capacity: 120,
            trips: 156,
            distance: 378,
            uptime: 96.8,
            lastService: '2024-01-18',
            nextService: '2024-02-18'
        },
        {
            id: 'BIN-006',
            status: 'operational',
            zone: 'zone-a',
            location: 'Al Hurriya Square, Mansoura',
            fillLevel: 55,
            battery: 65,
            capacity: 120,
            trips: 128,
            distance: 289,
            uptime: 94.5,
            lastService: '2024-01-12',
            nextService: '2024-02-12'
        },
        {
            id: 'BIN-007',
            status: 'charging',
            zone: 'zone-b',
            location: 'Talkha Entrance, Mansoura',
            fillLevel: 30,
            battery: 42,
            capacity: 120,
            trips: 141,
            distance: 325,
            uptime: 95.7,
            lastService: '2024-01-16',
            nextService: '2024-02-16'
        },
        {
            id: 'BIN-008',
            status: 'operational',
            zone: 'zone-c',
            location: 'Al Mashaya Corniche, Mansoura',
            fillLevel: 78,
            battery: 90,
            capacity: 120,
            trips: 173,
            distance: 412,
            uptime: 99.3,
            lastService: '2024-01-22',
            nextService: '2024-02-22'
        },
        {
            id: 'BIN-009',
            status: 'operational',
            zone: 'zone-d',
            location: 'University Campus, Mansoura',
            fillLevel: 88,
            battery: 75,
            capacity: 120,
            trips: 159,
            distance: 367,
            uptime: 97.9,
            lastService: '2024-01-14',
            nextService: '2024-02-14'
        },
        {
            id: 'BIN-010',
            status: 'operational',
            zone: 'zone-e',
            location: 'Industrial Zone, Mansoura',
            fillLevel: 95,
            battery: 82,
            capacity: 120,
            trips: 148,
            distance: 334,
            uptime: 98.2,
            lastService: '2024-01-17',
            nextService: '2024-02-17'
        },
        {
            id: 'BIN-011',
            status: 'maintenance',
            zone: 'zone-a',
            location: 'Old City Center, Mansoura',
            fillLevel: 0,
            battery: 0,
            capacity: 120,
            trips: 89,
            distance: 201,
            uptime: 82.4,
            lastService: '2024-01-08',
            nextService: '2024-01-30'
        },
        {
            id: 'BIN-012',
            status: 'operational',
            zone: 'zone-b',
            location: 'Al Mashaya Park, Mansoura',
            fillLevel: 72,
            battery: 77,
            capacity: 120,
            trips: 137,
            distance: 312,
            uptime: 96.1,
            lastService: '2024-01-19',
            nextService: '2024-02-19'
        }
    ];

    renderCarts();
    updateStats();
}

// Setup Search
function setupSearch() {
    const searchInput = document.getElementById('searchCart');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }
}

// Handle Search
function handleSearch() {
    const searchInput = document.getElementById('searchCart');
    if (searchInput) {
        currentFilters.search = searchInput.value;
        renderCarts();
    }
}

// Render Carts
function renderCarts() {
    const container = document.getElementById('cartsContainer');
    if (!container) return;

    // Apply filters
    let filteredCarts = cartsData.filter(cart => {
        const matchStatus = currentFilters.status === 'all' || cart.status === currentFilters.status;
        const matchZone = currentFilters.zone === 'all' || cart.zone === currentFilters.zone;
        const matchSearch = cart.id.toLowerCase().includes(currentFilters.search.toLowerCase()) ||
                          cart.location.toLowerCase().includes(currentFilters.search.toLowerCase());
        return matchStatus && matchZone && matchSearch;
    });

    if (filteredCarts.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #6b7280;">
                <i class="fas fa-inbox" style="font-size: 64px; margin-bottom: 20px; opacity: 0.3;"></i>
                <h3 style="font-size: 18px; margin-bottom: 8px; color: #1a1f3a;">No Carts Found</h3>
                <p style="font-size: 14px; margin: 0;">Try adjusting your filters or search query</p>
            </div>
        `;
        return;
    }

    container.className = currentView === 'grid' ? 'carts-grid' : 'carts-list';
    container.innerHTML = filteredCarts.map(cart => createCartCard(cart)).join('');
}

// Create Cart Card
function createCartCard(cart) {
    const fillClass = cart.fillLevel > 80 ? 'danger' : cart.fillLevel > 50 ? 'warning' : '';
    const batteryClass = cart.battery < 20 ? 'danger' : cart.battery < 50 ? 'warning' : '';

    return `
        <div class="cart-card" data-cart-id="${cart.id}">
            <div class="cart-card-header">
                <div class="cart-id-badge">
                    <i class="fas fa-robot"></i>
                    <span>${cart.id}</span>
                </div>
                <div class="cart-status-row">
                    <span class="cart-status-badge ${cart.status}">
                        <i class="fas fa-circle"></i>
                        ${cart.status.toUpperCase()}
                    </span>
                    <span class="cart-zone">Zone ${cart.zone.split('-')[1].toUpperCase()}</span>
                </div>
            </div>

            <div class="cart-card-body">
                <div class="progress-item">
                    <div class="progress-header">
                        <span class="progress-label">
                            <i class="fas fa-fill-drip"></i>
                            Fill Level
                        </span>
                        <span class="progress-value">${cart.fillLevel}%</span>
                    </div>
                    <div class="progress-bar-container">
                        <div class="progress-bar ${fillClass}" style="width: ${cart.fillLevel}%"></div>
                    </div>
                </div>

                <div class="progress-item">
                    <div class="progress-header">
                        <span class="progress-label">
                            <i class="fas fa-battery-three-quarters"></i>
                            Battery
                        </span>
                        <span class="progress-value">${cart.battery}%</span>
                    </div>
                    <div class="progress-bar-container">
                        <div class="progress-bar ${batteryClass}" style="width: ${cart.battery}%"></div>
                    </div>
                </div>

                <div class="cart-stats">
                    <div class="cart-stat">
                        <span class="cart-stat-value">${cart.trips}</span>
                        <span class="cart-stat-label">Trips</span>
                    </div>
                    <div class="cart-stat">
                        <span class="cart-stat-value">${cart.distance}</span>
                        <span class="cart-stat-label">KM</span>
                    </div>
                    <div class="cart-stat">
                        <span class="cart-stat-value">${cart.uptime}%</span>
                        <span class="cart-stat-label">Uptime</span>
                    </div>
                </div>
            </div>

            <div class="cart-card-actions">
                <button class="action-btn" onclick="viewCartDetails('${cart.id}')" title="View Details">
                    <i class="fas fa-eye"></i>
                    View
                </button>
                <button class="action-btn" onclick="trackCart('${cart.id}')" title="Track Cart">
                    <i class="fas fa-location-dot"></i>
                    Track
                </button>
                <button class="action-btn" onclick="editCart('${cart.id}')" title="Edit Cart">
                    <i class="fas fa-edit"></i>
                    Edit
                </button>
            </div>
        </div>
    `;
}

// Update Stats
function updateStats() {
    const stats = {
        operational: cartsData.filter(c => c.status === 'operational').length,
        maintenance: cartsData.filter(c => c.status === 'maintenance').length,
        charging: cartsData.filter(c => c.status === 'charging').length,
        offline: cartsData.filter(c => c.status === 'offline').length,
        total: cartsData.length
    };

    animateValue('operationalCount', 0, stats.operational, 1000);
    animateValue('maintenanceCount', 0, stats.maintenance, 1000);
    animateValue('chargingCount', 0, stats.charging, 1000);
    animateValue('offlineCount', 0, stats.offline, 1000);
    animateValue('totalCount', 0, stats.total, 1000);
}

// Animate Value
function animateValue(id, start, end, duration) {
    const element = document.getElementById(id);
    if (!element) return;

    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        element.textContent = value;
        
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// Animate Stats on Load
function animateStats() {
    setTimeout(() => {
        updateStats();
    }, 300);
}

// Toggle dark mode (for carts page)
function toggleCartsTheme() {
    document.body.classList.toggle('dark-mode');
    const themeIcon = document.getElementById('cartsThemeIcon');

    if (document.body.classList.contains('dark-mode')) {
        if (themeIcon) themeIcon.className = 'fas fa-sun';
        localStorage.setItem('theme', 'dark');
        showToast('Dark mode enabled', 'info');
    } else {
        if (themeIcon) themeIcon.className = 'fas fa-moon';
        localStorage.setItem('theme', 'light');
        showToast('Light mode disabled', 'info');
    }
}

// Toggle notifications dropdown (carts page)
function toggleCartNotifications() {
    const dropdown = document.getElementById('notificationsDropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

// Clear all notifications (carts page)
function clearCartNotifications() {
    const notificationsList = document.querySelector('.notifications-list');
    if (notificationsList) {
        notificationsList.innerHTML = '<p style="text-align: center; padding: 30px; color: #6b7280;">No notifications</p>';
    }
    showToast('All notifications cleared', 'success');
}

// Toggle grid/list view from topbar icon (wrapper around existing toggleView)
function toggleTopbarView() {
    const nextView = currentView === 'grid' ? 'list' : 'grid';
    toggleView(nextView);

    const viewIcon = document.getElementById('cartsViewIcon');
    if (viewIcon) {
        viewIcon.className = nextView === 'grid' ? 'fas fa-th-large' : 'fas fa-list';
    }
}

// Toggle View
function toggleView(view) {
    currentView = view;
    
    // Update buttons
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-view="${view}"]`).classList.add('active');
    
    // Re-render
    renderCarts();
}

// Filter Carts
function filterCarts() {
    const statusFilter = document.getElementById('statusFilter');
    const zoneFilter = document.getElementById('zoneFilter');
    
    if (statusFilter) currentFilters.status = statusFilter.value;
    if (zoneFilter) currentFilters.zone = zoneFilter.value;
    
    renderCarts();
}

// View Cart Details
function viewCartDetails(cartId) {
    const cart = cartsData.find(c => c.id === cartId);
    if (!cart) return;

    const modal = document.getElementById('cartModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    modalTitle.textContent = `${cart.id} - Details`;
    modalBody.innerHTML = `
        <div style="display: grid; gap: 24px;">
            <div>
                <h3 style="margin: 0 0 16px 0; color: #1a1f3a; font-size: 16px; font-weight: 700; display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-info-circle" style="color: #4873ff;"></i>
                    General Information
                </h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; font-size: 14px; background: rgba(248, 250, 252, 0.5); padding: 16px; border-radius: 12px;">
                    <div>
                        <span style="color: #6b7280; font-weight: 500;">Status:</span>
                        <strong style="display: block; color: #1a1f3a; margin-top: 4px; text-transform: capitalize;">${cart.status}</strong>
                    </div>
                    <div>
                        <span style="color: #6b7280; font-weight: 500;">Zone:</span>
                        <strong style="display: block; color: #1a1f3a; margin-top: 4px;">${cart.zone.toUpperCase()}</strong>
                    </div>
                    <div style="grid-column: 1/-1;">
                        <span style="color: #6b7280; font-weight: 500;">Location:</span>
                        <strong style="display: block; color: #1a1f3a; margin-top: 4px;">${cart.location}</strong>
                    </div>
                    <div>
                        <span style="color: #6b7280; font-weight: 500;">Capacity:</span>
                        <strong style="display: block; color: #1a1f3a; margin-top: 4px;">${cart.capacity}L</strong>
                    </div>
                    <div>
                        <span style="color: #6b7280; font-weight: 500;">Total Distance:</span>
                        <strong style="display: block; color: #1a1f3a; margin-top: 4px;">${cart.distance} km</strong>
                    </div>
                </div>
            </div>

            <div>
                <h3 style="margin: 0 0 16px 0; color: #1a1f3a; font-size: 16px; font-weight: 700; display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-chart-line" style="color: #66bb6a;"></i>
                    Performance Metrics
                </h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <div style="background: rgba(72, 115, 255, 0.05); padding: 16px; border-radius: 12px; border: 1px solid rgba(72, 115, 255, 0.1);">
                        <div style="font-size: 12px; color: #6b7280; margin-bottom: 8px; font-weight: 600; text-transform: uppercase;">Fill Level</div>
                        <div style="font-size: 28px; font-weight: 700; color: #4873ff;">${cart.fillLevel}%</div>
                        <div style="height: 6px; background: rgba(72, 115, 255, 0.1); border-radius: 3px; margin-top: 8px; overflow: hidden;">
                            <div style="height: 100%; background: linear-gradient(90deg, #4873ff, #66bb6a); width: ${cart.fillLevel}%; border-radius: 3px;"></div>
                        </div>
                    </div>
                    <div style="background: rgba(102, 187, 106, 0.05); padding: 16px; border-radius: 12px; border: 1px solid rgba(102, 187, 106, 0.1);">
                        <div style="font-size: 12px; color: #6b7280; margin-bottom: 8px; font-weight: 600; text-transform: uppercase;">Battery</div>
                        <div style="font-size: 28px; font-weight: 700; color: #66bb6a;">${cart.battery}%</div>
                        <div style="height: 6px; background: rgba(102, 187, 106, 0.1); border-radius: 3px; margin-top: 8px; overflow: hidden;">
                            <div style="height: 100%; background: linear-gradient(90deg, #66bb6a, #4caf50); width: ${cart.battery}%; border-radius: 3px;"></div>
                        </div>
                    </div>
                    <div style="background: rgba(255, 167, 38, 0.05); padding: 16px; border-radius: 12px; border: 1px solid rgba(255, 167, 38, 0.1);">
                        <div style="font-size: 12px; color: #6b7280; margin-bottom: 8px; font-weight: 600; text-transform: uppercase;">Total Trips</div>
                        <div style="font-size: 28px; font-weight: 700; color: #ffa726;">${cart.trips}</div>
                    </div>
                    <div style="background: rgba(156, 39, 176, 0.05); padding: 16px; border-radius: 12px; border: 1px solid rgba(156, 39, 176, 0.1);">
                        <div style="font-size: 12px; color: #6b7280; margin-bottom: 8px; font-weight: 600; text-transform: uppercase;">Uptime</div>
                        <div style="font-size: 28px; font-weight: 700; color: #9c27b0;">${cart.uptime}%</div>
                    </div>
                </div>
            </div>

            <div>
                <h3 style="margin: 0 0 16px 0; color: #1a1f3a; font-size: 16px; font-weight: 700; display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-wrench" style="color: #ffa726;"></i>
                    Maintenance Schedule
                </h3>
                <div style="background: rgba(248, 250, 252, 0.5); padding: 16px; border-radius: 12px; display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <div>
                        <span style="color: #6b7280; font-size: 13px; font-weight: 500;">Last Service:</span>
                        <strong style="display: block; color: #1a1f3a; margin-top: 4px; font-size: 15px;">${cart.lastService}</strong>
                    </div>
                    <div>
                        <span style="color: #6b7280; font-size: 13px; font-weight: 500;">Next Service:</span>
                        <strong style="display: block; color: #1a1f3a; margin-top: 4px; font-size: 15px;">${cart.nextService}</strong>
                    </div>
                </div>
            </div>

            <div style="display: flex; gap: 12px; margin-top: 8px;">
                <button class="primary-btn" onclick="editCart('${cart.id}'); closeModal();" style="flex: 1;">
                    <i class="fas fa-edit"></i>
                    Edit Cart
                </button>
                <button class="secondary-btn" onclick="trackCart('${cart.id}'); closeModal();" style="flex: 1;">
                    <i class="fas fa-map-marker-alt"></i>
                    Track Location
                </button>
            </div>
        </div>
    `;

    modal.classList.add('active');
}

// Edit Cart
function editCart(cartId) {
    showToast(`Edit functionality for ${cartId} will be implemented`, 'info');
}

// Track Cart
function trackCart(cartId) {
    window.location.href = `/pages/tracking.html?cart=${cartId}`;
}

// Open Add Cart Modal
function openAddCartModal() {
    const modal = document.getElementById('cartModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    modalTitle.textContent = 'Add New Cart';
    modalBody.innerHTML = `
        <form onsubmit="addNewCart(event)" style="display: grid; gap: 16px;">
            <div>
                <label style="display: block; margin-bottom: 6px; color: #1a1f3a; font-weight: 600; font-size: 13px;">Cart ID</label>
                <input type="text" id="newCartId" placeholder="BIN-XXX" required 
                       style="width: 100%; padding: 12px; border: 1px solid rgba(72, 115, 255, 0.2); border-radius: 10px; font-size: 14px; transition: 0.3s;" 
                       onfocus="this.style.borderColor='#4873ff'; this.style.boxShadow='0 0 0 3px rgba(72, 115, 255, 0.1)';"
                       onblur="this.style.borderColor='rgba(72, 115, 255, 0.2)'; this.style.boxShadow='none';">
            </div>
            <div>
                <label style="display: block; margin-bottom: 6px; color: #1a1f3a; font-weight: 600; font-size: 13px;">Zone</label>
                <select id="newCartZone" required
                        style="width: 100%; padding: 12px; border: 1px solid rgba(72, 115, 255, 0.2); border-radius: 10px; font-size: 14px; cursor: pointer;">
                    <option value="">Select Zone</option>
                    <option value="zone-a">Zone A</option>
                    <option value="zone-b">Zone B</option>
                    <option value="zone-c">Zone C</option>
                    <option value="zone-d">Zone D</option>
                    <option value="zone-e">Zone E</option>
                </select>
            </div>
            <div>
                <label style="display: block; margin-bottom: 6px; color: #1a1f3a; font-weight: 600; font-size: 13px;">Location</label>
                <input type="text" id="newCartLocation" placeholder="Enter location" required
                       style="width: 100%; padding: 12px; border: 1px solid rgba(72, 115, 255, 0.2); border-radius: 10px; font-size: 14px;">
            </div>
            <div>
                <label style="display: block; margin-bottom: 6px; color: #1a1f3a; font-weight: 600; font-size: 13px;">Capacity (L)</label>
                <input type="number" id="newCartCapacity" value="120" required min="50" max="200"
                       style="width: 100%; padding: 12px; border: 1px solid rgba(72, 115, 255, 0.2); border-radius: 10px; font-size: 14px;">
            </div>
            <div style="display: flex; gap: 12px; margin-top: 8px;">
                <button type="submit" class="primary-btn" style="flex: 1;">
                    <i class="fas fa-plus"></i>
                    Add Cart
                </button>
                <button type="button" class="secondary-btn" onclick="closeModal()" style="flex: 1;">
                    Cancel
                </button>
            </div>
        </form>
    `;

    modal.classList.add('active');
}

// Add New Cart
function addNewCart(event) {
    event.preventDefault();
    
    const newCart = {
        id: document.getElementById('newCartId').value,
        status: 'operational',
        zone: document.getElementById('newCartZone').value,
        location: document.getElementById('newCartLocation').value,
        fillLevel: 0,
        battery: 100,
        capacity: parseInt(document.getElementById('newCartCapacity').value),
        trips: 0,
        distance: 0,
        uptime: 100,
        lastService: new Date().toISOString().split('T')[0],
        nextService: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0]
    };

    cartsData.push(newCart);
    renderCarts();
    updateStats();
    closeModal();
    
    showToast(`Cart ${newCart.id} added successfully!`, 'success');
}

// Refresh Carts
function refreshCarts(button) {
    // Support both inline onclick usage (refreshCarts(this)) and fallback to querying the button
    const btn = button || document.querySelector('.secondary-btn[onclick*="refreshCarts"]');
    const icon = btn ? btn.querySelector('i') : null;

    if (icon) {
        icon.classList.add('fa-spin');
    }

    setTimeout(() => {
        renderCarts();
        updateStats();
        if (icon) {
            icon.classList.remove('fa-spin');
        }
        showToast('Carts data refreshed', 'success');
    }, 1000);
}

// Export Carts
function exportCarts() {
    if (cartsData.length === 0) {
        showToast('No carts to export', 'warning');
        return;
    }

    // Create CSV
    const headers = ['Cart ID', 'Status', 'Zone', 'Location', 'Fill Level (%)', 'Battery (%)', 'Capacity (L)', 'Trips', 'Distance (km)', 'Uptime (%)', 'Last Service', 'Next Service'];
    
    const rows = cartsData.map(cart => [
        cart.id,
        cart.status,
        cart.zone,
        cart.location,
        cart.fillLevel,
        cart.battery,
        cart.capacity,
        cart.trips,
        cart.distance,
        cart.uptime,
        cart.lastService,
        cart.nextService
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Carts_Export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    showToast(`Exported ${cartsData.length} carts to CSV`, 'success');
}

// Show Toast
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    const colors = {
        success: '#66bb6a',
        error: '#ff5252',
        warning: '#ffa726',
        info: '#4873ff'
    };

    const icons = {
        success: 'check-circle',
        error: 'times-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };

    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type]};
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
        <i class="fas fa-${icons[type]}" style="font-size: 20px;"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// Close Modal
function closeModal() {
    const modal = document.getElementById('cartModal');
    modal.classList.remove('active');
}

// Close modal on outside click
window.addEventListener('click', (e) => {
    const modal = document.getElementById('cartModal');
    if (e.target === modal) {
        closeModal();
    }
});

// Add CSS animations
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

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('carts.html')) {
        initCartsPage();

        // Close notifications when clicking outside
        document.addEventListener('click', function(event) {
            const notificationsDropdown = document.getElementById('notificationsDropdown');
            const notificationBtn = document.getElementById('notificationBtn');
            
            if (notificationsDropdown && !notificationsDropdown.contains(event.target) && 
                notificationBtn && !notificationBtn.contains(event.target)) {
                notificationsDropdown.classList.remove('show');
            }
        });
    }
});