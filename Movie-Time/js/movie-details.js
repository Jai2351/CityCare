/* ==========================================================================
   Movie Time - Movie Details Page Controller
   Dynamic rendering, Trailer trigger, User Rating, Reviews & Similar Movies
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('.movie-details-wrapper')) {
    MovieDetailsController.init();
  }
});

const MovieDetailsController = {
  async init() {
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id') || 'm1';

    this.movie = await window.MovieAPI.getMovieById(movieId);
    if (!this.movie) {
      window.location.href = '404.html';
      return;
    }

    // Record in Recently Viewed
    window.StorageService.addRecentlyViewed(this.movie.id);

    this.renderHeader();
    this.renderCast();
    this.renderUserRatingSection();
    this.renderReviewsSection();
    this.renderSimilarMovies();
  },

  renderHeader() {
    const isWatchlist = window.StorageService.isInWatchlist(this.movie.id);
    const isFavorite = window.StorageService.isInFavorites(this.movie.id);

    // Dynamic document title
    document.title = `${this.movie.title} (${this.movie.year}) - Movie Time`;

    const container = document.querySelector('.movie-details-hero');
    if (!container) return;

    container.style.backgroundImage = `url('${this.movie.backdrop}')`;

    container.innerHTML = `
      <div class="details-backdrop-overlay"></div>
      <div class="container" style="position: relative; z-index: 2;">
        <div class="details-grid">
          <div class="details-poster-card">
            <img src="${this.movie.poster}" alt="${this.movie.title}" onerror="this.src='https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&q=80'">
          </div>
          <div class="details-info">
            <h1 class="details-title">${this.movie.title}</h1>
            ${this.movie.tagline ? `<p class="details-tagline">"${this.movie.tagline}"</p>` : ''}
            
            <div class="details-meta-row">
              <span class="rating-star" style="color: var(--star-gold); font-weight: 700; font-size: 1.1rem;">
                ⭐ ${this.movie.rating > 0 ? this.movie.rating : 'N/A'} <span style="font-size: 0.82rem; color: var(--text-muted); font-weight: 400;">/ 10</span>
              </span>
              <span class="meta-dot"></span>
              <span class="certification-badge">${this.movie.certification}</span>
              <span class="meta-dot"></span>
              <span>🕒 ${this.movie.runtime}</span>
              <span class="meta-dot"></span>
              <span>📅 ${this.movie.releaseDate}</span>
              <span class="meta-dot"></span>
              <span>🌐 ${this.movie.language}</span>
            </div>

            <div style="display: flex; gap: 0.6rem; flex-wrap: wrap; margin-top: 0.5rem;">
              ${this.movie.genres.map(g => `<span class="genre-tag" style="padding: 0.3rem 0.8rem; font-size: 0.88rem; background: rgba(59, 130, 246, 0.15); border: 1px solid rgba(59, 130, 246, 0.3); color: #60a5fa;">${g}</span>`).join('')}
            </div>

            <div class="details-overview-box">
              <h3>Overview</h3>
              <p style="color: #cbd5e1; line-height: 1.7; font-size: 1rem;">${this.movie.overview}</p>
              
              <div class="meta-info-grid">
                <div>
                  <div class="meta-item-label">Director</div>
                  <div class="meta-item-value">${this.movie.director}</div>
                </div>
                <div>
                  <div class="meta-item-label">Writers</div>
                  <div class="meta-item-value">${this.movie.writers.join(', ')}</div>
                </div>
                <div>
                  <div class="meta-item-label">Production</div>
                  <div class="meta-item-value">${this.movie.production}</div>
                </div>
                <div>
                  <div class="meta-item-label">Country</div>
                  <div class="meta-item-value">${this.movie.country}</div>
                </div>
              </div>
            </div>

            <div class="hero-actions" style="margin-top: 1rem;">
              <button class="btn btn-primary" onclick="window.openTrailerModal('${this.movie.trailer}')">
                ▶ Watch Trailer
              </button>
              <button class="btn btn-secondary ${isWatchlist ? 'active-watch' : ''}" id="detailsWatchlistBtn" onclick="MovieDetailsController.toggleWatchlist()">
                📌 ${isWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
              </button>
              <button class="btn btn-secondary ${isFavorite ? 'active-fav' : ''}" id="detailsFavoriteBtn" onclick="MovieDetailsController.toggleFavorite()">
                ❤️ ${isFavorite ? 'Favorited' : 'Add to Favorites'}
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  renderCast() {
    const castContainer = document.querySelector('#castList');
    if (!castContainer || !this.movie.cast) return;

    castContainer.innerHTML = this.movie.cast.map(c => `
      <div class="cast-card">
        <img src="${c.avatar}" alt="${c.name}" class="cast-thumb" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80'">
        <div class="cast-info">
          <div class="cast-name">${c.name}</div>
          <div class="cast-role">${c.character}</div>
        </div>
      </div>
    `).join('');
  },

  renderUserRatingSection() {
    const container = document.querySelector('#userRatingBox');
    if (!container) return;

    const currentRating = window.StorageService.getUserRating(this.movie.id);

    container.innerHTML = `
      <div>
        <h4 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 0.3rem;">Your Personal Rating</h4>
        <p style="font-size: 0.85rem; color: var(--text-secondary);" id="ratingFeedbackText">
          ${currentRating > 0 ? `You rated this film ${currentRating} / 5 stars` : 'Rate this movie to save your personal review'}
        </p>
      </div>
      <div class="stars-container" id="starRatingGroup">
        ${[1, 2, 3, 4, 5].map(star => `
          <span class="star-icon ${star <= currentRating ? 'filled' : ''}" data-star="${star}">★</span>
        `).join('')}
      </div>
    `;

    const stars = container.querySelectorAll('.star-icon');
    stars.forEach(star => {
      star.addEventListener('mouseenter', (e) => {
        const val = Number(e.target.dataset.star);
        stars.forEach((s, idx) => {
          if (idx < val) s.classList.add('filled');
          else s.classList.remove('filled');
        });
      });

      star.addEventListener('mouseleave', () => {
        const savedVal = window.StorageService.getUserRating(this.movie.id);
        stars.forEach((s, idx) => {
          if (idx < savedVal) s.classList.add('filled');
          else s.classList.remove('filled');
        });
      });

      star.addEventListener('click', (e) => {
        const val = Number(e.target.dataset.star);
        window.StorageService.saveUserRating(this.movie.id, val);
        window.AppController.showToast(`Saved rating: ${val} Stars`, 'success');
        document.querySelector('#ratingFeedbackText').textContent = `You rated this film ${val} / 5 stars`;
      });
    });
  },

  renderReviewsSection() {
    const formContainer = document.querySelector('#reviewFormBox');
    const listContainer = document.querySelector('#reviewsListBox');
    if (!formContainer || !listContainer) return;

    formContainer.innerHTML = `
      <h4 style="font-size: 1.1rem; font-weight: 700;">Write a Review</h4>
      <input type="text" id="reviewAuthorInput" placeholder="Your Name or Alias" value="Movie Lover" class="filter-search-input" style="width: 100%; max-width: 300px;">
      <textarea id="reviewTextInput" class="review-textarea" placeholder="What did you think of ${this.movie.title}? Write your thoughts..." maxlength="500"></textarea>
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <span class="char-counter" id="charCounter">0 / 500 characters</span>
        <button class="btn btn-primary btn-sm" id="submitReviewBtn">Submit Review</button>
      </div>
    `;

    const textarea = formContainer.querySelector('#reviewTextInput');
    const charCounter = formContainer.querySelector('#charCounter');
    const submitBtn = formContainer.querySelector('#submitReviewBtn');

    textarea.addEventListener('input', () => {
      charCounter.textContent = `${textarea.value.length} / 500 characters`;
    });

    submitBtn.addEventListener('click', () => {
      const text = textarea.value.trim();
      const author = formContainer.querySelector('#reviewAuthorInput').value.trim() || 'Anonymous';
      const userRating = window.StorageService.getUserRating(this.movie.id) || 5;

      if (!text) {
        window.AppController.showToast('Please write a review before submitting', 'warning');
        return;
      }

      window.StorageService.saveUserReview(this.movie.id, author, text, userRating);
      textarea.value = '';
      charCounter.textContent = '0 / 500 characters';
      window.AppController.showToast('Review submitted successfully!', 'success');
      this.loadReviewsList();
    });

    this.loadReviewsList();
  },

  loadReviewsList() {
    const listContainer = document.querySelector('#reviewsListBox');
    if (!listContainer) return;

    const reviews = window.StorageService.getReviewsForMovie(this.movie.id);

    if (reviews.length === 0) {
      listContainer.innerHTML = `
        <div style="text-align: center; color: var(--text-muted); padding: 1.5rem 0;">
          No reviews yet. Be the first to review ${this.movie.title}!
        </div>
      `;
      return;
    }

    listContainer.innerHTML = reviews.map(rev => `
      <div class="review-card">
        <div class="review-header">
          <div>
            <span class="review-author">${rev.author}</span>
            <span style="color: var(--star-gold); margin-left: 0.5rem; font-size: 0.85rem;">${'★'.repeat(rev.rating)}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 1rem;">
            <span class="review-date">${rev.date}</span>
            <span class="review-delete-btn" onclick="MovieDetailsController.deleteReview('${rev.id}')">Delete</span>
          </div>
        </div>
        <p style="font-size: 0.95rem; color: #cbd5e1; line-height: 1.6;">${rev.text}</p>
      </div>
    `).join('');
  },

  deleteReview(reviewId) {
    window.StorageService.deleteUserReview(reviewId);
    window.AppController.showToast('Review deleted', 'info');
    this.loadReviewsList();
  },

  async renderSimilarMovies() {
    const container = document.querySelector('#similarMoviesGrid');
    if (!container) return;

    const similar = await window.MovieAPI.getSimilarMovies(this.movie.id);
    if (!similar || similar.length === 0) {
      container.innerHTML = '<p style="color: var(--text-muted);">No similar movies found.</p>';
      return;
    }

    container.innerHTML = similar.map(movie => window.renderMovieCard(movie)).join('');
  },

  toggleWatchlist() {
    const added = window.StorageService.toggleWatchlist(this.movie.id);
    const btn = document.querySelector('#detailsWatchlistBtn');
    if (btn) {
      btn.innerHTML = `📌 ${added ? 'In Watchlist' : 'Add to Watchlist'}`;
      if (added) btn.classList.add('active-watch');
      else btn.classList.remove('active-watch');
    }
    window.AppController.updateNavBadges();
    window.AppController.showToast(added ? 'Added to Watchlist' : 'Removed from Watchlist', added ? 'success' : 'info');
  },

  toggleFavorite() {
    const added = window.StorageService.toggleFavorite(this.movie.id);
    const btn = document.querySelector('#detailsFavoriteBtn');
    if (btn) {
      btn.innerHTML = `❤️ ${added ? 'Favorited' : 'Add to Favorites'}`;
      if (added) btn.classList.add('active-fav');
      else btn.classList.remove('active-fav');
    }
    window.AppController.showToast(added ? 'Added to Favorites' : 'Removed from Favorites', added ? 'success' : 'info');
  }
};
