document.addEventListener("DOMContentLoaded", function () {

    // ============ KONFIGURASI IKLAN ============
    const ADS = {
        bannerSrc: "https://www.highperformanceformat.com/bd21bd4de40671fbaa0ab7f123c6ca8",
        socialSrc: "https://pl29191016.profitablecpmratenetwork.com/20/09/9d/20099d153d5a6",
        popSrc: "https://pl29191017.profitablecpmratenetwork.com/13/ac/57/13ac573259f9ac68",
        popDelay: 8000,        // 8 detik
        refreshTime: 120000     // 2 menit (untuk refresh iklan banner)
    };

    // ============ DETEKSI DEVICE ============
    const isMobile = window.innerWidth < 768;

    // ============ FUNGSI INJECT BANNER ============
    function injectBanner(id, src, height = 90) {
        const el = document.getElementById(id);
        if (!el) return;

        // Cegah inject berulang
        if (el.hasAttribute("data-ads-loaded")) return;
        el.setAttribute("data-ads-loaded", "true");

        el.innerHTML = `
            <iframe 
                src="${src}" 
                width="100%" 
                height="${height}" 
                frameborder="0" 
                scrolling="no" 
                allow="autoplay"
                loading="lazy"
                style="display:block; background:#111;">
            </iframe>
        `;
    }

    // ============ INJECT SEMUA BANNER ============
    function injectAllBanners() {
        // Banner Atas (index)
        injectBanner("bannerTop", ADS.bannerSrc, 90);

        // Banner Tengah / Home (index)
        injectBanner("bannerHome", ADS.socialSrc, isMobile ? 250 : 300);

        // Banner Bawah (index)
        injectBanner("bannerBottom", ADS.bannerSrc, 90);

        // Banner Player (player.html)
        injectBanner("bannerPlayer", ADS.socialSrc, 90);
    }

    // ============ POP-UNDER IKLAN ============
    function openPopunder() {
        try {
            // Buka tab baru di background
            const pop = window.open(ADS.popSrc, '_blank');
            if (pop) {
                // Fokus kembali ke halaman utama (biar gak mengganggu)
                window.focus();
            }
        } catch (e) {
            console.warn("Pop-up diblokir browser:", e);
        }
    }

    // ============ SAFE SCRIPT LOADER (CADANGAN) ============
    function loadScript(src) {
        try {
            if (!document.body) return;
            const s = document.createElement("script");
            s.src = src;
            s.async = true;
            s.onerror = () => console.warn("Script gagal load:", src);
            document.body.appendChild(s);
        } catch (e) {
            console.error("Loader error:", e);
        }
    }

    // ============ EKSEKUSI ============
    
    // 1. Inject semua banner SEKARANG
    injectAllBanners();

    // 2. Jadwalkan pop-under setelah delay
    setTimeout(() => {
        openPopunder();
    }, ADS.popDelay);

    // 3. Refresh banner setiap 2 menit (opsional)
    setInterval(() => {
        // Reset atribut biar bisa di-inject ulang
        ["bannerTop", "bannerHome", "bannerBottom", "bannerPlayer"].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.removeAttribute("data-ads-loaded");
        });
        injectAllBanners();
    }, ADS.refreshTime);

    // 4. Load script cadangan (jika diperlukan)
    // loadScript("https://example.com/backup-ads.js");

    console.log("✅ ADS.JS loaded - Banners injected");
});
