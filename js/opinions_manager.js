// Kelas untuk pengelolaan Opini terintegrasi dengan database MySQL
class OpinionManager {
  constructor() {
    // Container utama untuk merender kartu opini
    this.container =
      document.getElementById("opinionContainer") || document.getElementById("articlesGrid");

    this.opinions = [];

    // Mencegah script berjalan di halaman dashboard user karena sudah ditangani dashboard_user.js
    if (window.location.pathname.includes("dashboard_user.html")) {
      console.warn("Halaman dashboard user - OpinionManager dinonaktifkan");
      return;
    }

    // Inisialisasi hanya jika container ditemukan
    if (this.container) {
      this.init();
    } else {
      console.warn("Container opini tidak ditemukan pada halaman ini");
    }
  }

  async init() {
    console.log("OpinionManager dimulai (Mode Database)...");

    await this.loadOpinions();
    this.renderOpinions();

    // Event listener untuk reload data jika ada perubahan (misal setelah upload/hapus)
    window.addEventListener("opinions:changed", async () => {
      console.log("Event perubahan opini diterima, memuat ulang...");
      await this.loadOpinions();
      this.renderOpinions();
    });
  }

  // Memuat data opini dari database melalui API
  async loadOpinions() {
    try {
      console.log("Memuat opini dari database...");

      // Menambahkan timestamp untuk mencegah caching browser
      const timestamp = Date.now();
      const response = await fetch(
        `/ksmaja/api/list_opinion.php?limit=100&offset=0&_=${timestamp}`,
        {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        }
      );
      const data = await response.json();

      if (data.ok && data.results) {
        // Transformasi data API ke format internal object
        this.opinions = data.results.map((o) => {
          return {
            id: String(o.id),
            title: o.title || "Untitled",
            description: o.description || "",
            fullAbstract: o.description || "", // Mapping description ke abstract
            author: [o.author_name || "Anonymous"], // Format array agar seragam dengan jurnal
            date: o.created_at,
            uploadDate: o.created_at,
            fileData: o.file_url,
            file: o.file_url,
            coverImage:
              o.cover_url ||
              "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=500&h=400&fit=crop",
            views: parseInt(o.views) || 0,
            category: "opini",
          };
        });
        console.log(`Berhasil memuat ${this.opinions.length} opini dari database`);
      } else {
        console.warn("Tidak ada opini ditemukan atau database kosong");
        this.opinions = [];
      }
    } catch (error) {
      console.error("Error memuat opini dari database:", error);
      this.opinions = [];
    }
  }

  // Merender daftar opini ke HTML
  renderOpinions() {
    if (!this.container) return;

    this.container.innerHTML = "";

    // Tampilan jika data kosong
    if (this.opinions.length === 0) {
      this.container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon" style="font-size: 48px; margin-bottom: 10px;">📝</div>
          <h3>Belum Ada Opini</h3>
          <p>Silakan upload opini baru melalui form upload.</p>
        </div>
      `;
      return;
    }

    // Loop data opini dan buat kartu
    this.opinions.forEach((opinion) => {
      const card = this.createOpinionCard(opinion);
      this.container.appendChild(card);
    });

    if (typeof feather !== "undefined") {
      feather.replace();
    }
  }

  // Membuat elemen kartu opini HTML
  createOpinionCard(opinion) {
    // Cek apakah user adalah admin
    const isAdmin =
      sessionStorage.getItem("userType") === "admin" ||
      window.location.pathname.includes("dashboard_admin.html");

    const card = document.createElement("div");
    card.className = isAdmin ? "journal-card" : "article-card"; // Gunakan class yang sama dengan jurnal
    card.setAttribute("data-opinion-id", opinion.id);

    // Styling inline untuk konsistensi layout
    card.style.cssText = `
      display: flex; 
      flex-direction: column; 
      background: white; 
      border-radius: 10px; 
      overflow: hidden; 
      box-shadow: 0 2px 15px rgba(0,0,0,0.08); 
      transition: transform 0.3s;
      height: 100%;
    `;

    if (!isAdmin) {
      card.style.cursor = "pointer";
      card.onclick = () => this.viewOpinion(opinion.id);
    }

    // Fungsi helper formatting
    const truncateText = (text, maxLength) => {
      if (!text) return "";
      return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
    };

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

    // Template HTML kartu
    card.innerHTML = `
      <div style="width: 100%; height: 200px; overflow: hidden; position: relative;">
        <img src="${opinion.coverImage}" 
             alt="${opinion.title}" 
             style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s;"
             onerror="this.src='https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=500&h=400&fit=crop'">
        <div style="position: absolute; top: 12px; right: 12px; background: rgba(0,0,0,0.7); color: white; padding: 6px 10px; border-radius: 6px; font-size: 12px; display: flex; align-items: center; gap: 4px; font-weight: 600;">
          <i data-feather="eye" style="width: 14px; height: 14px;"></i> ${opinion.views}
        </div>
        <div style="position: absolute; top: 12px; left: 12px; background: #e67e22; color: white; padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: 700;">
          OPINI
        </div>
      </div>
      
      <div style="padding: 20px; display: flex; flex-direction: column; flex: 1;">
        <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 12px; color: #2c3e50; line-height: 1.4;">${truncateText(
          opinion.title,
          60
        )}</h3>
        
        <p style="font-size: 14px; color: #666; line-height: 1.6; margin-bottom: 16px;">${truncateText(
          opinion.description,
          100
        )}</p>
        
        <div style="display: flex; flex-wrap: wrap; gap: 12px; font-size: 12px; color: #888; margin-top: auto; padding-top: 12px; border-top: 1px solid #f0f0f0;">
          <span style="display: flex; align-items: center; gap: 4px;">
            <i data-feather="user" style="width: 14px; height: 14px;"></i> ${opinion.author[0]}
          </span>
          <span style="display: flex; align-items: center; gap: 4px;">
            <i data-feather="calendar" style="width: 14px; height: 14px;"></i> ${formatDate(
              opinion.uploadDate
            )}
          </span>
        </div>

        ${
          isAdmin
            ? `
          <div class="journal-actions" style="display: flex !important; gap: 8px; margin-top: 15px; padding-top: 15px; border-top: 1px solid #eee;">
            <button class="btn-view" onclick="event.stopPropagation(); opinionManager.viewOpinion('${
              opinion.id
            }')" style="flex:1; padding: 8px; border:none; background:#3498db; color:white; border-radius:4px; cursor:pointer; display:flex !important; align-items:center; justify-content:center; gap:5px;">
              <i data-feather="eye" style="width:14px; height:14px;"></i> Detail
            </button>
            <button class="btn-delete" onclick="event.stopPropagation(); opinionManager.deleteOpinion('${
              opinion.id
            }', '${opinion.title.replace(
                /'/g,
                "\\'"
              )}')" style="flex:1; padding: 8px; border:none; background:#e74c3c; color:white; border-radius:4px; cursor:pointer; display:flex !important; align-items:center; justify-content:center; gap:5px;">
              <i data-feather="trash-2" style="width:14px; height:14px;"></i> Hapus
            </button>
          </div>
        `
            : ""
        }
      </div>
    `;

    return card;
  }

  // Navigasi ke halaman detail opini
  viewOpinion(id) {
    console.log("Melihat opini:", id);
    this.updateViews(id);
    window.location.href = `explore_jurnal_admin.html?id=${id}&type=opini`;
  }

  // Menghapus opini dari database
  async deleteOpinion(id, title = "") {
    if (!id) {
      alert("ID opini tidak valid");
      return;
    }
    const confirmMsg = title
      ? `Yakin ingin menghapus opini "${title}"?\n\nData akan dihapus permanent dari database!`
      : `Yakin ingin menghapus opini ini?`;

    if (!confirm(confirmMsg)) return;

    try {
      // Efek visual loading pada kartu
      const card = document.querySelector(`[data-opinion-id="${id}"]`);
      if (card) {
        card.style.opacity = "0.5";
        card.style.pointerEvents = "none";
      }

      const response = await fetch(`/ksmaja/api/delete_opinion.php?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      const result = await response.json();
      if (result.ok) {
        alert("Opini berhasil dihapus!");
        this.opinions = this.opinions.filter((o) => String(o.id) !== String(id));
        this.renderOpinions();
        window.dispatchEvent(
          new CustomEvent("opinions:changed", { detail: { action: "deleted", id: id } })
        );

        // Refresh statistik jika ada manager statistik
        if (window.statisticManager) {
          setTimeout(async () => {
            await window.statisticManager.fetchStatistics();
          }, 500);
        }
      } else {
        throw new Error(result.message || "Gagal menghapus opini");
      }
    } catch (error) {
      alert("Gagal menghapus opini: " + error.message);
      // Kembalikan tampilan kartu jika gagal
      const card = document.querySelector(`[data-opinion-id="${id}"]`);
      if (card) {
        card.style.opacity = "1";
        card.style.pointerEvents = "auto";
      }
    }
  }

  // Update jumlah views artikel
  async updateViews(id) {
    try {
      const response = await fetch(`/ksmaja/api/update_views.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: id, type: "opinion" }),
      });
      const result = await response.json();
      if (result.ok) {
        const opinion = this.opinions.find((o) => o.id === id || o.id === String(id));
        if (opinion) opinion.views = (opinion.views || 0) + 1;
      }
    } catch (error) {
      console.warn("Gagal update views:", error);
    }
  }

  // Helper getters
  getOpinionById(id) {
    return this.opinions.find((o) => o.id === id || o.id === String(id));
  }
}

// Inisialisasi saat DOM siap
let opinionManager;
document.addEventListener("DOMContentLoaded", () => {
  if (window.opinionManager) {
    console.warn("OpinionManager sudah diinisialisasi, melewati proses...");
    return;
  }
  opinionManager = new OpinionManager();
  console.log("OpinionManager terinisialisasi (Integrasi Database)");
  window.opinionManager = opinionManager;
});

console.log("opinions_manager.js dimuat");
