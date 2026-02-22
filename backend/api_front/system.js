// ============================================
// system.js - System Configuration Management
// ============================================

// ── Auth Guard ──
if (typeof API !== 'undefined' && typeof API.isLoggedIn === 'function' && !API.isLoggedIn()) {
    window.location.href = '/pages/login.html';
}

// ── Logout ──
function logoutUser() {
    if (typeof API !== 'undefined') {
        if (typeof API.logout === 'function') API.logout();
        if (typeof API.clearSession === 'function') API.clearSession();
    }
    window.location.href = '/pages/login.html';
}

// Sample API Keys
const apiKeys = [
  {
    id: 1,
    name: 'Production API',
    key: 'sk_live_4873ff3461e6xyz123abc',
    created: '2024-01-15',
    lastUsed: '2 hours ago'
  },
  {
    id: 2,
    name: 'Development API',
    key: 'sk_test_1a2b3c4d5e6f7g8h9i0j',
    created: '2024-01-20',
    lastUsed: '1 day ago'
  },
  {
    id: 3,
    name: 'Mobile App API',
    key: 'sk_live_9876xyz321abc543def',
    created: '2024-01-10',
    lastUsed: '5 mins ago'
  }
];

let currentTab = 'general';
let hasUnsavedChanges = false;
let systemViewMode = 'normal'; // 'normal' | 'compact'

// Initialize page
function initSystemPage() {
  console.log('Initializing System Configuration page...');
  
  // Load saved theme preference (shared across dashboard pages)
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    const themeIcon = document.getElementById('systemThemeIcon');
    if (themeIcon) {
      themeIcon.className = 'fas fa-sun';
    }
  }

  // Load saved view mode for system settings density
  const savedView = localStorage.getItem('systemViewMode');
  if (savedView === 'compact') {
    systemViewMode = 'compact';
    document.body.classList.add('system-compact-view');
  }
  const viewIcon = document.getElementById('systemViewIcon');
  if (viewIcon) {
    viewIcon.className = systemViewMode === 'compact' ? 'fas fa-table' : 'fas fa-th-large';
  }
  setupTabs();
  setupEventListeners();
  renderApiKeys();
  
  // Track changes
  trackFormChanges();
}

// Setup tabs
function setupTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');
  
  tabBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const tabId = this.dataset.tab;
      
      // Update active states
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanels.forEach(p => p.classList.remove('active'));
      
      this.classList.add('active');
      document.getElementById(tabId).classList.add('active');
      
      currentTab = tabId;
    });
  });
}

// Setup event listeners
function setupEventListeners() {
  // Search functionality
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      searchSettings(this.value);
    });
  }
  
  // Warn before leaving if unsaved changes
  window.addEventListener('beforeunload', function(e) {
    if (hasUnsavedChanges) {
      e.preventDefault();
      e.returnValue = '';
    }
  });
}

// Track form changes
function trackFormChanges() {
  const inputs = document.querySelectorAll('input, select');
  inputs.forEach(input => {
    input.addEventListener('change', function() {
      hasUnsavedChanges = true;
    });
  });
}

// Search settings
function searchSettings(query) {
  if (!query) {
    document.querySelectorAll('.setting-item').forEach(item => {
      item.style.display = 'flex';
    });
    return;
  }
  
  const lowerQuery = query.toLowerCase();
  document.querySelectorAll('.setting-item').forEach(item => {
    const text = item.textContent.toLowerCase();
    if (text.includes(lowerQuery)) {
      item.style.display = 'flex';
    } else {
      item.style.display = 'none';
    }
  });
}

// Render API Keys
function renderApiKeys() {
  const container = document.getElementById('apiKeysList');
  if (!container) return;
  
  container.innerHTML = apiKeys.map(key => `
    <div class="api-key-item" data-id="${key.id}">
      <div class="api-key-info">
        <div class="api-key-name">${key.name}</div>
        <div class="api-key-value">${maskApiKey(key.key)}</div>
        <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">
          Created: ${key.created} • Last used: ${key.lastUsed}
        </div>
      </div>
      <div class="api-key-actions">
        <button class="api-key-btn" onclick="copyApiKey('${key.key}')">
          <i class="fas fa-copy"></i> Copy
        </button>
        <button class="api-key-btn" onclick="viewApiKey('${key.key}')">
          <i class="fas fa-eye"></i> View
        </button>
        <button class="api-key-btn danger" onclick="deleteApiKey(${key.id})">
          <i class="fas fa-trash"></i> Delete
        </button>
      </div>
    </div>
  `).join('');
}

// Mask API key
function maskApiKey(key) {
  const visible = 8;
  const masked = key.slice(0, visible) + '•'.repeat(key.length - visible * 2) + key.slice(-visible);
  return masked;
}

// Generate new API key
function generateApiKey() {
  const newKey = {
    id: apiKeys.length + 1,
    name: `API Key ${apiKeys.length + 1}`,
    key: generateRandomKey(),
    created: new Date().toISOString().split('T')[0],
    lastUsed: 'Never'
  };
  
  apiKeys.push(newKey);
  renderApiKeys();
  showSuccessMessage('New API key generated successfully');
}

// Generate random key
function generateRandomKey() {
  const prefix = 'sk_live_';
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let key = prefix;
  for (let i = 0; i < 24; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

// Copy API key
function copyApiKey(key) {
  navigator.clipboard.writeText(key).then(() => {
    showSuccessMessage('API key copied to clipboard');
  }).catch(err => {
    console.error('Failed to copy:', err);
  });
}

// View API key
function viewApiKey(key) {
  const modal = document.createElement('div');
  modal.className = 'modal show';
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 500px;">
      <div class="modal-header">
        <h2>API Key</h2>
        <button class="modal-close" onclick="this.closest('.modal').remove()">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="modal-body">
        <p style="color: #6b7280; margin-bottom: 12px;">Full API Key:</p>
        <div style="background: rgba(72, 115, 255, 0.05); padding: 12px; border-radius: 8px; font-family: 'Courier New', monospace; word-break: break-all; color: #1a1f3a;">
          ${key}
        </div>
        <button class="btn-primary" style="margin-top: 16px; width: 100%;" onclick="copyApiKey('${key}'); this.closest('.modal').remove();">
          <i class="fas fa-copy"></i>
          Copy to Clipboard
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

// Delete API key
function deleteApiKey(id) {
  if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
    return;
  }
  
  const index = apiKeys.findIndex(k => k.id === id);
  if (index !== -1) {
    apiKeys.splice(index, 1);
    renderApiKeys();
    showSuccessMessage('API key deleted successfully');
  }
}

// Save settings
function saveSettings() {
  // Show loading
  const btn = event.target;
  const originalText = btn.innerHTML;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
  btn.disabled = true;
  
  // Simulate API call
  setTimeout(() => {
    // Collect all settings
    const settings = collectSettings();
    console.log('Saving settings:', settings);
    
    // Reset button
    btn.innerHTML = originalText;
    btn.disabled = false;
    
    // Mark as saved
    hasUnsavedChanges = false;
    
    // Show success message
    showSuccessMessage('Settings saved successfully');
  }, 1500);
}

// Collect all settings
function collectSettings() {
  const settings = {};
  
  // Collect from all inputs
  document.querySelectorAll('.tab-panel.active input, .tab-panel.active select').forEach(input => {
    const name = input.name || input.id;
    if (name) {
      if (input.type === 'checkbox') {
        settings[name] = input.checked;
      } else {
        settings[name] = input.value;
      }
    }
  });
  
  return settings;
}

// Reset settings
function resetSettings() {
  if (!confirm('Are you sure you want to reset all settings to defaults? This will undo all your changes.')) {
    return;
  }
  
  // Reset all inputs in current tab
  document.querySelectorAll('.tab-panel.active input, .tab-panel.active select').forEach(input => {
    if (input.type === 'checkbox') {
      input.checked = input.defaultChecked;
    } else {
      input.value = input.defaultValue;
    }
  });
  
  hasUnsavedChanges = false;
  showSuccessMessage('Settings reset to defaults');
}

// Show success message
function showSuccessMessage(message) {
  // Remove existing messages
  document.querySelectorAll('.success-message').forEach(msg => msg.remove());
  
  // Create new message
  const msgEl = document.createElement('div');
  msgEl.className = 'success-message';
  msgEl.innerHTML = `
    <i class="fas fa-check-circle"></i>
    <span>${message}</span>
  `;
  
  document.body.appendChild(msgEl);
  
  // Remove after 3 seconds
  setTimeout(() => {
    msgEl.style.animation = 'slideOutRight 0.3s ease';
    setTimeout(() => msgEl.remove(), 300);
  }, 3000);
}

// Slide out animation
const style = document.createElement('style');
style.textContent = `
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

// Export configuration
function exportConfiguration() {
  const settings = collectSettings();
  const dataStr = JSON.stringify(settings, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
  
  const exportFileDefaultName = `system-config-${new Date().toISOString().split('T')[0]}.json`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
  
  showSuccessMessage('Configuration exported successfully');
}

// Import configuration
function importConfiguration() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  
  input.onchange = e => {
    const file = e.target.files[0];
    const reader = new FileReader();
    
    reader.onload = event => {
      try {
        const config = JSON.parse(event.target.result);
        applyConfiguration(config);
        showSuccessMessage('Configuration imported successfully');
      } catch (err) {
        alert('Invalid configuration file');
      }
    };
    
    reader.readAsText(file);
  };
  
  input.click();
}

// Apply configuration
function applyConfiguration(config) {
  Object.keys(config).forEach(key => {
    const input = document.querySelector(`[name="${key}"], #${key}`);
    if (input) {
      if (input.type === 'checkbox') {
        input.checked = config[key];
      } else {
        input.value = config[key];
      }
    }
  });
  
  hasUnsavedChanges = true;
}

// Test API connection
function testApiConnection() {
  showSuccessMessage('Testing API connection...');
  
  setTimeout(() => {
    const success = Math.random() > 0.2; // 80% success rate
    
    if (success) {
      showSuccessMessage('✓ API connection successful');
    } else {
      showErrorMessage('✗ API connection failed');
    }
  }, 2000);
}

// Show error message
function showErrorMessage(message) {
  const msgEl = document.createElement('div');
  msgEl.className = 'success-message';
  msgEl.style.borderLeftColor = '#ef4444';
  msgEl.innerHTML = `
    <i class="fas fa-exclamation-circle" style="color: #ef4444;"></i>
    <span>${message}</span>
  `;
  
  document.body.appendChild(msgEl);
  
  setTimeout(() => {
    msgEl.style.animation = 'slideOutRight 0.3s ease';
    setTimeout(() => msgEl.remove(), 300);
  }, 3000);
}

// Topbar: toggle notifications dropdown (system page)
function toggleSystemNotifications() {
  const dropdown = document.getElementById('systemNotificationsDropdown');
  if (dropdown) {
    dropdown.classList.toggle('show');
  }
}

function clearSystemNotifications() {
  const notificationsList = document.querySelector('.notifications-list');
  if (notificationsList) {
    notificationsList.innerHTML = '<div style="text-align: center; padding: 20px; color: #6b7280;">No notifications</div>';
  }
  showSuccessMessage('All system notifications cleared');
}

// Topbar: toggle dark mode (system page)
function toggleSystemTheme() {
  document.body.classList.toggle('dark-mode');
  const icon = document.getElementById('systemThemeIcon');

  if (document.body.classList.contains('dark-mode')) {
    if (icon) icon.className = 'fas fa-sun';
    localStorage.setItem('theme', 'dark');
    showSuccessMessage('Dark mode enabled');
  } else {
    if (icon) icon.className = 'fas fa-moon';
    localStorage.setItem('theme', 'light');
    showSuccessMessage('Dark mode disabled');
  }
}

// Topbar: toggle compact view for settings grid
function toggleSystemView() {
  const viewIcon = document.getElementById('systemViewIcon');

  if (systemViewMode === 'normal') {
    systemViewMode = 'compact';
    document.body.classList.add('system-compact-view');
    if (viewIcon) viewIcon.className = 'fas fa-table';
    localStorage.setItem('systemViewMode', 'compact');
    showSuccessMessage('Compact settings view enabled');
  } else {
    systemViewMode = 'normal';
    document.body.classList.remove('system-compact-view');
    if (viewIcon) viewIcon.className = 'fas fa-th-large';
    localStorage.setItem('systemViewMode', 'normal');
    showSuccessMessage('Normal settings view enabled');
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  if (window.location.pathname.includes('/pages/system.html')) {
    initSystemPage();

    // Close notifications when clicking outside
    document.addEventListener('click', function(event) {
      const dropdown = document.getElementById('systemNotificationsDropdown');
      const notificationBtn = document.getElementById('systemNotificationBtn');
      
      if (dropdown && !dropdown.contains(event.target) &&
          notificationBtn && !notificationBtn.contains(event.target)) {
        dropdown.classList.remove('show');
      }
    });
  }
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
  // Ctrl/Cmd + S to save
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    saveSettings();
  }
  
  // Ctrl/Cmd + R to reset (in addition to default)
  if ((e.ctrlKey || e.metaKey) && e.key === 'r' && e.shiftKey) {
    e.preventDefault();
    resetSettings();
  }
});

// Add keyboard shortcut hints
window.addEventListener('load', function() {
  if (window.location.pathname.includes('system.html')) {
    console.log('Keyboard shortcuts:');
    console.log('- Ctrl/Cmd + S: Save settings');
    console.log('- Ctrl/Cmd + Shift + R: Reset settings');
  }
});
// Topbar Functions
function toggleNotifications() {
  const dropdown = document.getElementById('notificationsDropdown');
  if (dropdown) {
    dropdown.classList.toggle('show');
    
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

function clearNotifications() {
  const notificationsList = document.querySelector('.notifications-list');
  if (notificationsList) {
    notificationsList.innerHTML = '<div style="text-align: center; padding: 20px; color: #6b7280;">No notifications</div>';
  }
}

function toggleTheme() {
  document.body.classList.toggle('dark-theme');
  const icon = document.getElementById('themeIcon');
  if (icon) {
    icon.classList.toggle('fa-moon');
    icon.classList.toggle('fa-sun');
  }
  localStorage.setItem('theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
}

// Quick Action Functions
function runSystemDiagnostics() {
  showSuccessMessage('Running system diagnostics...');
  
  setTimeout(() => {
    showSuccessMessage('✓ System diagnostics completed - All systems operational');
  }, 3000);
}

function clearCache() {
  if (confirm('Are you sure you want to clear the cache? This may temporarily slow down the system.')) {
    showSuccessMessage('Clearing cache...');
    
    setTimeout(() => {
      showSuccessMessage('✓ Cache cleared successfully');
    }, 1500);
  }
}

function backupNow() {
  showSuccessMessage('Starting backup process...');
  
  setTimeout(() => {
    showSuccessMessage('✓ Backup completed successfully');
  }, 2500);
}

function refreshActivity() {
  showSuccessMessage('Refreshing activity data...');
  setTimeout(() => {
    showSuccessMessage('✓ Activity data updated');
  }, 1000);
}

function exportTable() {
  showSuccessMessage('Exporting table data...');
  setTimeout(() => {
    showSuccessMessage('✓ Table data exported');
  }, 1000);
}