// ==========================================
// LOAD MOVIES
// ==========================================

const url = "/movies.json";   // FIX WAJIB

async function loadMovies() {
    try {
        const res = await fetch(url);
        const data = await res.json();

        document.getElementById("loading").style.display = "none";

        showCategories(data);
        showMovies(data);

        setupSearch(data);

    } catch (error) {
        console.log(error);
        document.getElementById("loading").innerHTML = "Gagal memuat data!";
    }
}

// ==========================================
// CATEGORY AUTO
// ==========================================

function showCategories(data) {
    const categories = [...new Set(data.map(m => m.genre))];

    let html = "";
    categories.forEach(c => {
        html += `<button class="cat-btn" onclick="filterCategory('${c}')">${c}</button>`;
    });

    document.getElementById("categories").innerHTML = html;
}

// ==========================================
// TAMPILKAN MOVIE / SERIES
// ==========================================

function showMovies(data) {
    let html = "";

    data.forEach(m => {
        html += `
        <div class="card" onclick="openDetail('${encodeURIComponent(m.title)}')">
            <img src="${m.poster}" alt="${m.title}">
            <div class="title">${m.title}</div>
        </div>`;
    });

    document.getElementById("movies").innerHTML = html;
}

// ==========================================
// FILTER KATEGORI
// ==========================================

function filterCategory(cat) {
    fetch(url).then(res => res.json()).then(data => {
        const filtered = data.filter(m => m.genre === cat);
        showMovies(filtered);
    });
}

// ==========================================
// SEARCH
// ==========================================

function setupSearch(data) {
    const input = document.getElementById("search");

    input.addEventListener("input", () => {
        const q = input.value.toLowerCase();

        const filtered = data.filter(m =>
            m.title.toLowerCase().includes(q)
        );

        showMovies(filtered);
    });
}

// ==========================================
// BUKA PLAYER
// ==========================================

function openDetail(title) {
    window.location.href = "/player.html?title=" + title;
}

// ==========================================
// PLAYER PAGE
// ==========================================

if (window.location.pathname.includes("player.html")) {
    const params = new URLSearchParams(window.location.search);
    const title = decodeURIComponent(params.get("title"));

    fetch(url).then(res => res.json()).then(data => {
        const movie = data.find(m => m.title === title);

        document.getElementById("title").innerText = movie.title;
        document.getElementById("videoFrame").src = movie.embed;
    });
}

// ==========================================
// START
// ==========================================

loadMovies();
