// ============================================
// overview.js - Connected to Smart Bins API
// ============================================

let tripsChart, statusChart;
let currentPage = 1;
let itemsPerPage = 5;
let allActivities = [];
let sortColumn = -1;
let sortDirection = 'asc';
let autoRefreshInterval;

// ── Auth Guard ──
if (!API.isLoggedIn()) {
    window.location.href = '/api_front/login.html';
}

// Initialize Overview Page
function initOverviewPage() {
    console.log('Initializing Smart Bins Overview...');
    initializeCharts();
    loadDashboardData();
    initializeFeatures();
    startAutoRefresh();
}

// Initialize new features
function initializeFeatures() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        const ti = document.getElementById('themeIcon');
        if (ti) ti.className = 'fas fa-sun';
    }

    const savedView = localStorage.getItem('viewMode');
    if (savedView === 'cards') {
        document.body.classList.add('card-view');
        const vi = document.getElementById('viewIcon');
        if (vi) vi.className = 'fas fa-table';
    }

    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.addEventListener('input', handleSearch);

    document.addEventListener('click', function (event) {
        const notificationsDropdown = document.getElementById('notificationsDropdown');
        const notificationBtn = document.getElementById('notificationBtn');
        if (notificationsDropdown && notificationBtn &&
            !notificationsDropdown.contains(event.target) &&
            !notificationBtn.contains(event.target)) {
            notificationsDropdown.classList.remove('show');
        }
    });
}

// ── Load Real Data from API ──
async function loadDashboardData() {
    try {
        // Fetch stats and bins in parallel
        const [statsRes, binsRes, alertsRes] = await Promise.all([
            API.getStats(),
            API.listBins(),
            API.listAlerts('active')
        ]);

        if (statsRes.status === 'success') {
            updateStatsCards(statsRes.data);
        }

        if (binsRes.status === 'success') {
            allActivities = mapBinsToActivities(binsRes.data);
            updateActivityDisplay();
            updateStatusChart(binsRes.data);
        }

        if (alertsRes.status === 'success') {
            updateNotificationsBadge(alertsRes.count);
        }

        console.log('✅ Dashboard data loaded from API');
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showToast('Warning', 'Could not load live data – showing cached values', 'warning');
    }
}

// Map bins API response → activity table format
function mapBinsToActivities(bins) {
    const statusMap = {
        operational: { cls: 'active',    text: 'Operational' },
        full:        { cls: 'critical',  text: 'Full'        },
        charging:    { cls: 'completed', text: 'Charging'    },
        maintenance: { cls: 'critical',  text: 'Maintenance' },
        offline:     { cls: 'critical',  text: 'Offline'     },
    };

    return bins.map(bin => {
        const s = statusMap[bin.status] || { cls: 'active', text: bin.status };
        return {
            binId:      bin.bin_code,
            location:   bin.location_name || 'Unknown',
            fillLevel:  bin.fill_level  ?? 0,
            status:     s.cls,
            statusText: s.text,
            battery:    bin.battery_level ?? 0,
            timestamp:  new Date(bin.updated_at || Date.now())
        };
    });
}

// Update stat cards with real numbers
function updateStatsCards(data) {
    animateValue('activeBins',     0, data.operational    ?? 0, 1000);
    animateValue('criticalAlerts', 0, data.active_alerts  ?? 0, 1000);

    const avgFillEl = document.getElementById('avgFillLevel');
    if (avgFillEl) {
        const target = Math.round(data.avg_fill ?? 0);
        animateValue('avgFillLevel', 0, target, 1000);
    }
}

// Update Status doughnut chart from real data
function updateStatusChart(bins) {
    if (!statusChart) return;
    const counts = { operational: 0, full: 0, charging: 0, maintenance: 0 };
    bins.forEach(b => {
        if (b.status in counts) counts[b.status]++;
        else if (b.fill_level >= 85) counts.full++;
    });

    statusChart.data.datasets[0].data = [
        counts.operational,
        counts.full,
        counts.charging,
        counts.maintenance
    ];
    statusChart.update();
}

// Update notification bell badge
function updateNotificationsBadge(count) {
    const badge = document.querySelector('.notification-badge');
    if (badge) badge.textContent = count > 0 ? count : '';
}

// Initialize Charts
function initializeCharts() {
    if (typeof Chart === 'undefined') { console.error('Chart.js not loaded!'); return; }

    const tripsCtx = document.getElementById('tripsChart');
    if (tripsCtx) {
        tripsChart = new Chart(tripsCtx.getContext('2d'), {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Autonomous Collections',
                    data: [0, 0, 0, 0, 0, 0, 0],
                    borderColor: '#4873ff',
                    backgroundColor: 'rgba(72,115,255,0.1)',
                    tension: 0.4, fill: true,
                    pointBackgroundColor: '#4873ff',
                    pointBorderColor: '#fff', pointBorderWidth: 2,
                    pointRadius: 5, pointHoverRadius: 7
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, grid: { color: 'rgba(72,115,255,0.1)' } },
                    x: { grid: { display: false } }
                }
            }
        });
    }

    const statusCtx = document.getElementById('statusChart');
    if (statusCtx) {
        statusChart = new Chart(statusCtx.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Operational', 'Full', 'Charging', 'Maintenance'],
                datasets: [{
                    data: [0, 0, 0, 0],
                    backgroundColor: ['#4873ff', '#ff5252', '#ffa726', '#9e9e9e'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { padding: 15, usePointStyle: true }
                    }
                }
            }
        });
    }

    // After charts are created, load trips history data
    loadTripsChartData('week');
}

// Load trips chart data from API
async function loadTripsChartData(period) {
    try {
        const res = await API.listTrips('completed');
        if (res.status !== 'success' || !tripsChart) return;

        const trips = res.data;
        const now = new Date();

        if (period === 'week') {
            const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            const counts = [0, 0, 0, 0, 0, 0, 0];
            trips.forEach(t => {
                const d = new Date(t.start_time);
                const diffDays = Math.floor((now - d) / 86400000);
                if (diffDays < 7) {
                    const dayIdx = (d.getDay() + 6) % 7; // Mon=0
                    counts[dayIdx]++;
                }
            });
            tripsChart.data.labels = days;
            tripsChart.data.datasets[0].data = counts;
        } else if (period === 'month') {
            const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
            const counts = [0, 0, 0, 0];
            trips.forEach(t => {
                const d = new Date(t.start_time);
                const diffDays = Math.floor((now - d) / 86400000);
                if (diffDays < 28) {
                    const wIdx = Math.min(3, Math.floor(diffDays / 7));
                    counts[3 - wIdx]++;
                }
            });
            tripsChart.data.labels = weeks;
            tripsChart.data.datasets[0].data = counts;
        }

        tripsChart.update();
    } catch (e) {
        console.error('Could not load trips chart data:', e);
    }
}

// Update chart based on filter button
function updateChart(period) {
    loadTripsChartData(period);
    document.querySelectorAll('.chart-filter .filter-btn').forEach(btn => btn.classList.remove('active'));
    if (event && event.target) event.target.classList.add('active');
    showToast('Chart Updated', `Showing ${period} data`, 'info');
}

// Animate Stats Values
function animateValue(id, start, end, duration) {
    const obj = document.getElementById(id);
    if (!obj) return;
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        if (id === 'avgFillLevel') {
            obj.innerHTML = value + '<span style="font-size:18px;color:#6b7280;">%</span>';
        } else {
            obj.textContent = value;
        }
        if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
}

function animateStatsOnLoad() {
    // Placeholder – real values come from API
    animateValue('activeBins', 0, 0, 800);
    animateValue('tripsToday', 0, 0, 800);
    animateValue('criticalAlerts', 0, 0, 800);
}

// Search functionality
function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    allActivities = allActivities.filter(a =>
        a.binId.toLowerCase().includes(searchTerm) ||
        a.location.toLowerCase().includes(searchTerm) ||
        a.statusText.toLowerCase().includes(searchTerm)
    );
    currentPage = 1;
    updateActivityDisplay();
    if (!searchTerm) loadDashboardData(); // reload all on clear
}

// Sort table
function sortTable(columnIndex) {
    const columns = ['binId', 'location', 'fillLevel', 'status', 'battery', 'timestamp'];
    const column = columns[columnIndex];
    if (sortColumn === columnIndex) {
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        sortColumn = columnIndex;
        sortDirection = 'asc';
    }
    allActivities.sort((a, b) => {
        let va = a[column], vb = b[column];
        if (column === 'timestamp') { va = va.getTime(); vb = vb.getTime(); }
        if (typeof va === 'string') { va = va.toLowerCase(); vb = vb.toLowerCase(); }
        return sortDirection === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
    });
    updateActivityDisplay();
}

// Pagination & table rendering (unchanged logic)
function updateActivityDisplay() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const pageData = allActivities.slice(startIndex, startIndex + itemsPerPage);
    updateActivityTable(pageData);
    updateMobileCards(pageData);
    updatePagination();
}

function updateActivityTable(activities) {
    const tableBody = document.getElementById('activityTable');
    if (!tableBody) return;
    if (activities.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:30px;color:#6b7280;">No activities found</td></tr>';
        return;
    }
    tableBody.innerHTML = activities.map(a => `
        <tr>
            <td class="vehicle-id">${a.binId}</td>
            <td>${a.location}</td>
            <td><span class="fill-indicator fill-${getFillClass(a.fillLevel)}">${a.fillLevel}%</span></td>
            <td><span class="status-badge ${a.status}">${a.statusText}</span></td>
            <td><span class="battery-indicator battery-${getBatteryClass(a.battery)}">${a.battery}%</span></td>
            <td>${formatTimeAgo(a.timestamp)}</td>
        </tr>
    `).join('');
}

function updateMobileCards(activities) {
    const cardsView = document.getElementById('cardsView');
    if (!cardsView) return;
    if (activities.length === 0) {
        cardsView.innerHTML = '<p style="text-align:center;padding:30px;color:#6b7280;">No activities found</p>';
        return;
    }
    cardsView.innerHTML = activities.map(a => `
        <div class="bin-card">
            <div class="bin-card-header">
                <span class="bin-card-id">${a.binId}</span>
                <span class="status-badge ${a.status}">${a.statusText}</span>
            </div>
            <div class="bin-card-body">
                <div class="bin-card-row"><span class="bin-card-label">Location</span><span class="bin-card-value">${a.location}</span></div>
                <div class="bin-card-row"><span class="bin-card-label">Fill Level</span><span class="bin-card-value"><span class="fill-indicator fill-${getFillClass(a.fillLevel)}">${a.fillLevel}%</span></span></div>
                <div class="bin-card-row"><span class="bin-card-label">Battery</span><span class="bin-card-value"><span class="battery-indicator battery-${getBatteryClass(a.battery)}">${a.battery}%</span></span></div>
                <div class="bin-card-row"><span class="bin-card-label">Last Action</span><span class="bin-card-value">${formatTimeAgo(a.timestamp)}</span></div>
            </div>
        </div>
    `).join('');
}

function updatePagination() {
    const totalPages = Math.ceil(allActivities.length / itemsPerPage);
    const cp = document.getElementById('currentPage');
    const tp = document.getElementById('totalPages');
    const prev = document.getElementById('prevBtn');
    const next = document.getElementById('nextBtn');
    if (cp) cp.textContent = currentPage;
    if (tp) tp.textContent = totalPages;
    if (prev) prev.disabled = currentPage === 1;
    if (next) next.disabled = currentPage === totalPages;
}

function previousPage() { if (currentPage > 1) { currentPage--; updateActivityDisplay(); } }
function nextPage() {
    const totalPages = Math.ceil(allActivities.length / itemsPerPage);
    if (currentPage < totalPages) { currentPage++; updateActivityDisplay(); }
}

// Helper functions
function getFillClass(f) { if (f >= 80) return 'high'; if (f >= 50) return 'medium'; if (f >= 20) return 'low'; return 'critical'; }
function getBatteryClass(b) { if (b >= 60) return 'good'; if (b >= 30) return 'medium'; return 'low'; }
function formatTimeAgo(timestamp) {
    if (!timestamp) return 'N/A';
    const diff = Math.floor((new Date() - new Date(timestamp)) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
}

// Notifications
function toggleNotifications() {
    const dropdown = document.getElementById('notificationsDropdown');
    if (dropdown) dropdown.classList.toggle('show');
}

async function clearNotifications() {
    const notificationsList = document.querySelector('.notifications-list');
    if (notificationsList) notificationsList.innerHTML = '<p style="text-align:center;padding:30px;color:#6b7280;">No notifications</p>';
    showToast('Notifications Cleared', 'All notifications have been cleared', 'success');
}

// Theme & View
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const themeIcon = document.getElementById('themeIcon');
    if (document.body.classList.contains('dark-mode')) {
        if (themeIcon) themeIcon.className = 'fas fa-sun';
        localStorage.setItem('theme', 'dark');
    } else {
        if (themeIcon) themeIcon.className = 'fas fa-moon';
        localStorage.setItem('theme', 'light');
    }
}

function toggleView() {
    document.body.classList.toggle('card-view');
    const viewIcon = document.getElementById('viewIcon');
    if (document.body.classList.contains('card-view')) {
        if (viewIcon) viewIcon.className = 'fas fa-table';
        localStorage.setItem('viewMode', 'cards');
    } else {
        if (viewIcon) viewIcon.className = 'fas fa-th-large';
        localStorage.setItem('viewMode', 'table');
    }
}

// Toast
function showToast(title, message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const icons = { success: 'fa-check-circle', error: 'fa-times-circle', warning: 'fa-exclamation-triangle', info: 'fa-info-circle' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="toast-icon"><i class="fas ${icons[type]}"></i></div>
        <div class="toast-content"><p class="toast-title">${title}</p><p class="toast-message">${message}</p></div>
        <button class="toast-close" onclick="this.parentElement.remove()">×</button>`;
    container.appendChild(toast);
    setTimeout(() => { toast.style.animation = 'toastSlideIn 0.3s ease reverse'; setTimeout(() => toast.remove(), 300); }, 4000);
}

// Refresh (calls API again)
async function refreshActivity() {
    showToast('Refreshing', 'Updating activity data...', 'info');
    await loadDashboardData();
    showToast('Refreshed', 'Activity data updated', 'success');
}

// Auto-refresh every 30 seconds
function startAutoRefresh() {
    autoRefreshInterval = setInterval(loadDashboardData, 30000);
}

// CSV Export
function exportChartData() {
    if (!tripsChart) { showToast('Export Failed', 'Chart data not available', 'error'); return; }
    const data = tripsChart.data;
    let csv = 'Date,Collections\n';
    data.labels.forEach((label, i) => { csv += `${label},${data.datasets[0].data[i]}\n`; });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'chart-data.csv'; a.click();
    window.URL.revokeObjectURL(url);
    showToast('Export Success', 'Chart data exported', 'success');
}

window.addEventListener('beforeunload', () => { if (autoRefreshInterval) clearInterval(autoRefreshInterval); });

document.addEventListener('DOMContentLoaded', function () {
    if (window.location.pathname.includes('overview.html') || window.location.pathname.endsWith('/')) {
        initOverviewPage();
    }
});

window.addEventListener('load', function () {
    if (window.location.pathname.includes('overview.html') || window.location.pathname.endsWith('/')) {
        animateStatsOnLoad();
    }
});