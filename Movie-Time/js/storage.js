/* ==========================================================================
   Movie Time - LocalStorage Management Utility
   ========================================================================== */

const STORAGE_KEYS = {
  WATCHLIST: 'movietime_watchlist',
  FAVORITES: 'movietime_favorites',
  RATINGS: 'movietime_user_ratings',
  REVIEWS: 'movietime_user_reviews',
  RECENTLY_VIEWED: 'movietime_recently_viewed'
};

const StorageService = {
  // Safe helper to read JSON from localStorage
  getItem(key, defaultValue = []) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
      console.error(`Error reading ${key} from localStorage:`, e);
      return defaultValue;
    }
  },

  // Safe helper to write JSON to localStorage
  setItem(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error(`Error writing ${key} to localStorage:`, e);
      return false;
    }
  },

  // --- Watchlist ---
  getWatchlist() {
    return this.getItem(STORAGE_KEYS.WATCHLIST, []);
  },

  isInWatchlist(movieId) {
    const watchlist = this.getWatchlist();
    return watchlist.includes(movieId);
  },

  toggleWatchlist(movieId) {
    let watchlist = this.getWatchlist();
    const exists = watchlist.includes(movieId);
    if (exists) {
      watchlist = watchlist.filter(id => id !== movieId);
    } else {
      watchlist.push(movieId);
    }
    this.setItem(STORAGE_KEYS.WATCHLIST, watchlist);
    return !exists; // Returns true if added, false if removed
  },

  // --- Favorites ---
  getFavorites() {
    return this.getItem(STORAGE_KEYS.FAVORITES, []);
  },

  isInFavorites(movieId) {
    const favorites = this.getFavorites();
    return favorites.includes(movieId);
  },

  toggleFavorite(movieId) {
    let favorites = this.getFavorites();
    const exists = favorites.includes(movieId);
    if (exists) {
      favorites = favorites.filter(id => id !== movieId);
    } else {
      favorites.push(movieId);
    }
    this.setItem(STORAGE_KEYS.FAVORITES, favorites);
    return !exists; // Returns true if added, false if removed
  },

  // --- User Personal Ratings ---
  getUserRatings() {
    return this.getItem(STORAGE_KEYS.RATINGS, {});
  },

  getUserRating(movieId) {
    const ratings = this.getUserRatings();
    return ratings[movieId] || 0;
  },

  saveUserRating(movieId, rating) {
    const ratings = this.getUserRatings();
    ratings[movieId] = Number(rating);
    this.setItem(STORAGE_KEYS.RATINGS, ratings);
    return rating;
  },

  // --- User Reviews ---
  getAllReviews() {
    return this.getItem(STORAGE_KEYS.REVIEWS, []);
  },

  getReviewsForMovie(movieId) {
    const reviews = this.getAllReviews();
    return reviews.filter(rev => rev.movieId === movieId);
  },

  saveUserReview(movieId, author, text, rating) {
    const reviews = this.getAllReviews();
    const newReview = {
      id: 'rev_' + Date.now(),
      movieId,
      author: author || 'Movie Fan',
      text,
      rating: rating || 5,
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    };
    reviews.unshift(newReview);
    this.setItem(STORAGE_KEYS.REVIEWS, reviews);
    return newReview;
  },

  deleteUserReview(reviewId) {
    let reviews = this.getAllReviews();
    reviews = reviews.filter(rev => rev.id !== reviewId);
    this.setItem(STORAGE_KEYS.REVIEWS, reviews);
    return true;
  },

  // --- Recently Viewed ---
  getRecentlyViewed() {
    return this.getItem(STORAGE_KEYS.RECENTLY_VIEWED, []);
  },

  addRecentlyViewed(movieId) {
    let recent = this.getRecentlyViewed();
    // Remove if already present so it moves to top
    recent = recent.filter(id => id !== movieId);
    recent.unshift(movieId);
    // Limit to max 12 items
    if (recent.length > 12) {
      recent = recent.slice(0, 12);
    }
    this.setItem(STORAGE_KEYS.RECENTLY_VIEWED, recent);
    return recent;
  }
};

// Export to window
if (typeof window !== 'undefined') {
  window.StorageService = StorageService;
}
