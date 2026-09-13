/**
 * CityCare - Admin Dashboard Logic (Supabase + LocalStorage Fallback Enabled)
 * Manages problem requests display, real-time KPI counters, status updates, 
 * administrative remarks, and database records filtering.
 * 
 * admin.html element IDs referenced:
 *   KPI cards: kpi-total, kpi-pending, kpi-progress, kpi-resolved
 *   Sidebar badge: sidebar-pending-badge
 *   Search: admin-search-input
 *   Filters: filter-status, filter-category, filter-priority
 *   Table body: complaints-table-body
 *   Empty state: empty-state
 *   Modal: admin-modal, modal-id, modal-priority, btn-modal-close, modal-photo
 *   Modal details: modal-citizen-name, modal-citizen-phone, modal-category, modal-date,
 *                  modal-title, modal-location, modal-description
 *   Status buttons: .status-opt-btn[data-status]
 *   Remarks input: modal-admin-remarks
 *   Save button: btn-save-status
 */

document.addEventListener('DOMContentLoaded', () => {
  loadAdminDashboard();
  initAdminEventListeners();
});

let currentEditingComplaintId = null;
let currentEditingStatus = 'Pending';
let allComplaintsData = [];

/**
 * Load all complaints from Supabase DB or LocalStorage
 */
async function loadAdminDashboard() {
  showAdminTableLoading(true);
  allComplaintsData = await apiGetComplaints();
  showAdminTableLoading(false);

  updateKpiCounters(allComplaintsData);
  filterAndRenderTable();
}

/**
 * Update KPI Header Metric Counters
 */
function updateKpiCounters(complaints) {
  const total = complaints.length;
  const pending = complaints.filter(c => c.status === 'Pending').length;
  const inProgress = complaints.filter(c => c.status === 'In Progress' || c.status === 'Assigned').length;
  const resolved = complaints.filter(c => c.status === 'Resolved').length;

  const totalEl = document.getElementById('kpi-total');
  const pendingEl = document.getElementById('kpi-pending');
  const progressEl = document.getElementById('kpi-progress');
  const resolvedEl = document.getElementById('kpi-resolved');
  const sidebarPendingEl = document.getElementById('sidebar-pending-badge');

  if (totalEl) totalEl.textContent = total;
  if (pendingEl) pendingEl.textContent = pending;
  if (progressEl) progressEl.textContent = inProgress;
  if (resolvedEl) resolvedEl.textContent = resolved;
  if (sidebarPendingEl) sidebarPendingEl.textContent = pending;
}

/**
 * Apply Search and Dropdown Filters to Table Rows
 */
function filterAndRenderTable() {
  const searchInput = document.getElementById('admin-search-input');
  const statusFilter = document.getElementById('filter-status');
  const categoryFilter = document.getElementById('filter-category');
  const priorityFilter = document.getElementById('filter-priority');

  const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
  const statusVal = statusFilter ? statusFilter.value : 'ALL';
  const categoryVal = categoryFilter ? categoryFilter.value : 'ALL';
  const priorityVal = priorityFilter ? priorityFilter.value : 'ALL';

  const filtered = allComplaintsData.filter(item => {
    const matchesSearch = 
      item.id.toLowerCase().includes(query) ||
      item.fullName.toLowerCase().includes(query) ||
      item.phone.includes(query) ||
      item.title.toLowerCase().includes(query) ||
      item.location.toLowerCase().includes(query);

    const matchesStatus = (statusVal === 'ALL') || (item.status === statusVal);
    const matchesCategory = (categoryVal === 'ALL') || (item.category === categoryVal);
    const matchesPriority = (priorityVal === 'ALL') || (item.priority === priorityVal);

    return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
  });

  renderAdminTableRows(filtered);
}

/**
 * Render Table Rows in DOM
 * Table columns: Complaint ID | Citizen Info | Problem Category & Title | Location | Priority | Submitted Date | Status | Action
 */
function renderAdminTableRows(complaints) {
  const tbody = document.getElementById('complaints-table-body');
  const emptyState = document.getElementById('empty-state');

  if (!tbody) return;

  if (complaints.length === 0) {
    tbody.innerHTML = '';
    if (emptyState) emptyState.classList.add('active');
    return;
  }

  if (emptyState) emptyState.classList.remove('active');

  tbody.innerHTML = complaints.map(item => `
    <tr>
      <td class="complaint-id-cell">${item.id}</td>
      <td>
        <div class="citizen-cell">
          <span class="citizen-name">${escapeHtml(item.fullName)}</span>
          <span class="citizen-phone">${escapeHtml(item.phone)}</span>
        </div>
      </td>
      <td>
        <div style="font-weight: 600;">${escapeHtml(item.title)}</div>
        <span class="badge ${getStatusBadgeClass(item.status)}" style="margin-top: 4px; font-size: 0.7rem;">${item.category}</span>
      </td>
      <td class="location-cell" title="${escapeHtml(item.location)}">
        📍 ${escapeHtml(item.location)}
      </td>
      <td>
        <span class="badge ${getPriorityBadgeClass(item.priority)}">${item.priority}</span>
      </td>
      <td style="font-size: 0.875rem; color: var(--text-muted);">
        ${item.date || 'N/A'}
      </td>
      <td>
        <span class="badge ${getStatusBadgeClass(item.status)}">${item.status}</span>
      </td>
      <td>
        <button class="btn-action" onclick="openAdminModal('${item.id}')">
          Manage &rarr;
        </button>
      </td>
    </tr>
  `).join('');
}

/**
 * Open Modal to View Details and Change Request Status
 */
window.openAdminModal = function(complaintId) {
  const item = allComplaintsData.find(c => c.id === complaintId);
  if (!item) return;

  currentEditingComplaintId = item.id;
  currentEditingStatus = item.status;

  const modalOverlay = document.getElementById('admin-modal');
  const modalIdTitle = document.getElementById('modal-id');
  const modalName = document.getElementById('modal-citizen-name');
  const modalPhone = document.getElementById('modal-citizen-phone');
  const modalCategory = document.getElementById('modal-category');
  const modalPriority = document.getElementById('modal-priority');
  const modalDate = document.getElementById('modal-date');
  const modalTitle = document.getElementById('modal-title');
  const modalDesc = document.getElementById('modal-description');
  const modalLocation = document.getElementById('modal-location');
  const modalRemarksInput = document.getElementById('modal-admin-remarks');
  const modalPhoto = document.getElementById('modal-photo');

  if (modalIdTitle) modalIdTitle.textContent = item.id;
  if (modalName) modalName.textContent = item.fullName;
  if (modalPhone) modalPhone.textContent = item.phone;
  if (modalCategory) modalCategory.textContent = item.category;
  if (modalDate) modalDate.textContent = item.date || 'N/A';
  if (modalTitle) modalTitle.textContent = item.title;
  if (modalDesc) modalDesc.textContent = item.description;
  if (modalLocation) modalLocation.textContent = item.location;
  if (modalRemarksInput) modalRemarksInput.value = item.adminRemarks || '';
  if (modalPhoto) modalPhoto.src = item.image || createDefaultImage(item.category);

  // Priority badge update in modal header
  if (modalPriority) {
    modalPriority.textContent = item.priority.toUpperCase();
    modalPriority.className = 'badge badge-priority-' + item.priority.toLowerCase();
  }

  highlightStatusButton(item.status);

  if (modalOverlay) modalOverlay.classList.add('active');
};

/**
 * Save Updated Status & Admin Remarks to Database
 */
async function saveAdminModalChanges() {
  if (!currentEditingComplaintId) return;

  const remarksInput = document.getElementById('modal-admin-remarks');
  const newRemarks = remarksInput ? remarksInput.value.trim() : '';

  const saveBtn = document.getElementById('btn-save-status');
  if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';
  }

  await apiUpdateComplaint(currentEditingComplaintId, {
    status: currentEditingStatus,
    adminRemarks: newRemarks
  });

  if (saveBtn) {
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save Status Update';
  }

  showAdminToast(`✅ Request ${currentEditingComplaintId} updated to "${currentEditingStatus}"!`);

  const modalOverlay = document.getElementById('admin-modal');
  if (modalOverlay) modalOverlay.classList.remove('active');

  await loadAdminDashboard();
}

/**
 * Initialize Event Listeners for Filters & Modal
 */
function initAdminEventListeners() {
  const searchInput = document.getElementById('admin-search-input');
  const statusFilter = document.getElementById('filter-status');
  const categoryFilter = document.getElementById('filter-category');
  const priorityFilter = document.getElementById('filter-priority');
  const btnCloseModal = document.getElementById('btn-modal-close');
  const btnSaveModal = document.getElementById('btn-save-status');

  if (searchInput) searchInput.addEventListener('input', filterAndRenderTable);
  if (statusFilter) statusFilter.addEventListener('change', filterAndRenderTable);
  if (categoryFilter) categoryFilter.addEventListener('change', filterAndRenderTable);
  if (priorityFilter) priorityFilter.addEventListener('change', filterAndRenderTable);

  if (btnCloseModal) {
    btnCloseModal.addEventListener('click', () => {
      const modalOverlay = document.getElementById('admin-modal');
      if (modalOverlay) modalOverlay.classList.remove('active');
    });
  }

  if (btnSaveModal) btnSaveModal.addEventListener('click', saveAdminModalChanges);

  // Status Option Buttons inside Modal
  const statusBtns = document.querySelectorAll('.status-opt-btn');
  statusBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      currentEditingStatus = btn.getAttribute('data-status');
      highlightStatusButton(currentEditingStatus);
    });
  });
}

function highlightStatusButton(status) {
  const statusBtns = document.querySelectorAll('.status-opt-btn');
  statusBtns.forEach(btn => {
    if (btn.getAttribute('data-status') === status) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

function showAdminTableLoading(isLoading) {
  const tbody = document.getElementById('complaints-table-body');
  if (!tbody) return;
  if (isLoading) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 40px; color: var(--text-muted);">
          Loading requests...
        </td>
      </tr>
    `;
  }
}

// -------------------------------------------------------------
// Helper Utilities & Badges
// -------------------------------------------------------------

function getStatusBadgeClass(status) {
  switch (status) {
    case 'Pending': return 'badge-pending';
    case 'In Progress': return 'badge-in-progress';
    case 'Assigned': return 'badge-assigned';
    case 'Resolved': return 'badge-resolved';
    default: return 'badge-pending';
  }
}

function getPriorityBadgeClass(priority) {
  switch (priority) {
    case 'Low': return 'badge-priority-low';
    case 'Medium': return 'badge-priority-medium';
    case 'High': return 'badge-priority-high';
    default: return 'badge-priority-medium';
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, (m) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  })[m]);
}

function createDefaultImage(category) {
  return 'data:image/svg+xml;base64,' + btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" fill="#E3F2FD"><rect width="600" height="400"/><text x="300" y="200" text-anchor="middle" font-size="24" fill="#1565C0">${category}</text></svg>`);
}

function showAdminToast(message) {
  let toastContainer = document.getElementById('admin-toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'admin-toast-container';
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;

  toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}
