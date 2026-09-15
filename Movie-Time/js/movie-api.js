/* ==========================================================================
   Movie Time - API Service Layer Architecture
   Prepped for future TMDB API integration while using local dataset fallback
   ========================================================================== */

const API_CONFIG = {
  USE_TMDB: false, // Set to true when API_KEY is provided
  API_KEY: '', // TMDB API Key placeholder
  BASE_URL: 'https://api.themoviedb.org/3',
  IMAGE_BASE_URL: 'https://image.tmdb.org/t/p/w500'
};

const MovieAPI = {
  // Simulate network delay for realistic loading skeleton demonstration
  async delay(ms = 150) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  // Fetch all movies (with optional filtering and sorting)
  async getMovies(options = {}) {
    await this.delay();
    let result = [...window.MOVIES_DATA];

    const { genre, language, year, minRating, search, sort, upcoming } = options;

    if (upcoming !== undefined) {
      result = result.filter(m => m.upcoming === upcoming);
    }

    if (genre && genre !== 'All') {
      result = result.filter(m => m.genres.includes(genre));
    }

    if (language && language !== 'All') {
      result = result.filter(m => m.language.toLowerCase() === language.toLowerCase());
    }

    if (year && year !== 'All') {
      if (year === 'Older') {
        result = result.filter(m => m.year < 2024);
      } else {
        result = result.filter(m => m.year === Number(year));
      }
    }

    if (minRating && minRating !== 'All') {
      const min = parseFloat(minRating);
      result = result.filter(m => m.rating >= min);
    }

    if (search && search.trim() !== '') {
      const q = search.toLowerCase().trim();
      result = result.filter(m => 
        m.title.toLowerCase().includes(q) ||
        m.director.toLowerCase().includes(q) ||
        m.genres.some(g => g.toLowerCase().includes(q)) ||
        m.cast.some(c => c.name.toLowerCase().includes(q))
      );
    }

    // Apply Sorting
    if (sort) {
      switch (sort) {
        case 'Rating':
          result.sort((a, b) => b.rating - a.rating);
          break;
        case 'Newest':
          result.sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
          break;
        case 'Oldest':
          result.sort((a, b) => new Date(a.releaseDate) - new Date(b.releaseDate));
          break;
        case 'A-Z':
          result.sort((a, b) => a.title.localeCompare(b.title));
          break;
        case 'Popularity':
        default:
          result.sort((a, b) => b.popularity - a.popularity);
          break;
      }
    }

    return result;
  },

  // Fetch single movie details by ID
  async getMovieById(id) {
    await this.delay();
    return window.MOVIES_DATA.find(m => m.id === id) || null;
  },

  // Dynamic Search Suggestions for navbar quick search
  async searchMovies(query) {
    if (!query || query.trim().length === 0) return [];
    await this.delay(50);
    const q = query.toLowerCase().trim();
    return window.MOVIES_DATA.filter(m => 
      m.title.toLowerCase().includes(q) ||
      m.director.toLowerCase().includes(q) ||
      m.cast.some(c => c.name.toLowerCase().includes(q))
    ).slice(0, 5); // Return top 5 matches
  },

  // Fetch Trending Movies
  async getTrending(period = 'both') {
    await this.delay();
    let movies = window.MOVIES_DATA.filter(m => !m.upcoming);
    if (period === 'today') {
      movies = movies.filter(m => m.trendingPeriod === 'today' || m.trendingPeriod === 'both');
    } else if (period === 'week') {
      movies = movies.filter(m => m.trendingPeriod === 'week' || m.trendingPeriod === 'both');
    }
    return movies.sort((a, b) => a.trendingRank - b.trendingRank);
  },

  // Fetch Top Rated Movies
  async getTopRated() {
    await this.delay();
    return [...window.MOVIES_DATA]
      .filter(m => !m.upcoming && m.rating > 0)
      .sort((a, b) => b.rating - a.rating);
  },

  // Fetch Upcoming Movies
  async getUpcoming() {
    await this.delay();
    return window.MOVIES_DATA.filter(m => m.upcoming);
  },

  // Fetch Similar Movies based on genre matching
  async getSimilarMovies(movieId) {
    await this.delay();
    const current = window.MOVIES_DATA.find(m => m.id === movieId);
    if (!current) return [];

    return window.MOVIES_DATA
      .filter(m => m.id !== movieId)
      .map(m => {
        // Count matching genres
        const commonGenres = m.genres.filter(g => current.genres.includes(g)).length;
        return { movie: m, matchCount: commonGenres };
      })
      .sort((a, b) => b.matchCount - a.matchCount || b.movie.rating - a.movie.rating)
      .slice(0, 6)
      .map(item => item.movie);
  },

  // Fetch movies by ID array (for Watchlist/Favorites)
  async getMoviesByIds(idArray) {
    await this.delay();
    if (!idArray || idArray.length === 0) return [];
    return window.MOVIES_DATA.filter(m => idArray.includes(m.id));
  }
};

// Export to window
if (typeof window !== 'undefined') {
  window.MovieAPI = MovieAPI;
}
