# LAZARUS DEV — Visual Revision Execution Plan

**Proyek:** The Forest Between Pages (Lazarus Dev)  
**Ditetapkan:** 18 November 2026  
**Target branch:** `main` (commit langsung atas instruksi eksplisit pemilik)  
**Status:** `PLANNED` — rencana produksi, bukan klaim implementasi atau sign-off visual.  
**Sumber arah:** audit visual lima bab, pengalaman The Atrium, kontinuitas Paperkeeper dan halaman sobek; `ART-DIRECTION-LOCK.md` dan `visual-comparison-r12.md`.

## Tujuan akhir
Pengunjung mengikuti Paperkeeper ke gerbang, menjelajah galeri dan **benar-benar memasuki The Atrium**, menggeser cahaya sehingga bayangan pilar dan relief bereaksi jelas, kemudian kembali ke posisi poster semula. Di sungai Paperkeeper **menyelamatkan satu halaman** yang berbeda jelas dari objek lingkungan. Di rumah, halaman dengan **sudut sobek identik** tampak dijemur di dekat jendela yang menjadi pusat cahaya senja. Semua kejadian terbaca dari gambar bahkan tanpa caption.

## Batasan kreatif yang tidak boleh dinegosiasikan
- **2D krayon/pensil warna di atas kertas**; pertahankan stroke dan tekanan pigmen asli. Jangan mengganti ke ilustrasi vektor halus, filter noise generik, 3D yang tidak selaras, ikon stok atau layout kartu AI generik.
- **Paperkeeper tetap satu karakter**: topi daun asimetris, jubah daun/lumut, kaki ranting, tas kertas, lentera biji ek. Siluet dan proporsi lintas pose tidak berubah.
- Lima bab utama, konten faktual dan status *concept study* bukan proyek klien, navigasi anchor, Field Letter lokal saja, serta `/` dan `/storybook/` dipertahankan.
- Tidak mengunci scroll cerita utama, tidak memaksa animasi untuk pengunjung yang memilih `prefers-reduced-motion`, jangan membuat tombol penting tersembunyi di gambar.
- Art direction dibangun melalui **komposisi, nilai terang-gelap, sumber cahaya, siluet dan kontras**, bukan menambah ornamen.

## Tahap dan definition of done

### R13 / Tahap 0 — Baseline visual yang dapat diaudit
**Status:** TODO · **Prasyarat:** tidak ada · **Tujuan:** mengubah audit aset menjadi pengujian *halaman yang benar-benar dirender*.

**Pekerjaan**
1. Tambahkan pengambilan screenshot aktual dari browser pada dua rute, setidaknya pada viewport `1440×900`, `390×844`, `320×720`, dan `844×390`, meliputi lima adegan, poster, Atrium posisi cahaya 0/50/100, dan kondisi rumah. Ambil screenshot sesudah aset selesai decode.
2. Simpan gambar per bab/viewport sebagai artefak pemeriksaan GitHub Actions atau preview yang dapat diperiksa; sertakan pemetaan viewport, commit SHA dan media preference. **Jangan gunakan screenshot buatan atau masterboard skematis sebagai bukti output browser.**
3. Catat clipping, tumpang tindih kontrol, crop, keterbacaan teks dan ketidaksesuaian posisi Paperkeeper di groundline. Audit scroll galeri, masuk Atrium, Back browser, dan kontinuitas kertas.
4. Tetapkan baseline skor per bab, berdasarkan pemeriksaan gambar nyata, dan laporkan semua kegagalan. Lindungi sumber aset yang sudah disetujui.

**Sentuh:** `scripts/forest_atrium_story_smoke.mjs` atau skrip capture terpisah; `.github/workflows/forest-atrium-rescue.yml`; dokumentasi bukti R13.  
**Lulus jika:** screenshot aktual desktop/ponsel dapat dibandingkan; artefak dan laporan otomatis terhubung pada SHA commit yang sama; status manual tetap tertulis `NOT SIGNED OFF` hingga dinilai manusia.

### R14 / Tahap 1 — Kunci sepuluh komposisi dan kurva cahaya
**Status:** TODO · **Prasyarat:** R13.

**Pekerjaan**
1. Buat *production comparison sheet* berisi **lima render desktop dan lima ponsel** dari komposisi final/candidate, bukan hanya `visual-comparison-r12.svg` yang sekarang masih skematis.
2. Terapkan urutan atmosfer: **gerbang = pagi / bukaan sempit; jalan = cahaya berlapis diagonal; galeri = ruang terbuka dengan pintu emas sebagai fokus; sungai = air lebih dingin dan kamera dekat; rumah = senja dengan jendela emas dominan**.
3. Tentukan titik pijak Paperkeeper, arah pandangan, zona aman teks dan kontrol, focal point serta benda naratif per bab. Uji thumbnail tanpa judul.
4. Tetapkan lokasi **satu** halaman sobek di sungai dan lokasi yang kompatibel di jendela rumah sebelum produksi pose dan repaint.

**Sentuh:** aset ilustrasi kandidat desktop/portrait, `docs/forest/visual-comparison-r12.*` sebagai referensi, lembar perbandingan produksi R14.  
**Lulus jika:** galeri, sungai, rumah dapat dibedakan dari siluet dan pola terang-gelap saat thumbnail diberi label tersembunyi; aset lama tetap bisa dipulihkan; inspeksi visual didokumentasikan. **Tidak otomatis mengklaim user-test manusia selesai.**

### R15 / Tahap 2 — The Atrium sebagai dunia kedua yang menyatu
**Status:** TODO · **Prasyarat:** R13–R14 · **Prioritas implementasi interaktif: pertama**.

**Pekerjaan**
1. Pertahankan poster Atrium dan concept notes yang sudah ada. Perjelas affordance `Enter The Atrium` pada ponsel, tanpa mengorbankan poster Oracle/Archive.
2. Samakan proporsi dan siluet gerbang emas pada poster dengan ambang pembuka ruang; transisi animasi singkat dengan titik asal elemen yang benar. `reduced-motion` masuk langsung ke state akhir.
3. Tingkatkan tiga lapisan: ambang depan, pilar tengah, relief/dinding belakang. Finishing batu berupa material berpola krayon yang kompatibel dengan poster, bukan vektor steril.
4. Perbaiki sistem cahaya sehingga kiri–tengah–kanan jelas mengubah **arah/panjang bayangan** serta *reveal* relief sesuai lokasi cahaya; jangan hanya mengubah opacity berdasarkan slider.
5. Pertahankan *pointer drag*, slider, tombol panah, Escape/Back browser, focus trap, restorasi scrollY, scrollLeft galeri dan fokus pemicu.

**Sentuh:** `src/storybook/atrium-room.js`, `src/storybook/styles/atrium-room.css`, template di `index.html` dan `storybook/index.html`, material ilustrasi Atrium, pengujian browser.  
**Lulus jika:** pengunjung masuk dari tombol `Explore the work`, dapat menemukan relief dengan **satu usap**, keluar tanpa kehilangan posisi dan fokus; respons pada `390×844`, `1440×900`, `844×390`; kedua rute setara.

### R16 / Tahap 3 — Satu kertas, satu tindakan Paperkeeper
**Status:** TODO · **Prasyarat:** R14 · **Integrasi silang:** R17.

**Pekerjaan**
1. Hilangkan ambiguitas dari **dua kertas yang sudah tergambar** di lukisan sungai dan overlay halaman tambahan. Produksi ulang/retouch lukisan dasar sehingga hanya **satu kertas interaktif** yang menjadi pusat gestur; jangan mengandalkan tempelan CSS untuk menutup objek lama secara kasar.
2. Pakai **satu aset geometris sobekan** sebagai sumber untuk tiga keadaan: tersangkut, dipegang/terangkat, dan dijemur. Pertahankan bentuk, garis tulisan, pola sobek, orientasi dan identitas visual.
3. Buat pose spesifik `look-down`, `set-lantern`, `reach`, `lift`, `carry` dengan kaki tetap terdaftar pada titik pijak; lentera mandiri tidak teleport saat karakter berganti pose.
4. Adegan bergantung pada scroll masuk secara ringan, **tidak menghentikan native scroll**. Setelah tangan menyentuh halaman, animasi pendek dapat selesai meski jempol diam; pengunjung yang swipe cepat tetap bisa melewati adegan. Pengulangan hanya setelah pengunjung sengaja kembali ke awal sungai.
5. Mode reduced motion dan lanskap pendek menampilkan Paperkeeper memegang kertas sebagai keadaan statis lengkap, bukan frame animasi yang tak terbaca.

**Sentuh:** `storybook/assets/river-stories/exports/*`, aset karakter dan prop baru, `src/storybook/paper-rescue.js`, `src/storybook/keeper-journey.js`, `src/storybook/styles/paper-rescue.css` serta HTML kedua rute.  
**Lulus jika:** gesture dapat dibaca saat karakter dan kertas ditampilkan **pada ukuran ponsel sebenarnya**, termasuk scroll perlahan, berhenti, swipe cepat, kembali ke awal, serta reduced motion. Tidak ada kertas ganda atau kaki yang melompat.

### R17 / Tahap 4 — House on the Hill: senja dan *payoff* naratif
**Status:** TODO · **Prasyarat:** R14 dan identitas halaman R16.

**Pekerjaan**
1. Relight adegan rumah dari sore terang ke **senja**: lingkungan lebih dingin, lereng dan langit turun nilainya, jendela menghangat sebagai focal point. Hindari menempatkan glow besar hanya sebagai overlay gradien; cahaya harus tampak memengaruhi permukaan yang berdekatan.
2. Gantung halaman R16 **di dekat jendela pada perspektif yang benar**, dengan penjepit/tali dan bayangan kontak halus. Pastikan tidak tampak seperti sticker melayang. Tetap terbaca pada `390px` lebar tanpa membesarkan prop secara tidak wajar.
3. Setelah reveal halaman, arahkan perhatian secara bertahap ke meja dan Field Letter. Lembar kosong untuk Field Letter **berbeda** dengan lembar sobek yang diselamatkan.
4. Pastikan Paperkeeper telah selesai gestur berjalan/membawa sebelum pengunjung memasuki pembacaan/penulisan; tidak ada animasi tanpa tujuan di belakang formulir lokal.

**Sentuh:** `storybook/assets/house-on-the-hill/exports/*`, `src/storybook/styles/house-on-the-hill.css`, `src/storybook/styles/paper-rescue.css`, `src/storybook/house-on-the-hill.js` bila dibutuhkan, dan HTML kedua rute.  
**Lulus jika:** rumah terbaca sebagai akhir hari pada thumbnail tanpa label; posisi jendela dan halaman bertahan pada crop portrait/desktop; pengunjung mengenali sobekan identik dan bisa memakai Field Letter.

### R18 / Tahap 5 — Galeri potret, tipografi, dan kalibrasi lima bab
**Status:** TODO · **Prasyarat:** R15–R17.

**Pekerjaan**
1. Buat ilustrasi potret Work Clearing yang benar-benar **diart-direct untuk ponsel**, bukan hanya crop dari `work-clearing-woods.webp`. Paperkeeper menghadap poster Atrium dan tepi poster berikutnya menjadi petunjuk swipe.
2. Atur kontras di belakang ketiga poster; emas terbanyak tetap menjadi milik pintu Atrium, lalu jendela rumah.
3. Sesuaikan densitas jalur dan area kaki di Winding Path agar karakter kontras terhadap latar. Jangan mengecat ulang Entrance yang sudah kuat tanpa alasan komposisional.
4. Perkaya ritme editorial antar-bab: variasi skala, jarak baca, penggunaan huruf miring dan warna judul **tanpa mengganti** Fraunces/Newsreader/Atkinson Hyperlegible hanya demi kebaruan.
5. Selaraskan detail transisi antar-bab, pose Paperkeeper, dan model pencahayaan pada sepuluh render final.

**Sentuh:** `storybook/assets/work-clearing/exports/*`, `src/storybook/styles/work-clearing.css`, `src/storybook/styles/experience-r10.css`, CSS bab terkait, dan aset mobile final.  
**Lulus jika:** kelima bab memiliki focal point dan pencahayaan berbeda; konten dan poster tetap terbaca/terjangkau pada perangkat sempit; peta komposisi final menunjukkan 10 tampilan nyata.

### R19 / Tahap 6 — QA visual, interaksi, aksesibilitas dan release sign-off
**Status:** TODO · **Prasyarat:** seluruh tahap sebelumnya.

**Pekerjaan**
1. Jalankan `npm run build`, `npm run build:storybook`, smoke test R12 dan regresi relevan; cek GitHub Actions untuk commit yang **sama** dengan bukti visual.
2. Pemeriksaan browser minimum: `320×720`, `375×812`, `390×844`, `430×932`, `768×860`, `1440×900`, `844×390`, dua rute, direct hash `#atrium`, Back browser, galeri horizontal, rotasi, no-JS, reduced motion, dan teks 200%.
3. Audit WCAG 2.2 AA: kontras normal >=4.5:1, teks besar >=3:1, urutan fokus, label kontrol, ukuran touch target >=44px, overflow dan clipping. Uji dengan keyboard dan inspeksi mobile fisik jika perangkat tersedia; tulis `NOT VERIFIED` jika tidak.
4. Ambil screenshot final di semua viewport kritis dan lakukan perbandingan sebelum–sesudah. Aturan art sign-off dari `ART-DIRECTION-LOCK.md`: **setiap kategori >=4/5 dan rata-rata >=4,5/5**, melalui penilaian gambar yang sungguh diperiksa.
5. Validasi tanpa instruksi kepada pembaca: (a) apa yang dilakukan di Atrium, (b) mengapa Paperkeeper berhenti di sungai, (c) di mana kertas terlihat lagi. Tes manusia harus benar-benar dilakukan sebelum dicatat lulus; tidak dapat digantikan oleh assertions.
6. Pastikan aset Atrium baru diinisialisasi/dimuat secara proporsional ketika karya dipilih atau didekati; amati transfer bytes dan CLS/LCP bila instrumentasi tersedia.

**Lulus jika:** tidak ada regresi interaksi, gambar akhir konsisten, seluruh batas aksesibilitas yang dapat diuji lulus, dan *visual sign-off* manual tercatat jujur. **CI hijau bukan bukti otomatis bahwa kualitas artistik sudah di-ACC**.

## Matriks penyelesaian dan bukti
| Tahap | Output yang harus dilampirkan ke commit | Gate |
|---|---|---|
| R13 | Screenshot browser awal + manifest viewport/sha + daftar masalah | Visual baseline nyata |
| R14 | 10 komposisi produksi + aturan cahaya/groundline + catatan review | Siluet & focal point |
| R15 | Atrium art/interaction + screenshot light 0/50/100 + regression | Masuk–cahaya–kembali |
| R16 | 1 halaman sumber, pose khusus, screenshot fase rescue + motion tests | Tindakan terbaca |
| R17 | House twilight, detail jendela dan halaman + before/after mobile | Payoff kertas terbaca |
| R18 | Clearing potret, final 10-up, typography/contrast notes | Lima bab berbeda |
| R19 | Hasil CI, screenshot final, aksesibilitas dan status user-test manusia | Release sign-off |

## Protokol kerja GitHub untuk revisi berikutnya
- Sesuai instruksi pengguna, setiap tahap yang dieksekusi kemudian akan diubah **langsung pada branch `main`** dan di-commit dengan pesan spesifik (`feat(forest-r15): ...`, `fix(forest-r16): ...` dan seterusnya). Dokumen ini sendiri juga di-commit ke `main` sekarang.
- Setiap tahap = satu ruang lingkup yang dapat diuji; hindari menggabungkan seluruh revisi visual sebagai satu commit besar. Verifikasi SHA terakhir dan pemeriksaan sebelum/sesudah; bila gate gagal, perbaiki atau pulihkan baseline sebelum melanjutkan.
- Jangan menyebut revisi yang baru direncanakan sebagai sudah selesai. Pelaksanaan tahap berikutnya membutuhkan instruksi eksekusi baru; tidak ada pekerjaan otomatis atau background di antara percakapan.
- **Sumber hukum spesifikasi:** `ART-DIRECTION-LOCK.md` tetap mengatur kualitas visual, namun ketentuan lama yang melarang commit ke `main` telah digantikan oleh otorisasi eksplisit pengguna dalam percakapan terbaru. Jangan mengubah riwayat maupun mengklaim tahap art lama sudah tervalidasi.
- Prioritas desain tidak dapat dikompromikan demi CI hijau: **gambar diam harus sudah bagus, gerak hanya memperkuat maknanya**.

## Status proyek pada tanggal dokumen
- Sudah tersedia **first-pass** Atrium (ruang, slider, keyboard, back/restoration) dan **first-pass** paper rescue.
- File `visual-comparison-r12.svg` adalah studi skematis, **bukan** screenshot final dari browser.
- CI R12 pada `main` telah dilaporkan sukses untuk tes interaksi dan build, tetapi workflow tersebut **tanpa screenshot**; tidak menjadi visual sign-off.
- Semua R13–R19 masih `TODO` sampai perubahan aktual, bukti, dan gate direkam.
