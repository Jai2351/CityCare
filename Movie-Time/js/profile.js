/* ==========================================================================
   Movie Time - Profile Dashboard Page Controller
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('.profile-page')) {
    ProfilePageController.init();
  }
});

const ProfilePageController = {
  async init() {
    this.watchlistCountEl = document.querySelector('#statWatchlistCount');
    this.favoriteCountEl = document.querySelector('#statFavCount');
    this.reviewsCountEl = document.querySelector('#statReviewsCount');
    this.recentCountEl = document.querySelector('#statRecentCount');
    this.tabContentEl = document.querySelector('#profileTabContent');

    this.setupTabs();
    await this.updateStats();
    await this.loadTab('watchlist');
  },

  setupTabs() {
    const tabs = document.querySelectorAll('.profile-tabs .tab-btn');
    tabs.forEach(tab => {
      tab.addEventListener('click', async (e) => {
        tabs.forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');
        const tabName = e.target.dataset.tab;
        await this.loadTab(tabName);
      });
    });
  },

  async updateStats() {
    const watchlist = window.StorageService.getWatchlist();
    const favorites = window.StorageService.getFavorites();
    const reviews = window.StorageService.getAllReviews();
    const recent = window.StorageService.getRecentlyViewed();

    if (this.watchlistCountEl) this.watchlistCountEl.textContent = watchlist.length;
    if (this.favoriteCountEl) this.favoriteCountEl.textContent = favorites.length;
    if (this.reviewsCountEl) this.reviewsCountEl.textContent = reviews.length;
    if (this.recentCountEl) this.recentCountEl.textContent = recent.length;
  },

  async loadTab(tabName) {
    if (!this.tabContentEl) return;

    if (tabName === 'watchlist') {
      const ids = window.StorageService.getWatchlist();
      const movies = await window.MovieAPI.getMoviesByIds(ids);
      if (movies.length === 0) {
        this.tabContentEl.innerHTML = `
          <div class="empty-state">
            <div class="empty-icon">📌</div>
            <h3 class="empty-title">Your Watchlist is empty</h3>
            <a href="movies.html" class="btn btn-primary">Browse Movies</a>
          </div>
        `;
        return;
      }
      this.tabContentEl.innerHTML = `
        <div class="movie-grid">${movies.map(m => window.renderMovieCard(m)).join('')}</div>
      `;
    }

    if (tabName === 'favorites') {
      const ids = window.StorageService.getFavorites();
      const movies = await window.MovieAPI.getMoviesByIds(ids);
      if (movies.length === 0) {
        this.tabContentEl.innerHTML = `
          <div class="empty-state">
            <div class="empty-icon">❤️</div>
            <h3 class="empty-title">No Favorite Movies yet</h3>
            <a href="movies.html" class="btn btn-primary">Explore Movies</a>
          </div>
        `;
        return;
      }
      this.tabContentEl.innerHTML = `
        <div class="movie-grid">${movies.map(m => window.renderMovieCard(m)).join('')}</div>
      `;
    }

    if (tabName === 'reviews') {
      const reviews = window.StorageService.getAllReviews();
      if (reviews.length === 0) {
        this.tabContentEl.innerHTML = `
          <div class="empty-state">
            <div class="empty-icon">✍️</div>
            <h3 class="empty-title">You haven't submitted any reviews</h3>
            <p class="empty-text">Open any movie details page to leave your review and rating.</p>
          </div>
        `;
        return;
      }

      // Fetch movie details for each review
      const reviewCards = await Promise.all(reviews.map(async rev => {
        const movie = await window.MovieAPI.getMovieById(rev.movieId);
        const title = movie ? movie.title : 'Movie';
        return `
          <div class="review-card" style="margin-bottom: 1rem;">
            <div class="review-header">
              <div>
                <span style="font-weight: 700; color: var(--accent-blue);" onclick="window.location.href='movie-details.html?id=${rev.movieId}'" style="cursor: pointer;">${title}</span>
                <span style="color: var(--star-gold); margin-left: 0.5rem; font-size: 0.85rem;">${'★'.repeat(rev.rating)}</span>
              </div>
              <span class="review-date">${rev.date}</span>
            </div>
            <p style="font-size: 0.95rem; color: #cbd5e1;">${rev.text}</p>
          </div>
        `;
      }));

      this.tabContentEl.innerHTML = `<div class="reviews-list">${reviewCards.join('')}</div>`;
    }

    if (tabName === 'recent') {
      const recentIds = window.StorageService.getRecentlyViewed();
      const movies = await window.MovieAPI.getMoviesByIds(recentIds);
      
      // Preserve recently viewed order
      const ordered = recentIds.map(id => movies.find(m => m.id === id)).filter(Boolean);

      if (ordered.length === 0) {
        this.tabContentEl.innerHTML = `
          <div class="empty-state">
            <div class="empty-icon">👁️</div>
            <h3 class="empty-title">No Recently Viewed movies</h3>
            <a href="movies.html" class="btn btn-primary">Start Exploring</a>
          </div>
        `;
        return;
      }

      this.tabContentEl.innerHTML = `
        <div class="movie-grid">${ordered.map(m => window.renderMovieCard(m)).join('')}</div>
      `;
    }
  }
};
