# R01 — Arahan kreatif revisi 01

Tanggal: 16 November 2026. Baseline `8e6b0cf0d33e4589f3699f82888334930359cb74`.
Status: **R01 selesai; arahan kerja ditetapkan berdasarkan delegasi pengguna**. Produksi R02 belum dilakukan. Pemeriksaan dan keputusan kreatif menjadi tanggung jawab Codex; tidak menunggu review pemilik.

## Keputusan arah

**The Forest Between Pages — sebuah buku lapangan yang dihuni.** Hutan terasa tua, sedikit ganjil, hangat, dan dibuat dengan perhatian. Kertas menjadi ruang membaca; ilustrasi mengarahkan pandangan; Paperkeeper memberi respons kecil yang masuk akal. Pesan studio tetap dapat dipahami tanpa mengikuti cerita.

Revisi meneruskan Forest V2. Prioritasnya menyatukan material desktop/mobile, mengatur kepadatan detail, dan mengganti gerak studi dengan acting yang dirancang. Palet, lima lokasi, spesies pendukung, identitas karakter, scroll native dan konten HTML tetap menjadi dasar.

## Sumber dan pencarian master

Sumber yang dibaca: `docs/forest/ART-DIRECTION-LOCK.md`, `05-character-bible.md`, dokumen Stage 06–18, aset produksi dan audit 16 November. HEAD main/feature forest masih sama dengan baseline audit. Nama/path master dicari dalam workspace, checkout dan riwayat yang dijangkau main; daftar branch remote diperiksa. Tree utama repo `lazarus-design-os` dan `lazarus-design-lab` juga diperiksa, tanpa menemukan paket master Forest V2.

`master-board-v2.png`, `DESIGN-SYSTEM.md`, dan `ART-DIRECTION-AUDIT.md` asli belum ditemukan dalam lingkup itu. Hash master yang tercatat: `e6bd07a35e3a79b7cca5e2832b301aa2a2cbb13af46942eb2c95460358f85403`. Ini bukan klaim pencarian seluruh akun atau seluruh branch arsip.

Board R01 adalah **interpretasi yang ditetapkan sebagai acuan kerja**, bukan master yang ditemukan kembali. Riwayat lock lama dipertahankan. Jika master ditemukan, rekonsiliasi perbedaannya terhadap keputusan kerja. Dasar keputusan tercatat pada `review-record.md`.

## Bahasa ilustrasi yang dipilih

| Unsur | Aturan kerja | Cara menilai |
|---|---|---|
| Bentuk | Kelompokkan kanopi, akar, batu dan bangunan menjadi massa yang terbaca; asimetri memiliki fungsi komposisi | Pada ukuran thumbnail, gerbang/jalan/rumah masih dikenali tanpa tekstur |
| Perspektif | Kedalaman sederhana: depan, tempat aksi, latar jauh. Kemiringan bebas namun permukaan pijakan konsisten | Kaki, batu, ambang dan bayangan menyatakan bidang tanah yang sama |
| Goresan | Hatching mengikuti volume: memanjang pada kulit kayu, bersudut pada batu, berlapis pada daun | Detail dekat memiliki arah dan variasi tekanan; tidak seluruh bidang memakai bintik/garis acak |
| Detail | Satu pusat detail utama, satu pendukung, sisanya lebih tenang. Sisakan kertas di sekitar tulisan | Mata menemukan fokus dahulu, baru ornamen; bunga/daun tidak sama kuatnya dengan karakter |
| Nilai terang | Tiga kelompok: kertas terang, lingkungan midtone, siluet forest gelap | Karakter tetap terbaca ketika warna diabaikan; judul tidak bertabrakan dengan tekstur |
| Cahaya | Cahaya lembut dari kiri-atas dalam ruang gambar; cahaya lentera/window lokal dari dalam objek | Bayangan kontak dan highlight tidak berganti arah tanpa alasan antarperangkat |
| Tepi | Tepi fokus tegas dengan pigment break, latar lebih hilang ke kertas | Tidak ada halo putih/matte pada cutout, noise menyeluruh, atau tepi vektor identik |
| Material | Kertas hangat, batu berkapur, kulit kayu berserat, daun berlapis, amber redup | Material berbeda melalui bentuk/goresan, tidak hanya beda warna |

Perbandingan audit: lukisan desktop Path/House menjadi contoh kekayaan material, namun kepadatannya perlu disunting. SVG portrait lama menjadi contoh masalah: bidang datar dan daun berulang belum setara dengan lukisan. **Desktop juga diperbaiki; mobile tidak dibebani dengan seluruh detail desktop.**

## Warna dan tipografi

Pertahankan Forest `#244F3B`, Ink `#273829`, Paper `#F7E9D6`. River `#5A8CAF`, Sun `#F3C354`, Clay `#D86A4A`, Berry `#8B6CA8` tetap aksen. Sebagai pedoman komposisi, kertas/warna lembut mendominasi; gelap mengunci siluet; warna terang digunakan pada tujuan perhatian. Persentase warna tidak dijadikan tes otomatis.

Entrance: kertas + forest dengan amber kecil. Path: moss/ochre. Work: kertas sedikit lebih terang agar isi folio menonjol. River: blue yang diredam, ritme lebih tenang. House: forest dengan amber lokal, tanpa menyelimuti halaman oleh glow.

Fraunces untuk display, Newsreader untuk membaca, Atkinson Hyperlegible untuk kontrol tetap dipakai. R02 menguji hierarchy, bukan mengganti keluarga font. Target awal body 17–19 px, baris 1.5–1.65; lebar bacaan 35–60 karakter menurut konteks. Huruf dekoratif hanya aksen; pesan, label, dan CTA tetap HTML. Verifikasi kontras pada komposit sebenarnya. Board menggunakan label editorial untuk dokumentasi, bukan copy website final.

## Entrance sebagai acuan komposisi

**Desktop 1440×900:** pesan utama di kiri sekitar 40–46% lebar; gerbang di kanan; Paperkeeper di kaki gerbang, tidak memotong teks. Jalan mengantar pandangan dari foreground ke bukaan gerbang. Sisakan jarak aman selebar minimal satu karakter dari CTA. Ukuran karakter awal 240–300 CSS px, disesuaikan jika siluet/ruang teks menghendaki. Ini refinement dari rentang bible lama, bukan perubahan proporsi figur.

**Mobile 390×844:** susunan header → judul/lead → CTA → ambang/karakter. Kurangi microcopy dan ruang atas sebelum mengecilkan font. Target karakter terlihat sebagian jelas sekitar y=520–700, tinggi awal 150–180 px; gerbang memberi konteks di sekitarnya. Posisi final harus diukur pada teks nyata, bukan dipaksakan oleh gambar. Pada 320 px atau zoom, isi boleh melampaui layar pertama. Atlas diletakkan sesudah prioritas utama.

**Tablet/landscape:** pertahankan prioritas pesan dan arah pandang; tidak meregangkan portrait atau membuat karakter menabrak judul. Tentukan breakpoint dari fit komposisi, bukan semata jenis device.

Desktop dan mobile berbagi siluet gerbang, spesies pohon, arah cahaya, palette, tingkat goresan, dan proporsi karakter. Penempatan serta jumlah objek boleh berbeda. Produksi sebagai pasangan; review berdampingan. Layer foreground hanya dibuat bila dipakai untuk overlap yang bermakna, bukan syarat menambah parallax.

## Karakter dan acting

Paperkeeper tetap memiliki topi daun asimetris, tiga lapisan jubah yang tidak seragam, wajah pucat dengan mata kecil, kaki ranting, tas kertas dan lentera biji ek. Kecilkan kesan sepatu berat sesuai catatan bible; jangan mengubahnya menjadi figur manusia atau maskot bermata besar. Pertahankan sisi tas/lentera berdasarkan pose referensi; jangan mirror sembarangan.

Satu aksi utama untuk prototipe: **menyadari pengunjung → menoleh ke jalan → mengangkat lentera sedikit → diam.** Kepala memulai, lengan menyusul, tas/jubah terlambat sedikit. Kaki tetap menapak. Waktu awal 1,1–1,4 detik, cadence gambar 8–12 fps sebagai eksplorasi. R01 memberi storyboard/intent, belum memberikan sprite produksi atau hasil animasi.

Gerak lain, trigger dan fallback: lihat `motion-matrix.md`. Perjalanan lima lokasi: lihat `storyboard.md`. Keputusan per aset: lihat `asset-register.md`.

## Batas dan kriteria penerimaan

R01 selesai: board, aturan, storyboard, inventaris dan matriks tersedia, telah diperiksa, dan ditetapkan sebagai acuan oleh Codex atas delegasi pengguna. Review internal dilakukan sebelum perluasan produksi tanpa meminta persetujuan berulang. Pengguna tetap dapat mengarahkan perubahan kapan saja. Keputusan acuan R01 tidak menyatakan bahwa aset atau animasi produksi yang belum dibuat sudah lulus.

Reviewer menilai: siluet, goresan/material, kontinuitas karakter, keragaman komposisi, maksud gerak, integritas sumber, tipografi dan harmoni UX. Ikuti rubric lock (setiap aspek ≥4/5 dan rerata ≥4,5/5) hanya setelah inspeksi; tidak ada skor yang diisi dari build atau oleh template. Board yang bagus tidak meluluskan scene produksi yang belum dibuat.

R02 mendapat: komposisi Entrance pasangan, batas ruang HTML, referensi karakter, layer yang diperlukan, dan keputusan aset. R03 mendapat storyboard aksi, rentang waktu, baseline/pivot serta stopping behavior. Halaman live, aset produksi dan skrip runtime tidak diubah pada R01.
