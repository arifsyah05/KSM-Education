// Variabel pengunci global untuk mencegah dialog file terbuka ganda
let _fileDialogLock = false;
let _coverDialogLock = false;

// Set untuk melacak elemen yang sudah diinisialisasi agar tidak terjadi duplikasi event listener
const _initializedDropzones = new Set();
const _initializedCovers = new Set();

class FileUploadManager {
  // Konstruktor untuk menginisialisasi elemen DOM dan properti dasar
  constructor(suffix = "") {
    this.suffix = suffix;
    this.dropZone = document.getElementById(`dropZone${suffix}`);
    this.fileInput = document.getElementById(`fileInput${suffix}`);
    this.filePreview = document.getElementById(`filePreview${suffix}`);
    this.removeFileBtn = document.getElementById(`removeFile${suffix}`);
    this.uploadedFile = null;

    // Konfigurasi batasan file
    this.maxFileSize = 10 * 1024 * 1024;
    this.allowedTypes = ["application/pdf"];
    this.allowedExtensions = [".pdf"];

    // Cek apakah elemen ada dan belum diinisialisasi sebelumnya
    if (this.dropZone && this.fileInput) {
      const elementId = this.dropZone.id;
      if (_initializedDropzones.has(elementId)) {
        console.warn(`FileUploadManager: ${elementId} already initialized!`);
        return;
      }
      _initializedDropzones.add(elementId);
      this.init();
    }
  }

  // Mengatur event listener untuk interaksi user
  init() {
    // Fungsi internal untuk menangani pembukaan dialog file dengan locking mechanism
    const openDialog = () => {
      if (_fileDialogLock) {
        console.log("BLOCKED: Dialog already opening");
        return;
      }

      _fileDialogLock = true;
      this.dropZone.style.pointerEvents = "none";

      console.log("Opening file dialog at:", Date.now());
      this.fileInput.click();

      // Reset lock setelah delay singkat
      setTimeout(() => {
        this.dropZone.style.pointerEvents = "auto";
        _fileDialogLock = false;
      }, 1000);
    };

    this.dropZone.onclick = openDialog;

    // Event saat file dipilih melalui dialog
    this.fileInput.onchange = (e) => {
      this.handleFiles(e.target.files);
      _fileDialogLock = false;
      this.dropZone.style.pointerEvents = "auto";
    };

    // Event saat file di-drag ke area dropzone
    this.dropZone.ondragover = (e) => {
      e.preventDefault();
      this.dropZone.classList.add("dragover");
    };

    // Event saat file keluar dari area dropzone
    this.dropZone.ondragleave = (e) => {
      e.preventDefault();
      this.dropZone.classList.remove("dragover");
    };

    // Event saat file di-drop ke area dropzone
    this.dropZone.ondrop = (e) => {
      e.preventDefault();
      this.dropZone.classList.remove("dragover");
      this.handleFiles(e.dataTransfer.files);
    };

    // Event untuk tombol hapus file
    if (this.removeFileBtn) {
      this.removeFileBtn.onclick = (e) => {
        e.stopPropagation();
        this.removeFile();
      };
    }

    console.log("FileUploadManager initialized:", this.suffix);
  }

  // Memproses file yang masuk baik dari input maupun drag-drop
  handleFiles(files) {
    if (files.length === 0) return;
    const file = files[0];
    if (!this.validateFile(file)) return;
    this.uploadedFile = file;
    this.showFilePreview(file);
    this.dropZone.style.display = "none";
  }

  // Memvalidasi tipe dan ukuran file
  validateFile(file) {
    const fileExtension = "." + file.name.split(".").pop().toLowerCase();
    if (!this.allowedTypes.includes(file.type) && !this.allowedExtensions.includes(fileExtension)) {
      alert("File harus berformat PDF!");
      return false;
    }
    if (file.size > this.maxFileSize) {
      alert("Ukuran file maksimal 10MB!");
      return false;
    }
    return true;
  }

  // Menampilkan preview nama dan ukuran file di UI
  showFilePreview(file) {
    const fileName = document.getElementById(`fileName${this.suffix}`);
    const fileSize = document.getElementById(`fileSize${this.suffix}`);
    if (fileName) fileName.textContent = file.name;
    if (fileSize) fileSize.textContent = this.formatFileSize(file.size);
    if (this.filePreview) this.filePreview.style.display = "block";
  }

  // Mengubah ukuran file dari bytes ke format yang mudah dibaca (KB, MB)
  formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  }

  // Menghapus file yang sudah diupload dan mereset UI
  removeFile() {
    this.uploadedFile = null;
    this.fileInput.value = "";
    if (this.filePreview) this.filePreview.style.display = "none";
    this.dropZone.style.display = "block";
  }

  // Getter untuk mengambil object file
  getUploadedFile() {
    return this.uploadedFile;
  }

  // Mengubah file menjadi Data URL (base64) menggunakan Promise
  getFileDataURL() {
    return new Promise((resolve, reject) => {
      if (!this.uploadedFile) {
        resolve(null);
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(this.uploadedFile);
    });
  }
}

class CoverUploadManager {
  // Konstruktor untuk inisialisasi elemen upload cover image
  constructor(suffix = "") {
    this.suffix = suffix;
    this.coverDropZone = document.getElementById(`coverDropZone${suffix}`);
    this.coverInput = document.getElementById(`coverInput${suffix}`);
    this.coverPreview = document.getElementById(`coverPreview${suffix}`);
    this.coverImage = document.getElementById(`coverImage${suffix}`);
    this.removeCoverBtn = document.getElementById(`removeCover${suffix}`);
    this.uploadedCover = null;

    // Konfigurasi batasan file gambar
    this.maxFileSize = 2 * 1024 * 1024;
    this.allowedTypes = ["image/jpeg", "image/png", "image/gif"];

    // Cek inisialisasi ganda
    if (this.coverDropZone && this.coverInput) {
      const elementId = this.coverDropZone.id;
      if (_initializedCovers.has(elementId)) {
        console.warn(`CoverUploadManager: ${elementId} already initialized!`);
        return;
      }
      _initializedCovers.add(elementId);
      this.init();
    }
  }

  // Mengatur event listener untuk cover upload
  init() {
    const openDialog = () => {
      if (_coverDialogLock) {
        console.log("BLOCKED: Cover dialog already opening");
        return;
      }

      _coverDialogLock = true;
      this.coverDropZone.style.pointerEvents = "none";

      console.log("Opening cover dialog at:", Date.now());
      this.coverInput.click();

      setTimeout(() => {
        this.coverDropZone.style.pointerEvents = "auto";
        _coverDialogLock = false;
      }, 1000);
    };

    this.coverDropZone.onclick = openDialog;

    this.coverInput.onchange = (e) => {
      this.handleFiles(e.target.files);
      _coverDialogLock = false;
      this.coverDropZone.style.pointerEvents = "auto";
    };

    this.coverDropZone.ondragover = (e) => {
      e.preventDefault();
      this.coverDropZone.classList.add("dragover");
    };

    this.coverDropZone.ondragleave = (e) => {
      e.preventDefault();
      this.coverDropZone.classList.remove("dragover");
    };

    this.coverDropZone.ondragdrop = (e) => {
      e.preventDefault();
      this.coverDropZone.classList.remove("dragover");
      this.handleFiles(e.dataTransfer.files);
    };

    if (this.removeCoverBtn) {
      this.removeCoverBtn.onclick = (e) => {
        e.stopPropagation();
        this.removeCover();
      };
    }

    console.log("CoverUploadManager initialized:", this.suffix);
  }

  // Memproses file gambar yang dipilih
  handleFiles(files) {
    if (files.length === 0) return;
    const file = files[0];
    if (!this.validateFile(file)) return;
    this.uploadedCover = file;
    this.showCoverPreview(file);
  }

  // Validasi format dan ukuran gambar
  validateFile(file) {
    if (!this.allowedTypes.includes(file.type)) {
      alert("File harus berformat JPG, PNG, atau GIF!");
      return false;
    }
    if (file.size > this.maxFileSize) {
      alert("Ukuran file maksimal 2MB!");
      return false;
    }
    return true;
  }

  // Menampilkan preview gambar menggunakan FileReader
  showCoverPreview(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (this.coverImage) this.coverImage.src = e.target.result;
      if (this.coverPreview) this.coverPreview.style.display = "block";
      this.coverDropZone.style.display = "none";
    };
    reader.readAsDataURL(file);
  }

  // Menghapus cover dan reset UI
  removeCover() {
    this.uploadedCover = null;
    this.coverInput.value = "";
    if (this.coverImage) this.coverImage.src = "";
    if (this.coverPreview) this.coverPreview.style.display = "none";
    this.coverDropZone.style.display = "block";
  }

  // Getter file cover
  getCoverFile() {
    return this.uploadedCover;
  }

  // Alias untuk getter file cover
  getUploadedCover() {
    return this.uploadedCover;
  }

  // Mendapatkan data URL dari gambar cover
  getCoverDataURL() {
    if (this.coverImage && this.coverImage.src) {
      return this.coverImage.src;
    }
    return null;
  }
}

console.log("file_upload.js loaded");
