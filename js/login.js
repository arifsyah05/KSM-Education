// Kelas untuk mengelola otentikasi admin
class LoginManager {
  constructor() {
    this.loginModal = document.getElementById("loginModal");
    this.loginForm = document.getElementById("loginForm");

    // Mendukung lokasi tombol login di berbagai halaman (dashboard admin & jurnal)
    this.loginBtn = document.querySelector(".btn-register");

    this.closeModalBtn = document.getElementById("closeLoginModal");
    this.togglePasswordBtn = document.getElementById("togglePassword");
    this.uploadSection = document.querySelector(".upload-section");

    // Kredensial hardcoded untuk admin
    this.adminCredentials = {
      email: "admin@ksmeducation.com",
      password: "admin123",
    };

    this.isLoggedIn = false;

    // Memeriksa ketersediaan elemen tombol login
    if (!this.loginBtn) {
      console.warn("Tombol login tidak ditemukan");
      return;
    }

    // Memeriksa ketersediaan modal dan form
    if (!this.loginModal || !this.loginForm) {
      console.warn("Modal login atau form tidak ditemukan");
      return;
    }

    this.init();
  }

  init() {
    this.checkLoginStatus();

    // Menambahkan event listener ke tombol login
    this.loginBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (this.isLoggedIn) {
        this.logout();
      } else {
        this.openLoginModal();
      }
    });

    // Memastikan tombol tutup modal tersedia sebelum menambah event
    if (!this.closeModalBtn) {
      console.warn("Tombol tutup modal tidak ditemukan, modal tidak ada di halaman ini");
      return;
    }

    this.closeModalBtn.addEventListener("click", () => {
      this.closeLoginModal();
    });

    // Menutup modal saat area luar (overlay) diklik
    const overlay = this.loginModal.querySelector(".modal-overlay");
    if (overlay) {
      overlay.addEventListener("click", () => {
        this.closeLoginModal();
      });
    }

    // Event listener untuk tombol lihat/sembunyi password
    if (this.togglePasswordBtn) {
      this.togglePasswordBtn.addEventListener("click", () => {
        this.togglePasswordVisibility();
      });
    }

    // Menangani submit form login
    this.loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleLogin();
    });

    // Mengisi otomatis email jika fitur Remember Me aktif sebelumnya
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      const emailInput = document.getElementById("loginEmail");
      if (emailInput) {
        emailInput.value = rememberedEmail;
      }
      const rememberCheckbox = document.getElementById("rememberMe");
      if (rememberCheckbox) {
        rememberCheckbox.checked = true;
      }
    }

    this.updateUploadSection();
  }

  // Membuka modal login
  openLoginModal() {
    if (!this.loginModal) {
      console.error("Modal login tidak ditemukan");
      return;
    }

    this.loginModal.classList.add("active");
    document.body.style.overflow = "hidden";

    // Refresh icon feather setelah modal tampil
    setTimeout(() => {
      feather.replace();
    }, 100);
  }

  // Menutup modal login
  closeLoginModal() {
    if (!this.loginModal) {
      return;
    }

    this.loginModal.classList.remove("active");
    document.body.style.overflow = "auto";
  }

  // Mengubah visibilitas input password
  togglePasswordVisibility() {
    const passwordInput = document.getElementById("loginPassword");
    const eyeIcon = document.getElementById("eyeIcon");

    if (passwordInput.type === "password") {
      // Ubah ke teks biasa (lihat password)
      passwordInput.type = "text";
      eyeIcon.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
        <line x1="1" y1="1" x2="23" y2="23"></line>
      </svg>
    `;
    } else {
      // Ubah kembali ke password (sembunyi)
      passwordInput.type = "password";
      eyeIcon.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
      </svg>
    `;
    }
  }

  // Logika pemrosesan login
  handleLogin() {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
    const rememberMe = document.getElementById("rememberMe").checked;

    if (email === this.adminCredentials.email && password === this.adminCredentials.password) {
      this.isLoggedIn = true;

      // Mengatur sessionStorage untuk sesi saat ini
      sessionStorage.setItem("userLoggedIn", "true");
      sessionStorage.setItem("userType", "admin");
      sessionStorage.setItem("userEmail", email);

      // Mengatur localStorage untuk login persisten
      localStorage.setItem("adminLoggedIn", "true");
      localStorage.setItem("adminLoginTime", new Date().toISOString());

      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      this.updateLoginButton();
      this.updateUploadSection();
      this.closeLoginModal();

      alert("LOGIN BERHASIL\n\nSELAMAT DATANG, ADMIN");

      this.loginForm.reset();

      // Dispatch event custom untuk memberitahu komponen lain
      window.dispatchEvent(
        new CustomEvent("adminLoginStatusChanged", {
          detail: { isLoggedIn: true },
        })
      );
    } else {
      alert("LOGIN GAGAL\n\nEMAIL ATAU PASSWORD SALAH");
    }
  }

  // Proses logout
  logout() {
    if (confirm("YAKIN MAU LOGOUT?")) {
      this.isLoggedIn = false;

      // Hapus data dari localStorage
      localStorage.removeItem("adminLoggedIn");
      localStorage.removeItem("adminLoginTime");

      // Hapus data dari sessionStorage
      sessionStorage.removeItem("userLoggedIn");
      sessionStorage.removeItem("userType");
      sessionStorage.removeItem("userEmail");

      this.updateLoginButton();
      this.updateUploadSection();

      alert("LOGOUT BERHASIL");

      window.dispatchEvent(
        new CustomEvent("adminLoginStatusChanged", {
          detail: { isLoggedIn: false },
        })
      );
    }
  }

  // Memeriksa status login saat halaman dimuat
  checkLoginStatus() {
    const loggedIn = localStorage.getItem("adminLoggedIn");
    const loginTime = localStorage.getItem("adminLoginTime");

    // Cek timeout sesi (60 menit)
    if (loggedIn === "true" && loginTime) {
      const loginDate = new Date(loginTime);
      const now = new Date();
      const diffMinutes = (now - loginDate) / 1000 / 60;

      if (diffMinutes > 60) {
        // Sesi habis, hapus semua data login
        localStorage.removeItem("adminLoggedIn");
        localStorage.removeItem("adminLoginTime");
        sessionStorage.removeItem("userLoggedIn");
        sessionStorage.removeItem("userType");
        sessionStorage.removeItem("userEmail");
        this.isLoggedIn = false;
        return;
      }
    }

    if (loggedIn === "true") {
      this.isLoggedIn = true;

      // Sinkronisasi sessionStorage jika hilang saat reload
      if (sessionStorage.getItem("userLoggedIn") !== "true") {
        sessionStorage.setItem("userLoggedIn", "true");
        sessionStorage.setItem("userType", "admin");
        sessionStorage.setItem(
          "userEmail",
          localStorage.getItem("adminEmail") || "admin@ksmeducation.com"
        );
      }

      this.updateLoginButton();
      this.updateUploadSection();
    } else {
      this.isLoggedIn = false;
    }
  }

  // Memperbarui tampilan tombol login/logout
  updateLoginButton() {
    if (!this.loginBtn) {
      return;
    }

    if (this.isLoggedIn) {
      this.loginBtn.innerHTML = `
      <i data-feather="log-out"></i>
      LOGOUT
    `;
      this.loginBtn.classList.add("admin-logged-in");
      feather.replace();
    } else {
      this.loginBtn.textContent = "LOGIN";
      this.loginBtn.classList.remove("admin-logged-in");
    }
  }

  // Mengunci atau membuka bagian upload berdasarkan status login
  updateUploadSection() {
    if (!this.uploadSection) {
      return;
    }

    if (this.isLoggedIn) {
      this.uploadSection.classList.remove("locked");
    } else {
      this.uploadSection.classList.add("locked");
    }
  }

  // Helper untuk cek status admin
  isAdmin() {
    return this.isLoggedIn;
  }

  // Sinkronisasi status login antar halaman
  syncLoginStatus() {
    this.checkLoginStatus();
    this.updateLoginButton();
    this.updateUploadSection();
  }
}

// Inisialisasi LoginManager saat DOM siap
document.addEventListener("DOMContentLoaded", () => {
  window.loginManager = new LoginManager();
});
