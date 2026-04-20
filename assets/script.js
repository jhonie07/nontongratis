document.addEventListener("DOMContentLoaded", function () {

    let allMovies = [];
    let allSeries = [];
    let categories = [];

    // ============ FETCH DATA ============
    async function fetchMovies() {
        const loading = document.getElementById("loading");
        if (loading) loading.style.display = "block";

        try {
            const response = await fetch("./movies.json");
            if (!response.ok) throw new Error("Gagal load movies.json");
            
            const data = await response.json();
            
            // Pisahkan movie dan series
            allMovies = data.filter(item => item.type === "movie");
            allSeries = data.filter(item => item.type === "series");
            
            // Ambil kategori unik
            const genreSet = new Set();
            data.forEach(item => {
                if (item.genre) {
                    item.genre.split(",").forEach(g => genreSet.add(g.trim()));
                }
            });
            categories = Array.from(genreSet);
            
            renderCategories();
            renderMovies(allMovies);
            renderSeries(allSeries);
            
        } catch (error) {
            console.error("❌ Error fetch:", error);
        } finally {
            if (loading) loading.style.display = "none";
        }
    }

    // ============ RENDER KATEGORI ============
    function renderCategories() {
        const catContainer = document.getElementById("categories");
        if (!catContainer) return;
        
        catContainer.innerHTML = "";
        
        const allBtn = document.createElement("button");
        allBtn.className = "category-btn active";
        allBtn.textContent = "Semua";
        allBtn.onclick = () => {
            renderMovies(allMovies);
            renderSeries(allSeries);
            setActiveCategory("Semua");
        };
        catContainer.appendChild(allBtn);
        
        categories.sort().forEach(cat => {
            const btn = document.createElement("button");
            btn.className = "category-btn";
            btn.textContent = cat;
            btn.onclick = () => {
                const filteredMovies = allMovies.filter(m => m.genre && m.genre.includes(cat));
                const filteredSeries = allSeries.filter(s => s.genre && s.genre.includes(cat));
                renderMovies(filteredMovies);
                renderSeries(filteredSeries);
                setActiveCategory(cat);
            };
            catContainer.appendChild(btn);
        });
    }

    function setActiveCategory(catName) {
        document.querySelectorAll(".category-btn").forEach(btn => {
            btn.classList.remove("active");
            if (btn.textContent === catName) btn.classList.add("active");
        });
    }

    // ============ RENDER MOVIES ============
    function renderMovies(movieList) {
        const container = document.getElementById("movies");
        if (!container) return;
        container.innerHTML = "";
        
        if (movieList.length === 0) {
            container.innerHTML = "<p style='grid-column:1/-1; text-align:center; padding:40px; color:#aaa;'>😕 Tidak ada film</p>";
            return;
        }
        
        movieList.slice(0, 6).forEach(movie => {
            const card = createCard(movie);
            container.appendChild(card);
        });
    }

    // ============ RENDER SERIES ============
    function renderSeries(seriesList) {
        const container = document.getElementById("series");
        if (!container) return;
        container.innerHTML = "";
        
        if (seriesList.length === 0) {
            container.innerHTML = "<p style='grid-column:1/-1; text-align:center; padding:40px; color:#aaa;'>😕 Tidak ada series</p>";
            return;
        }
        
        seriesList.slice(0, 6).forEach(series => {
            const card = createCard(series);
            container.appendChild(card);
        });
    }

    // ============ CREATE CARD ============
    function createCard(item) {
        const card = document.createElement("div");
        card.className = item.type === "movie" ? "movie-card" : "series-card";
        card.onclick = () => openPlayer(item);
        
        const imgSrc = item.poster || `https://via.placeholder.com/300x200/333/e50914?text=${encodeURIComponent(item.title)}`;
        const year = item.year || "2024";
        const genre = item.genre || "Unknown";
        
        card.innerHTML = `
            <div style="position: relative;">
                <img src="${imgSrc}" alt="${item.title}" loading="lazy" onerror="this.src='https://via.placeholder.com/300x200/333/e50914?text=No+Image'">
                <span class="rating">${item.type === "series" ? "📺" : "🎬"}</span>
            </div>
            <div class="${item.type === "movie" ? "movie-info" : "series-info"}">
                <h3>${item.title}</h3>
                <p>${year} • ${genre}</p>
            </div>
        `;
        
        return card;
    }

    // ============ SEARCH ============
    const searchInput = document.getElementById("search");
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            const term = e.target.value.toLowerCase();
            const filteredMovies = allMovies.filter(m => m.title.toLowerCase().includes(term));
            const filteredSeries = allSeries.filter(s => s.title.toLowerCase().includes(term));
            renderMovies(filteredMovies);
            renderSeries(filteredSeries);
        });
    }

    // ============ OPEN PLAYER ============
    function openPlayer(item) {
        localStorage.setItem("currentMovie", JSON.stringify(item));
        window.location.href = "player.html";
    }

    // ============ PLAYER PAGE ============
    const videoFrame = document.getElementById("videoFrame");
    const titleEl = document.getElementById("title");
    const infoEl = document.getElementById("info");
    const episodesContainer = document.getElementById("episodes");
    const recommendContainer = document.getElementById("recommend");
    
    if (videoFrame && titleEl && infoEl) {
        const item = JSON.parse(localStorage.getItem("currentMovie") || "{}");
        
        titleEl.textContent = item.title || "Judul";
        infoEl.textContent = `${item.year || "2024"} • ${item.genre || "Unknown"}`;
        
        // Set video
        if (item.type === "movie" && item.embed) {
            let embedUrl = item.embed;
            if (embedUrl.includes("dailymotion.com/video/")) {
                const videoId = embedUrl.split("/video/")[1].split("?")[0];
                embedUrl = `https://www.dailymotion.com/embed/video/${videoId}`;
            }
            videoFrame.src = embedUrl + "?autoplay=1";
        }
        
        // Render episodes untuk series
        if (episodesContainer) {
            episodesContainer.innerHTML = "";
            const episodeTitle = document.getElementById("Episode");
            
            if (item.type === "series" && item.episodes) {
                if (episodeTitle) episodeTitle.style.display = "block";
                
                item.episodes.forEach((ep, i) => {
                    const btn = document.createElement("button");
                    btn.className = "episode-btn";
                    btn.textContent = ep.ep || `Episode ${i+1}`;
                    btn.onclick = () => {
                        let embedUrl = ep.embed;
                        if (embedUrl.includes("dailymotion.com/video/")) {
                            const videoId = embedUrl.split("/video/")[1];
                            embedUrl = `https://www.dailymotion.com/embed/video/${videoId}`;
                        }
                        videoFrame.src = embedUrl + "?autoplay=1";
                        
                        document.querySelectorAll(".episode-btn").forEach(b => b.classList.remove("active"));
                        btn.classList.add("active");
                    };
                    episodesContainer.appendChild(btn);
                });
                
                // Play episode 1
                if (item.episodes[0]) {
                    let embedUrl = item.episodes[0].embed;
                    if (embedUrl.includes("dailymotion.com/video/")) {
                        const videoId = embedUrl.split("/video/")[1];
                        embedUrl = `https://www.dailymotion.com/embed/video/${videoId}`;
                    }
                    videoFrame.src = embedUrl + "?autoplay=1";
                }
            } else {
                if (episodeTitle) episodeTitle.style.display = "none";
            }
        }
        
        // Rekomendasi
        if (recommendContainer) {
            recommendContainer.innerHTML = "";
            const all = [...allMovies, ...allSeries].filter(i => i.title !== item.title);
            const random = all.sort(() => 0.5 - Math.random()).slice(0, 4);
            
            random.forEach(rec => {
                const card = document.createElement("div");
                card.className = "rec-card";
                card.onclick = () => {
                    localStorage.setItem("currentMovie", JSON.stringify(rec));
                    window.location.reload();
                };
                
                card.innerHTML = `
                    <img src="${rec.poster || 'https://via.placeholder.com/120x160/333/e50914?text=No+Image'}" alt="${rec.title}">
                    <span>${rec.title}</span>
                `;
                recommendContainer.appendChild(card);
            });
        }
    }

    // Init
    fetchMovies();
    console.log("✅ Script loaded - Dailymotion + Series support");
});
