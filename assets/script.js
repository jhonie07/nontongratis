/**
 * NONTON GRATIS - Main Script v2.0
 * Full Featured Streaming Website
 */

(function() {
    'use strict';

    // ============ GLOBAL VARIABLES ============
    let allMovies = [];
    let allSeries = [];
    let allData = [];
    let categories = [];
    let currentFilter = 'all';
    let deferredPrompt = null;

    // DOM Elements
    const DOM = {
        // Containers
        moviesContainer: document.getElementById('movies'),
        seriesContainer: document.getElementById('series'),
        categoriesContainer: document.getElementById('categories'),
        continueWatchingContainer: document.getElementById('continueWatching'),
        continueWatchingSection: document.getElementById('continueWatchingSection'),
        
        // Hero
        heroVideo: document.getElementById('heroVideo'),
        heroTitle: document.getElementById('heroTitle'),
        heroInfo: document.getElementById('heroInfo'),
        heroWatchBtn: document.getElementById('heroWatchBtn'),
        heroTrailerBtn: document.getElementById('heroTrailerBtn'),
        heroBookmarkBtn: document.getElementById('heroBookmarkBtn'),
        
        // Search
        searchInput: document.getElementById('search'),
        searchBtn: document.getElementById('searchBtn'),
        
        // UI Controls
        darkModeToggle: document.getElementById('darkModeToggle'),
        menuToggle: document.getElementById('menuToggle'),
        sidebar: document.getElementById('sidebar'),
        sidebarOverlay: document.getElementById('sidebarOverlay'),
        closeSidebar: document.getElementById('closeSidebar'),
        clearHistoryBtn: document.getElementById('clearHistoryBtn'),
        
        // Loading
        loading: document.getElementById('loading'),
        
        // Modals
        trailerModal: document.getElementById('trailerModal'),
        trailerFrame: document.getElementById('trailerFrame'),
        
        // Install PWA
        installPrompt: document.getElementById('installPrompt'),
        installBtn: document.getElementById('installBtn'),
        dismissInstall: document.getElementById('dismissInstall')
    };

    // ============ INITIALIZATION ============
    document.addEventListener('DOMContentLoaded', () => {
        console.log('🚀 Nonton Gratis v2.0 Initializing...');
        
        initApp();
        fetchData();
        setupEventListeners();
        checkInstallPrompt();
        loadUserPreferences();
        renderContinueWatching();
    });

    // ============ INIT APP ============
    function initApp() {
        // Check if we're on homepage
        const isHomePage = DOM.moviesContainer || DOM.seriesContainer;
        const isPlayerPage = document.getElementById('videoFrame');
        const isBookmarksPage = window.location.pathname.includes('bookmarks');
        
        console.log(`📍 Page: ${isHomePage ? 'Home' : isPlayerPage ? 'Player' : isBookmarksPage ? 'Bookmarks' : 'Other'}`);
    }

    // ============ FETCH DATA ============
    async function fetchData() {
        // Only fetch if on homepage
        if (!DOM.moviesContainer && !DOM.seriesContainer) return;
        
        showLoading(true);
        
        try {
            // Try to fetch from movies.json
            const response = await fetch('./movies.json');
            if (!response.ok) throw new Error('Failed to fetch movies.json');
            
            const data = await response.json();
            allData = data;
            
            // Separate movies and series
            allMovies = data.filter(item => item.type === 'movie');
            allSeries = data.filter(item => item.type === 'series');
            
            // Extract categories
            extractCategories();
            
            // Setup hero with trending item
            setupHero();
            
            // Render content
            renderCategories();
            renderMovies(allMovies.slice(0, 6));
            renderSeries(allSeries.slice(0, 6));
            
            console.log(`✅ Loaded ${allMovies.length} movies and ${allSeries.length} series`);
            
        } catch (error) {
            console.error('❌ Error fetching data:', error);
            useFallbackData();
        } finally {
            showLoading(false);
        }
    }

    // ============ EXTRACT CATEGORIES ============
    function extractCategories() {
        const genreSet = new Set();
        allData.forEach(item => {
            if (item.genre) {
                item.genre.split(',').forEach(g => genreSet.add(g.trim()));
            }
        });
        categories = ['Semua', ...Array.from(genreSet).sort()];
    }

    // ============ SETUP HERO ============
    function setupHero() {
        if (!DOM.heroVideo) return;
        
        // Get trending item (first item or most viewed)
        const allItems = [...allMovies, ...allSeries];
        const sortedByViews = allItems.sort((a, b) => (b.views || 0) - (a.views || 0));
        const trendingItem = sortedByViews[0] || allItems[0];
        
        if (!trendingItem) return;
        
        // Store for later use
        window.trendingItem = trendingItem;
        
        // Update hero content
        DOM.heroTitle.textContent = `🔥 ${trendingItem.title}`;
        DOM.heroInfo.textContent = `${trendingItem.year || ''} • ${trendingItem.genre || ''} • ${trendingItem.type === 'series' ? 'Series' : 'Movie'}`;
        
        // Set video
        let videoUrl = '';
        if (trendingItem.type === 'series' && trendingItem.episodes) {
            videoUrl = trendingItem.episodes[0]?.embed || '';
        } else {
            videoUrl = trendingItem.embed || '';
        }
        
        if (videoUrl) {
            if (videoUrl.includes('dailymotion.com/video/')) {
                const videoId = videoUrl.split('/video/')[1].split('?')[0];
                videoUrl = `https://www.dailymotion.com/embed/video/${videoId}`;
            }
            DOM.heroVideo.src = `${videoUrl}?autoplay=1&mute=1&controls=0&loop=0`;
        }
        
        // Setup hero buttons
        DOM.heroWatchBtn.onclick = () => openPlayer(trendingItem);
        DOM.heroTrailerBtn.onclick = () => showTrailer(trendingItem);
        DOM.heroBookmarkBtn.onclick = () => toggleBookmark(trendingItem, DOM.heroBookmarkBtn);
        
        // Check bookmark status
        updateBookmarkButton(trendingItem, DOM.heroBookmarkBtn);
    }

    // ============ RENDER CATEGORIES ============
    function renderCategories() {
        if (!DOM.categoriesContainer) return;
        
        DOM.categoriesContainer.innerHTML = '';
        
        categories.forEach(cat => {
            const btn = document.createElement('button');
            btn.className = 'category-btn' + (cat === 'Semua' ? ' active' : '');
            btn.textContent = cat;
            btn.dataset.category = cat;
            btn.onclick = () => filterByCategory(cat);
            DOM.categoriesContainer.appendChild(btn);
        });
    }

    // ============ FILTER BY CATEGORY ============
    function filterByCategory(category) {
        currentFilter = category;
        
        // Update active button
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === category);
        });
        
        let filteredMovies = allMovies;
        let filteredSeries = allSeries;
        
        if (category !== 'Semua') {
            filteredMovies = allMovies.filter(m => m.genre && m.genre.includes(category));
            filteredSeries = allSeries.filter(s => s.genre && s.genre.includes(category));
        }
        
        renderMovies(filteredMovies.slice(0, 6));
        renderSeries(filteredSeries.slice(0, 6));
    }

    // ============ RENDER MOVIES ============
    function renderMovies(movies) {
        if (!DOM.moviesContainer) return;
        
        DOM.moviesContainer.innerHTML = '';
        
        if (movies.length === 0) {
            DOM.moviesContainer.innerHTML = '<p class="empty-message">😕 Tidak ada film</p>';
            return;
        }
        
        movies.forEach(movie => {
            const card = createMovieCard(movie);
            DOM.moviesContainer.appendChild(card);
        });
    }

    // ============ RENDER SERIES ============
    function renderSeries(series) {
        if (!DOM.seriesContainer) return;
        
        DOM.seriesContainer.innerHTML = '';
        
        if (series.length === 0) {
            DOM.seriesContainer.innerHTML = '<p class="empty-message">😕 Tidak ada series</p>';
            return;
        }
        
        series.forEach(item => {
            const card = createMovieCard(item);
            DOM.seriesContainer.appendChild(card);
        });
    }

    // ============ CREATE MOVIE CARD ============
    function createMovieCard(item) {
        const card = document.createElement('div');
        card.className = 'movie-card';
        card.dataset.id = item.id || item.title;
        
        const imgSrc = item.poster || 'https://via.placeholder.com/300x200/333/e50914?text=No+Image';
        const year = item.year || 'N/A';
        const genre = item.genre || 'Unknown';
        const typeIcon = item.type === 'series' ? '📺' : '🎬';
        
        card.innerHTML = `
            <div class="card-image-wrapper">
                <img src="${imgSrc}" alt="${item.title}" loading="lazy" onerror="this.src='https://via.placeholder.com/300x200/333/e50914?text=Error'">
                <span class="rating-badge">${typeIcon}</span>
                <div class="movie-actions">
                    <button class="bookmark-btn" title="Bookmark">🔖</button>
                    <button class="trailer-btn" title="Trailer">▶</button>
                </div>
            </div>
            <div class="movie-info">
                <h3>${item.title}</h3>
                <p>${year} • ${genre}</p>
            </div>
        `;
        
        // Event listeners
        card.addEventListener('click', (e) => {
            // Don't trigger if clicking on action buttons
            if (e.target.closest('.movie-actions')) return;
            openPlayer(item);
        });
        
        const bookmarkBtn = card.querySelector('.bookmark-btn');
        bookmarkBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleBookmark(item, bookmarkBtn);
        });
        
        const trailerBtn = card.querySelector('.trailer-btn');
        trailerBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showTrailer(item);
        });
        
        // Update bookmark button
        updateBookmarkButton(item, bookmarkBtn);
        
        return card;
    }

    // ============ OPEN PLAYER ============
    function openPlayer(item) {
        // Add to continue watching
        addToContinueWatching(item);
        
        // Save to localStorage
        localStorage.setItem('currentMovie', JSON.stringify(item));
        
        // Navigate to player
        window.location.href = 'player.html';
    }

    // ============ SHOW TRAILER ============
    function showTrailer(item) {
        if (!DOM.trailerModal || !DOM.trailerFrame) return;
        
        let trailerUrl = '';
        
        if (item.type === 'series' && item.episodes) {
            trailerUrl = item.episodes[0]?.embed || '';
        } else {
            trailerUrl = item.embed || '';
        }
        
        if (trailerUrl) {
            if (trailerUrl.includes('dailymotion.com/video/')) {
                const videoId = trailerUrl.split('/video/')[1].split('?')[0];
                trailerUrl = `https://www.dailymotion.com/embed/video/${videoId}`;
            }
            DOM.trailerFrame.src = trailerUrl + '?autoplay=1';
        }
        
        DOM.trailerModal.classList.add('active');
    }

    // ============ CLOSE TRAILER MODAL ============
    window.closeTrailerModal = function() {
        if (DOM.trailerModal) {
            DOM.trailerModal.classList.remove('active');
            if (DOM.trailerFrame) {
                DOM.trailerFrame.src = '';
            }
        }
    };

    // ============ TOGGLE BOOKMARK ============
    function toggleBookmark(item, button) {
        const bookmarks = JSON.parse(localStorage.getItem('nontongratis_bookmarks') || '[]');
        const index = bookmarks.findIndex(b => b.id === item.id || b.title === item.title);
        
        if (index >= 0) {
            bookmarks.splice(index, 1);
            showToast('Dihapus dari bookmark');
        } else {
            bookmarks.push({
                id: item.id || item.title,
                type: item.type,
                title: item.title,
                poster: item.poster,
                genre: item.genre,
                year: item.year,
                embed: item.embed,
                episodes: item.episodes
            });
            showToast('Ditambahkan ke bookmark');
        }
        
        localStorage.setItem('nontongratis_bookmarks', JSON.stringify(bookmarks));
        updateBookmarkButton(item, button);
    }

    // ============ UPDATE BOOKMARK BUTTON ============
    function updateBookmarkButton(item, button) {
        if (!button) return;
        
        const bookmarks = JSON.parse(localStorage.getItem('nontongratis_bookmarks') || '[]');
        const isBookmarked = bookmarks.some(b => b.id === item.id || b.title === item.title);
        
        button.textContent = isBookmarked ? '🔖' : '🔖';
        button.style.color = isBookmarked ? '#e50914' : '';
    }

    // ============ ADD TO CONTINUE WATCHING ============
    function addToContinueWatching(item) {
        const history = JSON.parse(localStorage.getItem('watch_history') || '[]');
        const existing = history.findIndex(h => h.id === (item.id || item.title));
        
        const entry = {
            id: item.id || item.title,
            title: item.title,
            poster: item.poster,
            type: item.type,
            progress: 0,
            timestamp: Date.now()
        };
        
        if (existing >= 0) {
            history[existing] = entry;
        } else {
            history.push(entry);
        }
        
        // Keep last 20 items
        const trimmed = history.slice(-20);
        localStorage.setItem('watch_history', JSON.stringify(trimmed));
    }

    // ============ RENDER CONTINUE WATCHING ============
    function renderContinueWatching() {
        if (!DOM.continueWatchingContainer || !DOM.continueWatchingSection) return;
        
        const history = JSON.parse(localStorage.getItem('watch_history') || '[]');
        
        if (history.length === 0) {
            DOM.continueWatchingSection.style.display = 'none';
            return;
        }
        
        DOM.continueWatchingSection.style.display = 'block';
        DOM.continueWatchingContainer.innerHTML = '';
        
        // Show last 4 items
        history.slice(-4).reverse().forEach(item => {
            const card = document.createElement('div');
            card.className = 'movie-card';
            
            card.innerHTML = `
                <div class="card-image-wrapper">
                    <img src="${item.poster || 'https://via.placeholder.com/300x200/333/e50914?text=No+Image'}" alt="${item.title}" loading="lazy">
                    <div class="progress-bar" style="width: ${item.progress || 0}%"></div>
                </div>
                <div class="movie-info">
                    <h3>${item.title}</h3>
                    <p>${item.type === 'series' ? '📺 Series' : '🎬 Movie'}</p>
                </div>
            `;
            
            card.addEventListener('click', () => {
                // Find full item data
                const fullItem = allData.find(d => d.title === item.title) || item;
                openPlayer(fullItem);
            });
            
            DOM.continueWatchingContainer.appendChild(card);
        });
    }

    // ============ SEARCH FUNCTION ============
    function performSearch(term) {
        if (!term) {
            renderMovies(allMovies.slice(0, 6));
            renderSeries(allSeries.slice(0, 6));
            return;
        }
        
        const searchTerm = term.toLowerCase();
        
        const filteredMovies = allMovies.filter(m => 
            m.title.toLowerCase().includes(searchTerm) ||
            (m.genre && m.genre.toLowerCase().includes(searchTerm))
        );
        
        const filteredSeries = allSeries.filter(s => 
            s.title.toLowerCase().includes(searchTerm) ||
            (s.genre && s.genre.toLowerCase().includes(searchTerm))
        );
        
        renderMovies(filteredMovies);
        renderSeries(filteredSeries);
    }

    // ============ SETUP EVENT LISTENERS ============
    function setupEventListeners() {
        // Search
        if (DOM.searchInput) {
            DOM.searchInput.addEventListener('input', (e) => performSearch(e.target.value));
        }
        if (DOM.searchBtn) {
            DOM.searchBtn.addEventListener('click', () => performSearch(DOM.searchInput?.value || ''));
        }
        
        // Dark Mode Toggle
        if (DOM.darkModeToggle) {
            DOM.darkModeToggle.addEventListener('click', toggleDarkMode);
        }
        
        // Sidebar
        if (DOM.menuToggle) {
            DOM.menuToggle.addEventListener('click', openSidebar);
        }
        if (DOM.closeSidebar) {
            DOM.closeSidebar.addEventListener('click', closeSidebar);
        }
        if (DOM.sidebarOverlay) {
            DOM.sidebarOverlay.addEventListener('click', closeSidebar);
        }
        
        // Clear History
        if (DOM.clearHistoryBtn) {
            DOM.clearHistoryBtn.addEventListener('click', () => {
                if (confirm('Hapus semua riwayat tontonan?')) {
                    localStorage.removeItem('watch_history');
                    renderContinueWatching();
                    showToast('Riwayat dihapus');
                }
            });
        }
        
        // Modal close on overlay click
        if (DOM.trailerModal) {
            DOM.trailerModal.addEventListener('click', (e) => {
                if (e.target === DOM.trailerModal) {
                    closeTrailerModal();
                }
            });
        }
        
        // Escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeTrailerModal();
                closeSidebar();
            }
        });
        
        // Install PWA
        if (DOM.installBtn) {
            DOM.installBtn.addEventListener('click', installPWA);
        }
        if (DOM.dismissInstall) {
            DOM.dismissInstall.addEventListener('click', () => {
                DOM.installPrompt.style.display = 'none';
                localStorage.setItem('installPromptDismissed', 'true');
            });
        }
        
        // See All links
        document.querySelectorAll('.see-all').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const type = link.dataset.type;
                if (type === 'movies') {
                    renderMovies(allMovies);
                } else if (type === 'series') {
                    renderSeries(allSeries);
                }
            });
        });
        
        // History link in sidebar
        const historyLink = document.getElementById('historyLink');
        if (historyLink) {
            historyLink.addEventListener('click', (e) => {
                e.preventDefault();
                closeSidebar();
                DOM.continueWatchingSection?.scrollIntoView({ behavior: 'smooth' });
            });
        }
    }

    // ============ TOGGLE DARK MODE ============
    function toggleDarkMode() {
        const html = document.documentElement;
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        if (DOM.darkModeToggle) {
            DOM.darkModeToggle.textContent = newTheme === 'light' ? '☀️' : '🌙';
        }
    }

    // ============ LOAD USER PREFERENCES ============
    function loadUserPreferences() {
        // Theme
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        if (DOM.darkModeToggle) {
            DOM.darkModeToggle.textContent = savedTheme === 'light' ? '☀️' : '🌙';
        }
    }

    // ============ SIDEBAR FUNCTIONS ============
    function openSidebar() {
        if (DOM.sidebar) DOM.sidebar.classList.add('active');
        if (DOM.sidebarOverlay) DOM.sidebarOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeSidebar() {
        if (DOM.sidebar) DOM.sidebar.classList.remove('active');
        if (DOM.sidebarOverlay) DOM.sidebarOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    // ============ PWA INSTALL ============
    function checkInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            
            const dismissed = localStorage.getItem('installPromptDismissed');
            if (!dismissed && DOM.installPrompt) {
                setTimeout(() => {
                    DOM.installPrompt.style.display = 'block';
                }, 3000);
            }
        });
    }

    function installPWA() {
        if (!deferredPrompt) {
            alert('Aplikasi sudah terinstall atau tidak support PWA.');
            return;
        }
        
        deferredPrompt.prompt();
        
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted install');
                showToast('Terima kasih! Aplikasi sedang diinstall...');
            }
            deferredPrompt = null;
            DOM.installPrompt.style.display = 'none';
        });
    }

    // ============ FALLBACK DATA ============
    function useFallbackData() {
        console.warn('⚠️ Using fallback data');
        
        allMovies = [
            {
                type: 'movie',
                title: 'Bodyguard 3',
                poster: 'https://raw.githubusercontent.com/jhonie07/nontongratis/main/bodyguard.jpg',
                embed: 'https://www.dailymotion.com/embed/video/x9e11se',
                genre: 'Action',
                year: '2025',
                views: 1250
            },
            {
                type: 'movie',
                title: 'The Raid',
                poster: 'https://www.dailymotion.com/thumbnail/video/x918nyu',
                embed: 'https://www.dailymotion.com/embed/video/x918nyu',
                genre: 'Action Indo',
                year: '2011',
                views: 3400
            },
            {
                type: 'movie',
                title: '3 Iron',
                poster: 'https://www.dailymotion.com/thumbnail/video/x9p1fgw',
                embed: 'https://www.dailymotion.com/embed/video/x9p1fgw',
                genre: 'Action',
                year: '2004',
                views: 890
            }
        ];
        
        allSeries = [
            {
                type: 'series',
                title: 'Positively Yours Sub Indo',
                poster: 'https://www.dailymotion.com/thumbnail/video/xa5pfsy',
                genre: 'Drama',
                year: '2026',
                views: 2300,
                episodes: [
                    { ep: 'Episode 1', embed: 'https://www.dailymotion.com/embed/video/xa5pfsy' },
                    { ep: 'Episode 2', embed: 'https://www.dailymotion.com/embed/video/xa5pr62' }
                ]
            }
        ];
        
        allData = [...allMovies, ...allSeries];
        
        extractCategories();
        setupHero();
        renderCategories();
        renderMovies(allMovies.slice(0, 6));
        renderSeries(allSeries.slice(0, 6));
    }

    // ============ UTILITY FUNCTIONS ============
    function showLoading(show) {
        if (DOM.loading) {
            DOM.loading.classList.toggle('active', show);
        }
    }

    function showToast(message) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            bottom: 80px;
            left: 50%;
            transform: translateX(-50%);
            background: #e50914;
            color: white;
            padding: 12px 24px;
            border-radius: 30px;
            z-index: 9999;
            font-weight: bold;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => toast.remove(), 3000);
    }

    // ============ EXPOSE TO WINDOW ============
    window.closeTrailerModal = closeTrailerModal;
    window.toggleBookmark = toggleBookmark;
    window.openPlayer = openPlayer;
    window.showTrailer = showTrailer;
    window.allData = allData;

    console.log('✅ Script.js v2.0 loaded successfully!');
})();
