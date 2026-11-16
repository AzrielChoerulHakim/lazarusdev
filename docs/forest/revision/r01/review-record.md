# R01 — Catatan keputusan dan handoff

Status paket: **siap review**. Arahan ini diusulkan oleh Codex berdasarkan audit dan aturan Forest V2. Status penerimaan pemilik: **belum tercatat**. Tidak ada skor artistik yang diisi otomatis.

## Kelengkapan

- [x] Pencarian sumber/master dalam lingkup yang dicatat.
- [x] Arahan material, warna, bentuk, komposisi dan tipografi.
- [x] Board usulan yang dapat dibuka, dengan pasangan desktop/mobile.
- [x] Perbandingan aset Path/House baseline pada board HTML.
- [x] Inventaris pertahankan/perbaiki/ganti dan dependensi produksi.
- [x] Storyboard lima bab dan intent aksi Entrance.
- [x] Matriks trigger/input, waktu, replay, cancel dan reduced motion.
- [ ] Keputusan pemilik atas board usulan atau rekonsiliasi dengan master asli.

## Keputusan yang siap ditinjau

1. Pertahankan Forest V2 dengan kekayaan goresan yang dipusatkan; tambah ruang kertas dan hierarki detail.
2. Pasangkan komposisi desktop/mobile sejak produksi. Empat SVG portrait lama menjadi prioritas penggantian.
3. Entrance menjadi acuan pertama; karakter masuk lebih awal pada mobile setelah pesan/CTA.
4. Opening atlas menjadi trigger aksi lantern invitation, dengan input setara dan respons langsung.
5. Produksi frame acting baru; jangan memperbesar atau mengulang tiga pose studi sebagai solusi utama.

## Pemeriksaan internal board

Board konsep menampilkan pasangan Entrance dengan material yang serupa dan ruang tenang; lima lokasi dan palet terbaca. Versi gambar pertama menampilkan pose akhir duduk, tidak sesuai storyboard berdiri-menunjukkan-jalan. Versi itu direvisi sebelum menjadi `concept-board.png`.

Board tetap memiliki batas: layout HTML belum diukur, kontak kaki dan perbedaan motif antar-thumbnail belum menjadi continuity proof, dan tekstur/ruang negatif perlu ditinjau pada ukuran produksi. Pose pada board adalah intent, tidak boleh diekspor sebagai animasi. Pengujian struktur dokumen bukan sign-off artistik.

## Verifikasi paket

Board HTML diperiksa melalui Chromium pada lebar 1440, 390 dan 320 px. Pada ketiganya: lima gambar berhasil decode, tidak ada horizontal document overflow, semua tautan file tersedia, dan tidak ada page error. Panel perbandingan House dibuka dalam pemeriksaan. Tidak ada screenshot/video diambil. Pemeriksaan memakai HTTP lokal karena akses `file://` dibatasi kebijakan browser. Ini memverifikasi keterbukaan artefak, bukan komposisi situs produksi.

Hash PNG dan dua gambar referensi tersimpan dalam `provenance.json`. Semua perubahan repository berada dalam `docs/forest/revision/r01/`; source situs dan aset baseline tidak diubah.

## Handoff R02

Mulai dari `art-direction-revision.md` bagian Entrance. Produksi hanya pasangan scene Entrance dengan karakter statis, frame referensi dan ruang teks nyata. Referensi utama karakter: `storybook/assets/characters/paperkeeper.three-quarter.webp` dan bible Stage 05. Acuan material: scene baseline + board usulan yang diterima. Pertahankan peran HTML, provenance, dan kebijakan tanpa screenshot otomatis.

Jika pengguna memberikan master asli, periksa SHA-256 terhadap lock, bandingkan dengan board ini, dan catat konflik secara spesifik sebelum membuat aset produksi. Jika usulan diterima, catat keputusan tersebut tanpa mengubah sejarah master lama. R01 tidak dengan sendirinya mengotorisasi R02 atau publikasi website.
