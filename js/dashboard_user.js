// Mengganti icon feather saat script dimuat
feather.replace();

// Memeriksa status login pengguna dari session storage
function checkLoginStatus() {
  return sessionStorage.getItem("userLoggedIn") === "true";
}

// Variabel global untuk menampung artikel
let articles = [];

// Fungsi asinkronus untuk mengambil data artikel dari database
async function loadArticles() {
  try {
    console.log("Memuat artikel dari database...");

    // Membuat timestamp untuk mencegah cache browser
    const timestamp = Date.now();

    // Mengambil data jurnal dari API
    const journalsResponse = await fetch(
      `/ksmaja/api/list_journals.php?limit=50&offset=0&t=${timestamp}`,
      {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      }
    );
    const journalsData = await journalsResponse.json();

    // Mengambil data opini dari API
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
      console.warn("Endpoint opini tidak ditemukan atau error, melewati proses ini...");
    }

    let journals = [];
    let opinions = [];

    // Memproses data jurnal jika request berhasil
    if (journalsData.ok && journalsData.results) {
      journals = journalsData.results.map((j) => {
        // Parsing data authors jika bentuknya string JSON
        const authors = j.authors
          ? typeof j.authors === "string"
            ? JSON.parse(j.authors)
            : j.authors
          : [];

        // Parsing data tags
        const tags = j.tags ? (typeof j.tags === "string" ? JSON.parse(j.tags) : j.tags) : [];

        // Normalisasi struktur data jurnal
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

    // Memproses data opini jika request berhasil
    if (opinionsData.ok && opinionsData.results) {
      opinions = opinionsData.results.map((o) => {
        // Normalisasi struktur data opini
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

    // Menggabungkan jurnal dan opini lalu mengurutkan berdasarkan tanggal terbaru
    const allArticles = [...journals, ...opinions].sort((a, b) => {
      const dateA = new Date(a.uploadDate || a.date || 0);
      const dateB = new Date(b.uploadDate || b.date || 0);
      return dateB - dateA;
    });

    console.log(`Total artikel dari database: ${allArticles.length}`);
    return allArticles;
  } catch (error) {
    console.error("Error memuat artikel dari database:", error);
    return [];
  }
}

// Fungsi navigasi ke halaman detail artikel
function openArticleDetail(articleId, articleType) {
  console.log("Membuka artikel:", articleId, articleType);
  window.location.href = `explore_jurnal_user.html?id=${articleId}&type=${articleType}`;
}

// Fungsi utama untuk merender artikel ke dalam grid HTML
async function renderArticles() {
  const grid = document.getElementById("articlesGrid");
  const navUser = document.getElementById("latestArticlesNavUser");

  // Menampilkan animasi loading
  grid.innerHTML = `
    <div class="loading-state" style="text-align: center; padding: 60px 20px; color: #666;">
      <div style="width: 50px; height: 50px; border: 4px solid rgba(0,0,0,0.1); border-top: 4px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
      <p>MEMUAT ARTIKEL...</p>
    </div>
  `;

  if (navUser) navUser.innerHTML = "";

  // Mengambil data terbaru
  articles = await loadArticles();

  // Menampilkan pesan jika tidak ada artikel
  if (articles.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon" style="font-size: 48px; margin-bottom: 16px;">📄</div>
        <h3>BELUM ADA ARTIKEL</h3>
        <p>ARTIKEL AKAN MUNCUL DI SINI SETELAH ADMIN MENGUPLOAD JURNAL</p>
      </div>
    `;
    return;
  }

  // Merender 6 artikel terbaru ke dalam grid
  grid.innerHTML = articles
    .slice(0, 6)
    .map((article) => {
      // Penentuan judul, penulis, dan tanggal dengan fallback value
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

      // Penentuan label tipe artikel (Jurnal atau Opini)
      const typeLabel = article.type === "opini" ? "OPINI" : "JURNAL";
      const typeClass = article.type === "opini" ? "badge-opini" : "badge-jurnal";

      // Template literal HTML untuk kartu artikel
      return `
        <div class="article-card" onclick="openArticleDetail('${article.id}', '${
        article.type
      }')" style="cursor: pointer;">
          <div class="article-image-container">
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
            <div class="article-title">${title}</div>
            ${truncatedAbstract ? `<div class="article-excerpt">${truncatedAbstract}</div>` : ""}
          </div>
        </div>
      `;
    })
    .join("");

  // Menambahkan tombol Lihat Semua jika artikel lebih dari 6
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

  // Refresh icon feather agar muncul di elemen baru
  feather.replace();
}

// Menyiapkan event listener untuk tombol logout
function setupLogout() {
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      if (confirm("YAKIN INGIN LOGOUT?")) {
        // Menghapus sesi login dari storage
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

// Menyiapkan fungsi berlangganan newsletter
function setupNewsletter() {
  const subscribeBtn = document.getElementById("subscribeBtn");
  const newsletterEmail = document.getElementById("newsletterEmail");

  if (subscribeBtn && newsletterEmail) {
    subscribeBtn.addEventListener("click", () => {
      const email = newsletterEmail.value.trim();
      // Validasi format email sederhana
      if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        alert("TERIMA KASIH! ANDA TELAH BERHASIL SUBSCRIBE NEWSLETTER");
        newsletterEmail.value = "";
      } else {
        alert("MOHON MASUKKAN EMAIL YANG VALID");
      }
    });
  }
}

// Mengatur tampilan nama user di navbar
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

// Mengatur mode tamu (Guest) jika belum login
function setupGuestMode() {
  const isLoggedIn = checkLoginStatus();

  const loggedInElements = [
    document.getElementById("userProfile"),
    document.getElementById("logoutBtn"),
    document.querySelector(".user-info-section"),
  ];

  if (!isLoggedIn) {
    // Mode Tamu: sembunyikan elemen khusus member
    loggedInElements.forEach((el) => {
      if (el) el.style.display = "none";
    });

    // Menambahkan tombol login di navbar
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

    // Set nama profil default tamu
    const userNameEl = document.querySelector(".user-name");
    const userAvatarEl = document.querySelector(".user-avatar");
    if (userNameEl) userNameEl.textContent = "GUEST";
    if (userAvatarEl) userAvatarEl.textContent = "G";
  } else {
    // Mode Member: tampilkan elemen member
    loggedInElements.forEach((el) => {
      if (el) el.style.display = "block";
    });

    // Hapus tombol login tamu jika ada
    const guestBtn = document.getElementById("guestLoginBtn");
    if (guestBtn) guestBtn.remove();

    setUserName();
  }
}

// Menyiapkan fitur pencarian artikel
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

// Melakukan logika pencarian dan redirect ke halaman jurnal
async function performSearch(query) {
  // Memuat data terbaru sebelum filter
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

  // Redirect ke halaman daftar jurnal dengan parameter query
  window.location.href = `journals_user.html?search=${encodeURIComponent(query)}`;
}

// Inisialisasi utama saat DOM siap
document.addEventListener("DOMContentLoaded", async () => {
  console.log("Inisialisasi Dashboard User (Mode Database)...");

  // Inisialisasi manajer statistik jika tersedia
  if (typeof StatisticsManager !== "undefined" && !window.statsManager) {
    window.statsManager = new StatisticsManager();
  }

  // Menjalankan fungsi-fungsi setup
  setupGuestMode();
  setupLogout();
  setupNewsletter();
  setupSearch();

  // Render artikel utama
  await renderArticles();

  feather.replace();
  console.log("Dashboard User siap");
});

// Menambahkan CSS untuk animasi loading secara dinamis
const style = document.createElement("style");
style.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);
