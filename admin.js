/**
 * CityCare - Admin Dashboard Logic
 * Manages government complaint review, status updating, real-time searching/filtering,
 * statistics updates, and cross-tab synchronization.
 */

document.addEventListener('DOMContentLoaded', () => {
  initAdminDashboard();
});

const STORAGE_KEY = 'citycare_complaints';
let allComplaints = [];
let selectedComplaintId = null;
let activeSelectedStatus = '';

/**
 * Initialize Admin Dashboard
 */
function initAdminDashboard() {
  loadComplaintsFromStorage();
  initSidebarFilters();
  initSearchAndDropdownFilters();
  initModalEvents();
  initResetDataButton();
  initCrossTabSync();
  renderDashboard();
}

/**
 * Read from localStorage or Seed if Empty
 */
function loadComplaintsFromStorage() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data || JSON.parse(data).length === 0) {
    seedDefaultComplaints();
  } else {
    allComplaints = JSON.parse(data);
  }
}

/**
 * Seed initial sample dataset if localStorage is empty
 */
function seedDefaultComplaints() {
  allComplaints = [
    {
      id: 'CC-2026-0101',
      fullName: 'Rahul Sharma',
      phone: '+91 98765 43210',
      category: 'Garbage',
      title: 'Uncollected Garbage Pile near Green Park Market',
      description: 'Garbage has been accumulating for 4 days near the central vegetable market gate. Needs urgent cleanup.',
      location: 'Green Park Sector 4, Main Market Road',
      image: createCategoryPlaceholderSvg('Garbage'),
      priority: 'High',
      date: '2026-09-10 10:30 AM',
      status: 'Pending',
      adminRemarks: ''
    },
    {
      id: 'CC-2026-0102',
      fullName: 'Anita Desai',
      phone: '+91 98123 45678',
      category: 'Road & Potholes',
      title: 'Dangerous Pothole on MG Road Flyover Slip Road',
      description: 'Large deep pothole causing severe traffic slowdowns and bike hazards near pillar 42.',
      location: 'MG Road Flyover Slipway, West Junction',
      image: createCategoryPlaceholderSvg('Road & Potholes'),
      priority: 'High',
      date: '2026-09-11 02:15 PM',
      status: 'In Progress',
      adminRemarks: 'Field road repair team dispatched with asphalt patcher.'
    },
    {
      id: 'CC-2026-0103',
      fullName: 'Vikram Singh',
      phone: '+91 97654 32109',
      category: 'Streetlights',
      title: 'Broken Streetlights on 5th Avenue',
      description: 'Four consecutive streetlights are non-functional, making the street unsafe at night.',
      location: '5th Avenue, Block C, near Community Center',
      image: createCategoryPlaceholderSvg('Streetlights'),
      priority: 'Medium',
      date: '2026-09-12 09:00 AM',
      status: 'Assigned',
      adminRemarks: 'Electrical engineering team assigned.'
    },
    {
      id: 'CC-2026-0104',
      fullName: 'Priya Patel',
      phone: '+91 99887 76655',
      category: 'Water Leakage',
      title: 'Major Pipeline Leakage wasting clean water',
      description: 'Underground water pipe burst leaking clean water into street drain.',
      location: 'Crossroad 12, near City Public Library',
      image: createCategoryPlaceholderSvg('Water Leakage'),
      priority: 'High',
      date: '2026-09-08 11:45 AM',
      status: 'Resolved',
      adminRemarks: 'Main valve repaired and pipe section replaced.'
    },
    {
      id: 'CC-2026-0105',
      fullName: 'Suresh Kumar',
      phone: '+91 91234 56789',
      category: 'Drainage',
      title: 'Blocked Stormwater Drain causing waterlogging',
      description: 'Drain choked with debris causing standing water after heavy rain.',
      location: 'Station Road, near Sub-Post Office',
      image: createCategoryPlaceholderSvg('Drainage'),
      priority: 'Low',
      date: '2026-09-13 08:20 AM',
      status: 'Pending',
      adminRemarks: ''
    }
  ];

  localStorage.setItem(STORAGE_KEY, JSON.stringify(allComplaints));
}

function createCategoryPlaceholderSvg(category) {
  const bgColors = {
    'Garbage': '#E3F2FD',
    'Road & Potholes': '#E0F2FE',
    'Water Leakage': '#E0F2FE',
    'Streetlights': '#FFF7ED',
    'Drainage': '#F0F9FF',
    'Other': '#E3F2FD'
  };
  const bg = bgColors[category] || '#E3F2FD';
  
  const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
    <rect width="600" height="400" fill="${bg}"/>
    <rect x="20" y="20" width="560" height="360" rx="12" fill="#FFFFFF" stroke="#1565C0" stroke-width="2" stroke-dasharray="8 8"/>
    <circle cx="300" cy="180" r="48" fill="#1565C0"/>
    <text x="300" y="188" font-family="sans-serif" font-weight="bold" font-size="28" fill="#FFFFFF" text-anchor="middle">CC</text>
    <text x="300" y="270" font-family="sans-serif" font-weight="bold" font-size="22" fill="#0D47A1" text-anchor="middle">${category} Inspection Image</text>
    <text x="300" y="300" font-family="sans-serif" font-size="14" fill="#64748B" text-anchor="middle">Official CityCare Verified Field Upload</text>
  </svg>`;

  return 'data:image/svg+xml;base64,' + btoa(svgString);
}

/**
 * Render Dashboard: Updates KPI stats, sidebar badges, and applies filters
 */
function renderDashboard() {
  updateKPIStatistics();
  filterAndRenderTable();
}

/**
 * Update Top KPI Stat Cards & Sidebar Counters
 */
function updateKPIStatistics() {
  const total = allComplaints.length;
  const pending = allComplaints.filter(c => c.status === 'Pending').length;
  const assigned = allComplaints.filter(c => c.status === 'Assigned').length;
  const progress = allComplaints.filter(c => c.status === 'In Progress').length;
  const resolved = allComplaints.filter(c => c.status === 'Resolved').length;

  document.getElementById('kpi-total').innerText = total;
  document.getElementById('kpi-pending').innerText = pending;
  document.getElementById('kpi-progress').innerText = progress;
  document.getElementById('kpi-resolved').innerText = resolved;

  document.getElementById('count-all').innerText = total;
  document.getElementById('count-pending').innerText = pending;
  document.getElementById('count-assigned').innerText = assigned;
  document.getElementById('count-progress').innerText = progress;
  document.getElementById('count-resolved').innerText = resolved;
}

/**
 * Filter complaints array based on search text and controls
 */
function filterAndRenderTable() {
  const searchVal = document.getElementById('admin-search-input').value.trim().toLowerCase();
  const categoryVal = document.getElementById('filter-category').value;
  const statusVal = document.getElementById('filter-status').value;
  const priorityVal = document.getElementById('filter-priority').value;
  const sortBy = document.getElementById('sort-by').value;

  let filtered = allComplaints.filter(item => {
    // Search query match
    const matchSearch = !searchVal || 
      item.id.toLowerCase().includes(searchVal) ||
      item.fullName.toLowerCase().includes(searchVal) ||
      item.title.toLowerCase().includes(searchVal) ||
      item.location.toLowerCase().includes(searchVal) ||
      item.category.toLowerCase().includes(searchVal);

    // Category match
    const matchCategory = (categoryVal === 'ALL') || (item.category === categoryVal);

    // Status match
    const matchStatus = (statusVal === 'ALL') || (item.status === statusVal);

    // Priority match
    const matchPriority = (priorityVal === 'ALL') || (item.priority === priorityVal);

    return matchSearch && matchCategory && matchStatus && matchPriority;
  });

  // Sorting
  if (sortBy === 'NEWEST') {
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  } else if (sortBy === 'OLDEST') {
    filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
  } else if (sortBy === 'PRIORITY') {
    const pMap = { 'High': 3, 'Medium': 2, 'Low': 1 };
    filtered.sort((a, b) => pMap[b.priority] - pMap[a.priority]);
  }

  renderTableRows(filtered);
}

/**
 * Render HTML table rows
 */
function renderTableRows(complaints) {
  const tbody = document.getElementById('complaints-table-body');
  const emptyState = document.getElementById('empty-state');

  if (!tbody) return;

  if (complaints.length === 0) {
    tbody.innerHTML = '';
    if (emptyState) emptyState.classList.add('active');
    return;
  }

  if (emptyState) emptyState.classList.remove('active');

  tbody.innerHTML = complaints.map(c => {
    const statusClass = `badge-${c.status.toLowerCase().replace(' ', '-')}`;
    const priorityClass = `badge-priority-${c.priority.toLowerCase()}`;

    return `
      <tr>
        <td class="complaint-id-cell">${c.id}</td>
        <td class="citizen-cell">
          <span class="citizen-name">${escapeHtml(c.fullName)}</span>
          <span class="citizen-phone">${escapeHtml(c.phone)}</span>
        </td>
        <td>
          <div class="problem-title-cell" title="${escapeHtml(c.title)}">${escapeHtml(c.title)}</div>
          <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600;">${escapeHtml(c.category)}</span>
        </td>
        <td class="location-cell" title="${escapeHtml(c.location)}">${escapeHtml(c.location)}</td>
        <td><span class="badge ${priorityClass}">${c.priority}</span></td>
        <td style="font-size: 0.875rem; color: var(--text-muted);">${escapeHtml(c.date)}</td>
        <td><span class="badge ${statusClass}">${c.status}</span></td>
        <td>
          <button class="btn-action" onclick="openComplaintModal('${c.id}')">
            View & Update
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * Sidebar status filter buttons listener
 */
function initSidebarFilters() {
  const links = document.querySelectorAll('.sidebar-filter-link');
  const statusSelect = document.getElementById('filter-status');

  links.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      links.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      const filterStatus = link.getAttribute('data-filter-status');
      if (statusSelect) {
        statusSelect.value = filterStatus;
        filterAndRenderTable();
      }
    });
  });
}

/**
 * Search & Dropdown filter event listeners
 */
function initSearchAndDropdownFilters() {
  const searchInput = document.getElementById('admin-search-input');
  const catSelect = document.getElementById('filter-category');
  const statusSelect = document.getElementById('filter-status');
  const prioritySelect = document.getElementById('filter-priority');
  const sortSelect = document.getElementById('sort-by');

  if (searchInput) searchInput.addEventListener('input', filterAndRenderTable);
  if (catSelect) catSelect.addEventListener('change', filterAndRenderTable);
  if (statusSelect) {
    statusSelect.addEventListener('change', () => {
      // Sync sidebar active highlight
      const val = statusSelect.value;
      const links = document.querySelectorAll('.sidebar-filter-link');
      links.forEach(l => {
        if (l.getAttribute('data-filter-status') === val) {
          l.classList.add('active');
        } else {
          l.classList.remove('active');
        }
      });
      filterAndRenderTable();
    });
  }
  if (prioritySelect) prioritySelect.addEventListener('change', filterAndRenderTable);
  if (sortSelect) sortSelect.addEventListener('change', filterAndRenderTable);
}

/**
 * Open Complaint Review & Status Modal
 */
window.openComplaintModal = function(id) {
  const complaint = allComplaints.find(c => c.id === id);
  if (!complaint) return;

  selectedComplaintId = id;
  activeSelectedStatus = complaint.status;

  document.getElementById('modal-id').innerText = complaint.id;
  document.getElementById('modal-priority').innerText = `${complaint.priority} PRIORITY`;
  document.getElementById('modal-priority').className = `badge badge-priority-${complaint.priority.toLowerCase()}`;
  document.getElementById('modal-photo').src = complaint.image;
  document.getElementById('modal-citizen-name').innerText = complaint.fullName;
  document.getElementById('modal-citizen-phone').innerText = complaint.phone;
  document.getElementById('modal-category').innerText = complaint.category;
  document.getElementById('modal-date').innerText = complaint.date;
  document.getElementById('modal-location').innerText = complaint.location;
  document.getElementById('modal-description').innerText = complaint.description;
  document.getElementById('modal-admin-remarks').value = complaint.adminRemarks || '';

  // Set active status button
  highlightStatusOptionButton(activeSelectedStatus);

  const modalOverlay = document.getElementById('admin-modal');
  if (modalOverlay) modalOverlay.classList.add('active');
};

/**
 * Highlight selected status option button in modal
 */
function highlightStatusOptionButton(status) {
  const buttons = document.querySelectorAll('.status-opt-btn');
  buttons.forEach(btn => {
    if (btn.getAttribute('data-status') === status) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

/**
 * Modal Events & Status Save
 */
function initModalEvents() {
  const modalOverlay = document.getElementById('admin-modal');
  const btnClose = document.getElementById('btn-modal-close');
  const btnSave = document.getElementById('btn-save-status');
  const statusButtons = document.querySelectorAll('.status-opt-btn');

  if (btnClose && modalOverlay) {
    btnClose.addEventListener('click', () => {
      modalOverlay.classList.remove('active');
    });
  }

  statusButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      activeSelectedStatus = btn.getAttribute('data-status');
      highlightStatusOptionButton(activeSelectedStatus);
    });
  });

  if (btnSave) {
    btnSave.addEventListener('click', () => {
      if (!selectedComplaintId) return;

      const complaintIndex = allComplaints.findIndex(c => c.id === selectedComplaintId);
      if (complaintIndex !== -1) {
        const remarks = document.getElementById('modal-admin-remarks').value.trim();
        allComplaints[complaintIndex].status = activeSelectedStatus;
        allComplaints[complaintIndex].adminRemarks = remarks;

        // Save back to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allComplaints));

        // Close Modal & Refresh
        if (modalOverlay) modalOverlay.classList.remove('active');
        renderDashboard();
        showToast(`Complaint ${selectedComplaintId} updated to "${activeSelectedStatus}"`, 'success');
      }
    });
  }
}

/**
 * Reset Demo Data Button
 */
function initResetDataButton() {
  const resetBtn = document.getElementById('btn-reset-data');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('Reset demo dataset to initial 5 sample complaints?')) {
        localStorage.removeItem(STORAGE_KEY);
        loadComplaintsFromStorage();
        renderDashboard();
        showToast('Demo dataset reset successfully', 'info');
      }
    });
  }
}

/**
 * Cross-tab sync: update admin table live when new report submitted in citizen tab
 */
function initCrossTabSync() {
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) {
      loadComplaintsFromStorage();
      renderDashboard();
      showToast('New complaint received from Citizen Portal!', 'info');
    }
  });
}

/**
 * Utility HTML Escaper
 */
function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
}

/**
 * Toast Notification Helper
 */
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  if (type === 'error') toast.style.backgroundColor = '#991B1B';
  if (type === 'success') toast.style.backgroundColor = '#047857';

  toast.innerHTML = `<span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
