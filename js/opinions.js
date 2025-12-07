// Class untuk mengelola halaman opini dengan integrasi database MySQL
class OpinionsPageManager {
  // Konstruktor inisialisasi properti dasar dan state
  constructor() {
    this.container = document.getElementById("opinionsContainer");
    this.opinionsPerPage = 12;
    this.currentPage = 1;
    this.opinions = [];
    this.filteredOpinions = [];
    this.currentFilter = "all";
    this.currentSort = "newest";

    console.log("OpinionsPageManager initializing (Database Mode)...");
    this.init();
  }

  // Inisialisasi event listener dan memuat data awal
  async init() {
    if (!this.container) {
      console.warn("Opinions container not found!");
      return;
    }

    // Memuat data opini dari database
    await this.loadOpinions();

    console.log("OpinionsPageManager initialized with", this.opinions.length, "opinions");

    // Render antarmuka pengguna
    this.render();
    this.setupSort();
    this.setupSearch();
    this.renderPagination();

    // Event listener untuk sinkronisasi antar tab browser via storage
    window.addEventListener("storage", async (e) => {
      if (e.key === "opinions") {
        console.log("Storage changed, reloading opinions...");
        await this.loadOpinions();
        this.applyFiltersAndSort();
      }
    });

    // Event listener custom untuk trigger manual
    window.addEventListener("opinions:changed", async () => {
      console.log("Opinions changed event triggered");
      await this.loadOpinions();
      this.applyFiltersAndSort();
    });
  }

  // Mengambil data opini dari endpoint API
  async loadOpinions() {
    try {
      console.log("[INFO] Loading opinions from database...");

      const response = await fetch("/ksmaja/api/list_opinions.php?limit=100&offset=0");
      const data = await response.json();

      if (data.ok && data.results) {
        // Transformasi data dari format database ke format aplikasi
        this.opinions = data.results.map((o) => {
          return {
            id: String(o.id),
            title: o.title || "Untitled",
            description: o.description || "",
            category: o.category || "opini",
            author_name: o.author_name || "Anonymous",
            date: o.created_at,
            uploadDate: o.created_at,
            coverImage:
              o.cover_url ||
              "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=500&h=400&fit=crop",
            fileUrl: o.file_url,
            file: o.file_url,
            views: parseInt(o.views) || 0,
          };
        });

        this.filteredOpinions = [...this.opinions];
        console.log(`[SUCCESS] Loaded ${this.opinions.length} opinions from database`);
      } else {
        console.warn("[WARN] No opinions found in database response");
        this.opinions = [];
        this.filteredOpinions = [];
      }
    } catch (error) {
      console.error("[ERROR] Error loading opinions from database:", error);

      // Fallback ke localStorage jika koneksi database gagal
      console.warn("[WARN] Falling back to localStorage...");
      const stored = localStorage.getItem("opinions");
      if (stored) {
        try {
          const data = JSON.parse(stored);
          this.opinions = data;
          this.filteredOpinions = [...this.opinions];
          console.log(
            `[INFO] Loaded ${this.opinions.length} opinions from localStorage (fallback)`
          );
        } catch (e) {
          console.error("Error parsing opinions:", e);
          this.opinions = [];
          this.filteredOpinions = [];
        }
      } else {
        console.log("No opinions found in localStorage");
        this.opinions = [];
        this.filteredOpinions = [];
      }
    }
  }

  // Merender tampilan kartu opini ke dalam kontainer
  render() {
    if (!this.container) return;

    // Menampilkan state kosong jika tidak ada data
    if (this.filteredOpinions.length === 0) {
      this.container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📝</div>
          <h3>Belum Ada Opini</h3>
          <p>Artikel opini akan muncul di sini setelah admin mengupload</p>
        </div>
      `;
      return;
    }

    // Kalkulasi pagination
    const start = (this.currentPage - 1) * this.opinionsPerPage;
    const end = start + this.opinionsPerPage;
    const opinionsToShow = this.filteredOpinions.slice(start, end);

    this.container.innerHTML = "";

    // Loop untuk membuat kartu opini
    opinionsToShow.forEach((opinion) => {
      const card = this.createOpinionCard(opinion);
      this.container.appendChild(card);
    });

    // Inisialisasi ulang icon feather
    if (typeof feather !== "undefined") {
      feather.replace();
    }
  }

  // Membuat elemen HTML untuk satu kartu opini
  createOpinionCard(opinion) {
    const card = document.createElement("div");
    card.className = "opinion-card";
    card.setAttribute("data-opinion-id", opinion.id);

    // Fungsi helper untuk memotong teks yang terlalu panjang
    const truncateText = (text, maxLength) => {
      if (!text) return "";
      return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
    };

    // Fungsi helper untuk format tanggal Indonesia
    const formatDate = (dateString) => {
      try {
        return new Date(dateString).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
      } catch (e) {
        return dateString;
      }
    };

    // Menentukan kelas CSS berdasarkan kategori
    const getCategoryClass = (category) => {
      const categories = {
        opini: "category-opini",
        artikel: "category-artikel",
        berita: "category-berita",
        editorial: "category-editorial",
      };
      return categories[category] || "category-default";
    };

    // Template literal HTML untuk kartu
    card.innerHTML = `
      <div class="opinion-cover">
        <img src="${opinion.coverImage}" 
             alt="${opinion.title}" 
             onerror="this.src='https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=500&h=400&fit=crop'">
        <div class="opinion-views">
          <i data-feather="eye"></i> ${opinion.views}
        </div>
      </div>
      <div class="opinion-content">
        <span class="opinion-category ${getCategoryClass(opinion.category)}">${
      opinion.category
    }</span>
        <h3 class="opinion-title">${truncateText(opinion.title, 60)}</h3>
        <p class="opinion-description">${truncateText(opinion.description, 150)}</p>
        <div class="opinion-meta">
          <span class="opinion-author">
            <i data-feather="user"></i> ${opinion.author_name}
          </span>
          <span class="opinion-date">
            <i data-feather="calendar"></i> ${formatDate(opinion.uploadDate)}
          </span>
        </div>
        <div class="opinion-actions">
          <button class="btn-view" onclick="opinionsManager.viewOpinion('${opinion.id}')">
            <i data-feather="eye"></i> Lihat Detail
          </button>
          <button class="btn-delete" onclick="opinionsManager.deleteOpinion('${
            opinion.id
          }', '${opinion.title.replace(/'/g, "\\'")}')">
            <i data-feather="trash-2"></i> Hapus
          </button>
        </div>
      </div>
    `;

    return card;
  }

  // Menangani aksi klik tombol lihat detail
  viewOpinion(id) {
    console.log("[INFO] Viewing opinion:", id);

    // Update jumlah views di database
    this.updateViews(id);

    // Redirect ke halaman detail
    window.location.href = `explore_jurnal_user.html?id=${id}&type=opini`;
  }

  // Menangani penghapusan data opini dari database
  async deleteOpinion(id, title) {
    // Konfirmasi sebelum menghapus
    if (!confirm(`Yakin ingin menghapus opini "${title}"?`)) {
      return;
    }

    try {
      console.log(`[INFO] Deleting opinion ID: ${id}`);

      // Efek visual loading pada kartu
      const card = document.querySelector(`[data-opinion-id="${id}"]`);
      if (card) {
        card.style.opacity = "0.5";
        card.style.pointerEvents = "none";
      }

      // Request hapus ke API
      const response = await fetch(`/ksmaja/api/delete_opinion.php?id=${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (result.ok) {
        console.log("[SUCCESS] Opinion deleted from database");

        alert("Opini berhasil dihapus!");

        // Hapus dari state lokal
        this.opinions = this.opinions.filter((o) => o.id !== id && o.id !== String(id));
        this.filteredOpinions = this.filteredOpinions.filter(
          (o) => o.id !== id && o.id !== String(id)
        );

        // Render ulang UI
        this.render();
        this.renderPagination();

        // Trigger event custom
        window.dispatchEvent(
          new CustomEvent("opinions:changed", {
            detail: {
              action: "deleted",
              id: id,
            },
          })
        );
      } else {
        throw new Error(result.message || "Gagal menghapus opini dari database");
      }
    } catch (error) {
      console.error("[ERROR] Delete error:", error);

      alert("Gagal menghapus opini: " + error.message);

      // Kembalikan tampilan kartu jika gagal
      const card = document.querySelector(`[data-opinion-id="${id}"]`);
      if (card) {
        card.style.opacity = "1";
        card.style.pointerEvents = "auto";
      }
    }
  }

  // Mengupdate jumlah view counter ke API
  async updateViews(id) {
    try {
      console.log("[INFO] Updating views for opinion:", id);

      const response = await fetch(`/ksmaja/api/update_views.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: id,
          type: "opinion",
        }),
      });

      const result = await response.json();

      if (result.ok) {
        // Update data lokal
        const opinion = this.opinions.find((o) => o.id === id || o.id === String(id));
        if (opinion) {
          opinion.views = (opinion.views || 0) + 1;
        }
      }
    } catch (error) {
      console.warn("[WARN] Failed to update views:", error);
    }
  }

  // Mengatur event listener untuk dropdown sorting
  setupSort() {
    const sortSelect = document.getElementById("sortSelect");
    if (sortSelect) {
      sortSelect.addEventListener("change", (e) => {
        this.currentSort = e.target.value;
        this.applyFiltersAndSort();
      });
    }
  }

  // Mengatur event listener untuk input pencarian realtime
  setupSearch() {
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        const query = e.target.value.toLowerCase().trim();

        if (!query) {
          this.filteredOpinions = [...this.opinions];
        } else {
          this.filteredOpinions = this.opinions.filter(
            (o) =>
              o.title.toLowerCase().includes(query) ||
              o.description.toLowerCase().includes(query) ||
              o.author_name.toLowerCase().includes(query) ||
              o.category.toLowerCase().includes(query)
          );
        }

        this.currentPage = 1;
        this.render();
        this.renderPagination();
      });
    }
  }

  // Menerapkan logika sorting dan filtering pada data
  applyFiltersAndSort() {
    this.filteredOpinions = [...this.opinions];

    if (this.currentSort === "newest") {
      this.filteredOpinions.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
    } else if (this.currentSort === "oldest") {
      this.filteredOpinions.sort((a, b) => new Date(a.uploadDate) - new Date(b.uploadDate));
    } else if (this.currentSort === "title") {
      this.filteredOpinions.sort((a, b) => a.title.localeCompare(b.title));
    } else if (this.currentSort === "views") {
      this.filteredOpinions.sort((a, b) => (b.views || 0) - (a.views || 0));
    }

    this.currentPage = 1;
    this.render();
    this.renderPagination();
  }

  // Memfilter data berdasarkan kategori tertentu
  filterByCategory(category) {
    if (category === "all") {
      this.filteredOpinions = [...this.opinions];
    } else {
      this.filteredOpinions = this.opinions.filter((o) => o.category === category);
    }

    this.currentPage = 1;
    this.render();
    this.renderPagination();
  }

  // Merender tombol navigasi pagination
  renderPagination() {
    const totalPages = Math.ceil(this.filteredOpinions.length / this.opinionsPerPage);

    const paginationContainer = document.getElementById("pagination");

    if (!paginationContainer || totalPages <= 1) {
      if (paginationContainer) paginationContainer.innerHTML = "";
      return;
    }

    paginationContainer.innerHTML = "";

    // Tombol Previous
    const prevBtn = document.createElement("button");
    prevBtn.textContent = "Previous";
    prevBtn.className = "pagination-btn";
    prevBtn.disabled = this.currentPage === 1;
    prevBtn.addEventListener("click", () => {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.render();
        this.renderPagination();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
    paginationContainer.appendChild(prevBtn);

    // Logika menampilkan nomor halaman (max 5 tombol terlihat)
    const maxVisiblePages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Tombol halaman pertama jika tidak terlihat
    if (startPage > 1) {
      const firstBtn = this.createPageButton(1);
      paginationContainer.appendChild(firstBtn);

      if (startPage > 2) {
        const ellipsis = document.createElement("span");
        ellipsis.textContent = "...";
        ellipsis.className = "pagination-ellipsis";
        paginationContainer.appendChild(ellipsis);
      }
    }

    // Loop tombol halaman
    for (let i = startPage; i <= endPage; i++) {
      const pageBtn = this.createPageButton(i);
      paginationContainer.appendChild(pageBtn);
    }

    // Tombol halaman terakhir jika tidak terlihat
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        const ellipsis = document.createElement("span");
        ellipsis.textContent = "...";
        ellipsis.className = "pagination-ellipsis";
        paginationContainer.appendChild(ellipsis);
      }

      const lastBtn = this.createPageButton(totalPages);
      paginationContainer.appendChild(lastBtn);
    }

    // Tombol Next
    const nextBtn = document.createElement("button");
    nextBtn.textContent = "Next";
    nextBtn.className = "pagination-btn";
    nextBtn.disabled = this.currentPage === totalPages;
    nextBtn.addEventListener("click", () => {
      if (this.currentPage < totalPages) {
        this.currentPage++;
        this.render();
        this.renderPagination();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
    paginationContainer.appendChild(nextBtn);
  }

  // Helper membuat elemen tombol pagination
  createPageButton(pageNum) {
    const pageBtn = document.createElement("button");
    pageBtn.textContent = pageNum;
    pageBtn.className = pageNum === this.currentPage ? "pagination-btn active" : "pagination-btn";
    pageBtn.addEventListener("click", () => {
      this.currentPage = pageNum;
      this.render();
      this.renderPagination();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    return pageBtn;
  }

  // Mengambil satu objek opini berdasarkan ID
  getOpinionById(id) {
    return this.opinions.find((o) => o.id === id || o.id === String(id));
  }

  // Mendapatkan total jumlah opini
  getTotalCount() {
    return this.opinions.length;
  }

  // Mendapatkan akumulasi total views dari semua opini
  getTotalViews() {
    return this.opinions.reduce((total, opinion) => total + (opinion.views || 0), 0);
  }
}

// Inisialisasi manager saat DOM siap
let opinionsManager;
document.addEventListener("DOMContentLoaded", () => {
  opinionsManager = new OpinionsPageManager();
  console.log("OpinionsPageManager initialized (Full Database Integration)");

  // Expose instance ke window agar bisa diakses di console
  window.opinionsManager = opinionsManager;
});

console.log("opinions.js loaded (Database Mode)");
