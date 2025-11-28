// ===== STATISTICS MANAGER - DATABASE VERSION =====
class StatisticsManager {
  constructor() {
    this.articleCountElement = document.getElementById("articleCount");
    this.visitorCountElement = document.getElementById("visitorCount");
    this.currentArticles = 0;
    this.currentVisitors = 0;
    this.init();
  }

  async init() {
    if (!this.articleCountElement && !this.visitorCountElement) return;

    if (this.articleCountElement) this.articleCountElement.textContent = "0";
    if (this.visitorCountElement) this.visitorCountElement.textContent = "0";

    await this.loadStatisticsFromDatabase();
    await this.trackVisitorToDatabase();

    requestAnimationFrame(() => {
      this.startCounterAnimation();
    });

    setInterval(() => this.refreshStatistics(), 30000);

    window.addEventListener("journals:changed", () => this.refreshStatistics());
    window.addEventListener("opinions:changed", () => this.refreshStatistics());
  }

  async loadStatisticsFromDatabase() {
    try {
      const response = await fetch("/ksmaja/api/get_stats.php");
      const data = await response.json();

      if (data.ok && data.stats) {
        this.currentArticles = data.stats.total_articles || 0;
        this.currentVisitors = data.stats.total_visitors || 0;
        this.saveToLocalCache(data.stats);
        console.log("✅ Stats loaded from database:", data.stats);
      } else {
        this.loadFromLocalCache();
      }
    } catch (error) {
      console.error("Error loading stats:", error);
      this.loadFromLocalCache();
    }
  }

  async trackVisitorToDatabase() {
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
        console.log("✅ Visitor tracked:", data.message);
        if (data.new) await this.refreshStatistics();
      }
    } catch (error) {
      console.error("Error tracking visitor:", error);
    }
  }

  async refreshStatistics() {
    const oldArticles = this.currentArticles;
    const oldVisitors = this.currentVisitors;

    await this.loadStatisticsFromDatabase();

    if (this.articleCountElement && this.currentArticles !== oldArticles) {
      this.animateCounter(this.articleCountElement, oldArticles, this.currentArticles, 600);
    }

    if (this.visitorCountElement && this.currentVisitors !== oldVisitors) {
      this.animateCounter(this.visitorCountElement, oldVisitors, this.currentVisitors, 600);
    }
  }

  saveToLocalCache(stats) {
    const cache = {
      articles: stats.total_articles || 0,
      visitors: stats.total_visitors || 0,
      cached_at: new Date().toISOString(),
    };
    localStorage.setItem("siteStatisticsCache", JSON.stringify(cache));
  }

  loadFromLocalCache() {
    try {
      const cached = localStorage.getItem("siteStatisticsCache");
      if (cached) {
        const data = JSON.parse(cached);
        this.currentArticles = data.articles || 0;
        this.currentVisitors = data.visitors || 0;
        console.log("📦 Stats loaded from cache (fallback)");
      }
    } catch (error) {
      this.currentArticles = 0;
      this.currentVisitors = 0;
    }
  }

  startCounterAnimation() {
    if (this.articleCountElement) {
      this.animateCounter(this.articleCountElement, 0, this.currentArticles, 700);
    }
    if (this.visitorCountElement) {
      this.animateCounter(this.visitorCountElement, 0, this.currentVisitors, 900);
    }
  }

  animateCounter(element, start, end, duration) {
    if (!element) return;

    element.classList.add("counting");
    const startTime = performance.now();
    const range = end - start;

    const updateCounter = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = Math.floor(start + range * easeOutQuart);

      element.textContent = String(current);

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        element.textContent = String(end);
        element.classList.remove("counting");
      }
    };

    requestAnimationFrame(updateCounter);
  }

  resetStatistics() {
    localStorage.removeItem("siteStatisticsCache");
    sessionStorage.removeItem("visitorTracked");
    this.currentArticles = 0;
    this.currentVisitors = 0;
    if (this.articleCountElement) this.articleCountElement.textContent = "0";
    if (this.visitorCountElement) this.visitorCountElement.textContent = "0";
  }
}

// Auto init
document.addEventListener("DOMContentLoaded", () => {
  window.statisticsManager = new StatisticsManager();
});

console.log("✅ statistic.js loaded (Database Mode)");
