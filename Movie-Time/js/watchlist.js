/* ==========================================================================
   Movie Time - Watchlist Page Controller
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('.watchlist-grid')) {
    WatchlistPageController.init();
  }
});

const WatchlistPageController = {
  async init() {
    this.gridContainer = document.querySelector('.watchlist-grid');
    this.searchInput = document.querySelector('#watchlistSearch');
    this.countBadge = document.querySelector('#savedCountText');
    this.clearBtn = document.querySelector('#clearWatchlistBtn');

    this.bindEvents();
    await this.loadWatchlist();
  },

  bindEvents() {
    if (this.searchInput) {
      this.searchInput.addEventListener('input', () => this.filterAndRender());
    }

    if (this.clearBtn) {
      this.clearBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear your entire watchlist?')) {
          window.StorageService.setItem('movietime_watchlist', []);
          window.AppController.updateNavBadges();
          window.AppController.showToast('Watchlist cleared', 'info');
          this.loadWatchlist();
        }
      });
    }
  },

  async loadWatchlist() {
    const ids = window.StorageService.getWatchlist();
    this.movies = await window.MovieAPI.getMoviesByIds(ids);
    this.filterAndRender();
  },

  filterAndRender() {
    if (!this.gridContainer) return;

    let displayList = [...this.movies];
    const query = this.searchInput ? this.searchInput.value.toLowerCase().trim() : '';

    if (query) {
      displayList = displayList.filter(m => 
        m.title.toLowerCase().includes(query) ||
        m.genres.some(g => g.toLowerCase().includes(query))
      );
    }

    if (this.countBadge) {
      this.countBadge.textContent = `${this.movies.length} saved movies`;
    }

    if (this.movies.length === 0) {
      this.gridContainer.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-icon">📌</div>
          <h3 class="empty-title">No movies in your watchlist yet</h3>
          <p class="empty-text">Explore movies and click the bookmark button on any movie card to save it for later.</p>
          <a href="movies.html" class="btn btn-primary">Explore Movies</a>
        </div>
      `;
      return;
    }

    if (displayList.length === 0) {
      this.gridContainer.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-icon">🔍</div>
          <h3 class="empty-title">No saved movies match your search</h3>
          <p class="empty-text">Try clearing your search input.</p>
        </div>
      `;
      return;
    }

    this.gridContainer.innerHTML = displayList.map(m => window.renderMovieCard(m)).join('');
  }
};
