/**
 * CityCare - Citizen Portal Logic (Supabase + LocalStorage Fallback Enabled)
 * Manages issue reporting, image uploading, complaint tracking, and live UI updates.
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize mock data in LocalStorage if empty & Supabase is not connected
  initLocalStorageMockData();

  // Initialize UI Features & Event Listeners
  initNavigation();
  initCategoryCards();
  initImageUpload();
  initFormSubmission();
  initTracking();
  initFaqAccordion();
  initLocationDetector();
  
  // Load dynamic stats counters
  await refreshStatsCounters();
});

let currentUploadedFile = null;
let currentUploadedImageBase64 = '';

/**
 * Initialize sample dataset in localStorage if empty (fallback mode)
 */
function initLocalStorageMockData() {
  const STORAGE_KEY = 'citycare_complaints';
  const existing = localStorage.getItem(STORAGE_KEY);
  if (!existing || JSON.parse(existing).length === 0) {
    const defaultComplaints = [
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
      }
    ];

    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultComplaints));
  }
}

/**
 * Generate clean SVG Data URL placeholder for category preview
 */
function createCategoryPlaceholderSvg(category) {
  const bg = '#E3F2FD';
  const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
    <rect width="600" height="400" fill="${bg}"/>
    <rect x="20" y="20" width="560" height="360" rx="12" fill="#FFFFFF" stroke="#1565C0" stroke-width="2" stroke-dasharray="8 8"/>
    <circle cx="300" cy="180" r="48" fill="#1565C0"/>
    <text x="300" y="188" font-family="sans-serif" font-weight="bold" font-size="28" fill="#FFFFFF" text-anchor="middle">CC</text>
    <text x="300" y="270" font-family="sans-serif" font-weight="bold" font-size="22" fill="#0D47A1" text-anchor="middle">${category} Inspection Image</text>
  </svg>`;
  return 'data:image/svg+xml;base64,' + btoa(svgString);
}

/**
 * Update Impact Stats Strip counters dynamically from DB
 */
async function refreshStatsCounters() {
  const complaints = await apiGetComplaints();
  const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;
  const totalCount = complaints.length;

  const resolvedEl = document.getElementById('stat-resolved-count');
  if (resolvedEl) {
    resolvedEl.textContent = `${resolvedCount + 1840}+`;
  }

  const activeCitizensEl = document.getElementById('stat-active-citizens');
  if (activeCitizensEl) {
    activeCitizensEl.textContent = `${totalCount + 12400}+`;
  }
}

/**
 * Mobile Drawer & Nav scroll handling
 */
function initNavigation() {
  const hamburgerBtn = document.getElementById('hamburger-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');

  if (hamburgerBtn && mobileDrawer) {
    hamburgerBtn.addEventListener('click', () => {
      mobileDrawer.classList.toggle('active');
    });

    mobileDrawer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('active');
      });
    });
  }
}

/**
 * Interactive Category Cards - click pre-fills report form category
 */
function initCategoryCards() {
  const categoryCards = document.querySelectorAll('.category-card');
  const categorySelect = document.getElementById('category');
  const reportSection = document.getElementById('report');

  categoryCards.forEach(card => {
    card.addEventListener('click', () => {
      const selectedCategory = card.getAttribute('data-category');
      if (categorySelect && selectedCategory) {
        categorySelect.value = selectedCategory;
      }
      if (reportSection) {
        reportSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

/**
 * Drag and Drop & Image Upload handling
 * HTML IDs: upload-dropzone, photo-file, preview-container, image-preview, btn-remove-image
 */
function initImageUpload() {
  const dropzone = document.getElementById('upload-dropzone');
  const fileInput = document.getElementById('photo-file');
  const previewContainer = document.getElementById('preview-container');
  const previewImg = document.getElementById('image-preview');
  const removeBtn = document.getElementById('btn-remove-image');

  if (!dropzone || !fileInput) return;

  dropzone.addEventListener('click', () => fileInput.click());

  ['dragenter', 'dragover'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
    }, false);
  });

  dropzone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length > 0) handleImageFile(files[0]);
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) handleImageFile(e.target.files[0]);
  });

  if (removeBtn) {
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      currentUploadedFile = null;
      currentUploadedImageBase64 = '';
      fileInput.value = '';
      if (previewContainer) previewContainer.classList.remove('active');
      dropzone.style.display = 'block';
    });
  }

  function handleImageFile(file) {
    if (!file.type.startsWith('image/')) {
      showToast('Please upload a valid image file (JPG, PNG, WebP).');
      return;
    }

    currentUploadedFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      currentUploadedImageBase64 = e.target.result;
      if (previewImg) previewImg.src = currentUploadedImageBase64;
      if (previewContainer) previewContainer.classList.add('active');
      dropzone.style.display = 'none';
    };
    reader.readAsDataURL(file);
  }
}

/**
 * Geolocation Detector
 */
function initLocationDetector() {
  const locateBtn = document.getElementById('btn-detect-location');
  const locationInput = document.getElementById('location');

  if (!locateBtn || !locationInput) return;

  locateBtn.addEventListener('click', () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser.');
      return;
    }

    locateBtn.disabled = true;
    locateBtn.textContent = 'Detecting...';

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(4);
        const lng = position.coords.longitude.toFixed(4);
        locationInput.value = `Lat: ${lat}, Long: ${lng} (Detected via GPS)`;
        locateBtn.disabled = false;
        locateBtn.textContent = '📍 Auto Detect';
        showToast('📍 GPS Location detected successfully!');
      },
      (error) => {
        locateBtn.disabled = false;
        locateBtn.textContent = '📍 Auto Detect';
        showToast('Could not retrieve precise location. Please type manually.');
      }
    );
  });
}

/**
 * Handle Complaint Form Submission
 * HTML IDs: complaint-form, fullName, phoneNumber, category, title, description, location, priority
 * Modal IDs: success-modal, modal-complaint-id, btn-copy-id, btn-modal-track
 */
function initFormSubmission() {
  const form = document.getElementById('complaint-form');
  const modalOverlay = document.getElementById('success-modal');
  const modalComplaintIdEl = document.getElementById('modal-complaint-id');
  const btnCopyId = document.getElementById('btn-copy-id');
  const btnModalTrack = document.getElementById('btn-modal-track');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fullName = document.getElementById('fullName').value.trim();
    const phone = document.getElementById('phoneNumber').value.trim();
    const category = document.getElementById('category').value;
    const title = document.getElementById('title').value.trim();
    const description = document.getElementById('description').value.trim();
    const location = document.getElementById('location').value.trim();
    const priorityEl = document.querySelector('input[name="priority"]:checked');
    const priority = priorityEl ? priorityEl.value : 'Medium';

    if (!fullName || !category || !title || !description || !location) {
      showToast('Please fill out all required fields marked with *');
      return;
    }

    // Find the submit button inside the form
    const submitBtn = form.querySelector('button[type="submit"]');

    // Generate unique complaint ID
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const complaintId = `CC-2026-${randomNum}`;

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `Submitting to Database...`;
    }

    // Upload image to Supabase Storage or get base64
    let imageUrl = '';
    if (currentUploadedFile) {
      imageUrl = await apiUploadImage(currentUploadedFile, complaintId);
    } else if (currentUploadedImageBase64) {
      imageUrl = currentUploadedImageBase64;
    } else {
      imageUrl = createCategoryPlaceholderSvg(category);
    }

    const newComplaint = {
      id: complaintId,
      fullName,
      phone: phone || 'Not Provided',
      category,
      title,
      description,
      location,
      image: imageUrl,
      priority,
      date: new Date().toLocaleString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true }),
      status: 'Pending',
      adminRemarks: ''
    };

    // Submit to Supabase DB or LocalStorage
    await apiCreateComplaint(newComplaint);

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `Submit Complaint &rarr;`;
    }

    // Reset Form
    form.reset();
    currentUploadedFile = null;
    currentUploadedImageBase64 = '';
    const previewContainer = document.getElementById('preview-container');
    const dropzone = document.getElementById('upload-dropzone');
    if (previewContainer) previewContainer.classList.remove('active');
    if (dropzone) dropzone.style.display = 'block';

    // Refresh stats
    refreshStatsCounters();

    // Show Success Modal with complaint ID
    if (modalComplaintIdEl) modalComplaintIdEl.textContent = complaintId;
    if (modalOverlay) modalOverlay.classList.add('active');
  });

  // Copy ID button
  if (btnCopyId) {
    btnCopyId.addEventListener('click', () => {
      const id = modalComplaintIdEl ? modalComplaintIdEl.textContent.trim() : '';
      if (id && navigator.clipboard) {
        navigator.clipboard.writeText(id).then(() => {
          showToast('✅ Complaint ID copied to clipboard!');
        });
      }
    });
  }

  // Track Now button inside success modal
  if (btnModalTrack && modalOverlay) {
    btnModalTrack.addEventListener('click', () => {
      const id = modalComplaintIdEl ? modalComplaintIdEl.textContent.trim() : '';
      modalOverlay.classList.remove('active');
      const trackInput = document.getElementById('track-id-input');
      if (trackInput) {
        trackInput.value = id;
        document.getElementById('track').scrollIntoView({ behavior: 'smooth' });
        // Auto-search after a small delay
        setTimeout(() => {
          document.getElementById('btn-track-submit').click();
        }, 500);
      }
    });
  }

  // Close modal on overlay click
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        modalOverlay.classList.remove('active');
      }
    });
  }
}

/**
 * Track Complaint Section Logic
 * HTML IDs: track-id-input, btn-track-submit, track-result-card, track-error-card
 * Sample chips: .sample-chip with data-id attribute
 */
function initTracking() {
  const trackBtn = document.getElementById('btn-track-submit');
  const trackInput = document.getElementById('track-id-input');
  const trackResultCard = document.getElementById('track-result-card');
  const trackErrorCard = document.getElementById('track-error-card');
  const sampleChips = document.querySelectorAll('.sample-chip');

  if (!trackBtn || !trackInput) return;

  const performSearch = async (query) => {
    const q = query.trim().toLowerCase();
    if (!q) {
      showToast('Please enter a Complaint ID or Mobile Number to search.');
      return;
    }

    trackBtn.disabled = true;
    trackBtn.textContent = 'Searching...';

    const complaints = await apiGetComplaints();
    const match = complaints.find(c => 
      c.id.toLowerCase() === q || 
      c.phone.replace(/[^0-9]/g, '').includes(q.replace(/[^0-9]/g, ''))
    );

    trackBtn.disabled = false;
    trackBtn.textContent = 'Search';

    if (match) {
      renderTrackDetails(match);
      if (trackErrorCard) trackErrorCard.classList.remove('active');
      if (trackResultCard) {
        trackResultCard.classList.add('active');
        trackResultCard.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      if (trackResultCard) trackResultCard.classList.remove('active');
      if (trackErrorCard) {
        const errorIdSpan = document.getElementById('error-input-id');
        if (errorIdSpan) errorIdSpan.textContent = query.trim();
        trackErrorCard.classList.add('active');
        trackErrorCard.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  trackBtn.addEventListener('click', () => performSearch(trackInput.value));
  trackInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') performSearch(trackInput.value);
  });

  sampleChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const sampleId = chip.getAttribute('data-id') || chip.textContent.trim();
      trackInput.value = sampleId;
      performSearch(sampleId);
    });
  });
}

/**
 * Render visual stepper timeline and complaint details
 * HTML IDs: res-id, res-date, res-priority-badge, res-status-badge, 
 *           res-category, res-title, res-location, res-description, 
 *           res-admin-remarks, res-admin-remarks-group, res-photo
 *           timeline-progress-bar, step-submitted, step-pending, step-assigned, step-in-progress, step-resolved
 */
function renderTrackDetails(complaint) {
  const trackIdTitle = document.getElementById('res-id');
  const trackDate = document.getElementById('res-date');
  const trackPriorityBadge = document.getElementById('res-priority-badge');
  const trackStatusBadge = document.getElementById('res-status-badge');
  const trackCategory = document.getElementById('res-category');
  const trackTitle = document.getElementById('res-title');
  const trackLocation = document.getElementById('res-location');
  const trackDesc = document.getElementById('res-description');
  const trackRemarks = document.getElementById('res-admin-remarks');
  const trackRemarksGroup = document.getElementById('res-admin-remarks-group');
  const trackPhoto = document.getElementById('res-photo');

  if (trackIdTitle) trackIdTitle.textContent = complaint.id;
  if (trackDate) trackDate.textContent = 'Submitted on ' + complaint.date;
  if (trackCategory) trackCategory.textContent = complaint.category;
  if (trackTitle) trackTitle.textContent = complaint.title;
  if (trackDesc) trackDesc.textContent = complaint.description;
  if (trackLocation) trackLocation.textContent = complaint.location;
  if (trackPhoto) trackPhoto.src = complaint.image || createCategoryPlaceholderSvg(complaint.category);

  // Priority badge
  if (trackPriorityBadge) {
    trackPriorityBadge.textContent = complaint.priority.toUpperCase() + ' PRIORITY';
    trackPriorityBadge.className = 'badge badge-priority-' + complaint.priority.toLowerCase();
  }

  // Status badge
  if (trackStatusBadge) {
    trackStatusBadge.textContent = complaint.status.toUpperCase();
    trackStatusBadge.className = 'badge ' + getBadgeClassForStatus(complaint.status);
  }

  // Admin Remarks section - show/hide
  if (complaint.adminRemarks && complaint.adminRemarks.trim()) {
    if (trackRemarks) trackRemarks.textContent = complaint.adminRemarks;
    if (trackRemarksGroup) trackRemarksGroup.style.display = 'block';
  } else {
    if (trackRemarksGroup) trackRemarksGroup.style.display = 'none';
  }

  // Update 5-step Timeline Stepper Progress
  // Steps: submitted(1) -> pending(2) -> assigned(3) -> in-progress(4) -> resolved(5)
  const stepMap = { 'Pending': 2, 'Assigned': 3, 'In Progress': 4, 'Resolved': 5 };
  const currentStepNum = stepMap[complaint.status] || 1;

  const stepIds = ['step-submitted', 'step-pending', 'step-assigned', 'step-in-progress', 'step-resolved'];
  stepIds.forEach((stepId, idx) => {
    const stepEl = document.getElementById(stepId);
    if (!stepEl) return;
    
    const stepNumber = idx + 1;
    stepEl.classList.remove('completed', 'current');

    if (stepNumber < currentStepNum) {
      stepEl.classList.add('completed');
    } else if (stepNumber === currentStepNum) {
      stepEl.classList.add('current');
    }
  });

  // Update progress line width
  const progressLine = document.getElementById('timeline-progress-bar');
  if (progressLine) {
    const percentageMap = { 1: '0%', 2: '25%', 3: '50%', 4: '75%', 5: '100%' };
    progressLine.style.width = percentageMap[currentStepNum] || '0%';
  }
}

function getBadgeClassForStatus(status) {
  switch (status) {
    case 'Pending': return 'badge-pending';
    case 'In Progress': return 'badge-in-progress';
    case 'Assigned': return 'badge-assigned';
    case 'Resolved': return 'badge-resolved';
    default: return 'badge-pending';
  }
}

/**
 * Accordion FAQ toggle
 */
function initFaqAccordion() {
  const faqQuestions = document.querySelectorAll('.faq-question');
  faqQuestions.forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.parentElement;
      item.classList.toggle('active');
    });
  });
}

/**
 * Toast notification banner
 */
function showToast(message) {
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;

  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 3500);
}
