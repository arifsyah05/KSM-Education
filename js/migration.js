// Script Migrasi Otomatis: LocalStorage -> Database
// Menggunakan IIFE agar langsung dieksekusi saat script dimuat
(async function () {
  console.log("[INFO] Memulai proses migrasi otomatis...");

  // Objek untuk menyimpan status keberhasilan migrasi
  const results = {
    journals: { success: 0, failed: 0, skipped: 0 },
    opinions: { success: 0, failed: 0, skipped: 0 },
    total: 0,
  };

  // Proses Migrasi Jurnal
  try {
    const journalsRaw = localStorage.getItem("journals");
    if (journalsRaw) {
      const journals = JSON.parse(journalsRaw);
      console.log(`[INFO] Ditemukan ${journals.length} jurnal untuk diproses`);

      // Iterasi setiap jurnal secara berurutan untuk menghindari overload server
      for (const journal of journals) {
        // Lewati data yang sudah memiliki ID server (sudah termigrasi)
        if (journal.server_id) {
          results.journals.skipped++;
          continue;
        }

        try {
          // Mengirim data ke server menggunakan fungsi global window.createJournal
          const result = await window.createJournal({
            title: journal.title,
            abstract: journal.abstract,
            authors: journal.author,
            tags: journal.tags,
            fileUrl: journal.fileData,
            coverUrl: journal.coverImage,
            client_temp_id: journal.id,
            client_updated_at: journal.date,
          });

          // Cek respon dari server
          if (result.ok) {
            journal.server_id = result.id;
            journal.migrated_at = new Date().toISOString();
            results.journals.success++;
            console.log(`[SUKSES] Migrasi jurnal: ${journal.title}`);
          } else {
            results.journals.failed++;
            console.error(`[GAGAL] Migrasi jurnal: ${journal.title}`, result.message);
          }
        } catch (err) {
          results.journals.failed++;
          console.error(`[ERROR] Exception pada jurnal: ${journal.title}`, err);
        }
      }

      // Simpan kembali array jurnal yang sudah diupdate ke localStorage
      localStorage.setItem("journals", JSON.stringify(journals));
    }
  } catch (err) {
    console.error("[FATAL] Error saat membaca data jurnal:", err);
  }

  // Proses Migrasi Opini
  try {
    const opinionsRaw = localStorage.getItem("opinions");
    if (opinionsRaw) {
      const opinions = JSON.parse(opinionsRaw);
      console.log(`[INFO] Ditemukan ${opinions.length} opini untuk diproses`);

      for (const opinion of opinions) {
        // Lewati data yang sudah termigrasi
        if (opinion.server_id) {
          results.opinions.skipped++;
          continue;
        }

        try {
          // Mengirim data opini ke server
          const result = await window.createOpinion({
            title: opinion.title,
            description: opinion.description,
            category: opinion.category,
            author_name: opinion.author || "Anonymous",
            fileUrl: opinion.fileUrl,
            coverUrl: opinion.coverImage,
          });

          if (result.ok) {
            opinion.server_id = result.id;
            opinion.migrated_at = new Date().toISOString();
            results.opinions.success++;
            console.log(`[SUKSES] Migrasi opini: ${opinion.title}`);
          } else {
            results.opinions.failed++;
            console.error(`[GAGAL] Migrasi opini: ${opinion.title}`, result.message);
          }
        } catch (err) {
          results.opinions.failed++;
          console.error(`[ERROR] Exception pada opini: ${opinion.title}`, err);
        }
      }

      // Update localStorage opini
      localStorage.setItem("opinions", JSON.stringify(opinions));
    }
  } catch (err) {
    console.error("[FATAL] Error saat membaca data opini:", err);
  }

  // Menampilkan Ringkasan Akhir
  results.total = results.journals.success + results.opinions.success;

  console.log("[INFO] Ringkasan Migrasi:");
  console.log(
    `Jurnal: ${results.journals.success} sukses, ${results.journals.failed} gagal, ${results.journals.skipped} dilewati`
  );
  console.log(
    `Opini : ${results.opinions.success} sukses, ${results.opinions.failed} gagal, ${results.opinions.skipped} dilewati`
  );
  console.log(`Total berhasil dimigrasi: ${results.total} item`);

  if (results.total > 0) {
    console.log("[SELESAI] Migrasi tuntas. Data LocalStorage aman untuk dibersihkan.");
  } else {
    console.log("[INFO] Tidak ada data baru yang perlu dimigrasi.");
  }

  return results;
})();
