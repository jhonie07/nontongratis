document.addEventListener("DOMContentLoaded", function () {

  try {

    // ================= AI CONFIG =================
    const ADS = {
      bannerSrc: "https://www.highperformanceformat.com/bd2a1bd4de40671fbaa0ab7f123c6cab/invoke.js",
      socialSrc: "https://pl29191016.profitablecpmratenetwork.com/20/09/9d/20099d153d5a60e357a56bb8eec294ed.js",
      popSrc: "https://pl29191017.profitablecpmratenetwork.com/13/ac/57/13ac573259f9ac689cf966e9075b8096.js",

      popDelay: 8000,
      refreshTime: 120000
    };

    // ================= DEVICE AI DETECTION =================
    const isMobile = window.innerWidth < 768;

    // AI menentukan slot terbaik
    const slots = {
      top: "bannerTop",
      mid: isMobile ? "bannerHome" : "bannerTop",
      bottom: isMobile ? "bannerBottom" : "bannerHome"
    };

    // ================= SAFE SCRIPT LOADER =================
    function loadScript(src) {
      try {
        if (!document.body) return;

        const s = document.createElement("script");
        s.src = src;
        s.async = true;
        s.onerror = () => console.warn("AI ADS gagal load:", src);

        document.body.appendChild(s);
      } catch (e) {
        console.error("AI loader error:", e);
      }
    }

    // ================= AI FALLBACK BANNER =================
    function renderFallback(id) {
      const el = document.getElementById(id);
      if (!el) return;

      el.innerHTML = `
        <div style="
          padding:10px;
          margin:10px 0;
          text-align:center;
          font-size:12px;
          background:#f3f3f3;
          border:1px dashed #aaa;
          color:#666;
        ">
          AD SLOT
        </div>
      `;
    }

    // ================= AI SLOT RENDER =================
    function initSlots() {
      Object.values(slots).forEach(renderFallback);
    }

    // ================= AI LOAD SYSTEM =================
    function startAds() {

      // banner utama
      loadScript(ADS.bannerSrc);

      // social bar (lazy load)
      setTimeout(() => {
        loadScript(ADS.socialSrc);
      }, 3000);

      // popunder (AI delay)
      setTimeout(() => {
        loadScript(ADS.popSrc);
      }, ADS.popDelay);

    }

    // ================= SMART REFRESH =================
    function autoRefresh() {
      setInterval(() => {
        console.log("AI ADS refresh cycle");

        // hanya reload ringan (tidak spam popunder)
        loadScript(ADS.bannerSrc);

      }, ADS.refreshTime);
    }

    // ================= INITIALIZE AI ADS =================
    initSlots();
    startAds();
    autoRefresh();

    console.log("🤖 Cinematic Ads AI Mode ACTIVE (SAFE)");

  } catch (err) {
    console.error("AI ADS SYSTEM SAFE MODE TRIGGERED:", err);
  }

});
