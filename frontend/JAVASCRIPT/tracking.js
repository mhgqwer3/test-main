// ============================================
// tracking.js - Enhanced with Dark Mode
// ============================================

let map;
let markers = {};
let binData = [];
let currentFilter = 'all';
let currentSort = 'id';
let selectedBinId = null;
let darkMode = false;
let mapTileLayer = null;

// Initialize Tracking Page
function initTrackingPage() {
    console.log('Initializing Enhanced Live Tracking...');
    loadThemePreference();
    initializeMap();
    loadBinsData();
    setupFilterButtons();
    setupSearch();
    startAutoRefresh();
    setupEventListeners();
}

// Load Theme Preference
function loadThemePreference() {
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme === 'true') {
        darkMode = true;
        document.body.classList.add('dark-mode');
        updateThemeIcon();
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Close notifications when clicking outside
    document.addEventListener('click', function(e) {
        const dropdown = document.getElementById('notificationsDropdown');
        const btn = document.getElementById('notificationBtn');
        if (dropdown && !dropdown.contains(e.target) && !btn.contains(e.target)) {
            dropdown.classList.remove('show');
        }
    });

    // Close modal when clicking outside
    const modal = document.getElementById('binModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeBinModal();
            }
        });
    }
}

// Initialize Leaflet Map
function initializeMap() {
    // Center on Mansoura, Egypt
    map = L.map('map').setView([31.0409, 31.3785], 13);

    // Add appropriate tile layer based on theme
    updateMapTiles();

    console.log('✅ Map initialized');
}

// Update Map Tiles for Dark Mode
function updateMapTiles() {
    // Remove existing tile layer
    if (mapTileLayer) {
        map.removeLayer(mapTileLayer);
    }

    // Add tile layer based on current theme
    if (darkMode) {
        // Dark map tiles
        mapTileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '© OpenStreetMap contributors, © CARTO',
            maxZoom: 18,
        }).addTo(map);
    } else {
        // Light map tiles
        mapTileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18,
        }).addTo(map);
    }
}

// Sample Bin Data
function loadBinsData() {
    binData = [
        {
            id: 'BIN-001',
            status: 'moving',
            location: 'Al Gomhoria St, Mansoura',
            lat: 31.0418,
            lng: 31.3775,
            fillLevel: 85,
            battery: 72,
            speed: 12,
            lastUpdate: new Date(Date.now() - 2 * 60000)
        },
        {
            id: 'BIN-002',
            status: 'active',
            location: 'Al Mashaya Area, Mansoura',
            lat: 31.0360,
            lng: 31.3805,
            fillLevel: 92,
            battery: 88,
            speed: 0,
            lastUpdate: new Date(Date.now() - 1 * 60000)
        },
        {
            id: 'BIN-003',
            status: 'idle',
            location: 'Toriel District, Mansoura',
            lat: 31.0530,
            lng: 31.3830,
            fillLevel: 45,
            battery: 55,
            speed: 0,
            lastUpdate: new Date(Date.now() - 5 * 60000)
        },
        {
            id: 'BIN-004',
            status: 'moving',
            location: 'Al Matar Area, Mansoura',
            lat: 31.0295,
            lng: 31.3655,
            fillLevel: 78,
            battery: 65,
            speed: 15,
            lastUpdate: new Date(Date.now() - 3 * 60000)
        },
        {
            id: 'BIN-005',
            status: 'active',
            location: 'Mit Khamis, Mansoura',
            lat: 31.0335,
            lng: 31.4020,
            fillLevel: 68,
            battery: 80,
            speed: 0,
            lastUpdate: new Date(Date.now() - 4 * 60000)
        },
        {
            id: 'BIN-006',
            status: 'idle',
            location: 'Al Hurriya Square, Mansoura',
            lat: 31.0435,
            lng: 31.3625,
            fillLevel: 35,
            battery: 45,
            speed: 0,
            lastUpdate: new Date(Date.now() - 8 * 60000)
        },
        {
            id: 'BIN-007',
            status: 'moving',
            location: 'Talkha Entrance, Mansoura',
            lat: 31.0620,
            lng: 31.3560,
            fillLevel: 88,
            battery: 70,
            speed: 10,
            lastUpdate: new Date(Date.now() - 2 * 60000)
        },
        {
            id: 'BIN-008',
            status: 'active',
            location: 'Industrial Zone, Mansoura',
            lat: 31.0205,
            lng: 31.3950,
            fillLevel: 95,
            battery: 90,
            speed: 0,
            lastUpdate: new Date(Date.now() - 1 * 60000)
        }
    ];

    renderBinsOnMap();
    renderBinsList();
    updateStats();
}

// Render Bins on Map
function renderBinsOnMap() {
    // Clear existing markers
    Object.values(markers).forEach(marker => map.removeLayer(marker));
    markers = {};

    binData.forEach(bin => {
        const iconColor = getStatusColor(bin.status);
        const borderColor = darkMode ? '#1a1f3a' : 'white';
        
        const icon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="
                background: ${iconColor};
                width: 32px;
                height: 32px;
                border-radius: 50%;
                border: 3px solid ${borderColor};
                box-shadow: 0 3px 12px rgba(0,0,0,${darkMode ? '0.5' : '0.3'});
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: 12px;
            ">${bin.id.split('-')[1]}</div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16]
        });

        const marker = L.marker([bin.lat, bin.lng], { icon })
            .addTo(map)
            .bindPopup(createPopupContent(bin), {
                className: 'custom-popup'
            });

        markers[bin.id] = marker;

        marker.on('click', () => {
            highlightBinCard(bin.id);
        });
    });

    console.log('✅ Bins rendered on map');
}

// Create Popup Content
function createPopupContent(bin) {
    return `
        <div class="popup-header">
            <i class="fas fa-robot"></i>
            <span class="popup-title">${bin.id}</span>
        </div>
        <div class="popup-info">
            <div class="popup-info-item">
                <span>Status:</span>
                <strong style="color: ${getStatusColor(bin.status)};">${bin.status.toUpperCase()}</strong>
            </div>
            <div class="popup-info-item">
                <span>Location:</span>
                <strong>${bin.location}</strong>
            </div>
            <div class="popup-info-item">
                <span>Fill Level:</span>
                <strong>${bin.fillLevel}%</strong>
            </div>
            <div class="popup-info-item">
                <span>Battery:</span>
                <strong>${bin.battery}%</strong>
            </div>
            <div class="popup-info-item">
                <span>Speed:</span>
                <strong>${bin.speed} km/h</strong>
            </div>
        </div>
    `;
}

// Render Bins List
function renderBinsList() {
    const binsList = document.getElementById('binsList');
    if (!binsList) return;

    // Apply filters and sorting
    let filteredBins = binData.filter(bin => {
        if (currentFilter === 'all') return true;
        return bin.status === currentFilter;
    });

    // Sort bins
    filteredBins = sortBinsArray(filteredBins, currentSort);

    if (filteredBins.length === 0) {
        binsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <p>No bins found with current filter</p>
            </div>
        `;
        return;
    }

    binsList.innerHTML = filteredBins.map(bin => `
        <div class="bin-card" data-bin-id="${bin.id}" data-status="${bin.status}">
            <div class="bin-card-header">
                <div class="bin-id">
                    <i class="fas fa-robot"></i>
                    <span>${bin.id}</span>
                </div>
                <span class="status-badge ${bin.status}">
                    <i class="fas fa-${getStatusIcon(bin.status)}"></i>
                    ${bin.status.charAt(0).toUpperCase() + bin.status.slice(1)}
                </span>
            </div>
            <div class="bin-card-body">
                <div class="bin-info-row">
                    <div class="info-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${bin.location}</span>
                    </div>
                </div>
                <div class="bin-info-row">
                    <div class="info-item">
                        <i class="fas fa-fill"></i>
                        <span>Fill: <strong>${bin.fillLevel}%</strong></span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-battery-${getBatteryIcon(bin.battery)}"></i>
                        <span>Battery: <strong>${bin.battery}%</strong></span>
                    </div>
                </div>
                <div class="bin-info-row">
                    <div class="info-item">
                        <i class="fas fa-gauge-high"></i>
                        <span>Speed: <strong>${bin.speed} km/h</strong></span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-clock"></i>
                        <span>Updated: <strong>${formatTimeAgo(bin.lastUpdate)}</strong></span>
                    </div>
                </div>
            </div>
            <div class="bin-card-footer">
                <button class="action-btn" onclick="focusBin('${bin.id}')">
                    <i class="fas fa-location-arrow"></i>
                    Locate
                </button>
                <button class="action-btn" onclick="viewBinDetails('${bin.id}')">
                    <i class="fas fa-info-circle"></i>
                    Details
                </button>
            </div>
        </div>
    `).join('');

    // Update bins count
    document.getElementById('binsCount').textContent = filteredBins.length;

    console.log('✅ Bins list rendered');
}

// Sort Bins Array
function sortBinsArray(bins, sortBy) {
    return bins.sort((a, b) => {
        switch(sortBy) {
            case 'fill':
                return b.fillLevel - a.fillLevel;
            case 'battery':
                return b.battery - a.battery;
            case 'status':
                return a.status.localeCompare(b.status);
            case 'id':
            default:
                return a.id.localeCompare(b.id);
        }
    });
}

// Sort Bins (triggered by select)
function sortBins() {
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        currentSort = sortSelect.value;
        renderBinsList();
        showToast('Bins sorted by ' + sortSelect.options[sortSelect.selectedIndex].text, 'info');
    }
}

// Update Stats
function updateStats() {
    const stats = {
        active: binData.filter(b => b.status === 'active').length,
        moving: binData.filter(b => b.status === 'moving').length,
        idle: binData.filter(b => b.status === 'idle').length,
        offline: 4
    };

    document.getElementById('activeBinsCount').textContent = stats.active + stats.moving + stats.idle;
    document.getElementById('movingBinsCount').textContent = stats.moving;
    document.getElementById('idleBinsCount').textContent = stats.idle;
    document.getElementById('offlineBinsCount').textContent = stats.offline;
}

// Helper Functions
function getStatusColor(status) {
    const colors = {
        active: '#66bb6a',
        moving: '#4873ff',
        idle: '#ffa726',
        offline: '#ff5252'
    };
    return colors[status] || '#6b7280';
}

function getStatusIcon(status) {
    const icons = {
        active: 'circle',
        moving: 'arrow-right',
        idle: 'pause',
        offline: 'circle-xmark'
    };
    return icons[status] || 'circle';
}

function getBatteryIcon(battery) {
    if (battery >= 80) return 'full';
    if (battery >= 60) return 'three-quarters';
    if (battery >= 40) return 'half';
    if (battery >= 20) return 'quarter';
    return 'empty';
}

function formatTimeAgo(date) {
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

// Focus on Bin
function focusBin(binId) {
    const bin = binData.find(b => b.id === binId);
    if (!bin) return;

    map.setView([bin.lat, bin.lng], 15, {
        animate: true,
        duration: 1
    });

    if (markers[binId]) {
        markers[binId].openPopup();
    }

    highlightBinCard(binId);
    showToast(`Focused on ${binId}`, 'info');
}

// Highlight Bin Card
function highlightBinCard(binId) {
    document.querySelectorAll('.bin-card').forEach(card => {
        card.style.border = '1px solid rgba(72, 115, 255, 0.15)';
    });

    const card = document.querySelector(`[data-bin-id="${binId}"]`);
    if (card) {
        card.style.border = '2px solid #4873ff';
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// View Bin Details (Enhanced Modal)
function viewBinDetails(binId) {
    const bin = binData.find(b => b.id === binId);
    if (!bin) return;

    selectedBinId = binId;

    const modalBody = document.getElementById('binModalBody');
    modalBody.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 20px;">
            <div style="display: flex; flex-direction: column; gap: 6px;">
                <span style="font-size: 12px; color: #6b7280; font-weight: 600; text-transform: uppercase;">Bin ID</span>
                <span style="font-size: 16px; color: #1a1f3a; font-weight: 700;">${bin.id}</span>
            </div>
            <div style="display: flex; flex-direction: column; gap: 6px;">
                <span style="font-size: 12px; color: #6b7280; font-weight: 600; text-transform: uppercase;">Status</span>
                <span class="status-badge ${bin.status}">${bin.status.toUpperCase()}</span>
            </div>
            <div style="display: flex; flex-direction: column; gap: 6px;">
                <span style="font-size: 12px; color: #6b7280; font-weight: 600; text-transform: uppercase;">Location</span>
                <span style="font-size: 14px; color: #1a1f3a; font-weight: 600;">${bin.location}</span>
            </div>
            <div style="display: flex; flex-direction: column; gap: 6px;">
                <span style="font-size: 12px; color: #6b7280; font-weight: 600; text-transform: uppercase;">Last Update</span>
                <span style="font-size: 14px; color: #1a1f3a; font-weight: 600;">${formatTimeAgo(bin.lastUpdate)}</span>
            </div>
            <div style="display: flex; flex-direction: column; gap: 6px;">
                <span style="font-size: 12px; color: #6b7280; font-weight: 600; text-transform: uppercase;">Fill Level</span>
                <span style="font-size: 14px; color: #1a1f3a; font-weight: 600;">${bin.fillLevel}%</span>
            </div>
            <div style="display: flex; flex-direction: column; gap: 6px;">
                <span style="font-size: 12px; color: #6b7280; font-weight: 600; text-transform: uppercase;">Battery</span>
                <span style="font-size: 14px; color: #1a1f3a; font-weight: 600;">${bin.battery}%</span>
            </div>
            <div style="display: flex; flex-direction: column; gap: 6px;">
                <span style="font-size: 12px; color: #6b7280; font-weight: 600; text-transform: uppercase;">Speed</span>
                <span style="font-size: 14px; color: #1a1f3a; font-weight: 600;">${bin.speed} km/h</span>
            </div>
            <div style="display: flex; flex-direction: column; gap: 6px;">
                <span style="font-size: 12px; color: #6b7280; font-weight: 600; text-transform: uppercase;">Coordinates</span>
                <span style="font-size: 12px; color: #1a1f3a; font-weight: 600;">${bin.lat.toFixed(4)}, ${bin.lng.toFixed(4)}</span>
            </div>
        </div>
    `;

    document.getElementById('binModal').classList.add('show');
}

// Close Bin Modal
function closeBinModal() {
    document.getElementById('binModal').classList.remove('show');
    selectedBinId = null;
}

// Track Bin (from modal)
function trackBin() {
    if (selectedBinId) {
        closeBinModal();
        focusBin(selectedBinId);
    }
}

// Center Map
function centerMap() {
    if (binData.length === 0) return;

    const bounds = L.latLngBounds(binData.map(bin => [bin.lat, bin.lng]));
    map.fitBounds(bounds, { padding: [50, 50] });
    showToast('Map centered on all bins', 'info');
}

// Toggle Fullscreen
function toggleFullscreen() {
    const mapContainer = document.querySelector('.map-container');
    
    if (!document.fullscreenElement) {
        mapContainer.requestFullscreen().then(() => {
            setTimeout(() => map.invalidateSize(), 100);
        });
    } else {
        document.exitFullscreen().then(() => {
            setTimeout(() => map.invalidateSize(), 100);
        });
    }
}

// Toggle Heatmap (placeholder)
function toggleHeatmap() {
    showToast('Heatmap view coming soon!', 'info');
}

// Setup Filter Buttons
function setupFilterButtons() {
    const filterButtons = document.querySelectorAll('.filter-btn[data-filter]');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            currentFilter = button.getAttribute('data-filter');
            renderBinsList();
        });
    });
}

// Setup Search
function setupSearch() {
    const searchInput = document.getElementById('searchBin');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const cards = document.querySelectorAll('.bin-card');

        cards.forEach(card => {
            const binId = card.getAttribute('data-bin-id').toLowerCase();
            const text = card.textContent.toLowerCase();
            
            if (binId.includes(searchTerm) || text.includes(searchTerm)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
}

// Refresh Tracking
function refreshTracking() {
    console.log('Refreshing tracking data...');
    
    loadBinsData();
    
    const refreshBtn = document.querySelector('.refresh-btn i');
    if (refreshBtn) {
        refreshBtn.style.transform = 'rotate(360deg)';
        setTimeout(() => {
            refreshBtn.style.transform = 'rotate(0deg)';
        }, 600);
    }

    showToast('Tracking data refreshed', 'success');
}

// Start Auto Refresh
function startAutoRefresh() {
    setInterval(() => {
        refreshTracking();
    }, 30000);
}

// Simulate Real-time Movement
function simulateMovement() {
    setInterval(() => {
        binData.forEach(bin => {
            if (bin.status === 'moving') {
                bin.lat += (Math.random() - 0.5) * 0.001;
                bin.lng += (Math.random() - 0.5) * 0.001;
                
                if (markers[bin.id]) {
                    markers[bin.id].setLatLng([bin.lat, bin.lng]);
                }
            }
        });
    }, 5000);
}

// Toggle Notifications
function toggleNotifications() {
    const dropdown = document.getElementById('notificationsDropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

// Clear Notifications
function clearNotifications() {
    const notificationsList = document.querySelector('.notifications-list');
    if (notificationsList) {
        notificationsList.innerHTML = '<div class="empty-state"><i class="fas fa-bell"></i><p>No notifications</p></div>';
    }
}

// Toggle Theme (Dark Mode)
function toggleTheme() {
    darkMode = !darkMode;
    document.body.classList.toggle('dark-mode');
    
    // Save preference
    localStorage.setItem('darkMode', darkMode);
    
    // Update theme icon
    updateThemeIcon();
    
    // Update map tiles
    updateMapTiles();
    
    // Re-render markers with new colors
    renderBinsOnMap();
    
    // Show toast
    showToast(darkMode ? 'Dark mode enabled' : 'Light mode enabled', 'success');
}

// Update Theme Icon
function updateThemeIcon() {
    const themeIcon = document.getElementById('themeIcon');
    if (themeIcon) {
        themeIcon.className = darkMode ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// Toggle View Mode
// function toggleViewMode() {
//     showToast('View mode switching coming soon!', 'info');
// }

// Export Bins Data
function exportBinsData() {
    const csv = convertToCSV(binData);
    downloadCSV(csv, 'bins-tracking-data.csv');
    showToast('Data exported successfully', 'success');
}

// Convert to CSV
function convertToCSV(data) {
    const headers = ['Bin ID', 'Status', 'Location', 'Fill Level', 'Battery', 'Speed', 'Last Update'];
    const rows = data.map(bin => [
        bin.id,
        bin.status,
        bin.location,
        bin.fillLevel + '%',
        bin.battery + '%',
        bin.speed + ' km/h',
        bin.lastUpdate.toLocaleString()
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
}

// Download CSV
function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', filename);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// Show Toast
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle';
    
    toast.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span class="toast-message">${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('tracking.html')) {
        initTrackingPage();
        simulateMovement();
    }
});

// Handle window resize
window.addEventListener('resize', () => {
    if (map) {
        setTimeout(() => map.invalidateSize(), 100);
    }
});