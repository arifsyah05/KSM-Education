// mobile_menu.js

document.addEventListener("DOMContentLoaded", function () {
  console.log("Initializing mobile menu...");

  // Ambil elemen yang dibutuhkan dari DOM
  const header = document.querySelector(".header-container");
  const nav = document.querySelector("nav");
  const hamburger = document.querySelector(".hamburger-menu");

  // Cek apakah elemen ada
  if (!header || !nav || !hamburger) {
    console.error("Required elements not found");
    return;
  }

  // Buat elemen overlay untuk background menu mobile
  const overlay = document.createElement("div");
  overlay.className = "nav-overlay";
  document.body.appendChild(overlay);

  // Fungsi membuka menu mobile
  function openMenu() {
    hamburger.classList.add("active");
    hamburger.setAttribute("aria-expanded", "true");
    nav.classList.add("active");
    overlay.classList.add("active");
    document.body.classList.add("menu-open");
  }

  // Fungsi menutup menu mobile
  function closeMenu() {
    hamburger.classList.remove("active");
    hamburger.setAttribute("aria-expanded", "false");
    nav.classList.remove("active");
    overlay.classList.remove("active");
    document.body.classList.remove("menu-open");

    // Tutup juga dropdown jika sedang terbuka
    closeDropdown();
  }

  // Fungsi menutup dropdown
  function closeDropdown() {
    const dropdown = document.querySelector(".nav-dropdown");
    if (dropdown) {
      dropdown.classList.remove("active");
      dropdown.classList.remove("open");
      const dropdownButton = dropdown.querySelector(".nav-link.has-caret");
      if (dropdownButton) {
        dropdownButton.setAttribute("aria-expanded", "false");
      }
    }
  }

  // Fungsi toggle (buka/tutup) menu
  function toggleMenu() {
    const isActive = hamburger.classList.contains("active");
    if (isActive) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  // Event listener klik tombol hamburger
  hamburger.addEventListener("click", function (e) {
    e.stopPropagation();
    toggleMenu();
  });

  // Event listener klik overlay (tutup menu)
  overlay.addEventListener("click", function () {
    closeMenu();
  });

  // Tutup menu saat salah satu link navigasi diklik
  const navLinks = document.querySelectorAll("nav > a");
  navLinks.forEach(function (link) {
    link.addEventListener("click", function (e) {
      if (window.innerWidth <= 768) {
        const href = this.getAttribute("href");
        if (href && href.startsWith("#")) {
          closeMenu();
        }
      }
    });
  });

  // Handle logika dropdown (berjalan di mobile dan desktop)
  const dropdownButton = document.querySelector(".nav-link.has-caret");
  const dropdown = document.querySelector(".nav-dropdown");

  if (dropdownButton && dropdown) {
    // Event klik tombol dropdown
    dropdownButton.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();

      if (window.innerWidth <= 768) {
        // Logika Mobile: Toggle class active
        const isActive = dropdown.classList.contains("active");

        if (isActive) {
          dropdown.classList.remove("active");
          this.setAttribute("aria-expanded", "false");
        } else {
          dropdown.classList.add("active");
          this.setAttribute("aria-expanded", "true");
        }
      } else {
        // Logika Desktop: Toggle class open
        const isOpen = dropdown.classList.contains("open");

        if (isOpen) {
          dropdown.classList.remove("open");
          this.setAttribute("aria-expanded", "false");
        } else {
          dropdown.classList.add("open");
          this.setAttribute("aria-expanded", "true");
        }
      }
    });

    // Tutup menu saat link di dalam dropdown diklik (khusus mobile)
    const dropdownLinks = dropdown.querySelectorAll(".dropdown-menu a");
    dropdownLinks.forEach(function (link) {
      link.addEventListener("click", function () {
        if (window.innerWidth <= 768) {
          setTimeout(function () {
            closeMenu();
          }, 100);
        } else {
          // Desktop: hanya tutup dropdown
          closeDropdown();
        }
      });
    });
  }

  // Tutup dropdown saat klik di luar elemen menu
  document.addEventListener("click", function (e) {
    if (
      dropdown &&
      (dropdown.classList.contains("open") || dropdown.classList.contains("active"))
    ) {
      const isClickInsideDropdown = dropdown.contains(e.target);
      const isClickOnButton = dropdownButton && dropdownButton.contains(e.target);

      if (!isClickInsideDropdown && !isClickOnButton) {
        closeDropdown();
      }
    }
  });

  // Tutup dropdown saat klik area navigasi tapi bukan dropdown
  nav.addEventListener("click", function (e) {
    if (window.innerWidth <= 768) {
      const dropdown = document.querySelector(".nav-dropdown");
      const dropdownButton = document.querySelector(".nav-link.has-caret");
      const dropdownMenu = document.querySelector(".dropdown-menu");

      if (dropdown && dropdown.classList.contains("active")) {
        const isClickOnButton = dropdownButton && dropdownButton.contains(e.target);
        const isClickInDropdown = dropdownMenu && dropdownMenu.contains(e.target);

        if (!isClickOnButton && !isClickInDropdown) {
          closeDropdown();
        }
      }
    }
  });

  // Tutup menu otomatis saat layar di-resize ke ukuran desktop
  let resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      if (window.innerWidth > 768) {
        closeMenu();
      }
    }, 250);
  });

  // Handle tombol escape untuk menutup menu/dropdown
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      if (window.innerWidth <= 768) {
        const dropdown = document.querySelector(".nav-dropdown");
        if (dropdown && dropdown.classList.contains("active")) {
          closeDropdown();
        } else if (nav.classList.contains("active")) {
          closeMenu();
        }
      } else {
        // Desktop: tutup dropdown
        const dropdown = document.querySelector(".nav-dropdown");
        if (dropdown && dropdown.classList.contains("open")) {
          closeDropdown();
        }
      }
    }
  });

  console.log("Mobile menu initialized successfully");
});
