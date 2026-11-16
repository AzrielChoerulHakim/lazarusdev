# R02 — Keputusan implementasi dan handoff

Tanggal: 16 November 2026. Baseline situs: `main@8e6b0cf`. Arahan kreatif: R01 `20b7aef`, ditetapkan atas delegasi pengguna. Cabang implementasi: `feat/r02-entrance`.

Status: **R02 selesai**. Keputusan kreatif dan pemeriksaan internal diambil langsung sesuai delegasi pengguna; tidak ada gerbang review pengguna tambahan.

## Perubahan yang diputuskan

1. Jadikan environment sebuah figure berukuran proporsional di sebelah pesan pada desktop dan setelah CTA pada mobile. Ilustrasi tidak lagi menjadi background seluruh section yang framing-nya bergantung pada panjang konten.
2. Produksi scene landscape 1536×1024 dan scene square 1254×1254 secara terpisah. Ekspor mobile 1024×1024. Keduanya mempertahankan gerbang batu asimetris, oak di kanan, jalur ochre dari portal, arah cahaya kiri atas, goresan pensil/crayon, dan ruang tenang untuk karakter. Seluruh gambar tampil dengan `contain`.
3. Produksi Paperkeeper netral dengan identitas lama: topi daun, wajah sederhana, jubah moss, kaki ranting, tas kertas kiri dan lentera acorn kanan. Sepatu lebih kecil, tekstur daun lebih jelas, dan aksen ochre mengikuti scene. PNG transparan terpisah 1009×1558, WebP 622×960. Tidak ada character yang tertanam di environment.
4. Grounding memakai bayangan kontak lembut di bawah kaki. Batas alpha nyata digunakan untuk registrasi, bukan bagian bawah kotak gambar. Baseline alpha export `0.97083`; pusat tanah sekitar `0.865` tinggi scene. Tidak memakai rotasi seluruh badan atau drop-shadow pada seluruh siluet.
5. Pertahankan pesan jasa dan kedua tujuan CTA. Judul desktop kembali dua baris pada 1440 px. CTA mobile dapat satu baris bila cukup ruang dan membungkus pada layar sempit. Undangan atlas menjadi tautan kecil setelah adegan, dengan `<details>` atlas tetap native.
6. Matikan efek lama `paperkeeper-hat-tip` hanya pada Entrance. Pose awal adalah acuan diam R02; perilaku bab lain tetap untuk tahapnya masing-masing.

## Pemeriksaan artistik

PNG environment desktop, environment mobile, dan karakter diperiksa langsung sebagai gambar sumber. Material, arah cahaya, prop dan landmark konsisten; scene mobile adalah komposisi baru. Detail paling padat berada di oak/gerbang, sementara kiri memberi tempat karakter. Character pass kedua membersihkan tepi melalui imagegen dengan identitas dan pose tetap.

Pemeriksaan browser mencakup geometri hasil render, decode, susunan lapisan, ukuran teks/CTA, sumber gambar dan interaksi. Preview pasangan ukuran menjalankan situs aktual untuk pemeriksaan langsung. Tidak ada screenshot/video otomatis, dan hasil DOM tidak disebut sebagai penilaian artistik seluruh website. Master V2 asli tetap belum ditemukan; provenance R01 tidak diubah.

## Pengukuran referensi

| Ukuran | Paperkeeper | Hubungan dengan pesan |
|---|---|---|
| 390×844 | sekitar y604–771; tinggi 167 px | Judul dan kedua CTA berada di atas figure; karakter lengkap hadir pada layar pertama |
| 1440×900 | tinggi 280 px | Figure berdampingan dengan copy; karakter tidak menutup teks |
| 320×720 | tinggi 136 px | Copy dan CTA tetap terbaca; scene mengikuti lewat scroll native, tanpa memaksakan satu layar |
| 768×860 dan 844×390 | figure landscape proporsional | Tidak ada crop atau tinggi hero yang dipaksa sama dengan viewport |

Baseline audit 390×844 menempatkan awal karakter sekitar y891. Perbaikan ini memajukan petunjuk visual tanpa mengecilkan body copy. Detail pengukuran akhir tersimpan dalam `qa/browser.json`.

## Budget aset

| Gambar | Byte WebP |
|---|---:|
| Desktop environment | 336.838 |
| Mobile environment | 281.828 |
| Paperkeeper transparan | 191.112 |

Environment + karakter adalah 527.950 byte desktop / 472.940 byte mobile. Dibanding aset hero lama, kualitas baru menambah sekitar 147 KB desktop / 198 KB mobile. Ini keputusan kualitas, bukan klaim penghematan transfer. Browser hanya mengunduh satu environment sesuai media preload/picture; sumber PNG tidak masuk bundle publik. Tidak ada payload frame animasi baru.

## Verifikasi

Hasil akhir direkam di `qa/` setelah seluruh koreksi selesai. Pemeriksaan meliputi kedua build, integritas sumber/export, 11 viewport × 2 rute, CTA dan atlas lewat native anchors/keyboard, gambar gagal, JavaScript mati, reduced motion, dan reflow Entrance ketika teks diperbesar 200%. Axe otomatis dijalankan pada Entrance/header di 390 dan 1440 px. Ini bukan audit screen reader manual atau hasil performa pengguna nyata.

Hasil lokal: build root dan alternate lulus; 22 pemeriksaan layout dan 8 fallback lulus; 16 regresi Entrance plus gambar diblokir lulus; 18 regresi editorial plus 2 no-JS lulus. Empat pemeriksaan axe pada scope Entrance/header tidak menemukan pelanggaran WCAG yang diuji. `qa/inputs.json` mencatat hash source dan build yang diuji. Profil 720×450 memeriksa reflow viewport sempit; ini tidak disebut uji zoom browser fisik.

Tes editorial lama diperbarui untuk menguji invariant yang masih relevan: tinggi figure tetap sama setelah atlas dibuka. Batas 700–1111 px dari layout lama sudah tidak tepat. Tes no-JS menunggu CSS fold selesai sebelum pointer click dan menunggu fragment navigation selesai; tidak memakai force-click atau mengganti tautan dengan simulasi JavaScript.

## Batas dan pekerjaan berikutnya

- Pada pembesaran teks 200%, caption Entrance sekarang bisa membungkus. Header dan House masih memiliki overflow dari baseline; dicatat untuk R06/R08, bukan dinyatakan lulus seluruh halaman.
- CSS R02 dimuat paling akhir dan dibatasi ke Entrance. Konsolidasi stylesheet historis dan dua entry HTML tetap pekerjaan R08.
- Gambar metadata/share masih mengikuti release sebelumnya; pembaruan metadata final mengikuti R09.
- Tidak ada klaim bahwa empat bab lain sudah memiliki kualitas ilustrasi R02.
- Publikasi produksi mengikuti R09; penyelesaian R02 tidak membutuhkan persetujuan visual tambahan pengguna.

## Handoff R03

Gunakan sumber karakter R02, bukan crop dari board R01 atau sprite studi kecil. Pertahankan kaki pada baseline, ukuran topi, satchel kiri, lantern kanan dan arah cahaya. Produksi aksi menoleh → mengangkat lentera → settle dengan pose yang digambar khusus. Sisakan ruang dalam figure di kanan karakter untuk gerak tangan/lentera; R04 akan memasang trigger atlas tanpa menghambat navigasi. Bayangan kontak tetap terpisah dari gambar karakter.
