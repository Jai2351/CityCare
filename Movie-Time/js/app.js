// Early Theme Initialization to prevent Flash of Unstyled Theme (FOUT)
(function initThemeEarly() {
  const savedTheme = localStorage.getItem('movietime_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
})();

document.addEventListener('DOMContentLoaded', () => {
  AppController.init();
});

const AppController = {
  init() {
    this.setupThemeToggle();
    this.setupNavbar();
    this.setupMobileMenu();
    this.setupQuickSearch();
    this.setupTrailerModal();
    this.updateNavBadges();
  },

  // Navbar Sticky Scroll Effect
  setupNavbar() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });

    // Set Active Link based on current page
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link').forEach(link => {
      const href = link.getAttribute('href');
      if (href === currentPage || (currentPage === '' && href === 'index.html')) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  },

  // Light / Dark Theme Switcher Controller
  setupThemeToggle() {
    let btn = document.getElementById('themeToggleBtn');
    
    // Auto-inject Theme Toggle Button into navbar next to profile if not present
    if (!btn) {
      const navRight = document.querySelector('.nav-right');
      if (navRight) {
        const profileBtn = navRight.querySelector('a[href*="profile"]');
        btn = document.createElement('button');
        btn.className = 'nav-icon-btn theme-toggle-btn';
        btn.id = 'themeToggleBtn';
        btn.setAttribute('type', 'button');
        btn.setAttribute('title', 'Toggle Light/Dark Theme');
        btn.setAttribute('aria-label', 'Toggle Theme');
        
        if (profileBtn) {
          navRight.insertBefore(btn, profileBtn);
        } else {
          navRight.appendChild(btn);
        }
      }
    }

    if (!btn) return;

    const updateThemeUI = () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      btn.innerHTML = currentTheme === 'dark' ? '☀️' : '🌙';
      btn.setAttribute('title', currentTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode');
    };

    updateThemeUI();

    btn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('movietime_theme', newTheme);
      
      updateThemeUI();
      
      if (typeof showToast === 'function') {
        showToast(newTheme === 'light' ? 'Switched to Light Mode ☀️' : 'Switched to Dark Mode 🌙');
      }
    });
  },

  // Mobile Drawer Menu Toggle
  setupMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const mobileNav = document.querySelector('.mobile-nav');

    if (!hamburger || !mobileNav) return;

    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      mobileNav.classList.toggle('active');
    });

    // Close on link click
    mobileNav.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        mobileNav.classList.remove('active');
      });
    });
  },

  // Global Header Quick Search Auto-Suggest
  setupQuickSearch() {
    const searchInput = document.querySelector('.search-input');
    const suggestionsContainer = document.querySelector('.search-suggestions');
    const clearBtn = document.querySelector('.clear-search');

    if (!searchInput || !suggestionsContainer) return;

    let debounceTimer;

    searchInput.addEventListener('input', (e) => {
      const query = e.target.value;
      if (clearBtn) {
        clearBtn.style.display = query ? 'block' : 'none';
      }

      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(async () => {
        if (!query.trim()) {
          suggestionsContainer.classList.remove('active');
          return;
        }

        const matches = await window.MovieAPI.searchMovies(query);
        this.renderSearchSuggestions(matches, suggestionsContainer);
      }, 150);
    });

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        clearBtn.style.display = 'none';
        suggestionsContainer.classList.remove('active');
      });
    }

    // Support Enter key to go to movies page with search query
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && searchInput.value.trim()) {
        window.location.href = `movies.html?search=${encodeURIComponent(searchInput.value.trim())}`;
      }
    });

    // Close suggestions on document click outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.search-wrapper')) {
        suggestionsContainer.classList.remove('active');
      }
    });
  },

  renderSearchSuggestions(movies, container) {
    if (!movies || movies.length === 0) {
      container.innerHTML = `
        <div class="suggestion-item" style="cursor: default; justify-content: center; color: var(--text-muted);">
          No movies found
        </div>
      `;
      container.classList.add('active');
      return;
    }

    container.innerHTML = movies.map(movie => `
      <div class="suggestion-item" onclick="window.location.href='movie-details.html?id=${movie.id}'">
        <img src="${movie.poster}" alt="${movie.title}" class="suggestion-thumb" loading="lazy">
        <div class="suggestion-info">
          <div class="suggestion-title">${movie.title}</div>
          <div class="suggestion-meta">⭐ ${movie.rating > 0 ? movie.rating : 'N/A'} • ${movie.year} • ${movie.genres[0]}</div>
        </div>
      </div>
    `).join('');
    container.classList.add('active');
  },

  // Update Watchlist Nav Counter Badge
  updateNavBadges() {
    const watchlistCount = window.StorageService.getWatchlist().length;
    document.querySelectorAll('.watchlist-count-badge').forEach(badge => {
      badge.textContent = watchlistCount;
    });
  },

  // Global Trailer Modal Controller
  setupTrailerModal() {
    const overlay = document.querySelector('#trailerModal');
    if (!overlay) return;

    const closeBtn = overlay.querySelector('.modal-close-btn');

    const closeModal = () => {
      overlay.classList.remove('active');
      const container = overlay.querySelector('.video-responsive');
      if (container) container.innerHTML = '';
    };

    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('active')) {
        closeModal();
      }
    });

    // Global helper method attached to window
    window.openTrailerModal = (youtubeUrl) => {
      if (!youtubeUrl) {
        AppController.showToast('Trailer unavailable for this movie', 'warning');
        return;
      }

      const videoContainer = overlay.querySelector('.video-responsive');
      if (videoContainer) {
        // Ensure embed URL
        let embedUrl = youtubeUrl;
        if (youtubeUrl.includes('watch?v=')) {
          embedUrl = youtubeUrl.replace('watch?v=', 'embed/');
        }
        videoContainer.innerHTML = `<iframe src="${embedUrl}?autoplay=1" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
      }
      overlay.classList.add('active');
    };
  },

  // Global Toast Notification Utility
  showToast(message, type = 'info') {
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.className = 'toast-container';
      document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'warning') icon = '⚠️';

    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    toastContainer.appendChild(toast);

    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);

    // Auto dismiss after 3 seconds
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
};

// Reusable Movie Card Renderer Function
function renderMovieCard(movie, options = {}) {
  const isWatchlist = window.StorageService.isInWatchlist(movie.id);
  const isFavorite = window.StorageService.isInFavorites(movie.id);
  const rank = options.rank ? `<div class="rank-badge">#${options.rank}</div>` : '';

  return `
    <div class="movie-card" data-id="${movie.id}">
      <div class="poster-wrapper" onclick="window.location.href='movie-details.html?id=${movie.id}'" style="cursor: pointer;">
        <img src="${movie.poster}" alt="${movie.title}" loading="lazy" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80';">
        <div class="card-rating-badge">⭐ ${movie.rating > 0 ? movie.rating : 'N/A'}</div>
        ${rank}
        <div class="card-quick-actions" onclick="event.stopPropagation();">
          <button class="quick-btn ${isWatchlist ? 'active-watch' : ''}" 
                  title="${isWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}"
                  onclick="handleQuickWatchlist(event, '${movie.id}')">
            📌
          </button>
          <button class="quick-btn ${isFavorite ? 'active-fav' : ''}" 
                  title="${isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}"
                  onclick="handleQuickFavorite(event, '${movie.id}')">
            ❤️
          </button>
        </div>
        <div class="poster-overlay">
          <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); window.location.href='movie-details.html?id=${movie.id}'">View Details</button>
        </div>
      </div>
      <div class="movie-card-info" onclick="window.location.href='movie-details.html?id=${movie.id}'" style="cursor: pointer;">
        <h4 class="card-title" title="${movie.title}">${movie.title}</h4>
        <div class="card-subinfo">
          <span>${movie.year}</span>
          <span>${movie.genres[0] || 'Movie'}</span>
        </div>
      </div>
    </div>
  `;
}

// Quick action event handlers
function handleQuickWatchlist(event, movieId) {
  event.stopPropagation();
  const added = window.StorageService.toggleWatchlist(movieId);
  AppController.updateNavBadges();
  AppController.showToast(added ? 'Added to Watchlist' : 'Removed from Watchlist', added ? 'success' : 'info');
  
  // Update button visual
  const btn = event.currentTarget;
  if (added) {
    btn.classList.add('active-watch');
  } else {
    btn.classList.remove('active-watch');
  }
}

function handleQuickFavorite(event, movieId) {
  event.stopPropagation();
  const added = window.StorageService.toggleFavorite(movieId);
  AppController.showToast(added ? 'Added to Favorites' : 'Removed from Favorites', added ? 'success' : 'info');
  
  // Update button visual
  const btn = event.currentTarget;
  if (added) {
    btn.classList.add('active-fav');
  } else {
    btn.classList.remove('active-fav');
  }
}

// Global Exports
window.AppController = AppController;
window.renderMovieCard = renderMovieCard;
window.handleQuickWatchlist = handleQuickWatchlist;
window.handleQuickFavorite = handleQuickFavorite;
