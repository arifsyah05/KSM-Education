// Variabel global untuk menyimpan URL dan Judul saat ini
let currentShareUrl = "";
let currentShareTitle = "";

// Membuka modal share berdasarkan ID artikel
function openShareModal(id) {
  // Mencoba mengambil data jurnal dari journalManager atau paginationManager
  // Ini menangani kasus beda halaman (Dashboard vs List Jurnal)
  const journal =
    (window.journalManager && window.journalManager.getJournalById(id)) ||
    (window.paginationManager && window.paginationManager.createCard // Cek kapabilitas manager
      ? window.paginationManager.allItems.find((item) => item.id === String(id))
      : null);

  // Validasi jika data tidak ditemukan
  if (!journal) {
    // Coba cari di paginationManager array filteredItems sebagai fallback terakhir
    const fallbackJournal = window.paginationManager
      ? window.paginationManager.filteredItems.find((item) => item.id === String(id))
      : null;

    if (!fallbackJournal) {
      alert("Data jurnal tidak ditemukan.");
      return;
    }
  }

  // Mengambil data objek yang valid
  const finalJournal =
    journal ||
    (window.paginationManager
      ? window.paginationManager.filteredItems.find((item) => item.id === String(id))
      : null);

  // Konstruksi URL untuk dibagikan
  const baseUrl = window.location.origin;
  const path = window.location.pathname.substring(0, window.location.pathname.lastIndexOf("/"));

  // Set URL dan Title ke variabel global
  currentShareUrl = `${baseUrl}${path}/explore_jurnal_user.html?id=${id}&type=jurnal`;
  currentShareTitle = finalJournal ? finalJournal.title : "Jurnal";

  // Mengisi input field dan menampilkan modal
  const input = document.getElementById("shareUrlInput");
  const modal = document.getElementById("shareModal");
  if (!input || !modal) return;

  input.value = currentShareUrl;
  modal.classList.add("active");
  document.body.style.overflow = "hidden";

  // Refresh icon feather jika tersedia
  if (typeof feather !== "undefined") feather.replace();
}

// Menutup modal share
function closeShareModal() {
  const modal = document.getElementById("shareModal");
  if (!modal) return;
  modal.classList.remove("active");
  document.body.style.overflow = "auto";
}

// Menyalin link ke clipboard
function copyShareLink() {
  // Bug fix: Menghapus deklarasi fungsi ganda yang ada di kode asli
  if (!currentShareUrl) return;

  navigator.clipboard
    .writeText(currentShareUrl)
    .then(() => {
      // Menggunakan toast jika tersedia, atau alert biasa
      if (typeof showToast === "function") {
        showToast("Link berhasil disalin!", "success");
      } else {
        alert("Link berhasil disalin!\n\n" + currentShareUrl);
      }
    })
    .catch(() => {
      alert("Gagal menyalin link, salin manual:\n\n" + currentShareUrl);
    });
}

// Bagikan ke WhatsApp
function shareToWhatsApp() {
  if (!currentShareUrl) return;
  const text = encodeURIComponent(`${currentShareTitle}\n\n${currentShareUrl}`);
  window.open(`https://wa.me/?text=${text}`, "_blank");
}

// Bagikan ke Facebook
function shareToFacebook() {
  if (!currentShareUrl) return;
  window.open(
    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentShareUrl)}`,
    "_blank"
  );
}

// Bagikan ke Twitter (X)
function shareToTwitter() {
  if (!currentShareUrl) return;
  const text = encodeURIComponent(currentShareTitle);
  window.open(
    `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentShareUrl)}&text=${text}`,
    "_blank"
  );
}

// Event Listener saat DOM siap
document.addEventListener("DOMContentLoaded", () => {
  const shareModal = document.getElementById("shareModal");
  if (!shareModal) return;

  // Menutup modal saat overlay diklik
  const overlay = shareModal.querySelector(".modal-overlay");
  if (overlay) {
    overlay.addEventListener("click", () => {
      closeShareModal();
    });
  }
});
