// login_user.js - Database Version

// Inisialisasi ikon feather
feather.replace();

const togglePassword = document.getElementById("togglePassword");
const passwordInput = document.getElementById("loginPassword");
const alertBox = document.getElementById("alertBox");
const loginForm = document.getElementById("loginForm");
const loginButton = document.querySelector(".btn-login");

// Fungsi untuk mengubah visibilitas password
togglePassword.addEventListener("click", function () {
  const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
  passwordInput.setAttribute("type", type);
  const icon = type === "password" ? "eye" : "eye-off";
  this.innerHTML = `<i data-feather="${icon}"></i>`;
  feather.replace();
});

// Fungsi untuk menampilkan notifikasi alert
function showAlert(message, type = "error") {
  alertBox.textContent = message;
  alertBox.className = `alert alert-${type}`;
  alertBox.style.display = "block";
  setTimeout(() => {
    alertBox.style.display = "none";
  }, 5000);
}

// Event listener saat form disubmit
loginForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;
  const rememberMe = document.getElementById("rememberMe").checked;

  // Validasi input kosong
  if (!email || !password) {
    showAlert("Email dan password harus diisi!", "error");
    return;
  }

  // Validasi format email menggunakan regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showAlert("Format email tidak valid!", "error");
    return;
  }

  // Tampilkan status loading pada tombol
  loginButton.classList.add("loading-state");
  loginButton.textContent = "Loading...";

  try {
    // Panggil API login ke backend
    // Pastikan path sesuai dengan struktur folder: /ksmaja/api/auth_login.php
    const response = await fetch("/ksmaja/api/auth_login.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const result = await response.json();

    if (result.ok && result.user) {
      showAlert("Login berhasil! Mengalihkan...", "success");

      // Simpan preferensi remember me jika dicentang
      if (rememberMe) {
        localStorage.setItem("userEmail", email);
        localStorage.setItem("rememberMe", "true");
      } else {
        localStorage.removeItem("userEmail");
        localStorage.removeItem("rememberMe");
      }

      // Simpan sesi di storage browser
      sessionStorage.setItem("userLoggedIn", "true");
      sessionStorage.setItem("userEmail", email);
      sessionStorage.setItem("userType", result.user.role || "user");
      sessionStorage.setItem("userId", result.user.id);

      // Redirect ke dashboard setelah jeda singkat
      setTimeout(() => {
        window.location.href = "./dashboard_user.html";
      }, 1500);
    } else {
      showAlert(result.message || "Email atau password salah!", "error");
      loginButton.classList.remove("loading-state");
      loginButton.textContent = "LOGIN";
    }
  } catch (error) {
    console.error("Login error:", error);
    showAlert("Terjadi kesalahan server. Coba lagi nanti.", "error");
    loginButton.classList.remove("loading-state");
    loginButton.textContent = "LOGIN";
  }
});

// Handler untuk tombol login sosial media
document.getElementById("googleLogin").addEventListener("click", function () {
  showAlert("Fitur login Google sedang dalam pengembangan", "error");
});

document.getElementById("facebookLogin").addEventListener("click", function () {
  showAlert("Fitur login Facebook sedang dalam pengembangan", "error");
});

// Handler untuk lupa password
document.querySelector(".forgot-password").addEventListener("click", function (e) {
  e.preventDefault();
  showAlert("Link reset password akan dikirim ke email Anda", "success");
});

// Cek status login saat halaman dimuat
window.addEventListener("load", async function () {
  // Cek jika session storage sudah menandakan login
  if (sessionStorage.getItem("userLoggedIn") === "true") {
    window.location.href = "./dashboard_user.html";
    return;
  }

  // Cek sesi server melalui API auth_me
  try {
    const response = await fetch("/ksmaja/api/auth_me.php");
    const result = await response.json();

    if (result.ok && result.user) {
      // Jika sesi server masih aktif, auto login
      sessionStorage.setItem("userLoggedIn", "true");
      sessionStorage.setItem("userEmail", result.user.email);
      sessionStorage.setItem("userType", result.user.role);
      sessionStorage.setItem("userId", result.user.id);
      window.location.href = "./dashboard_user.html";
      return;
    }
  } catch (err) {
    console.error("Session check error:", err);
  }

  // Auto-fill email jika fitur remember me aktif
  if (localStorage.getItem("rememberMe") === "true") {
    const savedEmail = localStorage.getItem("userEmail");
    if (savedEmail) {
      document.getElementById("loginEmail").value = savedEmail;
      document.getElementById("rememberMe").checked = true;
    }
  }
});
