// ============================================
// trips.js - Trips & Logs Management (Enhanced)
// ============================================

// Sample trips data
const tripsData = [
  {
    id: 'TRP-2024-001',
    binId: 'BIN-001',
    routeFrom: 'Al Gomhoria St, Mansoura',
    routeTo: 'Collection Center',
    startTime: '2024-01-28 08:15',
    endTime: '2024-01-28 08:52',
    duration: 37,
    distance: 8.5,
    fillLevel: 95,
    status: 'completed',
    batteryStart: 100,
    batteryEnd: 85,
    wasteCollected: 114, // kg
    events: [
      { time: '08:15', event: 'Trip started from Nasr City, Zone A' },
      { time: '08:28', event: 'Fill level reached 95% - autonomous trigger' },
      { time: '08:30', event: 'En route to collection center' },
      { time: '08:52', event: 'Arrived at collection center - trip completed' }
    ]
  },
  {
    id: 'TRP-2024-002',
    binId: 'BIN-003',
    routeFrom: 'Al Mashaya Area, Mansoura',
    routeTo: 'Collection Center',
    startTime: '2024-01-28 09:30',
    endTime: null,
    duration: 18,
    distance: 5.2,
    fillLevel: 68,
    status: 'active',
    batteryStart: 92,
    batteryEnd: 88,
    wasteCollected: 0,
    events: [
      { time: '09:30', event: 'Trip started from Maadi, Zone B' },
      { time: '09:35', event: 'Collecting waste - fill level 68%' },
      { time: '09:48', event: 'Currently in progress...' }
    ]
  },
  {
    id: 'TRP-2024-003',
    binId: 'BIN-005',
    routeFrom: 'Toriel District, Mansoura',
    routeTo: 'Collection Center',
    startTime: '2024-01-28 07:45',
    endTime: '2024-01-28 08:28',
    duration: 43,
    distance: 9.8,
    fillLevel: 88,
    status: 'completed',
    batteryStart: 85,
    batteryEnd: 68,
    wasteCollected: 105.6,
    events: [
      { time: '07:45', event: 'Trip started from Heliopolis, Zone C' },
      { time: '07:58', event: 'Fill level reached 88%' },
      { time: '08:00', event: 'En route to collection center' },
      { time: '08:28', event: 'Trip completed successfully' }
    ]
  },
  {
    id: 'TRP-2024-004',
    binId: 'BIN-002',
    routeFrom: 'Al Matar Area, Mansoura',
    routeTo: 'Collection Center',
    startTime: '2024-01-28 10:15',
    endTime: '2024-01-28 10:58',
    duration: 43,
    distance: 12.3,
    fillLevel: 92,
    status: 'completed',
    batteryStart: 78,
    batteryEnd: 58,
    wasteCollected: 110.4,
    events: [
      { time: '10:15', event: 'Trip started from 6th October' },
      { time: '10:30', event: 'Fill level 92% - optimal collection' },
      { time: '10:35', event: 'En route to collection center' },
      { time: '10:58', event: 'Arrived and emptied successfully' }
    ]
  },
  {
    id: 'TRP-2024-005',
    binId: 'BIN-007',
    routeFrom: 'Mit Khamis, Mansoura',
    routeTo: 'Collection Center',
    startTime: '2024-01-28 06:30',
    endTime: '2024-01-28 07:15',
    duration: 45,
    distance: 11.5,
    fillLevel: 85,
    status: 'completed',
    batteryStart: 65,
    batteryEnd: 45,
    wasteCollected: 102,
    events: [
      { time: '06:30', event: 'Trip started - early morning collection' },
      { time: '06:48', event: 'Fill level 85% reached' },
      { time: '06:50', event: 'En route to collection center' },
      { time: '07:15', event: 'Trip completed' }
    ]
  },
  {
    id: 'TRP-2024-006',
    binId: 'BIN-003',
    routeFrom: 'Al Mashaya Corniche, Mansoura',
    routeTo: 'Collection Center',
    startTime: '2024-01-28 11:20',
    endTime: null,
    duration: 5,
    distance: 0.8,
    fillLevel: 72,
    status: 'active',
    batteryStart: 88,
    batteryEnd: 87,
    wasteCollected: 0,
    events: [
      { time: '11:20', event: 'Trip started' },
      { time: '11:25', event: 'Currently collecting...' }
    ]
  },
  {
    id: 'TRP-2024-007',
    binId: 'BIN-001',
    routeFrom: 'Al Hurriya Square, Mansoura',
    routeTo: 'Collection Center',
    startTime: '2024-01-27 15:45',
    endTime: '2024-01-27 16:22',
    duration: 37,
    distance: 8.2,
    fillLevel: 90,
    status: 'completed',
    batteryStart: 95,
    batteryEnd: 80,
    wasteCollected: 108,
    events: [
      { time: '15:45', event: 'Trip started' },
      { time: '16:00', event: 'En route' },
      { time: '16:22', event: 'Completed' }
    ]
  },
  {
    id: 'TRP-2024-008',
    binId: 'BIN-005',
    routeFrom: 'University Campus, Mansoura',
    routeTo: 'Collection Center',
    startTime: '2024-01-27 14:30',
    endTime: null,
    duration: 0,
    distance: 0,
    fillLevel: 45,
    status: 'failed',
    batteryStart: 25,
    batteryEnd: 20,
    wasteCollected: 0,
    events: [
      { time: '14:30', event: 'Trip started' },
      { time: '14:35', event: 'Low battery warning' },
      { time: '14:40', event: 'Trip failed - insufficient battery' }
    ]
  }
];

// Current filter state
let currentFilter = 'all';
let currentPage = 1;
const itemsPerPage = 8;
let selectedTrips = [];
let tripsViewMode = 'table'; // 'table' | 'compact'

// Initialize page
function initTripsPage() {
  console.log('Initializing Trips & Logs page...');

  // Load saved theme preference (shared with overview/carts)
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    const themeIcon = document.getElementById('tripsThemeIcon');
    if (themeIcon) {
      themeIcon.className = 'fas fa-sun';
    }
  }

  // Load saved view mode for trips table
  const savedTripsView = localStorage.getItem('tripsViewMode');
  if (savedTripsView === 'compact') {
    tripsViewMode = 'compact';
    document.body.classList.add('trips-compact-view');
  }
  const viewIcon = document.getElementById('tripsViewIcon');
  if (viewIcon) {
    viewIcon.className = tripsViewMode === 'compact' ? 'fas fa-table' : 'fas fa-th-large';
  }

  renderTripsTable();
  setupEventListeners();
  updatePagination();
  animateStats();
}

// Setup event listeners
function setupEventListeners() {
  // Filter chips
  document.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', function() {
      document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
      this.classList.add('active');
      currentFilter = this.dataset.filter;
      currentPage = 1; // Reset to first page
      renderTripsTable();
      updatePagination();
    });
  });

  // Search input
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      currentPage = 1;
      renderTripsTable(this.value);
      updatePagination();
    });
  }

  // Date filter
  const dateFilter = document.getElementById('dateFilter');
  if (dateFilter) {
    dateFilter.addEventListener('change', function() {
      currentPage = 1;
      renderTripsTable();
      updatePagination();
    });
  }

  // Bin filter
  const binFilter = document.getElementById('binFilter');
  if (binFilter) {
    binFilter.addEventListener('change', function() {
      currentPage = 1;
      renderTripsTable();
      updatePagination();
    });
  }

  // Select all checkbox
  const selectAll = document.getElementById('selectAll');
  if (selectAll) {
    selectAll.addEventListener('change', function() {
      const checkboxes = document.querySelectorAll('.trips-table tbody input[type="checkbox"]');
      checkboxes.forEach(cb => {
        cb.checked = this.checked;
        const tripId = cb.closest('tr').querySelector('.trip-id').textContent;
        if (this.checked) {
          if (!selectedTrips.includes(tripId)) {
            selectedTrips.push(tripId);
          }
        } else {
          selectedTrips = selectedTrips.filter(id => id !== tripId);
        }
      });
      updateBulkActions();
    });
  }
}

// Get filtered trips
function getFilteredTrips(searchQuery = '') {
  // Filter by status
  let filteredTrips = tripsData.filter(trip => {
    if (currentFilter === 'all') return true;
    return trip.status === currentFilter;
  });

  // Apply search filter
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filteredTrips = filteredTrips.filter(trip => 
      trip.id.toLowerCase().includes(query) ||
      trip.binId.toLowerCase().includes(query) ||
      trip.routeFrom.toLowerCase().includes(query) ||
      trip.routeTo.toLowerCase().includes(query)
    );
  }

  // Apply bin filter
  const binFilter = document.getElementById('binFilter');
  if (binFilter && binFilter.value !== 'all') {
    filteredTrips = filteredTrips.filter(trip => 
      trip.binId.toLowerCase() === binFilter.value
    );
  }

  return filteredTrips;
}

// Render trips table
function renderTripsTable(searchQuery = '') {
  const tableBody = document.getElementById('tripsTableBody');
  if (!tableBody) return;

  const filteredTrips = getFilteredTrips(searchQuery);

  // Calculate pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTrips = filteredTrips.slice(startIndex, endIndex);

  // Update showing info
  document.getElementById('showingStart').textContent = filteredTrips.length > 0 ? startIndex + 1 : 0;
  document.getElementById('showingEnd').textContent = Math.min(endIndex, filteredTrips.length);
  document.getElementById('totalRecords').textContent = filteredTrips.length;

  // Render table rows
  if (paginatedTrips.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="10" style="text-align: center; padding: 40px; color: #6b7280;">
          <i class="fas fa-inbox" style="font-size: 48px; margin-bottom: 16px; opacity: 0.3;"></i>
          <div>No trips found</div>
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = paginatedTrips.map(trip => `
    <tr>
      <td>
        <input type="checkbox" ${selectedTrips.includes(trip.id) ? 'checked' : ''} onchange="toggleTripSelection('${trip.id}')">
      </td>
      <td>
        <span class="trip-id" onclick="showTripDetails('${trip.id}')">${trip.id}</span>
      </td>
      <td>
        <span class="bin-badge">
          <i class="fas fa-robot"></i>
          ${trip.binId}
        </span>
      </td>
      <td>
        <div class="route-info">
          <div class="route-from">
            <i class="fas fa-circle"></i>
            ${trip.routeFrom}
          </div>
          <div class="route-to">
            <i class="fas fa-arrow-down"></i>
            ${trip.routeTo}
          </div>
        </div>
      </td>
      <td>${formatDateTime(trip.startTime)}</td>
      <td>
        <span class="duration-badge">
          <i class="fas fa-clock"></i>
          ${trip.duration} min
        </span>
      </td>
      <td>
        <span class="distance-badge">
          <i class="fas fa-road"></i>
          ${trip.distance} km
        </span>
      </td>
      <td>
        <div class="fill-progress">
          <div class="fill-progress-bar">
            <div class="fill-progress-fill" style="width: ${trip.fillLevel}%"></div>
          </div>
          <div class="fill-progress-text">${trip.fillLevel}%</div>
        </div>
      </td>
      <td>
        <span class="trip-status ${trip.status}">
          <i class="fas fa-${getStatusIcon(trip.status)}"></i>
          ${capitalizeFirst(trip.status)}
        </span>
      </td>
      <td>
        <div class="trip-actions">
          <button class="action-icon-btn" onclick="showTripDetails('${trip.id}')" title="View Details">
            <i class="fas fa-eye"></i>
          </button>
          <button class="action-icon-btn" onclick="downloadTripReport('${trip.id}')" title="Download Report">
            <i class="fas fa-download"></i>
          </button>
          <button class="action-icon-btn" onclick="openTripMenu('${trip.id}')" title="More Actions">
            <i class="fas fa-ellipsis-v"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

// Toggle trip selection
function toggleTripSelection(tripId) {
  if (selectedTrips.includes(tripId)) {
    selectedTrips = selectedTrips.filter(id => id !== tripId);
  } else {
    selectedTrips.push(tripId);
  }
  updateBulkActions();
}

// Update bulk actions
function updateBulkActions() {
  console.log('Selected trips:', selectedTrips.length);
  // You can add bulk action buttons here
}

// Update pagination
function updatePagination() {
  const container = document.getElementById('paginationContainer');
  if (!container) return;

  const filteredTrips = getFilteredTrips();
  const totalPages = Math.ceil(filteredTrips.length / itemsPerPage);

  if (totalPages <= 1) {
    container.innerHTML = '';
    return;
  }

  let paginationHTML = '';

  // Previous button
  paginationHTML += `
    <button class="page-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">
      <i class="fas fa-chevron-left"></i>
    </button>
  `;

  // Page numbers
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage < maxVisiblePages - 1) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  if (startPage > 1) {
    paginationHTML += `<button class="page-btn" onclick="changePage(1)">1</button>`;
    if (startPage > 2) {
      paginationHTML += `<span class="page-dots">...</span>`;
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    paginationHTML += `
      <button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">
        ${i}
      </button>
    `;
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      paginationHTML += `<span class="page-dots">...</span>`;
    }
    paginationHTML += `<button class="page-btn" onclick="changePage(${totalPages})">${totalPages}</button>`;
  }

  // Next button
  paginationHTML += `
    <button class="page-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">
      <i class="fas fa-chevron-right"></i>
    </button>
  `;

  container.innerHTML = paginationHTML;
}

// Change page
function changePage(page) {
  const filteredTrips = getFilteredTrips();
  const totalPages = Math.ceil(filteredTrips.length / itemsPerPage);
  
  if (page < 1 || page > totalPages) return;
  
  currentPage = page;
  renderTripsTable();
  updatePagination();
  
  // Scroll to top
  document.querySelector('.main-content').scrollTop = 0;
}

// Get status icon
function getStatusIcon(status) {
  switch(status) {
    case 'completed': return 'check-circle';
    case 'active': return 'spinner fa-spin';
    case 'failed': return 'times-circle';
    case 'pending': return 'clock';
    default: return 'circle';
  }
}

// Capitalize first letter
function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Format date time
function formatDateTime(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Show trip details modal
function showTripDetails(tripId) {
  const trip = tripsData.find(t => t.id === tripId);
  if (!trip) return;

  const modal = document.getElementById('tripModal');
  const modalBody = document.getElementById('modalBody');

  modalBody.innerHTML = `
    <div class="detail-grid">
      <div class="detail-item">
        <div class="detail-label">Trip ID</div>
        <div class="detail-value">${trip.id}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Bin ID</div>
        <div class="detail-value">
          <span class="bin-badge">
            <i class="fas fa-robot"></i>
            ${trip.binId}
          </span>
        </div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Start Time</div>
        <div class="detail-value">${formatDateTime(trip.startTime)}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">End Time</div>
        <div class="detail-value">${trip.endTime ? formatDateTime(trip.endTime) : 'In Progress'}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Duration</div>
        <div class="detail-value">${trip.duration} minutes</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Distance</div>
        <div class="detail-value">${trip.distance} km</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Fill Level</div>
        <div class="detail-value">${trip.fillLevel}%</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Status</div>
        <div class="detail-value">
          <span class="trip-status ${trip.status}">
            <i class="fas fa-${getStatusIcon(trip.status)}"></i>
            ${capitalizeFirst(trip.status)}
          </span>
        </div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Battery (Start)</div>
        <div class="detail-value">${trip.batteryStart}%</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Battery (End)</div>
        <div class="detail-value">${trip.batteryEnd}%</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Route From</div>
        <div class="detail-value">${trip.routeFrom}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Route To</div>
        <div class="detail-value">${trip.routeTo}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Waste Collected</div>
        <div class="detail-value">${trip.wasteCollected} kg</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Efficiency</div>
        <div class="detail-value">${((trip.distance / trip.duration) * 60).toFixed(1)} km/h avg</div>
      </div>
    </div>

    <div class="timeline">
      <div class="timeline-title">Trip Timeline</div>
      ${trip.events.map(event => `
        <div class="timeline-item">
          <div class="timeline-icon">
            <i class="fas fa-check"></i>
          </div>
          <div class="timeline-content">
            <div class="timeline-time">${event.time}</div>
            <div class="timeline-text">${event.event}</div>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  modal.classList.add('show');
}

// Download trip report
function downloadTripReport(tripId) {
  const trip = tripsData.find(t => t.id === tripId);
  if (!trip) return;

  // Create report data
  const report = `
TRIP REPORT
===========

Trip ID: ${trip.id}
Bin ID: ${trip.binId}
Date: ${formatDateTime(trip.startTime)}

ROUTE INFORMATION
-----------------
From: ${trip.routeFrom}
To: ${trip.routeTo}
Distance: ${trip.distance} km
Duration: ${trip.duration} minutes

PERFORMANCE METRICS
-------------------
Fill Level: ${trip.fillLevel}%
Waste Collected: ${trip.wasteCollected} kg
Battery Start: ${trip.batteryStart}%
Battery End: ${trip.batteryEnd}%
Battery Used: ${trip.batteryStart - trip.batteryEnd}%
Average Speed: ${((trip.distance / trip.duration) * 60).toFixed(1)} km/h

STATUS: ${trip.status.toUpperCase()}

TIMELINE
--------
${trip.events.map(e => `${e.time} - ${e.event}`).join('\n')}

Generated: ${new Date().toLocaleString()}
  `.trim();

  // Download as text file
  const blob = new Blob([report], { type: 'text/plain' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${trip.id}_Report.txt`;
  a.click();
  window.URL.revokeObjectURL(url);

  console.log(`✅ Report downloaded for ${trip.id}`);
}

// Open trip menu
function openTripMenu(tripId) {
  alert(`More actions for ${tripId}\n\nFeatures:\n• Replay Trip\n• Share Report\n• Add Notes\n• Flag Issue\n\nComing soon!`);
}

// Close modal
function closeModal() {
  const modal = document.getElementById('tripModal');
  modal.classList.remove('show');
}

// Close modal on outside click
window.addEventListener('click', function(e) {
  const modal = document.getElementById('tripModal');
  if (e.target === modal) {
    closeModal();
  }
});

// Animate stats values
function animateValue(id, start, end, duration) {
  const obj = document.getElementById(id);
  if (!obj) return;

  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const value = Math.floor(progress * (end - start) + start);
    obj.textContent = value.toLocaleString();
    
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
}

// Animate stats on load
function animateStats() {
  const completed = tripsData.filter(t => t.status === 'completed').length;
  const active = tripsData.filter(t => t.status === 'active').length;
  
  animateValue('totalTrips', 0, tripsData.length, 1200);
  animateValue('completedTrips', 0, completed, 1200);
  animateValue('activeTrips', 0, active, 1000);
}

// Toggle dark mode (for trips page)
function toggleTripsTheme() {
  document.body.classList.toggle('dark-mode');
  const themeIcon = document.getElementById('tripsThemeIcon');

  if (document.body.classList.contains('dark-mode')) {
    if (themeIcon) themeIcon.className = 'fas fa-sun';
    localStorage.setItem('theme', 'dark');
    showToast('Dark mode enabled', 'info');
  } else {
    if (themeIcon) themeIcon.className = 'fas fa-moon';
    localStorage.setItem('theme', 'light');
    showToast('Dark mode disabled', 'info');
  }
}

// Toggle table density/view (table vs compact)
function toggleTripsView() {
  const viewIcon = document.getElementById('tripsViewIcon');

  if (tripsViewMode === 'table') {
    tripsViewMode = 'compact';
    document.body.classList.add('trips-compact-view');
    if (viewIcon) viewIcon.className = 'fas fa-table';
    localStorage.setItem('tripsViewMode', 'compact');
    showToast('Compact view enabled', 'info');
  } else {
    tripsViewMode = 'table';
    document.body.classList.remove('trips-compact-view');
    if (viewIcon) viewIcon.className = 'fas fa-th-large';
    localStorage.setItem('tripsViewMode', 'table');
    showToast('Table view enabled', 'info');
  }
}

// Toggle notifications dropdown (trips page)
function toggleTripsNotifications() {
  const dropdown = document.getElementById('tripsNotificationsDropdown');
  if (dropdown) {
    dropdown.classList.toggle('show');
  }
}

// Clear all notifications (trips page)
function clearTripsNotifications() {
  const notificationsList = document.querySelector('.notifications-list');
  if (notificationsList) {
    notificationsList.innerHTML = '<p style="text-align: center; padding: 30px; color: #6b7280;">No notifications</p>';
  }
  showToast('All notifications cleared', 'success');
}

// Refresh trips
function refreshTrips(button) {
  // Support both inline onclick usage (refreshTrips(this)) and a safe fallback
  const btn = button || document.querySelector('.action-btn[onclick*="refreshTrips"]');
  const icon = btn ? btn.querySelector('i') : null;
  
  if (icon) {
    icon.classList.add('fa-spin');
  }
  
  setTimeout(() => {
    renderTripsTable();
    updatePagination();
    if (icon) {
      icon.classList.remove('fa-spin');
    }
    
    // Show toast notification
    showToast('Trips refreshed successfully', 'success');
  }, 1000);
}

// Export to CSV
function exportToCSV() {
  const filteredTrips = getFilteredTrips();
  
  if (filteredTrips.length === 0) {
    alert('No trips to export');
    return;
  }

  // Create CSV header
  const headers = ['Trip ID', 'Bin ID', 'Route From', 'Route To', 'Start Time', 'End Time', 'Duration (min)', 'Distance (km)', 'Fill Level (%)', 'Status', 'Battery Start (%)', 'Battery End (%)', 'Waste Collected (kg)'];
  
  // Create CSV rows
  const rows = filteredTrips.map(trip => [
    trip.id,
    trip.binId,
    trip.routeFrom,
    trip.routeTo,
    trip.startTime,
    trip.endTime || 'In Progress',
    trip.duration,
    trip.distance,
    trip.fillLevel,
    trip.status,
    trip.batteryStart,
    trip.batteryEnd,
    trip.wasteCollected
  ]);

  // Combine header and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  // Download CSV
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Trips_Export_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);

  showToast(`Exported ${filteredTrips.length} trips to CSV`, 'success');
}

// Show toast notification
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  const colors = {
    success: '#66bb6a',
    error: '#ff5252',
    warning: '#ffa726',
    info: '#4873ff'
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
    <i class="fas fa-check-circle" style="font-size: 20px;"></i>
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

// Add CSS for animations
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
  if (window.location.pathname.includes('trips.html')) {
    initTripsPage();

    // Close notifications when clicking outside
    document.addEventListener('click', function(event) {
      const dropdown = document.getElementById('tripsNotificationsDropdown');
      const notificationBtn = document.getElementById('tripsNotificationBtn');
      
      if (dropdown && !dropdown.contains(event.target) &&
          notificationBtn && !notificationBtn.contains(event.target)) {
        dropdown.classList.remove('show');
      }
    });
  }
});

// Animate stats on window load
window.addEventListener('load', function() {
  if (window.location.pathname.includes('trips.html')) {
    setTimeout(animateStats, 300);
  }
});