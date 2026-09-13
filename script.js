/**
 * CityCare - Citizen Portal Logic
 * Manages localStorage persistence, image uploading, complaint submission,
 * and live tracking updates.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Storage with mock data if empty
  initLocalStorage();

  // Initialize UI Features & Event Listeners
  initNavigation();
  initCategoryCards();
  initImageUpload();
  initFormSubmission();
  initTracking();
  initFaqAccordion();
  initLocationDetector();
  initCrossTabSync();
});

// Key used for storing complaints in localStorage
const STORAGE_KEY = 'citycare_complaints';
let currentUploadedImageBase64 = '';

/**
 * Initialize sample dataset in localStorage if empty
 */
function initLocalStorage() {
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
        adminRemarks: 'Field road repair team dispatched with asphalt asphalt patcher.'
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

    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultComplaints));
  }
}

/**
 * Generate clean SVG Data URLs for initial mock images
 */
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
 * Mobile Navigation Drawer Toggle & Scroll Highlights
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
 * Category Card Click Event -> Preselects category in form & scrolls down
 */
function initCategoryCards() {
  const cards = document.querySelectorAll('.category-card');
  const categorySelect = document.getElementById('category');

  cards.forEach(card => {
    card.addEventListener('click', () => {
      const selectedCategory = card.getAttribute('data-category');
      if (categorySelect && selectedCategory) {
        categorySelect.value = selectedCategory;
      }
      const reportSection = document.getElementById('report');
      if (reportSection) {
        reportSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

/**
 * Image Upload handling with Drag-Drop and Canvas compression
 */
function initImageUpload() {
  const dropzone = document.getElementById('upload-dropzone');
  const fileInput = document.getElementById('photo-file');
  const previewContainer = document.getElementById('preview-container');
  const imagePreview = document.getElementById('image-preview');
  const btnRemoveImage = document.getElementById('btn-remove-image');

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
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleImageFile(files[0]);
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleImageFile(e.target.files[0]);
    }
  });

  if (btnRemoveImage) {
    btnRemoveImage.addEventListener('click', (e) => {
      e.stopPropagation();
      currentUploadedImageBase64 = '';
      fileInput.value = '';
      if (imagePreview) imagePreview.src = '';
      if (previewContainer) previewContainer.classList.remove('active');
      showToast('Photo removed', 'info');
    });
  }

  function handleImageFile(file) {
    if (!file.type.startsWith('image/')) {
      showToast('Please upload an image file (JPG, PNG, WEBP)', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size exceeds 5MB limit. Please choose a smaller file.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
      // Compress image via Canvas to keep base64 lean
      const img = new Image();
      img.onload = function() {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        currentUploadedImageBase64 = canvas.toDataURL('image/jpeg', 0.85);
        if (imagePreview) imagePreview.src = currentUploadedImageBase64;
        if (previewContainer) previewContainer.classList.add('active');
        showToast('Image uploaded successfully', 'success');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
}

/**
 * Geolocation helper for area field
 */
function initLocationDetector() {
  const btnLocate = document.getElementById('btn-detect-location');
  const locationInput = document.getElementById('location');

  if (!btnLocate || !locationInput) return;

  btnLocate.addEventListener('click', () => {
    if ("geolocation" in navigator) {
      btnLocate.innerText = "Locating...";
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude.toFixed(4);
          const lng = position.coords.longitude.toFixed(4);
          locationInput.value = `Sector 7 Area (GPS: ${lat}, ${lng})`;
          btnLocate.innerText = "Location Set!";
          setTimeout(() => { btnLocate.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polygon points="12 8 8 12 12 16 12 8"></polygon></svg> Detect Location`; }, 3000);
          showToast("Location detected successfully", "success");
        },
        () => {
          locationInput.value = "Central Sector, Main Road Junction";
          btnLocate.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polygon points="12 8 8 12 12 16 12 8"></polygon></svg> Detect Location`;
          showToast("Using default city location landmark", "info");
        }
      );
    } else {
      locationInput.value = "Central Sector, Main Road Junction";
      showToast("Using default city location landmark", "info");
    }
  });
}

/**
 * Complaint Form Submission
 */
function initFormSubmission() {
  const form = document.getElementById('complaint-form');
  const successModal = document.getElementById('success-modal');
  const modalComplaintId = document.getElementById('modal-complaint-id');
  const btnCopyId = document.getElementById('btn-copy-id');
  const btnModalTrack = document.getElementById('btn-modal-track');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const fullName = document.getElementById('fullName').value.trim();
    const phone = document.getElementById('phoneNumber').value.trim();
    const category = document.getElementById('category').value;
    const title = document.getElementById('title').value.trim();
    const description = document.getElementById('description').value.trim();
    const location = document.getElementById('location').value.trim();
    
    const priorityEl = document.querySelector('input[name="priority"]:checked');
    const priority = priorityEl ? priorityEl.value : 'Medium';

    // Validation
    if (!fullName) {
      showToast('Please enter your Full Name', 'error');
      document.getElementById('fullName').focus();
      return;
    }
    if (!category) {
      showToast('Please select a Problem Category', 'error');
      document.getElementById('category').focus();
      return;
    }
    if (!title) {
      showToast('Please enter a Problem Title', 'error');
      document.getElementById('title').focus();
      return;
    }
    if (!location) {
      showToast('Please specify the Area / Location', 'error');
      document.getElementById('location').focus();
      return;
    }
    if (!description) {
      showToast('Please provide a Detailed Description', 'error');
      document.getElementById('description').focus();
      return;
    }

    // Generate Unique Complaint ID: CC-2026-XXXX
    const complaints = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const nextNum = (complaints.length + 101).toString().padStart(4, '0');
    const newId = `CC-2026-${nextNum}`;

    // Format Current Date
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + 
                    ' ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    // Fallback image if no photo uploaded
    const finalImage = currentUploadedImageBase64 || createCategoryPlaceholderSvg(category);

    const newComplaint = {
      id: newId,
      fullName: fullName,
      phone: phone || 'N/A',
      category: category,
      title: title,
      description: description,
      location: location,
      image: finalImage,
      priority: priority,
      date: dateStr,
      status: 'Pending',
      adminRemarks: ''
    };

    complaints.unshift(newComplaint);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(complaints));

    // Show Confirmation Modal
    if (modalComplaintId) modalComplaintId.innerText = newId;
    if (successModal) successModal.classList.add('active');

    // Reset Form
    form.reset();
    currentUploadedImageBase64 = '';
    const previewContainer = document.getElementById('preview-container');
    if (previewContainer) previewContainer.classList.remove('active');
  });

  if (btnCopyId && modalComplaintId) {
    btnCopyId.addEventListener('click', () => {
      navigator.clipboard.writeText(modalComplaintId.innerText);
      showToast('Complaint ID copied to clipboard!', 'success');
    });
  }

  if (btnModalTrack && successModal) {
    btnModalTrack.addEventListener('click', () => {
      const idToTrack = modalComplaintId.innerText;
      successModal.classList.remove('active');
      const trackInput = document.getElementById('track-id-input');
      if (trackInput) trackInput.value = idToTrack;
      const trackSection = document.getElementById('track');
      if (trackSection) trackSection.scrollIntoView({ behavior: 'smooth' });
      lookupComplaint(idToTrack);
    });
  }
}

/**
 * Complaint Lookup & Visual Timeline Stepper
 */
function initTracking() {
  const trackBtn = document.getElementById('btn-track-submit');
  const trackInput = document.getElementById('track-id-input');
  const sampleChips = document.querySelectorAll('.sample-chip');

  if (trackBtn && trackInput) {
    trackBtn.addEventListener('click', () => {
      const id = trackInput.value.trim();
      if (!id) {
        showToast('Please enter a Complaint ID to search', 'error');
        return;
      }
      lookupComplaint(id);
    });

    trackInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const id = trackInput.value.trim();
        if (id) lookupComplaint(id);
      }
    });
  }

  sampleChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const id = chip.getAttribute('data-id');
      if (trackInput && id) {
        trackInput.value = id;
        lookupComplaint(id);
      }
    });
  });
}

/**
 * Lookup Complaint in localStorage and Render Timeline
 */
function lookupComplaint(complaintId) {
  const complaints = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  const found = complaints.find(c => c.id.toUpperCase() === complaintId.toUpperCase());

  const resultCard = document.getElementById('track-result-card');
  const errorCard = document.getElementById('track-error-card');
  const errorInputId = document.getElementById('error-input-id');

  if (!found) {
    if (resultCard) resultCard.classList.remove('active');
    if (errorCard) errorCard.classList.add('active');
    if (errorInputId) errorInputId.innerText = complaintId;
    return;
  }

  if (errorCard) errorCard.classList.remove('active');
  if (resultCard) resultCard.classList.add('active');

  // Populate Details
  document.getElementById('res-id').innerText = found.id;
  document.getElementById('res-date').innerText = `Submitted on ${found.date}`;
  document.getElementById('res-category').innerText = found.category;
  document.getElementById('res-title').innerText = found.title;
  document.getElementById('res-location').innerText = found.location;
  document.getElementById('res-description').innerText = found.description;
  document.getElementById('res-photo').src = found.image;

  // Priority Badge
  const priorityBadge = document.getElementById('res-priority-badge');
  priorityBadge.innerText = `${found.priority} PRIORITY`;
  priorityBadge.className = `badge badge-priority-${found.priority.toLowerCase()}`;

  // Status Badge
  const statusBadge = document.getElementById('res-status-badge');
  statusBadge.innerText = found.status;
  statusBadge.className = `badge badge-${found.status.toLowerCase().replace(' ', '-')}`;

  // Official Remarks if any
  const adminRemarksGroup = document.getElementById('res-admin-remarks-group');
  const adminRemarksEl = document.getElementById('res-admin-remarks');
  if (found.adminRemarks) {
    adminRemarksEl.innerText = found.adminRemarks;
    adminRemarksGroup.style.display = 'block';
  } else {
    adminRemarksGroup.style.display = 'none';
  }

  // Update Visual Timeline Stepper
  updateTimelineStepper(found.status);
}

/**
 * Update Progress Bar and Stepper Bubbles
 */
function updateTimelineStepper(status) {
  const steps = ['Submitted', 'Pending', 'Assigned', 'In Progress', 'Resolved'];
  const stepElements = {
    'Submitted': document.getElementById('step-submitted'),
    'Pending': document.getElementById('step-pending'),
    'Assigned': document.getElementById('step-assigned'),
    'In Progress': document.getElementById('step-in-progress'),
    'Resolved': document.getElementById('step-resolved')
  };

  const statusIndex = steps.indexOf(status);
  const normalizedIndex = statusIndex === -1 ? 1 : statusIndex; // Default to Pending if unknown

  steps.forEach((stepName, idx) => {
    const el = stepElements[stepName];
    if (!el) return;

    el.classList.remove('completed', 'current');
    if (idx < normalizedIndex) {
      el.classList.add('completed');
    } else if (idx === normalizedIndex) {
      el.classList.add('current');
    }
  });

  // Calculate percentage width for progress line
  const progressBar = document.getElementById('timeline-progress-bar');
  if (progressBar) {
    const percentage = (normalizedIndex / (steps.length - 1)) * 100;
    progressBar.style.width = `${percentage}%`;
  }
}

/**
 * FAQ Accordion Toggle
 */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    if (questionBtn) {
      questionBtn.addEventListener('click', () => {
        faqItems.forEach(otherItem => {
          if (otherItem !== item) otherItem.classList.remove('active');
        });
        item.classList.toggle('active');
      });
    }
  });
}

/**
 * Listen for storage events so admin changes sync in real-time across open tabs
 */
function initCrossTabSync() {
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) {
      const activeIdEl = document.getElementById('res-id');
      if (activeIdEl && activeIdEl.innerText) {
        lookupComplaint(activeIdEl.innerText);
        showToast('Complaint status updated by Municipal Admin', 'info');
      }
    }
  });
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

  toast.innerHTML = `
    <span>${message}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
