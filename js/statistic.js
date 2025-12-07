// Manajer statistik versi database tanpa cache
class StatisticsManager {
  // Konstruktor untuk inisialisasi elemen dan properti dasar
  constructor() {
    console.log("StatisticsManager constructor called");

    this.articleCountElement = document.getElementById("articleCount");
    this.visitorCountElement = document.getElementById("visitorCount");

    console.log("Elements found:", {
      articleCount: this.articleCountElement ? "Yes" : "No",
      visitorCount: this.visitorCountElement ? "Yes" : "No",
    });

    this.currentArticles = 0;
    this.currentVisitors = 0;
    this.init();
  }

  // Memulai proses inisialisasi, memuat data, dan mengatur interval refresh
  async init() {
    if (!this.articleCountElement && !this.visitorCountElement) {
      console.error("No stat elements found! Aborting StatisticsManager init.");
      return;
    }

    console.log("StatisticsManager initializing...");

    // Set nilai awal tampilan ke 0 sebelum data dimuat
    if (this.articleCountElement) this.articleCountElement.textContent = "0";
    if (this.visitorCountElement) this.visitorCountElement.textContent = "0";

    // Memuat data dari database dan melacak pengunjung
    await this.loadStatisticsFromDatabase();
    await this.trackVisitorToDatabase();

    console.log("Starting animation with values:", {
      articles: this.currentArticles,
      visitors: this.currentVisitors,
    });

    // Jalankan animasi counter
    requestAnimationFrame(() => {
      this.startCounterAnimation();
    });

    // Refresh statistik setiap 30 detik
    setInterval(() => this.refreshStatistics(), 30000);

    // Event listener untuk update realtime jika ada perubahan data
    window.addEventListener("journals:changed", () => this.refreshStatistics());
    window.addEventListener("opinions:changed", () => this.refreshStatistics());
  }

  // Mengambil data statistik terbaru dari API server
  async loadStatisticsFromDatabase() {
    try {
      // Gunakan timestamp untuk mencegah browser melakukan caching pada request
      const timestamp = Date.now();
      console.log(`Fetching stats from API... (t=${timestamp})`);

      const response = await fetch(`/ksmaja/api/get_stats.php?t=${timestamp}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
      });

      const data = await response.json();
      console.log("Stats API response:", data);

      if (data.ok && data.stats) {
        this.currentArticles = data.stats.total_articles || 0;
        this.currentVisitors = data.stats.total_visitors || 0;
        console.log("Stats loaded:", {
          articles: this.currentArticles,
          visitors: this.currentVisitors,
        });
      } else {
        console.warn("Stats API returned not OK");
      }
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  }

  // Mengirim data pengunjung ke database (sekali per sesi)
  async trackVisitorToDatabase() {
    // Cek session storage untuk menghindari penghitungan ganda dalam satu sesi browser
    if (sessionStorage.getItem("visitorTracked")) {
      console.log("Visitor already tracked this session");
      return;
    }

    try {
      const response = await fetch("/ksmaja/api/track_visitor.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "page_url=" + encodeURIComponent(window.location.pathname),
      });

      const data = await response.json();

      if (data.ok) {
        sessionStorage.setItem("visitorTracked", "1");
        console.log("Visitor tracked");
        // Jika pengunjung baru terhitung, refresh statistik agar angka bertambah di UI
        if (data.new) await this.refreshStatistics();
      }
    } catch (error) {
      console.error("Error tracking visitor:", error);
    }
  }

  // Memperbarui angka statistik dan memicu animasi jika ada perubahan
  async refreshStatistics() {
    const oldArticles = this.currentArticles;
    const oldVisitors = this.currentVisitors;

    await this.loadStatisticsFromDatabase();

    // Animasi update angka artikel jika berubah
    if (this.articleCountElement && this.currentArticles !== oldArticles) {
      this.animateCounter(this.articleCountElement, oldArticles, this.currentArticles, 600);
    }

    // Animasi update angka pengunjung jika berubah
    if (this.visitorCountElement && this.currentVisitors !== oldVisitors) {
      this.animateCounter(this.visitorCountElement, oldVisitors, this.currentVisitors, 600);
    }
  }

  // Memulai animasi counter dari 0 ke nilai target saat halaman dimuat
  startCounterAnimation() {
    console.log("Starting counter animation");

    if (this.articleCountElement) {
      console.log(`Animating articles: 0 -> ${this.currentArticles}`);
      this.animateCounter(this.articleCountElement, 0, this.currentArticles, 700);
    }

    if (this.visitorCountElement) {
      console.log(`Animating visitors: 0 -> ${this.currentVisitors}`);
      this.animateCounter(this.visitorCountElement, 0, this.currentVisitors, 900);
    }
  }

  // Fungsi generik untuk animasi angka (counter increment)
  animateCounter(element, start, end, duration) {
    if (!element) return;

    console.log(`Animating ${element.id}: ${start} -> ${end}`);

    element.classList.add("counting");
    const startTime = performance.now();
    const range = end - start;

    const updateCounter = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Fungsi easing easeOutQuart untuk animasi yang lebih natural
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = Math.floor(start + range * easeOutQuart);

      element.textContent = String(current);

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        element.textContent = String(end);
        element.classList.remove("counting");
        console.log(`Animation complete for ${element.id}: ${end}`);
      }
    };

    requestAnimationFrame(updateCounter);
  }

  // Reset statistik dan cache (biasanya untuk debugging)
  resetStatistics() {
    localStorage.removeItem("siteStatisticsCache");
    sessionStorage.removeItem("visitorTracked");
    this.currentArticles = 0;
    this.currentVisitors = 0;
    if (this.articleCountElement) this.articleCountElement.textContent = "0";
    if (this.visitorCountElement) this.visitorCountElement.textContent = "0";
  }
}

// Inisialisasi otomatis dengan pengecekan state dokumen
if (document.readyState === "loading") {
  console.log("DOM still loading, waiting for DOMContentLoaded...");
  document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM ready, initializing StatisticsManager");
    localStorage.removeItem("siteStatisticsCache");
    window.statisticsManager = new StatisticsManager();
  });
} else {
  console.log("DOM already ready, initializing StatisticsManager immediately");
  localStorage.removeItem("siteStatisticsCache");
  window.statisticsManager = new StatisticsManager();
}

console.log("statistic.js loaded (Database Mode - No Cache)");
