// Class untuk mengelola navigasi tab pada halaman upload
class UploadTabsManager {
  // Konstruktor untuk mengambil elemen DOM yang diperlukan
  constructor() {
    this.tabs = document.querySelectorAll(".upload-tab");
    this.containers = document.querySelectorAll(".upload-form-container");
    this.init();
  }

  // Menginisialisasi event listener klik pada setiap tab
  init() {
    if (this.tabs.length === 0) return;

    this.tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const targetTab = tab.dataset.tab;
        this.switchTab(targetTab);
      });
    });

    console.log("Upload Tabs initialized");
  }

  // Menangani logika perpindahan tampilan antar tab
  switchTab(targetTab) {
    // Menghapus kelas active dari semua tombol tab
    this.tabs.forEach((tab) => tab.classList.remove("active"));

    // Menambahkan kelas active hanya pada tab yang diklik
    const activeTab = document.querySelector(`.upload-tab[data-tab="${targetTab}"]`);
    if (activeTab) {
      activeTab.classList.add("active");
    }

    // Menyembunyikan semua container form
    this.containers.forEach((container) => {
      container.classList.remove("active");
    });

    // Menampilkan container form yang sesuai dengan tab yang dipilih
    const targetContainer = document.getElementById(`form-${targetTab}`);
    if (targetContainer) {
      targetContainer.classList.add("active");
    }

    console.log(`Switched to ${targetTab} tab`);
  }
}

console.log("upload_tabs.js loaded");
