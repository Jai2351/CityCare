/* ==========================================================================
   Movie Time - Movies Page Logic (Filtering, Sorting, Dynamic Grid, Search Sync)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('.movies-page-grid')) {
    MoviesPageController.init();
  }
});

const MoviesPageController = {
  async init() {
    this.gridContainer = document.querySelector('.movies-page-grid');
    this.genreSelect = document.querySelector('#filterGenre');
    this.langSelect = document.querySelector('#filterLang');
    this.yearSelect = document.querySelector('#filterYear');
    this.ratingSelect = document.querySelector('#filterRating');
    this.sortSelect = document.querySelector('#filterSort');
    this.searchInput = document.querySelector('#filterSearch');
    this.resetBtn = document.querySelector('#resetFilters');
    this.resultsCount = document.querySelector('#resultsCount');

    // Parse URL parameters (e.g., movies.html?genre=Action or movies.html?search=Oppenheimer)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('genre') && this.genreSelect) {
      this.genreSelect.value = urlParams.get('genre');
    }
    if (urlParams.has('search') && this.searchInput) {
      this.searchInput.value = urlParams.get('search');
    }

    this.bindEvents();
    await this.loadAndRenderMovies();
  },

  bindEvents() {
    const filters = [this.genreSelect, this.langSelect, this.yearSelect, this.ratingSelect, this.sortSelect];
    filters.forEach(select => {
      if (select) {
        select.addEventListener('change', () => this.loadAndRenderMovies());
      }
    });

    if (this.searchInput) {
      let timeout;
      this.searchInput.addEventListener('input', () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => this.loadAndRenderMovies(), 200);
      });
    }

    if (this.resetBtn) {
      this.resetBtn.addEventListener('click', () => {
        if (this.genreSelect) this.genreSelect.value = 'All';
        if (this.langSelect) this.langSelect.value = 'All';
        if (this.yearSelect) this.yearSelect.value = 'All';
        if (this.ratingSelect) this.ratingSelect.value = 'All';
        if (this.sortSelect) this.sortSelect.value = 'Popularity';
        if (this.searchInput) this.searchInput.value = '';
        this.loadAndRenderMovies();
      });
    }
  },

  showSkeletons() {
    if (!this.gridContainer) return;
    this.gridContainer.innerHTML = Array(8).fill(`
      <div class="movie-card" style="width: 100%;">
        <div class="poster-wrapper skeleton" style="padding-top: 148%;"></div>
        <div class="movie-card-info">
          <div class="skeleton" style="height: 18px; margin-bottom: 8px;"></div>
          <div class="skeleton" style="height: 14px; width: 60%;"></div>
        </div>
      </div>
    `).join('');
  },

  async loadAndRenderMovies() {
    this.showSkeletons();

    const options = {
      genre: this.genreSelect ? this.genreSelect.value : 'All',
      language: this.langSelect ? this.langSelect.value : 'All',
      year: this.yearSelect ? this.yearSelect.value : 'All',
      minRating: this.ratingSelect ? this.ratingSelect.value : 'All',
      sort: this.sortSelect ? this.sortSelect.value : 'Popularity',
      search: this.searchInput ? this.searchInput.value.trim() : ''
    };

    const movies = await window.MovieAPI.getMovies(options);

    if (this.resultsCount) {
      this.resultsCount.textContent = `Showing ${movies.length} movies`;
    }

    if (!movies || movies.length === 0) {
      this.gridContainer.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-icon">🎬</div>
          <h3 class="empty-title">No movies match your filter criteria</h3>
          <p class="empty-text">Try resetting filters or searching for another title, actor, or genre.</p>
          <button class="btn btn-primary" onclick="document.querySelector('#resetFilters').click()">Reset Filters</button>
        </div>
      `;
      return;
    }

    this.gridContainer.innerHTML = movies.map(movie => window.renderMovieCard(movie)).join('');
  }
};
