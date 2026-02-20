// ============================================
// overview.js - Autonomous Bins Dashboard
// Enhanced Version with Interactive Features
// ============================================

let tripsChart, statusChart;
let currentPage = 1;
let itemsPerPage = 5;
let allActivities = [];
let sortColumn = -1;
let sortDirection = 'asc';
let autoRefreshInterval;

// Mock data for simulation
const mockActivities = [
    { binId: 'BIN-001', location: 'Al Gomhoria St, Mansoura', fillLevel: 95, status: 'active', statusText: 'En Route to Center', battery: 85, timestamp: new Date(Date.now() - 2 * 60 * 1000) },
    { binId: 'BIN-003', location: 'Al Mashaya Area, Mansoura', fillLevel: 68, status: 'completed', statusText: 'Collecting', battery: 92, timestamp: new Date(Date.now() - 15 * 60 * 1000) },
    { binId: 'BIN-005', location: 'Toriel District, Mansoura', fillLevel: 32, status: 'completed', statusText: 'Standby', battery: 78, timestamp: new Date(Date.now() - 45 * 60 * 1000) },
    { binId: 'BIN-002', location: 'Al Matar Area, Mansoura', fillLevel: 88, status: 'active', statusText: 'Returning', battery: 65, timestamp: new Date(Date.now() - 60 * 60 * 1000) },
    { binId: 'BIN-007', location: 'Mit Khamis, Mansoura', fillLevel: 12, status: 'critical', statusText: 'Low Battery', battery: 15, timestamp: new Date(Date.now() - 10 * 60 * 1000) },
    { binId: 'BIN-004', location: 'Al Hurriya Square, Mansoura', fillLevel: 55, status: 'active', statusText: 'Collecting', battery: 70, timestamp: new Date(Date.now() - 25 * 60 * 1000) },
    { binId: 'BIN-006', location: 'Talkha Entrance, Mansoura', fillLevel: 42, status: 'completed', statusText: 'Standby', battery: 88, timestamp: new Date(Date.now() - 90 * 60 * 1000) },
    { binId: 'BIN-008', location: 'Industrial Zone, Mansoura', fillLevel: 78, status: 'active', statusText: 'En Route', battery: 60, timestamp: new Date(Date.now() - 5 * 60 * 1000) },
];

// Initialize Overview Page
function initOverviewPage() {
    console.log('Initializing Autonomous Bins Overview...');
    initializeCharts();
    loadDashboardData();
    initializeFeatures();
    startAutoRefresh();
}

// Initialize new features
function initializeFeatures() {
    // Load saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        document.getElementById('themeIcon').className = 'fas fa-sun';
    }

    // Load saved view mode
    const savedView = localStorage.getItem('viewMode');
    if (savedView === 'cards') {
        document.body.classList.add('card-view');
        document.getElementById('viewIcon').className = 'fas fa-table';
    }

    // Setup search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }

    // Close notifications when clicking outside
    document.addEventListener('click', function(event) {
        const notificationsDropdown = document.getElementById('notificationsDropdown');
        const notificationBtn = document.getElementById('notificationBtn');
        
        if (notificationsDropdown && !notificationsDropdown.contains(event.target) && 
            !notificationBtn.contains(event.target)) {
            notificationsDropdown.classList.remove('show');
        }
    });

    // Initialize activities data
    allActivities = [...mockActivities];
    updateActivityDisplay();
}

// Initialize Charts
function initializeCharts() {
    if (typeof Chart === 'undefined') {
        console.error('Chart.js is not loaded!');
        return;
    }

    // Trips Chart
    const tripsCtx = document.getElementById('tripsChart');
    if (tripsCtx) {
        const ctx = tripsCtx.getContext('2d');
        if (ctx) {
            tripsChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    datasets: [{
                        label: 'Autonomous Collections',
                        data: [24, 28, 22, 30, 26, 28, 28],
                        borderColor: '#4873ff',
                        backgroundColor: 'rgba(72, 115, 255, 0.1)',
                        tension: 0.4,
                        fill: true,
                        pointBackgroundColor: '#4873ff',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 5,
                        pointHoverRadius: 7
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return 'Collections: ' + context.parsed.y;
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(72, 115, 255, 0.1)'
                            },
                            ticks: {
                                callback: function(value) {
                                    return value + ' trips';
                                }
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            }
                        }
                    }
                }
            });
            console.log('✅ Collections chart initialized');
        }
    }

    // Status Chart
    const statusCtx = document.getElementById('statusChart');
    if (statusCtx) {
        const ctx = statusCtx.getContext('2d');
        if (ctx) {
            statusChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Active', 'Standby', 'Charging', 'Maintenance'],
                    datasets: [{
                        data: [5, 4, 2, 1],
                        backgroundColor: [
                            '#4873ff',
                            '#66bb6a',
                            '#ffa726',
                            '#ff5252'
                        ],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                padding: 15,
                                usePointStyle: true,
                                generateLabels: function(chart) {
                                    const data = chart.data;
                                    if (data.labels.length && data.datasets.length) {
                                        return data.labels.map((label, i) => {
                                            const value = data.datasets[0].data[i];
                                            return {
                                                text: label + ': ' + value,
                                                fillStyle: data.datasets[0].backgroundColor[i],
                                                hidden: false,
                                                index: i
                                            };
                                        });
                                    }
                                    return [];
                                }
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return context.label + ': ' + context.parsed + ' bins';
                                }
                            }
                        }
                    }
                }
            });
            console.log('✅ Status chart initialized');
        }
    }
}

// Update Chart based on filter
function updateChart(period) {
    if (!tripsChart) return;

    let newData, newLabels;
    
    if (period === 'week') {
        newLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        newData = [24, 28, 22, 30, 26, 28, 28];
    } else if (period === 'month') {
        newLabels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
        newData = [168, 182, 175, 196];
    } else {
        newLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        newData = [720, 756, 800, 780, 840, 820, 860, 890, 870, 900, 920, 950];
    }

    tripsChart.data.labels = newLabels;
    tripsChart.data.datasets[0].data = newData;
    tripsChart.update();

    // Update active button
    document.querySelectorAll('.chart-filter .filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
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
            obj.innerHTML = value + '<span style="font-size: 18px; color: #6b7280;">%</span>';
        } else {
            obj.textContent = value;
        }
        
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// Animate all stats on load
function animateStatsOnLoad() {
    animateValue('activeBins', 0, 12, 1000);
    animateValue('tripsToday', 0, 28, 1000);
    animateValue('avgFillLevel', 0, 68, 1000);
    animateValue('criticalAlerts', 0, 2, 1000);
}

// Load dashboard data
async function loadDashboardData() {
    try {
        console.log('✅ Dashboard loaded with mock data');
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showToast('Error', 'Failed to load dashboard data', 'error');
    }
}

// Search functionality
function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    
    if (searchTerm === '') {
        allActivities = [...mockActivities];
    } else {
        allActivities = mockActivities.filter(activity => 
            activity.binId.toLowerCase().includes(searchTerm) ||
            activity.location.toLowerCase().includes(searchTerm) ||
            activity.statusText.toLowerCase().includes(searchTerm)
        );
    }
    
    currentPage = 1;
    updateActivityDisplay();
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
        let valueA = a[column];
        let valueB = b[column];
        
        if (column === 'timestamp') {
            valueA = valueA.getTime();
            valueB = valueB.getTime();
        }
        
        if (typeof valueA === 'string') {
            valueA = valueA.toLowerCase();
            valueB = valueB.toLowerCase();
        }
        
        if (sortDirection === 'asc') {
            return valueA > valueB ? 1 : -1;
        } else {
            return valueA < valueB ? 1 : -1;
        }
    });
    
    updateActivityDisplay();
    showToast('Table Sorted', `Sorted by ${columns[columnIndex]}`, 'info');
}

// Update activity display (table and cards)
function updateActivityDisplay() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageData = allActivities.slice(startIndex, endIndex);
    
    // Update table
    updateActivityTable(pageData);
    
    // Update mobile cards
    updateMobileCards(pageData);
    
    // Update pagination
    updatePagination();
}

// Update activity table
function updateActivityTable(activities) {
    const tableBody = document.getElementById('activityTable');
    if (!tableBody) return;

    if (activities.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 30px; color: #6b7280;">No activities found</td></tr>';
        return;
    }

    tableBody.innerHTML = activities.map(activity => `
        <tr>
            <td class="vehicle-id">${activity.binId}</td>
            <td>${activity.location}</td>
            <td><span class="fill-indicator fill-${getFillClass(activity.fillLevel)}">${activity.fillLevel}%</span></td>
            <td><span class="status-badge ${activity.status}">${activity.statusText}</span></td>
            <td><span class="battery-indicator battery-${getBatteryClass(activity.battery)}">${activity.battery}%</span></td>
            <td>${formatTimeAgo(activity.timestamp)}</td>
        </tr>
    `).join('');
}

// Update mobile cards view
function updateMobileCards(activities) {
    const cardsView = document.getElementById('cardsView');
    if (!cardsView) return;

    if (activities.length === 0) {
        cardsView.innerHTML = '<p style="text-align: center; padding: 30px; color: #6b7280;">No activities found</p>';
        return;
    }

    cardsView.innerHTML = activities.map(activity => `
        <div class="bin-card">
            <div class="bin-card-header">
                <span class="bin-card-id">${activity.binId}</span>
                <span class="status-badge ${activity.status}">${activity.statusText}</span>
            </div>
            <div class="bin-card-body">
                <div class="bin-card-row">
                    <span class="bin-card-label">Location</span>
                    <span class="bin-card-value">${activity.location}</span>
                </div>
                <div class="bin-card-row">
                    <span class="bin-card-label">Fill Level</span>
                    <span class="bin-card-value">
                        <span class="fill-indicator fill-${getFillClass(activity.fillLevel)}">${activity.fillLevel}%</span>
                    </span>
                </div>
                <div class="bin-card-row">
                    <span class="bin-card-label">Battery</span>
                    <span class="bin-card-value">
                        <span class="battery-indicator battery-${getBatteryClass(activity.battery)}">${activity.battery}%</span>
                    </span>
                </div>
                <div class="bin-card-row">
                    <span class="bin-card-label">Last Action</span>
                    <span class="bin-card-value">${formatTimeAgo(activity.timestamp)}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Update pagination controls
function updatePagination() {
    const totalPages = Math.ceil(allActivities.length / itemsPerPage);
    
    document.getElementById('currentPage').textContent = currentPage;
    document.getElementById('totalPages').textContent = totalPages;
    
    document.getElementById('prevBtn').disabled = currentPage === 1;
    document.getElementById('nextBtn').disabled = currentPage === totalPages;
}

// Pagination functions
function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        updateActivityDisplay();
    }
}

function nextPage() {
    const totalPages = Math.ceil(allActivities.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        updateActivityDisplay();
    }
}

// Helper functions
function getFillClass(fillLevel) {
    if (fillLevel >= 80) return 'high';
    if (fillLevel >= 50) return 'medium';
    if (fillLevel >= 20) return 'low';
    return 'critical';
}

function getBatteryClass(battery) {
    if (battery >= 60) return 'good';
    if (battery >= 30) return 'medium';
    return 'low';
}

function formatTimeAgo(timestamp) {
    if (!timestamp) return 'N/A';
    
    const now = new Date();
    const time = new Date(timestamp);
    const diff = Math.floor((now - time) / 1000);

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
}

// Toggle notifications dropdown
function toggleNotifications() {
    const dropdown = document.getElementById('notificationsDropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

// Clear all notifications
function clearNotifications() {
    const notificationsList = document.querySelector('.notifications-list');
    if (notificationsList) {
        notificationsList.innerHTML = '<p style="text-align: center; padding: 30px; color: #6b7280;">No notifications</p>';
    }
    showToast('Notifications Cleared', 'All notifications have been cleared', 'success');
}

// Toggle dark mode
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const themeIcon = document.getElementById('themeIcon');
    
    if (document.body.classList.contains('dark-mode')) {
        themeIcon.className = 'fas fa-sun';
        localStorage.setItem('theme', 'dark');
        showToast('Dark Mode', 'Dark mode enabled', 'info');
    } else {
        themeIcon.className = 'fas fa-moon';
        localStorage.setItem('theme', 'light');
        showToast('Light Mode', 'Light mode enabled', 'info');
    }
}

// Toggle view mode (table/cards)
function toggleView() {
    document.body.classList.toggle('card-view');
    const viewIcon = document.getElementById('viewIcon');
    
    if (document.body.classList.contains('card-view')) {
        viewIcon.className = 'fas fa-table';
        localStorage.setItem('viewMode', 'cards');
        showToast('Card View', 'Switched to card view', 'info');
    } else {
        viewIcon.className = 'fas fa-th-large';
        localStorage.setItem('viewMode', 'table');
        showToast('Table View', 'Switched to table view', 'info');
    }
}

// Toast notification system
function showToast(title, message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const icons = {
        success: 'fa-check-circle',
        error: 'fa-times-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fas ${icons[type]}"></i>
        </div>
        <div class="toast-content">
            <p class="toast-title">${title}</p>
            <p class="toast-message">${message}</p>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'toastSlideIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// Export chart data
function exportChartData() {
    if (!tripsChart) {
        showToast('Export Failed', 'Chart data not available', 'error');
        return;
    }

    const data = tripsChart.data;
    let csv = 'Date,Collections\n';
    
    data.labels.forEach((label, index) => {
        csv += `${label},${data.datasets[0].data[index]}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chart-data.csv';
    a.click();
    window.URL.revokeObjectURL(url);

    showToast('Export Success', 'Chart data exported successfully', 'success');
}

// Export table to PDF
function exportTable() {
    if (typeof jspdf === 'undefined') {
        showToast('Export Failed', 'PDF library not loaded', 'error');
        return;
    }

    const { jsPDF } = jspdf;
    const doc = new jsPDF();

    const tableData = allActivities.map(activity => [
        activity.binId,
        activity.location,
        `${activity.fillLevel}%`,
        activity.statusText,
        `${activity.battery}%`,
        formatTimeAgo(activity.timestamp)
    ]);

    doc.autoTable({
        head: [['Bin ID', 'Location', 'Fill Level', 'Status', 'Battery', 'Last Action']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [72, 115, 255] }
    });

    doc.save('activity-report.pdf');
    showToast('Export Success', 'Table exported to PDF successfully', 'success');
}

// Refresh activity with animation
function refreshActivity() {
    showToast('Refreshing', 'Updating activity data...', 'info');
    
    // Simulate data refresh with random changes
    setTimeout(() => {
        mockActivities.forEach(activity => {
            // Random small changes
            activity.fillLevel = Math.max(0, Math.min(100, activity.fillLevel + Math.floor(Math.random() * 10 - 5)));
            activity.battery = Math.max(0, Math.min(100, activity.battery + Math.floor(Math.random() * 6 - 3)));
            activity.timestamp = new Date(activity.timestamp.getTime() - Math.floor(Math.random() * 300000));
        });
        
        allActivities = [...mockActivities];
        updateActivityDisplay();
        
        showToast('Refreshed', 'Activity data updated', 'success');
    }, 1000);
}

// Auto-refresh data every 30 seconds
function startAutoRefresh() {
    autoRefreshInterval = setInterval(() => {
        // Update stats with small random changes
        const activeBinsEl = document.getElementById('activeBins');
        const tripsTodayEl = document.getElementById('tripsToday');
        const avgFillLevelEl = document.getElementById('avgFillLevel');
        
        if (activeBinsEl && Math.random() > 0.7) {
            const currentValue = parseInt(activeBinsEl.textContent);
            const newValue = Math.max(10, Math.min(15, currentValue + (Math.random() > 0.5 ? 1 : -1)));
            animateValue('activeBins', currentValue, newValue, 800);
        }
        
        if (tripsTodayEl && Math.random() > 0.8) {
            const currentValue = parseInt(tripsTodayEl.textContent);
            const newValue = currentValue + 1;
            animateValue('tripsToday', currentValue, newValue, 800);
        }
        
        // Update timestamps
        allActivities = allActivities.map(activity => ({
            ...activity,
            timestamp: new Date(activity.timestamp.getTime() + 30000)
        }));
        
        updateActivityDisplay();
    }, 30000);
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
    }
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('overview.html') || window.location.pathname.endsWith('/')) {
        initOverviewPage();
    }
});

// Initialize animations on window load
window.addEventListener('load', function() {
    if (window.location.pathname.includes('overview.html') || window.location.pathname.endsWith('/')) {
        animateStatsOnLoad();
    }
});