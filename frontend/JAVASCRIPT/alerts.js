// ============================================
// alerts.js - Alerts Management System
// ============================================

// Sample alerts data
const alertsData = [
  {
    id: 'ALT-001',
    type: 'critical',
    title: 'Critical Battery Level - BIN-007',
    description: 'Battery level dropped to 12%. Bin requires immediate charging to avoid service disruption.',
    binId: 'BIN-007',
    location: 'Mit Khamis, Mansoura',
    priority: 'High',
    timestamp: new Date(Date.now() - 10 * 60000),
    status: 'active',
    unread: true
  },
  {
    id: 'ALT-002',
    type: 'critical',
    title: 'Bin Overfilled - BIN-001',
    description: 'Fill level reached 98%. Autonomous collection triggered but bin is stationary.',
    binId: 'BIN-001',
    location: 'Al Gomhoria St, Mansoura',
    priority: 'High',
    timestamp: new Date(Date.now() - 25 * 60000),
    status: 'active',
    unread: true
  },
  {
    id: 'ALT-003',
    type: 'critical',
    title: 'Navigation System Failure - BIN-004',
    description: 'GPS signal lost. Bin unable to navigate autonomously. Manual intervention required.',
    binId: 'BIN-004',
    location: 'Unknown',
    priority: 'High',
    timestamp: new Date(Date.now() - 45 * 60000),
    status: 'active',
    unread: true
  },
  {
    id: 'ALT-004',
    type: 'warning',
    title: 'Maintenance Due - BIN-003',
    description: 'Scheduled maintenance is due in 48 hours. Please schedule service appointment.',
    binId: 'BIN-003',
    location: 'Al Mashaya Area, Mansoura',
    priority: 'Medium',
    timestamp: new Date(Date.now() - 2 * 3600000),
    status: 'active',
    unread: true
  },
  {
    id: 'ALT-005',
    type: 'warning',
    title: 'High Temperature Alert - BIN-005',
    description: 'Internal temperature exceeded normal range (42°C). Monitor for potential issues.',
    binId: 'BIN-005',
    location: 'Toriel District, Mansoura',
    priority: 'Medium',
    timestamp: new Date(Date.now() - 4 * 3600000),
    status: 'acknowledged',
    unread: false
  },
  {
    id: 'ALT-006',
    type: 'warning',
    title: 'Fill Level Rising Fast - BIN-008',
    description: 'Fill level increased from 45% to 72% in the last hour. Predict full in 2 hours.',
    binId: 'BIN-008',
    location: 'Al Hurriya Square, Mansoura',
    priority: 'Medium',
    timestamp: new Date(Date.now() - 30 * 60000),
    status: 'active',
    unread: true
  },
  {
    id: 'ALT-007',
    type: 'warning',
    title: 'Wheel Malfunction Detected - BIN-006',
    description: 'Front right wheel showing irregular rotation. Reduced movement speed to 60%.',
    binId: 'BIN-006',
    location: 'Talkha Entrance, Mansoura',
    priority: 'Medium',
    timestamp: new Date(Date.now() - 90 * 60000),
    status: 'acknowledged',
    unread: false
  },
  {
    id: 'ALT-008',
    type: 'info',
    title: 'Collection Completed - BIN-002',
    description: 'Successfully completed collection route. Total distance: 12.3 km, Duration: 43 min.',
    binId: 'BIN-002',
    location: 'Al Matar Area, Mansoura',
    priority: 'Low',
    timestamp: new Date(Date.now() - 1 * 3600000),
    status: 'acknowledged',
    unread: false
  },
  {
    id: 'ALT-009',
    type: 'info',
    title: 'System Update Available',
    description: 'Firmware version 2.4.1 is available for all bins. Includes performance improvements.',
    binId: 'All',
    location: 'System',
    priority: 'Low',
    timestamp: new Date(Date.now() - 6 * 3600000),
    status: 'active',
    unread: false
  },
  {
    id: 'ALT-010',
    type: 'success',
    title: 'Battery Fully Charged - BIN-009',
    description: 'Charging completed. Battery at 100%. Bin ready for operation.',
    binId: 'BIN-009',
    location: 'Charging Station A',
    priority: 'Low',
    timestamp: new Date(Date.now() - 45 * 60000),
    status: 'resolved',
    unread: false
  },
  {
    id: 'ALT-011',
    type: 'info',
    title: 'Route Optimization Completed',
    description: 'AI-powered route optimization saved 18% travel time across all active bins today.',
    binId: 'System',
    location: 'System',
    priority: 'Low',
    timestamp: new Date(Date.now() - 5 * 3600000),
    status: 'resolved',
    unread: false
  },
  {
    id: 'ALT-012',
    type: 'critical',
    title: 'Sensor Failure - BIN-011',
    description: 'Fill level sensor not responding. Manual inspection required immediately.',
    binId: 'BIN-011',
    location: 'Industrial Zone, Mansoura',
    priority: 'High',
    timestamp: new Date(Date.now() - 15 * 60000),
    status: 'active',
    unread: true
  },
  {
    id: 'ALT-013',
    type: 'warning',
    title: 'Low Battery Warning - BIN-010',
    description: 'Battery level at 28%. Consider sending to charging station soon.',
    binId: 'BIN-010',
    location: 'Mansoura Ring Road',
    priority: 'Medium',
    timestamp: new Date(Date.now() - 55 * 60000),
    status: 'active',
    unread: true
  },
  {
    id: 'ALT-014',
    type: 'info',
    title: 'Scheduled Collection Completed',
    description: 'Bin completed scheduled collection. No issues reported.',
    binId: 'BIN-012',
    location: 'Old City Center, Mansoura',
    priority: 'Low',
    timestamp: new Date(Date.now() - 3 * 3600000),
    status: 'resolved',
    unread: false
  },
  {
    id: 'ALT-015',
    type: 'critical',
    title: 'Collision Detected - BIN-013',
    description: 'Obstacle collision detected. Emergency stop activated. Inspection needed.',
    binId: 'BIN-013',
    location: 'Al Mashaya Corniche, Mansoura',
    priority: 'High',
    timestamp: new Date(Date.now() - 35 * 60000),
    status: 'active',
    unread: true
  }
];

let currentFilter = 'all';
let selectedAlertId = null;

// Initialize page
function initAlertsPage() {
  console.log('Initializing Alerts page...');
  renderAlerts();
  setupEventListeners();
  animateStats();
  
  // Auto-refresh every 30 seconds
  setInterval(() => {
    updateAlertCounts();
  }, 30000);
}

// Setup event listeners
function setupEventListeners() {
  // Filter chips
  document.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', function() {
      document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
      this.classList.add('active');
      currentFilter = this.dataset.filter;
      renderAlerts();
    });
  });

  // Search input
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      renderAlerts(this.value);
    });
  }

  // Filters
  const statusFilter = document.getElementById('statusFilter');
  if (statusFilter) {
    statusFilter.addEventListener('change', () => renderAlerts());
  }

  const timeFilter = document.getElementById('timeFilter');
  if (timeFilter) {
    timeFilter.addEventListener('change', () => renderAlerts());
  }
}

// Render alerts
function renderAlerts(searchQuery = '') {
  let filtered = alertsData.filter(alert => {
    if (currentFilter !== 'all' && alert.type !== currentFilter) return false;
    
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter && statusFilter.value !== 'all' && alert.status !== statusFilter.value) {
      return false;
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return alert.title.toLowerCase().includes(query) ||
             alert.description.toLowerCase().includes(query) ||
             alert.binId.toLowerCase().includes(query);
    }
    
    return true;
  });

  const active = filtered.filter(a => a.status === 'active');
  const acknowledged = filtered.filter(a => a.status === 'acknowledged');
  const resolved = filtered.filter(a => a.status === 'resolved');

  renderAlertsList('activeAlertsList', active);
  renderAlertsList('acknowledgedAlertsList', acknowledged);
  renderAlertsList('resolvedAlertsList', resolved);

  updateSectionCount('activeAlertsCount', active.length);
  updateSectionCount('acknowledgedCount', acknowledged.length);
  updateSectionCount('resolvedAlertsCount', resolved.length);
}

// Render alerts list
function renderAlertsList(containerId, alerts) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (alerts.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-inbox"></i>
        <h3>No alerts found</h3>
        <p>All clear in this category</p>
      </div>
    `;
    return;
  }

  container.innerHTML = alerts.map(alert => `
    <div class="alert-item ${alert.type} ${alert.unread ? 'unread' : ''}" onclick="showAlertDetails('${alert.id}')">
      <div class="alert-icon-wrapper">
        <div class="alert-icon">
          <i class="fas fa-${getAlertIcon(alert.type)}"></i>
        </div>
      </div>
      <div class="alert-content">
        <div class="alert-header">
          <h4 class="alert-title">${alert.title}</h4>
          <div class="alert-time">
            <i class="fas fa-clock"></i>
            ${formatTimeAgo(alert.timestamp)}
          </div>
        </div>
        <p class="alert-description">${alert.description}</p>
        <div class="alert-meta">
          ${alert.binId !== 'System' && alert.binId !== 'All' ? `
            <span class="alert-badge bin">
              <i class="fas fa-robot"></i>
              ${alert.binId}
            </span>
          ` : ''}
          ${alert.location !== 'System' ? `
            <span class="alert-badge location">
              <i class="fas fa-map-marker-alt"></i>
              ${alert.location}
            </span>
          ` : ''}
          ${alert.priority !== 'Low' ? `
            <span class="alert-badge priority">
              <i class="fas fa-flag"></i>
              ${alert.priority} Priority
            </span>
          ` : ''}
        </div>
        ${alert.status === 'active' ? `
          <div class="alert-actions" onclick="event.stopPropagation()">
            <button class="alert-action-btn primary" onclick="acknowledgeAlertQuick('${alert.id}')">
              <i class="fas fa-check"></i>
              Acknowledge
            </button>
            <button class="alert-action-btn success" onclick="resolveAlertQuick('${alert.id}')">
              <i class="fas fa-check-double"></i>
              Resolve
            </button>
          </div>
        ` : ''}
      </div>
    </div>
  `).join('');
}

// Get alert icon
function getAlertIcon(type) {
  const icons = {
    critical: 'exclamation-circle',
    warning: 'exclamation-triangle',
    info: 'info-circle',
    success: 'check-circle'
  };
  return icons[type] || 'bell';
}

// Format time ago
function formatTimeAgo(timestamp) {
  const now = new Date();
  const diff = Math.floor((now - timestamp) / 1000);

  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  return `${Math.floor(diff / 86400)} days ago`;
}

// Update section count
function updateSectionCount(elementId, count) {
  const element = document.getElementById(elementId);
  if (element) element.textContent = count;
}

// Show alert details
function showAlertDetails(alertId) {
  const alert = alertsData.find(a => a.id === alertId);
  if (!alert) return;

  selectedAlertId = alertId;
  alert.unread = false;

  const modalBody = document.getElementById('alertModalBody');
  modalBody.innerHTML = `
    <div class="detail-section">
      <h3><i class="fas fa-info-circle"></i> Alert Information</h3>
      <div class="detail-grid">
        <div class="detail-item">
          <div class="detail-label">Alert ID</div>
          <div class="detail-value">${alert.id}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Type</div>
          <div class="detail-value">
            <span class="alert-badge ${alert.type}">
              ${capitalizeFirst(alert.type)}
            </span>
          </div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Priority</div>
          <div class="detail-value">${alert.priority}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Status</div>
          <div class="detail-value">${capitalizeFirst(alert.status)}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Bin ID</div>
          <div class="detail-value">${alert.binId}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Location</div>
          <div class="detail-value">${alert.location}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Time</div>
          <div class="detail-value">${formatDateTime(alert.timestamp)}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Time Ago</div>
          <div class="detail-value">${formatTimeAgo(alert.timestamp)}</div>
        </div>
      </div>
    </div>
    
    <div class="detail-section">
      <h3><i class="fas fa-align-left"></i> Description</h3>
      <p style="color: #4b5563; line-height: 1.6;">${alert.description}</p>
    </div>
    
    ${alert.status === 'active' ? `
      <div class="detail-section">
        <h3><i class="fas fa-tasks"></i> Recommended Actions</h3>
        <ul style="color: #4b5563; line-height: 1.8; padding-left: 20px;">
          ${getRecommendedActions(alert).map(action => `<li>${action}</li>`).join('')}
        </ul>
      </div>
    ` : ''}
  `;

  const modal = document.getElementById('alertModal');
  modal.classList.add('show');
}

// Get recommended actions
function getRecommendedActions(alert) {
  if (alert.title.includes('Battery')) {
    return [
      'Send bin to nearest charging station immediately',
      'Schedule maintenance check for battery health',
      'Monitor battery consumption patterns'
    ];
  }
  if (alert.title.includes('Overfilled')) {
    return [
      'Verify bin autonomous navigation status',
      'Dispatch manual collection if needed',
      'Check for mechanical issues preventing movement'
    ];
  }
  if (alert.title.includes('Maintenance')) {
    return [
      'Schedule maintenance appointment within 48 hours',
      'Review maintenance history and logs',
      'Prepare replacement parts if needed'
    ];
  }
  return [
    'Investigate the issue further',
    'Contact technical support if needed',
    'Document any relevant observations'
  ];
}

// Format date time
function formatDateTime(date) {
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Capitalize
function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Close modal
function closeModal() {
  document.getElementById('alertModal').classList.remove('show');
  renderAlerts();
}

// Acknowledge alert
function acknowledgeAlert() {
  if (!selectedAlertId) return;
  const alert = alertsData.find(a => a.id === selectedAlertId);
  if (alert) {
    alert.status = 'acknowledged';
    closeModal();
    showNotification('Alert acknowledged successfully', 'success');
  }
}

// Resolve alert
function resolveAlert() {
  if (!selectedAlertId) return;
  const alert = alertsData.find(a => a.id === selectedAlertId);
  if (alert) {
    alert.status = 'resolved';
    closeModal();
    showNotification('Alert resolved successfully', 'success');
  }
}

// Quick actions
function acknowledgeAlertQuick(alertId) {
  const alert = alertsData.find(a => a.id === alertId);
  if (alert) {
    alert.status = 'acknowledged';
    renderAlerts();
    showNotification('Alert acknowledged', 'success');
  }
}

function resolveAlertQuick(alertId) {
  const alert = alertsData.find(a => a.id === alertId);
  if (alert) {
    alert.status = 'resolved';
    renderAlerts();
    showNotification('Alert resolved', 'success');
  }
}

// Mark all as read
function markAllAsRead() {
  alertsData.forEach(alert => alert.unread = false);
  renderAlerts();
  showNotification('All alerts marked as read', 'success');
}

// Refresh alerts
function refreshAlerts() {
  const btn = event.target.closest('.action-btn');
  const icon = btn.querySelector('i');
  
  icon.classList.add('fa-spin');
  
  setTimeout(() => {
    renderAlerts();
    updateAlertCounts();
    icon.classList.remove('fa-spin');
    showNotification('Alerts refreshed', 'info');
  }, 1000);
}

// Update counts
function updateAlertCounts() {
  const critical = alertsData.filter(a => a.type === 'critical' && a.status === 'active').length;
  const warning = alertsData.filter(a => a.type === 'warning' && a.status === 'active').length;
  const info = alertsData.filter(a => a.type === 'info' && a.status === 'active').length;
  const resolved = alertsData.filter(a => a.status === 'resolved').length;

  document.getElementById('criticalCount').textContent = critical;
  document.getElementById('warningCount').textContent = warning;
  document.getElementById('infoCount').textContent = info;
  document.getElementById('resolvedCount').textContent = resolved;
}

// Animate stats
function animateStats() {
  const critical = alertsData.filter(a => a.type === 'critical' && a.status === 'active').length;
  const warning = alertsData.filter(a => a.type === 'warning' && a.status === 'active').length;
  const info = alertsData.filter(a => a.type === 'info' && a.status === 'active').length;
  const resolved = alertsData.filter(a => a.status === 'resolved').length;

  animateValue('criticalCount', 0, critical, 1000);
  animateValue('warningCount', 0, warning, 1000);
  animateValue('infoCount', 0, info, 1000);
  animateValue('resolvedCount', 0, resolved, 1000);
}

function animateValue(id, start, end, duration) {
  const obj = document.getElementById(id);
  if (!obj) return;

  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const value = Math.floor(progress * (end - start) + start);
    obj.textContent = value;
    
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
}

// Toggle section
function toggleSection(header) {
  header.closest('.alerts-section').classList.toggle('collapsed');
}

// Config modal
function openConfigModal() {
  document.getElementById('configModal').classList.add('show');
}

function closeConfigModal() {
  document.getElementById('configModal').classList.remove('show');
}

function saveSettings() {
  showNotification('Settings saved successfully', 'success');
  closeConfigModal();
}

// Show notification
function showNotification(message, type = 'info') {
  console.log(`${type.toUpperCase()}: ${message}`);
}

// Close modals on outside click
window.addEventListener('click', function(e) {
  if (e.target.id === 'alertModal') closeModal();
  if (e.target.id === 'configModal') closeConfigModal();
});

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  if (window.location.pathname.includes('alerts.html')) {
    initAlertsPage();
  }
});

window.addEventListener('load', function() {
  if (window.location.pathname.includes('alerts.html')) {
    setTimeout(animateStats, 300);
  }
});
// ============================================
// Topbar Functions - Added from Overview
// ============================================

// Toggle Notifications Dropdown
function toggleNotifications() {
  const dropdown = document.getElementById('notificationsDropdown');
  if (dropdown) {
    dropdown.classList.toggle('show');
    
    // Close when clicking outside
    setTimeout(() => {
      document.addEventListener('click', function closeNotifications(e) {
        if (!e.target.closest('#notificationBtn') && !e.target.closest('#notificationsDropdown')) {
          dropdown.classList.remove('show');
          document.removeEventListener('click', closeNotifications);
        }
      });
    }, 100);
  }
}

// Clear All Notifications
function clearNotifications() {
  const notificationsList = document.querySelector('.notifications-list');
  if (notificationsList) {
    notificationsList.innerHTML = '<div style="text-align: center; padding: 20px; color: #6b7280;">No notifications</div>';
  }
  showToast('Notifications cleared', 'All notifications have been cleared', 'success');
}

// Toggle Dark Theme
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

// Export Alerts
function exportAlerts() {
  showToast('Exporting...', 'Preparing alerts data for export', 'info');
  
  setTimeout(() => {
    // Simulate export
    const alertsData = {
      exportDate: new Date().toISOString(),
      totalAlerts: 45,
      critical: 5,
      warnings: 12,
      info: 28
    };
    
    const dataStr = JSON.stringify(alertsData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `alerts-export-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showToast('Export Complete', 'Alerts data exported successfully', 'success');
  }, 1500);
}

// Show Toast Notification
function showToast(title, message, type = 'info') {
  const toastContainer = document.getElementById('toastContainer');
  if (!toastContainer) return;
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const icons = {
    success: 'fa-check-circle',
    error: 'fa-exclamation-circle',
    warning: 'fa-exclamation-triangle',
    info: 'fa-info-circle'
  };
  
  toast.innerHTML = `
    <div class="toast-icon">
      <i class="fas ${icons[type]}"></i>
    </div>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-message">${message}</div>
    </div>
    <button class="toast-close" onclick="this.parentElement.remove()">
      <i class="fas fa-times"></i>
    </button>
  `;
  
  toastContainer.appendChild(toast);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    toast.style.animation = 'toastSlideOut 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 5000);
}

// Slide out animation for toast
const toastStyle = document.createElement('style');
toastStyle.textContent = `
  @keyframes toastSlideOut {
    from {
      opacity: 1;
      transform: translateX(0);
    }
    to {
      opacity: 0;
      transform: translateX(100%);
    }
  }
`;
document.head.appendChild(toastStyle);

// Load theme on page load
document.addEventListener('DOMContentLoaded', function() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
    const icon = document.getElementById('themeIcon');
    if (icon) {
      icon.classList.remove('fa-moon');
      icon.classList.add('fa-sun');
    }
  }
});
