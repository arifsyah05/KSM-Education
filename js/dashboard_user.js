// ===== DASHBOARD USER - DATABASE MIGRATION VERSION =====
// FILE INI ADALAH CODE ORIGINAL + PENAMBAHAN FITUR BARU

feather.replace();

// ===== LOGIN STATUS CHECK =====
function checkLoginStatus() {
  return sessionStorage.getItem("userLoggedIn") === "true";
}

// ===== LOAD ARTICLES FROM DATABASE =====
async function loadArticles() {
  try {
    console.log("📥 Loading articles from database...");

    // Anti-cache timestamp
    const timestamp = Date.now();

    // Fetch journals with timestamp
    const journalsResponse = await fetch(
      `/ksmaja/api/list_journals.php?limit=50&offset=0&t=${timestamp}`,
      {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      }
    );
    const journalsData = await journalsResponse.json();

    // Fetch opinions with timestamp
    let opinionsData = { ok: false, results: [] };
    try {
      const opinionsResponse = await fetch(
        `/ksmaja/api/list_opinion.php?limit=50&offset=0&t=${timestamp}`,
        {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        }
      );
      opinionsData = await opinionsResponse.json();
    } catch (e) {
      console.warn("No opinions endpoint, skipping...");
    }

    let journals = [];
    let opinions = [];

    // Process journals from database
    if (journalsData.ok && journalsData.results) {
      journals = journalsData.results.map((j) => {
        const authors = j.authors
          ? typeof j.authors === "string"
            ? JSON.parse(j.authors)
            : j.authors
          : [];
        const tags = j.tags ? (typeof j.tags === "string" ? JSON.parse(j.tags) : j.tags) : [];
        return {
          id: j.id,
          title: j.title,
          judul: j.title,
          abstract: j.abstract,
          abstrak: j.abstract,
          authors: authors,
          author: authors,
          penulis: authors.length > 0 ? authors[0] : "Admin",
          tags: tags,
          date: j.created_at,
          uploadDate: j.created_at,
          fileData: j.file_url,
          coverImage:
            j.cover_url ||
            "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=500&h=400&fit=crop",
          cover: j.cover_url,
          views: j.views || 0,
          type: "jurnal",
        };
      });
    }

    // Process opinions from database
    if (opinionsData.ok && opinionsData.results) {
      opinions = opinionsData.results.map((o) => {
        return {
          id: o.id,
          title: o.title,
          judul: o.title,
          description: o.description,
          abstract: o.description,
          abstrak: o.description,
          category: o.category || "opini",
          author: [o.author_name || "Anonymous"],
          authors: [o.author_name || "Anonymous"],
          penulis: o.author_name || "Anonymous",
          date: o.created_at,
          uploadDate: o.created_at,
          coverImage:
            o.cover_url ||
            "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=500&h=400&fit=crop",
          cover: o.cover_url,
          fileUrl: o.file_url,
          fileData: o.file_url,
          views: o.views || 0,
          type: "opini",
        };
      });
    }

    const articles = [...journals, ...opinions].sort((a, b) => {
      const dateA = new Date(a.uploadDate || a.date || 0);
      const dateB = new Date(b.uploadDate || b.date || 0);
      return dateB - dateA;
    });

    console.log(`📊 Total articles from database: ${articles.length}`);
    return articles;
  } catch (error) {
    console.error("❌ Error loading articles from database:", error);
    return [];
  }
}

let articles = []; // Initialize empty, will be loaded async

// ===== NAVIGATE TO ARTICLE DETAIL =====
function openArticleDetail(articleId, articleType) {
  console.log("Opening article:", articleId, articleType);
  window.location.href = `explore_jurnal_user.html?id=${articleId}&type=${articleType}`;
}

async function renderArticles() {
  const grid = document.getElementById("articlesGrid");
  const navUser = document.getElementById("latestArticlesNavUser");

  grid.innerHTML = `
    <div class="loading-state" style="text-align: center; padding: 60px 20px; color: #666;">
      <div style="width: 50px; height: 50px; border: 4px solid rgba(0,0,0,0.1); border-top: 4px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
      <p>MEMUAT ARTIKEL...</p>
    </div>
  `;
  if (navUser) navUser.innerHTML = ""; // kosongin dulu

  // DATA DARI DATABASE
  articles = await loadArticles();

  if (articles.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📄</div>
        <h3>BELUM ADA ARTIKEL</h3>
        <p>ARTIKEL AKAN MUNCUL DI SINI SETELAH ADMIN MENGUPLOAD JURNAL</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = articles
    .slice(0, 6)
    .map((article) => {
      const title = article.title || article.judul || "UNTITLED";
      const author = Array.isArray(article.authors)
        ? article.authors[0]
        : Array.isArray(article.author)
        ? article.author[0]
        : article.author || article.penulis || "ADMIN";

      const date = article.date || article.uploadDate || new Date().toISOString();
      const formattedDate = new Date(date).toLocaleDateString("id-ID", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });

      const coverImage =
        article.coverImage ||
        article.cover ||
        "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=500&h=400&fit=crop";

      const views = article.views || 0;
      const abstract = article.abstract || article.abstrak || "";
      const truncatedAbstract =
        abstract.length > 100 ? abstract.substring(0, 100) + "..." : abstract;

      const typeLabel = article.type === "opini" ? "OPINI" : "JURNAL";
      const typeClass = article.type === "opini" ? "badge-opini" : "badge-jurnal";

      // ========================================
      // ✅ UPDATED: Tambah Quick Share Button
      // ========================================
      return `
        <div class="article-card">
          <div class="article-image-container" onclick="openArticleDetail('${article.id}', '${
        article.type
      }')" style="cursor: pointer;">
            <img src="${coverImage}" alt="${title}" class="article-image"
                 onerror="this.src='https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=500&h=400&fit=crop'">
            <span class="article-type-badge ${typeClass}">${typeLabel}</span>
          </div>
          <div class="article-content">
            <div class="article-meta">
              <span><i data-feather="user" style="width: 14px; height: 14px;"></i> ${author}</span>
              <span><i data-feather="calendar" style="width: 14px; height: 14px;"></i> ${formattedDate}</span>
              <span><i data-feather="eye" style="width: 14px; height: 14px;"></i> ${views}</span>
            </div>
            <div class="article-title" onclick="openArticleDetail('${article.id}', '${
        article.type
      }')" style="cursor: pointer;">
              ${title}
            </div>
            ${truncatedAbstract ? `<div class="article-excerpt">${truncatedAbstract}</div>` : ""}
            
            <!-- ✅ NEW: QUICK SHARE BUTTON -->
            <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #f0f0f0;">
              <button 
                class="btn-quick-share" 
                data-article-id="${article.id}"
                data-article-type="${article.type}"
                data-article-title="${title.replace(/"/g, "&quot;")}"
                onclick="event.stopPropagation()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/>
                </svg>
                Quick Share
              </button>
            </div>
          </div>
        </div>
      `;
    })
    .join("");

  // ====== TOMBOL LIHAT SEMUA ======
  if (navUser) {
    if (articles.length > 6) {
      navUser.innerHTML = `
        <button class="btn-see-all" onclick="window.location.href='journals_user.html'">
          LIHAT SEMUA ARTIKEL
        </button>
      `;
    } else {
      navUser.innerHTML = "";
    }
  }

  feather.replace();
}

// ===== LOGOUT HANDLER =====
function setupLogout() {
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      if (confirm("YAKIN INGIN LOGOUT?")) {
        sessionStorage.removeItem("userLoggedIn");
        sessionStorage.removeItem("userEmail");
        sessionStorage.removeItem("userType");
        sessionStorage.removeItem("visitorTracked");
        localStorage.removeItem("userEmail");
        window.location.href = "./login_user.html";
      }
    });
  }
}

// ===== NEWSLETTER SUBSCRIPTION =====
function setupNewsletter() {
  const subscribeBtn = document.getElementById("subscribeBtn");
  const newsletterEmail = document.getElementById("newsletterEmail");

  if (subscribeBtn && newsletterEmail) {
    subscribeBtn.addEventListener("click", () => {
      const email = newsletterEmail.value.trim();
      if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        alert("TERIMA KASIH! ANDA TELAH BERHASIL SUBSCRIBE NEWSLETTER");
        newsletterEmail.value = "";
      } else {
        alert("MOHON MASUKKAN EMAIL YANG VALID");
      }
    });
  }
}

// ===== SET USER NAME =====
function setUserName() {
  const userEmail = sessionStorage.getItem("userEmail");
  if (userEmail) {
    const userName = userEmail.split("@")[0].toUpperCase();
    const userNameEl = document.querySelector(".user-name");
    const userAvatarEl = document.querySelector(".user-avatar");
    if (userNameEl) userNameEl.textContent = userName;
    if (userAvatarEl) userAvatarEl.textContent = userName.charAt(0);
  }
}

// ===== GUEST MODE SETUP =====
function setupGuestMode() {
  const isLoggedIn = checkLoginStatus();

  const loggedInElements = [
    document.getElementById("userProfile"),
    document.getElementById("logoutBtn"),
    document.querySelector(".user-info-section"),
  ];

  if (!isLoggedIn) {
    // GUEST MODE
    loggedInElements.forEach((el) => {
      if (el) el.style.display = "none";
    });

    // Show login button in navbar
    const navbar = document.querySelector(".navbar");
    if (navbar && !document.getElementById("guestLoginBtn")) {
      const loginBtn = document.createElement("a");
      loginBtn.id = "guestLoginBtn";
      loginBtn.href = "./login_user.html";
      loginBtn.className = "btn-guest-login";
      loginBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
        LOGIN
      `;
      navbar.appendChild(loginBtn);
    }

    const userNameEl = document.querySelector(".user-name");
    const userAvatarEl = document.querySelector(".user-avatar");
    if (userNameEl) userNameEl.textContent = "GUEST";
    if (userAvatarEl) userAvatarEl.textContent = "G";
  } else {
    // LOGGED IN MODE
    loggedInElements.forEach((el) => {
      if (el) el.style.display = "block";
    });

    const guestBtn = document.getElementById("guestLoginBtn");
    if (guestBtn) guestBtn.remove();

    setUserName();
  }
}

// ===== SEARCH FUNCTIONALITY =====
function setupSearch() {
  const searchInput = document.querySelector(".search-box input");

  if (searchInput) {
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        const query = searchInput.value.trim();
        if (query) {
          performSearch(query);
        }
      }
    });
  }
}

async function performSearch(query) {
  const articles = await loadArticles();
  const results = articles.filter((article) => {
    const title = (article.title || article.judul || "").toLowerCase();
    const abstract = (article.abstract || article.abstrak || "").toLowerCase();
    const author = Array.isArray(article.authors)
      ? article.authors.join(" ").toLowerCase()
      : (article.author || article.penulis || "").toLowerCase();

    const searchQuery = query.toLowerCase();
    return (
      title.includes(searchQuery) || abstract.includes(searchQuery) || author.includes(searchQuery)
    );
  });

  // Redirect to journals page with search query
  window.location.href = `journals_user.html?search=${encodeURIComponent(query)}`;
}

document.addEventListener("DOMContentLoaded", async () => {
  console.log("🚀 Initializing User Dashboard (Database Mode)...");

  if (typeof StatisticsManager !== "undefined" && !window.statsManager) {
    window.statsManager = new StatisticsManager();
  }

  setupGuestMode();
  setupLogout();
  setupNewsletter();
  setupSearch();

  // INI YANG PENTING UNTUK UI USER
  await renderArticles();

  feather.replace();
  console.log("✅ User Dashboard ready");
});

// Add CSS for loading animation
const style = document.createElement("style");
style.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);

// ========================================
// ✅ NEW FEATURE 1: QUICK SHARE MANAGER
// Fitur untuk copy link artikel ke clipboard
// ========================================
class QuickShareManager {
  constructor() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Event delegation untuk tombol share
    document.addEventListener('click', (e) => {
      const shareBtn = e.target.closest('.btn-quick-share');
      if (shareBtn) {
        e.preventDefault();
        e.stopPropagation();
        const articleId = shareBtn.dataset.articleId;
        const articleType = shareBtn.dataset.articleType;
        const articleTitle = shareBtn.dataset.articleTitle;
        this.handleQuickShare(articleId, articleType, articleTitle);
      }
    });
  }

  handleQuickShare(articleId, articleType, articleTitle) {
    // Generate URL untuk share
    const baseUrl = window.location.origin;
    const shareUrl = `${baseUrl}/ksmaja/explore_jurnal_user.html?id=${articleId}&type=${articleType}`;
    this.copyToClipboard(shareUrl, articleTitle);
  }

  async copyToClipboard(url, title) {
    try {
      // Modern Clipboard API (Chrome, Firefox, Edge)
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
        this.showShareSuccess(title);
      } else {
        // Fallback untuk browser lama
        this.fallbackCopyToClipboard(url);
        this.showShareSuccess(title);
      }
    } catch (err) {
      console.error('Copy failed:', err);
      try {
        this.fallbackCopyToClipboard(url);
        this.showShareSuccess(title);
      } catch (fallbackErr) {
        this.showShareError();
      }
    }
  }

  fallbackCopyToClipboard(text) {
    // Metode fallback untuk copy text
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      textArea.remove();
    } catch (err) {
      textArea.remove();
      throw err;
    }
  }

  showShareSuccess(title) {
    const message = `✅ Link berhasil disalin!<br><small style="opacity: 0.8">${this.truncateTitle(title, 40)}</small>`;
    this.showToast(message, 'success');
  }

  showShareError() {
    this.showToast('❌ Gagal menyalin link. Silakan coba lagi.', 'error');
  }

  truncateTitle(title, maxLength) {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength) + '...';
  }

  showToast(message, type) {
    // Buat toast notification
    const toast = document.createElement('div');
    toast.className = `quick-share-toast ${type}`;
    toast.innerHTML = message;
    
    // Style inline
    Object.assign(toast.style, {
      position: 'fixed',
      bottom: '30px',
      right: '30px',
      background: type === 'success' ? '#10b981' : '#ef4444',
      color: 'white',
      padding: '16px 24px',
      borderRadius: '12px',
      boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
      zIndex: '10000',
      animation: 'slideInUp 0.3s ease',
      maxWidth: '400px',
      fontSize: '15px',
      fontWeight: '500',
      lineHeight: '1.5'
    });

    document.body.appendChild(toast);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      toast.style.animation = 'fadeOut 0.3s ease forwards';
      setTimeout(() => {
        if (toast.parentElement) {
          toast.remove();
        }
      }, 300);
    }, 3000);
  }
}

// ========================================
// ✅ NEW FEATURE 2: DYNAMIC CATEGORIES MANAGER
// Kategori dinamis berdasarkan tags dari database
// ========================================
class DynamicCategoriesManager {
  constructor() {
    this.categories = new Map(); // Store category counts
    this.loadCategories();
  }

  async loadCategories() {
    try {
      console.log('📊 Loading dynamic categories from database...');

      // Fetch all articles dengan timestamp anti-cache
      const timestamp = Date.now();
      
      const [journalsResponse, opinionsResponse] = await Promise.all([
        fetch(`/ksmaja/api/list_journals.php?limit=1000&offset=0&t=${timestamp}`, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        }),
        fetch(`/ksmaja/api/list_opinion.php?limit=1000&offset=0&t=${timestamp}`, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        }).catch(() => ({ json: async () => ({ ok: false, results: [] }) }))
      ]);

      const journalsData = await journalsResponse.json();
      const opinionsData = await opinionsResponse.json();

      // Combine semua articles
      const allArticles = [
        ...(journalsData.ok ? journalsData.results : []),
        ...(opinionsData.ok ? opinionsData.results : [])
      ];

      // Process tags dan hitung per kategori
      this.processArticleTags(allArticles);

      // Render categories ke UI
      this.renderCategories();

      console.log(`✅ Loaded ${this.categories.size} dynamic categories`);

    } catch (error) {
      console.error('❌ Error loading categories:', error);
      this.renderFallbackCategories();
    }
  }

  processArticleTags(articles) {
    this.categories.clear();

    articles.forEach(article => {
      let tags = article.tags;

      // Parse tags jika masih string
      if (typeof tags === 'string' && tags.trim()) {
        try {
          tags = JSON.parse(tags);
        } catch (e) {
          tags = [tags];
        }
      }

      // Ensure tags adalah array
      if (!Array.isArray(tags)) {
        tags = [];
      }

      // Count setiap tag
      tags.forEach(tag => {
        const normalizedTag = this.normalizeTag(tag);
        if (normalizedTag) {
          const currentCount = this.categories.get(normalizedTag) || 0;
          this.categories.set(normalizedTag, currentCount + 1);
        }
      });
    });

    // Sort by count (descending)
    this.categories = new Map(
      [...this.categories.entries()].sort((a, b) => b[1] - a[1])
    );
  }

  normalizeTag(tag) {
    if (!tag || typeof tag !== 'string') return null;
    
    // Capitalize first letter setiap kata
    return tag.trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  renderCategories() {
    const grid = document.querySelector('.categories-grid');
    if (!grid) {
      console.warn('Categories grid element not found');
      return;
    }

    // Ambil top 12 categories
    const topCategories = [...this.categories.entries()].slice(0, 12);

    if (topCategories.length === 0) {
      grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: #999; padding: 40px 0;">Belum ada kategori. Tambahkan tags saat upload artikel.</div>';
      return;
    }

    grid.innerHTML = topCategories.map(([category, count]) => `
      <div class="category-card" onclick="window.location.href='journals_user.html?category=${encodeURIComponent(category)}'" style="cursor: pointer;">
        <span class="category-name">${this.escapeHtml(category)}</span>
        <span class="category-count">(${count})</span>
      </div>
    `).join('');

    console.log(`✅ Rendered ${topCategories.length} categories to UI`);
  }

  renderFallbackCategories() {
    // Fallback jika tidak ada data
    const grid = document.querySelector('.categories-grid');
    if (!grid) return;

    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; color: #999; padding: 40px 0;">
        <div style="font-size: 48px; margin-bottom: 16px; opacity: 0.3;">📂</div>
        <p>Belum ada kategori.</p>
        <small style="opacity: 0.7;">Kategori akan muncul otomatis dari tags artikel.</small>
      </div>
    `;
  }

  escapeHtml(text) {
    // Escape HTML untuk prevent XSS
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  getCategoryCount(categoryName) {
    return this.categories.get(this.normalizeTag(categoryName)) || 0;
  }

  getAllCategories() {
    return Array.from(this.categories.keys());
  }
}

// ========================================
// ✅ INITIALIZE NEW FEATURES
// ========================================
console.log('🔧 Initializing Quick Share & Dynamic Categories...');

// Initialize Quick Share Manager
window.quickShareManager = new QuickShareManager();

// Initialize Dynamic Categories Manager
window.dynamicCategoriesManager = new DynamicCategoriesManager();

// ========================================
// ✅ ADD CSS FOR NEW FEATURES
// ========================================
const newFeaturesStyle = document.createElement('style');
newFeaturesStyle.textContent = `
  /* Quick Share Button */
  .btn-quick-share {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    text-decoration: none;
    font-family: inherit;
  }

  .btn-quick-share:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  }

  .btn-quick-share svg {
    width: 16px;
    height: 16px;
  }

  /* Toast Animations */
  @keyframes slideInUp {
    from {
      transform: translateY(100px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes fadeOut {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }

  /* Responsive */
  @media (max-width: 768px) {
    .quick-share-toast {
      right: 15px !important;
      left: 15px !important;
      bottom: 20px !important;
      max-width: calc(100% - 30px) !important;
    }
    
    .btn-quick-share {
      width: 100%;
      justify-content: center;
    }
  }
`;
document.head.appendChild(newFeaturesStyle);

console.log('✅ Quick Share & Dynamic Categories initialized successfully');