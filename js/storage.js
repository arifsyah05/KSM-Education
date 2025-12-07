// js/storage.js

window.AppStorage = (function () {
  // Prefix untuk membedakan key aplikasi ini dengan aplikasi lain di domain yang sama
  const PREFIX = "app_";
  const SYNC_QUEUE_KEY = PREFIX + "sync_queue";

  // Helper internal untuk format key
  function _key(k) {
    return PREFIX + k;
  }

  // Helper internal untuk membaca dari localStorage
  function getLocal(key) {
    const v = localStorage.getItem(_key(key));
    return v ? JSON.parse(v) : null;
  }

  // Helper internal untuk menulis ke localStorage
  function setLocal(key, value) {
    localStorage.setItem(_key(key), JSON.stringify(value));
  }

  // Menambahkan perubahan ke antrean sinkronisasi
  function pushSync(change) {
    const q = getLocal("sync_queue") || [];
    q.push(change);
    setLocal("sync_queue", q);
  }

  // Mengirim antrean data ke server (Sinkronisasi)
  async function flushSync() {
    const q = getLocal("sync_queue") || [];

    // Jika antrean kosong, hentikan proses
    if (!q.length) return { ok: true, applied: [] };

    try {
      // Pastikan fungsi window.syncPush ada di api.js
      if (typeof window.syncPush !== "function") {
        throw new Error("Fungsi syncPush tidak ditemukan");
      }

      const res = await window.syncPush(q);

      if (res && res.ok) {
        // Bersihkan antrean jika sinkronisasi berhasil
        setLocal("sync_queue", []);
      }
      return res;
    } catch (err) {
      return { ok: false, message: err.message };
    }
  }

  // Public API yang dikembalikan
  return {
    // Mengambil data (bisa dari lokal atau remote server)
    get: async function (key, opts = { remote: false }) {
      if (opts.remote) {
        // Contoh: ambil daftar jurnal langsung dari server
        if (key === "journals" && typeof window.listJournals === "function") {
          return await window.listJournals(opts.limit || 50, opts.offset || 0);
        }
      }
      return getLocal(key);
    },

    // Menyimpan data (opsi sync: true akan mengirim ke server juga)
    set: async function (key, value, opts = { sync: false, client_id: null }) {
      setLocal(key, value);

      if (opts.sync) {
        // Masukkan ke antrean sinkronisasi
        const change = {
          type: opts.type || "unknown",
          action: opts.action || "update",
          payload: value,
          client_id: opts.client_id || "c_" + Date.now(),
        };

        pushSync(change);

        // Jika online, langsung coba kirim ke server
        if (navigator.onLine) {
          await flushSync();
        }
      }
      return { ok: true };
    },

    // Mengambil isi antrean saat ini
    queue: function () {
      return getLocal("sync_queue") || [];
    },

    // Ekspor fungsi flushSync agar bisa dipanggil manual
    flushSync,

    // Fungsi Migrasi: Memindahkan draft lokal ke server (termasuk upload file)
    migrateLocalToServer: async function () {
      // Daftar key localStorage yang ingin dimigrasi
      const keysToMigrate = ["draft_journal", "draft_opinions"];
      const results = { migrated: [], skipped: [], failed: [] };

      console.log("Mulai migrasi data lokal ke server...");

      for (const key of keysToMigrate) {
        // Ambil data mentah tanpa prefix helper karena key mungkin raw
        // Atau sesuaikan jika draft disimpan menggunakan setLocal di atas
        // Di sini kita asumsikan akses langsung ke localStorage atau via getLocal jika konsisten

        // Coba akses via getLocal dulu
        let items = getLocal(key);

        // Jika null, coba akses raw key (antisipasi legacy code)
        if (!items) {
          const raw = localStorage.getItem(key);
          if (raw) {
            try {
              items = JSON.parse(raw);
            } catch (e) {}
          }
        }

        if (!items) continue;
        if (!Array.isArray(items)) items = [items];

        for (const item of items) {
          try {
            // Jika item sudah punya server_id, berarti sudah tersinkron
            if (item.server_id) {
              results.skipped.push({ key, item });
              continue;
            }

            // 1. Upload File Dokumen (jika ada)
            let fileUrl = item.fileUrl || null;
            if (item.file && typeof window.uploadFileToServer === "function") {
              // Logic upload file fisik jika objeknya masih ada di memori/blob
              // Catatan: File object HTML input tidak bertahan di localStorage
              // Bagian ini efektif jika dipanggil sesaat setelah user memilih file tapi offline
              // Jika murni dari localStorage string, file fisik harus diupload ulang oleh user
            }

            // 2. Upload Cover (jika ada)
            let coverUrl = item.coverUrl || null;

            // 3. Susun metadata untuk dikirim ke server
            const metadata = {
              title: item.title || item.name || "Untitled",
              abstract: item.abstract || item.description || "",
              fileUrl: fileUrl, // URL hasil upload atau yang tersimpan
              coverUrl: coverUrl,
              authors: item.authors || [],
              tags: item.tags || [],
              client_temp_id: item.client_temp_id || "local_" + Date.now(),
              client_updated_at: item.client_updated_at || new Date().toISOString(),
            };

            // Tentukan endpoint berdasarkan key
            let createFunc = null;
            if (key.includes("journal")) createFunc = window.createJournal;
            else if (key.includes("opinion")) createFunc = window.createOpinion;

            if (createFunc) {
              const created = await createFunc(metadata);

              if (created.ok) {
                // Tandai item sudah migrasi
                item.server_id = created.id;
                item.migrated_at = new Date().toISOString();
                results.migrated.push({ key, item, server_id: created.id });
              } else {
                results.failed.push({ key, item, error: created.message || "create failed" });
              }
            } else {
              results.failed.push({ key, item, error: "No create function found" });
            }
          } catch (err) {
            results.failed.push({ key, item, error: err.message });
          }
        }

        // Update localStorage dengan status migrasi terbaru
        setLocal(key, items);
      }

      // Jalankan flushSync untuk antrean standar
      await flushSync();

      console.log("Hasil migrasi:", results);
      return results;
    },
  };
})();
