class TagsManager {
  // Konstruktor untuk menginisialisasi elemen DOM berdasarkan suffix
  constructor(suffix = "") {
    this.suffix = suffix;

    // Mengambil elemen-elemen yang dibutuhkan dari DOM
    this.tagsContainer = document.getElementById(`tagsContainer${suffix}`);
    this.tagsInput = document.getElementById(`tagsInput${suffix}`);
    this.addTagBtn = document.getElementById(`addTagBtn${suffix}`);

    // Mencari container list di dalam tagsContainer
    this.tagsList = this.tagsContainer ? this.tagsContainer.querySelector(".tags-list") : null;

    this.tags = [];

    // Jalankan init jika semua elemen tersedia
    if (this.tagsContainer && this.tagsInput && this.addTagBtn) {
      this.init();
    }
  }

  // Menambahkan event listener untuk interaksi user
  init() {
    // Event klik tombol tambah
    this.addTagBtn.addEventListener("click", (e) => {
      e.preventDefault();
      this.addTag();
    });

    // Event tekan tombol Enter pada input
    this.tagsInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        this.addTag();
      }
    });
  }

  // Logika menambahkan tag baru
  addTag() {
    const tagValue = this.tagsInput.value.trim().toLowerCase();

    // Validasi input kosong
    if (!tagValue) {
      alert("Tag tidak boleh kosong!");
      return;
    }

    // Validasi panjang karakter minimal
    if (tagValue.length < 2) {
      alert("Tag minimal 2 karakter!");
      return;
    }

    // Validasi duplikasi tag
    if (this.tags.includes(tagValue)) {
      alert("Tag sudah ada!");
      return;
    }

    // Validasi jumlah maksimal tag
    if (this.tags.length >= 10) {
      alert("Maksimal 10 tag!");
      return;
    }

    // Tambahkan ke array dan reset input
    this.tags.push(tagValue);
    this.tagsInput.value = "";
    this.renderTags();
  }

  // Merender tampilan daftar tag ke HTML
  renderTags() {
    if (!this.tagsList) return;

    // Generate HTML untuk setiap tag
    this.tagsList.innerHTML = this.tags
      .map(
        (tag, index) => `
        <span class="tag" data-tag="${tag}">
          ${tag}
          <button type="button" class="btn-remove-tag" data-index="${index}">
            <i data-feather="x"></i>
          </button>
        </span>
      `
      )
      .join("");

    // Tambahkan event listener untuk tombol hapus pada setiap tag
    this.tagsList.querySelectorAll(".btn-remove-tag").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const index = parseInt(btn.dataset.index);
        this.removeTag(index);
      });
    });

    // Refresh icon feather jika library tersedia
    if (typeof feather !== "undefined") {
      feather.replace();
    }
  }

  // Menghapus tag berdasarkan index array
  removeTag(index) {
    this.tags.splice(index, 1);
    this.renderTags();
  }

  // Mengambil seluruh data tag
  getTags() {
    return this.tags;
  }

  // Mengatur data tag secara manual (misal saat mode edit)
  setTags(tags) {
    this.tags = Array.isArray(tags) ? tags : [];
    this.renderTags();
  }

  // Membersihkan seluruh tag
  clearTags() {
    this.tags = [];
    if (this.tagsInput) {
      this.tagsInput.value = "";
    }
    this.renderTags();
  }
}
