document.addEventListener("DOMContentLoaded", function () {

    console.log("🚀 ADS.JS LOADED - Adsterra Full Integration");

    // ============ KONFIGURASI ADSTERRA LENGKAP ============
    const ADS = {
        // Banner 300x250
        bannerKey: 'bd2a1bd4de40671fbaa0ab7f123c6cab',
        
        // Pop-under Script
        popScript: 'https://pl29191017.profitablecpmratenetwork.com/13/ac/57/13ac573259f9ac689cf966e9075b8096.js',
        
        // Social Bar Script
        socialBarScript: 'https://pl29191016.profitablecpmratenetwork.com/20/09/9d/20099d153d5a60e357a56bb8eec294ed.js',
        
        // Settings
        popDelay: 5000,      // 5 detik sebelum pop-under muncul
        bannerRefresh: 120000 // 2 menit refresh banner
    };

    // ============ DETEKSI DEVICE ============
    const isMobile = window.innerWidth < 768;

    // ============ FUNGSI INJECT BANNER ADSTERRA ============
    function injectAdsterraBanner(targetId, width = 300, height = 250) {
        const el = document.getElementById(targetId);
        if (!el) {
            console.warn(`❌ Element #${targetId} tidak ditemukan`);
            return;
        }

        // Cegah inject berulang
        if (el.hasAttribute("data-ads-loaded")) return;
        el.setAttribute("data-ads-loaded", "true");

        // Buat container untuk Adsterra
        const adContainer = document.createElement("div");
        adContainer.style.width = "100%";
        adContainer.style.maxWidth = width + "px";
        adContainer.style.margin = "0 auto";
        adContainer.style.textAlign = "center";
        adContainer.style.background = "#0a0a0a";
        adContainer.style.borderRadius = "8px";
        adContainer.style.padding = "10px 0";
        adContainer.style.overflow = "hidden";

        // Inject script Adsterra
        const script1 = document.createElement("script");
        script1.type = "text/javascript";
        script1.text = `
            atOptions = {
                'key' : '${ADS.bannerKey}',
                'format' : 'iframe',
                'height' : ${height},
                'width' : ${width},
                'params' : {}
            };
        `;

        const script2 = document.createElement("script");
        script2.src = `https://www.highperformanceformat.com/${ADS.bannerKey}/invoke.js`;
        script2.async = true;

        adContainer.appendChild(script1);
        adContainer.appendChild(script2);
        
        el.innerHTML = "";
        el.appendChild(adContainer);

        console.log(`✅ Banner Adsterra injected ke #${targetId} (${width}x${height})`);
    }

    // ============ FUNGSI INJECT POP-UNDER ============
    function injectPopunder() {
        if (!ADS.popScript) return;

        // Cek apakah sudah ada script pop-under
        const existing = document.querySelector(`script[src="${ADS.popScript}"]`);
        if (existing) {
            console.log("⏭️ Pop-under script sudah ada");
            return;
        }

        const script = document.createElement("script");
        script.src = ADS.popScript;
        script.async = true;
        script.setAttribute("data-adsterra", "popunder");
        script.onload = () => console.log("✅ Pop-under Adsterra loaded");
        script.onerror = () => console.warn("⚠️ Pop-under diblokir browser (normal)");

        document.body.appendChild(script);
    }

    // ============ FUNGSI INJECT SOCIAL BAR ============
    function injectSocialBar() {
        if (!ADS.socialBarScript) return;

        // Cek apakah sudah ada
        const existing = document.querySelector(`script[src="${ADS.socialBarScript}"]`);
        if (existing) {
            console.log("⏭️ Social Bar script sudah ada");
            return;
        }

        // Buat container fixed di bawah
        const socialContainer = document.createElement("div");
        socialContainer.id = "adsterra-social-bar";
        socialContainer.style.position = "fixed";
        socialContainer.style.bottom = "0";
        socialContainer.style.left = "0";
        socialContainer.style.width = "100%";
        socialContainer.style.zIndex = "9999";
        socialContainer.style.textAlign = "center";
        socialContainer.style.background = "rgba(0,0,0,0.7)";
        socialContainer.style.backdropFilter = "blur(5px)";
        socialContainer.style.padding = "5px 0";
        socialContainer.style.borderTop = "1px solid #e50914";

        // Tambahkan padding-bottom ke body agar konten tidak ketutupan
        document.body.style.paddingBottom = "60px";

        const script = document.createElement("script");
        script.src = ADS.socialBarScript;
        script.async = true;
        script.setAttribute("data-adsterra", "social-bar");
        script.onload = () => console.log("✅ Social Bar Adsterra loaded");
        script.onerror = () => console.warn("⚠️ Social Bar gagal load");

        socialContainer.appendChild(script);
        document.body.appendChild(socialContainer);
    }

    // ============ INJECT BANNER PLAYER (KHUSUS) ============
    function injectPlayerBanner() {
        const playerEl = document.getElementById("bannerPlayer");
        if (playerEl) {
            injectAdsterraBanner("bannerPlayer", 300, 250);
        }
    }

    // ============ INJECT SEMUA BANNER ============
    function injectAllBanners() {
        injectAdsterraBanner("bannerTop", 300, 250);
        injectAdsterraBanner("bannerHome", isMobile ? 300 : 336, isMobile ? 250 : 280);
        injectAdsterraBanner("bannerBottom", 300, 250);
        injectPlayerBanner();
    }

    // ============ REFRESH BANNER PERIODIK ============
    function startBannerRefresh() {
        setInterval(() => {
            console.log("🔄 Refreshing Adsterra banners...");
            ["bannerTop", "bannerHome", "bannerBottom", "bannerPlayer"].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.removeAttribute("data-ads-loaded");
            });
            injectAllBanners();
        }, ADS.bannerRefresh);
    }

    // ============ EKSEKUSI ============
    
    // 1. Inject semua banner SEKARANG
    injectAllBanners();

    // 2. Social Bar langsung (fixed di bawah)
    injectSocialBar();

    // 3. Pop-under setelah delay (biar user lihat konten dulu)
    setTimeout(() => {
        injectPopunder();
    }, ADS.popDelay);

    // 4. Refresh banner periodik
    startBannerRefresh();

    // 5. Expose ke window untuk debugging
    window.ADS = ADS;

    console.log("✅ ADSTERRA FULL INTEGRATION: Banner + Pop-under + Social Bar");
});
