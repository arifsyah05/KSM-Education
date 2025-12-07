// pdf_extractor.js

// Pastikan library PDF.js sudah dimuat di file HTML sebelum script ini dijalankan
// <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>

class PDFTextExtractor {
  constructor() {
    // Cek apakah library PDF.js sudah tersedia
    if (typeof pdfjsLib !== "undefined") {
      // Konfigurasi worker source untuk PDF.js
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      console.log("PDF.js initialized");
    } else {
      console.error("PDF.js not loaded");
    }
  }

  // Fungsi utama untuk mengekstrak teks mentah dari URL PDF
  async extractTextFromPDF(pdfUrl) {
    try {
      console.log("Loading PDF:", pdfUrl);

      // Memuat dokumen PDF
      const loadingTask = pdfjsLib.getDocument(pdfUrl);
      const pdf = await loadingTask.promise;

      console.log("PDF loaded, pages:", pdf.numPages);

      let fullText = "";

      // Loop untuk mengambil teks dari setiap halaman
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();

        // Gabungkan item teks pada halaman tersebut
        const pageText = textContent.items.map((item) => item.str).join(" ");

        fullText += pageText + "\n\n";
      }

      console.log("Text extracted, length:", fullText.length);
      return this.formatExtractedText(fullText);
    } catch (error) {
      console.error("Error extracting PDF text:", error);
      return null;
    }
  }

  // Fungsi untuk memformat teks mentah menjadi paragraf yang rapi
  formatExtractedText(text) {
    // Bersihkan teks dari spasi berlebih dan baris baru yang tidak perlu
    let formatted = text
      .replace(/\s+/g, " ") // Hapus spasi ganda
      .replace(/\n{3,}/g, "\n\n") // Hapus enter berlebih
      .trim();

    // Pecah menjadi array paragraf
    const paragraphs = formatted.split(/\n\n+/).filter((p) => p.trim().length > 50); // Hapus segmen teks yang terlalu pendek

    return paragraphs;
  }

  // Fungsi untuk merender teks PDF ke dalam elemen HTML
  async renderPDFContent(pdfUrl, targetElement) {
    // Helper untuk menampilkan status loading
    const showLoading = () => {
      targetElement.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: #666;">
          <div class="loading-spinner"></div>
          <p>Memuat konten PDF...</p>
        </div>
      `;
    };

    // Helper untuk menampilkan pesan error
    const showError = () => {
      targetElement.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: #d32f2f;">
          <i data-feather="alert-circle"></i>
          <p>Gagal memuat konten PDF. Silakan gunakan tombol Download PDF.</p>
        </div>
      `;
      // Refresh icon jika menggunakan feather icons
      if (typeof feather !== "undefined") feather.replace();
    };

    try {
      showLoading();

      // Jalankan ekstraksi teks
      const paragraphs = await this.extractTextFromPDF(pdfUrl);

      // Jika gagal atau tidak ada teks
      if (!paragraphs || paragraphs.length === 0) {
        showError();
        return;
      }

      // Render paragraf ke dalam HTML
      targetElement.innerHTML = paragraphs
        .map((para, index) => {
          // Cek jika paragraf terlihat seperti judul (pendek dan sedikit kata)
          if (para.length < 100 && para.split(" ").length < 15) {
            return `<h4>${para}</h4>`;
          }
          return `<p>${para}</p>`;
        })
        .join("");

      console.log("PDF content rendered");
    } catch (error) {
      console.error("Error rendering PDF:", error);
      showError();
    }
  }
}

// Ekspor class agar bisa diakses secara global
window.PDFTextExtractor = PDFTextExtractor;
console.log("PDF Text Extractor loaded");
