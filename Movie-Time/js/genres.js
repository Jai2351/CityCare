/* ==========================================================================
   Movie Time - Genres Page Controller
   ========================================================================== */

const GENRES_DATA = [
  { name: 'Action', bg: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=600&q=80', desc: 'Adrenaline-fueled fights, chases, and explosions' },
  { name: 'Adventure', bg: 'https://images.unsplash.com/photo-1542224566-6e85f2e6772f?w=600&q=80', desc: 'Epic journeys across uncharted worlds' },
  { name: 'Animation', bg: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&q=80', desc: 'Vibrant animated tales for all ages' },
  { name: 'Comedy', bg: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&q=80', desc: 'Heartwarming humor and hilarious moments' },
  { name: 'Crime', bg: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&q=80', desc: 'Heists, mobsters, and police investigations' },
  { name: 'Drama', bg: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&q=80', desc: 'Emotional, character-driven storytelling' },
  { name: 'Horror', bg: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=600&q=80', desc: 'Spine-chilling scares and supernatural terrors' },
  { name: 'Romance', bg: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&q=80', desc: 'Love stories, passion, and relationship journeys' },
  { name: 'Sci-Fi', bg: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=600&q=80', desc: 'Futuristic technology, space, and multiverses' },
  { name: 'Thriller', bg: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=600&q=80', desc: 'High-stakes suspense and mind-bending twists' }
];

document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('.genres-page-grid')) {
    GenresPageController.init();
  }
});

const GenresPageController = {
  async init() {
    const grid = document.querySelector('.genres-page-grid');
    if (!grid) return;

    const allMovies = await window.MovieAPI.getMovies();

    grid.innerHTML = GENRES_DATA.map(g => {
      const count = allMovies.filter(m => m.genres.includes(g.name)).length;
      return `
        <div class="genre-card" onclick="window.location.href='movies.html?genre=${g.name}'">
          <img src="${g.bg}" alt="${g.name}" class="genre-bg" loading="lazy">
          <div class="genre-overlay"></div>
          <div class="genre-info">
            <h3 class="genre-name">${g.name}</h3>
            <div class="genre-count">${count} Movies Available</div>
          </div>
        </div>
      `;
    }).join('');
  }
};
