# R15A — Paperkeeper Asset Cleanup & Pose System

**Status:** PLANNED / NOT IMPLEMENTED  
**Prioritas:** P1 visual quality gate  
**Posisi di roadmap:** sesudah R15 / sebelum R16; referensi pijakan mengikuti R14  
**Implementasi ke GitHub:** branch \`main\`, per sub-tahap dan disertai QA; dokumen ini sendiri hanya spesifikasi  
**Pemicu:** inspeksi visual R13 dan laporan pengguna tentang potongan Paperkeeper yang buruk serta sisa putih di tepi karakter.

## 1. Problem statement

Aset Paperkeeper tidak boleh tampak seperti stiker hasil pemotongan yang kasar. Kontur topi, ujung daun, kaki, tangan, tas kertas, dan lentera harus bersih serta tetap menunjukkan tekstur krayon. Sprite animasi perlu menggunakan frame, transparent padding, anchor kaki, dan massa visual yang konsisten pada seluruh pose.

**Bukti R13:** pada viewport 390×844, bounding box karakter di River Stories \`56 × 58px\` beririsan dengan panel navigasi sebesar sekitar **83%**. Inspeksi juga menunjukkan walker di Winding Path hanya sekitar \`36 × 38px\`. Itu membuktikan masalah keterbacaan/penempatan; **keberadaan white fringe harus diverifikasi per frame pada piksel asli**, tidak semata disimpulkan dari angka bounding box.

## 2. Prinsip artistik dan produksi

- **Pertahankan desain Paperkeeper asli:** topi daun asimetris, jubah daun/lumut, kaki ranting, satchel kertas, lentera biji ek, ekspresi sederhana. Jangan redesign chibi, mengganti maskot, atau menghaluskan kontur menjadi vektor.
- Prioritaskan sumber ilustrasi transparan beresolusi tertinggi. Jika hanya tersedia WebP hasil ekspor, audit alpha terlebih dahulu dan catat keterbatasan perbaikan; **jangan mengklaim re-export dari file sumber yang tidak ada**.
- Bedakan **white-matte contamination** dengan highlight/garis terang yang memang disengaja. Hapus hanya kontaminasi pada alpha fringe, bukan menghilangkan warna kertas atau hatching.
- Crop adalah fungsi kanvas dan posisi prop, bukan memotong bagian topi/lentera. Sprite sheet dan individual PNG/WebP harus memiliki aturan yang terukur.
- Jangan menutupi karakter dengan tombol atau memperbaiki collision dengan hanya menaikkan \`z-index\` sehingga tombol kehilangan hit area.
- Semua bahan dan hasil harus punya provenance dan dapat dibandingkan dengan baseline R13.

## 3. Sub-tahap terurut

| Sub-tahap | Pekerjaan yang harus dilakukan | Output yang harus disimpan | Kriteria penerimaan |
|---|---|---|---|
| **R15A.1 — Audit** | Inventaris seluruh aset Paperkeeper dan referensi CSS/JS; inspeksi PNG/WebP transparan/sprite frame; hitung lebar-tinggi kanvas, occupied alpha bbox, min/max opacity di tepi, whitespace aktual, kaki, tas dan lentera | \`ASSET-AUDIT.md\`, manifest input berisi file, SHA, pose, scene dan defect | Setiap penggunaan karakter terpetakan; masalah \`halo\`, \`crop\`, \`scale\`, \`anchor\`, \`collision\` dapat ditelusuri |
| **R15A.2 — Alpha cleanup** | Pembersihan white matte dan fringe dalam kanal RGBA; peninjauan manual pada alpha edge dan hatching | Aset bersih non-destruktif, before/after background terang/gelap/hijau, catatan metode | Tidak ada garis putih tak disengaja pada kontur karakter di preview aktual |
| **R15A.3 — Crop & padding** | Tentukan padding atas/samping/bawah, frame sprite per pose, standar konversi sprite sheet dan aset tunggal; cek topi/lentera/tas/sepatu | \`FRAME-SPEC.md\`, normalisasi frame & transparent padding | Tidak ada bagian siluet menyentuh tepi canvas tanpa disengaja; tiap pose utuh dan skala seragam |
| **R15A.4 — Groundline anchor** | Registrasi titik kaki kiri/kanan, pusat massa, pivot kepala, hubungan lentera terhadap tangan; uji transisi tanpa kenaikan kaki semu | \`ANCHOR-MANIFEST.json\`, grid overlay pijakan dan regression visual | Pergantian \`stand/look/reach/lift/carry\` tidak tampak teleport atau melayang pada pijakan yang sama |
| **R15A.5 — Pose library** | Tata pose umum (\`stand\`, \`look\`, \`walk\`, \`lantern\`, \`read\`) dan pose naratif (\`look-down\`, \`set-lantern\`, \`reach\`, \`lift\`, \`carry\`); gambar ulang pose yang belum ada, tidak menyamarkan \`read\` sebagai \`lift\` | Manifest pose final, raster/sprite transparan, legenda frame, penamaan eksplisit | Setiap pose terlihat sesuai aksinya; tidak ada gerak yang bergantung pada label palsu |
| **R15A.6 — QA scene** | Pasang aset bersih di Entrance, Winding Path, Work Clearing, River Stories, House on the Hill; cek render 1440×900, 390×844, 320×720, 844×390; latar warna kontras, zoom 100%/200%, reduced motion | Screenshot produksi dan perbandingan R13, laporan collision dan QA | Semua lima adegan menampilkan karakter tanpa halo atau crop; Paperkeeper sungai tidak tertutup UI, kaki tepat di groundline, gestur dan tas terbaca pada portrait |
| **R15A.7 — Character lock** | Dokumentasikan frame, anchor, sumber aset, nama pose, dimensi, aturan placement/skalasi, hal terlarang dan batas penggunaan | \`PAPERKEEPER-CHARACTER-LOCK.md\` + manifest release + bukti final | Semua aset final terdaftar dan siap dikonsumsi R16/R18 tanpa mengulang pembenahan cutout |

## 4. Aturan QA yang konkret

### Pemeriksaan alpha (otomatis + manual)
1. Untuk setiap pose, ukur \`RGBA\` pada crop dan batas alpha, lalu deteksi piksel semi-transparan yang terlalu putih dibanding warna kontur di sekitarnya.
2. Simpan empat komposit *preview* pada latar \`#F7E9D6\` (krem), \`#1E302B\` (hijau gelap), \`#5A8CAF\` (biru sungai), dan hitam netral. Semua harus menggunakan file **final asli** (bukan screenshot aset dengan background putih).
3. Periksa ujung topi, daun berlapis, tali tas, kaki, ujung lentera pada ukuran normal dan 200%. Threshold angka hanyalah diagnostik: keputusan akhir tetap melalui inspeksi gambar untuk mencegah hilangnya highlight/hatching.

### Pemeriksaan crop dan pose
- Tidak ada kontur atau properti penting melewati frame secara tak disengaja.
- Frame sprite pada animasi konsisten ukuran kanvas dan anchor. Perbedaan ruang kosong setiap pose harus dijelaskan oleh aksi (misalnya gestur membungkuk) bukan ekspor acak.
- Perpindahan posisi vertikal telapak kaki diuji saat animasi; tidak ada teleport visual.
- Karakter lebih mudah dibaca daripada tekstur latar di jalur yang ditetapkan R14; scaling/padding UI tidak menutupi objek lain.

### Pemeriksaan halaman sebenarnya
- Tampilkan screenshot hasil render \`/\` dan \`/storybook/\` pada desktop, potret ponsel dan lanskap pendek.
- Screenshot sebelum–sesudah harus memperlihatkan karakter yang sama, bukan maskot baru atau upscaling yang mengubah identitas.
- Untuk sungai, ukur tabrakan dengan tombol catatan. **Baseline 83% overlap harus berkurang menjadi 0% pada area tubuh yang penting**, dengan kontrol tetap dapat diketuk.
- Reduced motion menampilkan pose statis yang utuh, tanpa blank frame/tepi aneh.

## 5. File dan dependensi yang perlu diperiksa saat eksekusi

Sumber potensial berdasarkan repository saat pembuatan roadmap:
- \`storybook/assets/characters/*\` — sprite perjalanan dan pose membaca; audit source dan alpha sebelum mengganti.
- \`storybook/assets/entrance/r02/exports/paperkeeper.three-quarter.webp\` dan pose Entrance lain.
- \`src/storybook/styles/keeper-journey.css\`, \`src/storybook/keeper-journey.js\` — registrasi sprite/pose serta titik pijak.
- \`src/storybook/paper-rescue.js\`, \`src/storybook/styles/paper-rescue.css\` — fase sungai dan posisi karakter/props.
- CSS dan elemen scene di \`index.html\` dan \`storybook/index.html\`; jangan mengubah teks editorial atau metadata klien tanpa kebutuhan.
- Otomasi QA dan tangkapan visual yang dibangun di \`scripts/forest_r13_visual_capture.mjs\` serta \`docs/forest/revision/r13/evidence/\`.

**Catatan penting:** daftar di atas adalah target inspeksi, bukan klaim semua file perlu diubah. Cek lokasi sumber dan nama pose sesungguhnya di repo sebelum melakukan edit.

## 6. Urutan risiko dan hubungan lintas sprint

**P1 (wajib):** fringe putih, crop rusak, frame sprite yang melompat, collision sungai, integritas siluet.  
**P2:** ukuran karakter terlalu kecil, arah pandang, tangan dan lentera benar-benar berinteraksi, penyesuaian kontras terhadap lingkungan.  
**P3:** micro-shadow, timing/transisi pose, polishing ilustrasi yang tidak mengubah bentuk dasar.

- **R14:** menentukan komposisi dan jalur kaki yang menjadi rujukan R15A.
- **R15:** mengerjakan Atrium secara independen tanpa bergantung pada finalisasi pose sungai.
- **R15A:** membersihkan fondasi karakter, menormalkan pose, dan mengamankan integrasi lima bab.
- **R16:** menyusun pengambilan **satu kertas** memakai aset R15A, mengatur narasi dan timing scroll; tidak melakukan ulang cleanup alpha.
- **R17:** menempatkan kertas yang sama di rumah dalam suasana senja.
- **R18:** mengkalibrasi komposisi dan pencahayaan lintas bab dengan karakter yang sudah dikunci.
- **R19:** menguji keseluruhan hasil di browser nyata dan secara manual.

## 7. Definition of Done

- [ ] Seluruh penggunaan aset Paperkeeper dan defect per pose diinventarisasi.
- [ ] White fringe dan matte tidak disengaja hilang; detail krayon aman.
- [ ] Transparent padding dan bounding box antar pose stabil; tidak ada topi, tangan, tas, atau lentera terpotong.
- [ ] Anchor telapak kaki konsisten dan pergantian pose tidak meloncat.
- [ ] Library pose umum dan pose sungai memiliki gambar yang benar-benar menunjukkan aksi.
- [ ] Paperkeeper terbaca dan tidak ditutupi UI pada kelima bab, khususnya viewport 390×844.
- [ ] Screenshot nyata dari production build kedua rute dan perbandingan R13 diperiksa.
- [ ] Manifest aset final, panduan karakter, laporan QC, dan status kelulusan tersimpan di GitHub.
- [ ] **Sign-off manual** eksplisit; lolos CI bukan pengganti inspeksi visual.

**Status dokumen:** hanya perencanaan R15A, belum ada aset, CSS, JS, animasi atau hasil visual yang diubah oleh commit roadmap ini.
