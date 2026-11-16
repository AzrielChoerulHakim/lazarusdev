# R01 — Keputusan aset

Semua path relatif terhadap `storybook/assets/`. Keputusan ini adalah pekerjaan yang dijadwalkan; file baseline belum diganti. Pertahankan arsip dan provenance saat produksi berikutnya.

| Kelompok/path | Keputusan | Alasan dan pekerjaan | Tahap |
|---|---|---|---|
| `entrance/source/*`, `entrance/exports/entrance-{desktop,mobile}.webp` | Perbaiki sebagai pasangan | Gerbang/kertas dipertahankan; sunting density, framing dan tempat karakter; mobile harus memberi petunjuk dunia di layar pertama | R02 |
| `entrance/exports/entrance-leaf-cue.webp` | Pertahankan, review kontras | Prop navigasi sudah bermakna; selaraskan goresan bila scene berubah | R04 |
| `characters/paperkeeper.{front,three-quarter,profile,back}.webp` | Pertahankan identitas; perbaiki master produksi | Warna, hat/cape/bag/lantern menjadi jangkar; cek matte/edge, sepatu, proporsi dan ground contact | R02–R03 |
| `characters/paperkeeper.walk-{a,b,c}.webp` | Ganti penggunaan produksi; simpan sebagai studi | Terlalu kecil dan hanya tiga key; buat frame walk dengan berat/kontak kaki. Jangan upscale untuk hero | R03/R05a |
| `characters/paperkeeper.{read,rest}.webp` | Gambar ulang sesuai ukuran tampil | Siluet dan material harus sama dengan master karakter; pose lama referensi intent | R03/R05c–d |
| `characters/moth.guide.webp`, `roundbird.idle.webp` | Pertahankan dengan inspeksi | Tetap dua pendukung; cek edge, scale, arah cahaya; tidak perlu loop | R05a/c |
| `characters/source/*`, silhouette/scale sheets | Arsipkan dan lengkapi | Bukti sumber dan proporsi; source action sheet memuat eksplorasi noncanonical, jangan terbitkan semuanya | R03 |
| `winding-path/source/*`, `exports/*` | Perbaiki desktop; komposisi ulang mobile | Kurangi detail bersaing, jalur readable, bridge dan trace sesuai tanah | R05a |
| `work-clearing/source/*`, `exports/work-clearing-woods.webp` | Perbaiki komposisi pasangan | Space folio, tali dan tempat karakter menjadi satu dunia | R05b |
| `work-clearing/exports/folio-{atrium,oracle,archive}.webp` | Perbaiki konsistensi material | Kertas/peg/stroke selaras, isi tetap konsep; teks HTML terpisah | R05b |
| `river-stories/source/*`, `exports/*` | Perbaiki pasangan dan nilai | Area air tenang, notebook readable; portrait dibuat independen | R05c |
| `house-on-the-hill/source/*`, `exports/house-*` | Perbaiki desktop; gambar mobile ulang | Identitas cottage dan cahaya harus sama di kedua format | R05d |
| `house-on-the-hill/exports/window-glow-*` | Buat ulang setelah lukisan final | Glow harus mengikuti geometri window baru; tidak boleh tersisa overlay lama | R05d |
| `mobile-native/*-portrait.svg` (4 scene) | Ganti ilustrasi produksi setelah pasangan siap | Geometry/texture lama tidak konsisten dengan desktop; jangan dihapus sebelum fallback baru teruji | R05a–d |
| `mobile-native/house-window-glow.svg` | Ganti bersama cottage | Coordinate alignment mengikuti versi lukisan baru | R05d |
| `exports/forest-canopy.*`, `crooked-wayfinder.cutout.webp` | Tetap studi lab | Belum memenuhi status art final; tidak dipromosikan hanya untuk menambah layer | R02 evaluasi |
| Atlas SVG inline / seam SVG inline | Perbaiki seperlunya | Tetap diagram editorial yang lebih sederhana daripada lukisan; sama palette/irama garis, tidak menyamar jadi scene | R04/R06 |
| `*/manifest.json`, resep export | Versikan bersama perubahan | Hash baru, sumber, ukuran, alpha, peran desktop/mobile dan status review | Setiap tahap aset |

## Aset baru yang benar-benar dibutuhkan

1. Entrance pasangan landscape/portrait: background tenang, foreground penanda bila komposisi memerlukan, karakter transparan dan bayangan kontak. Jangan membelah board flattened untuk membuat depth palsu.
2. Aksi lantern invitation: frame produksi dengan canvas/baseline konsisten, neutral dan settled fallback.
3. Walk satu langkah, glance, read dan House acknowledgment hanya ketika bab terkait dikerjakan; boleh memakai master karakter yang sama, tetapi perlu drawing aksi tersendiri.
4. Empat lukisan portrait selaras serta overlay window yang cocok. Elemen scene yang tidak bergerak boleh tetap satu lukisan untuk efisiensi.

## Inventaris dan verifikasi

Manifest lama tetap membuktikan byte baseline. Saat produksi berubah, lakukan versi yang disengaja: source → export → inspect pasangan → catat hash → update tes kontrak. Tes tidak boleh mengunci tiga pose lama sebagai definisi kualitas, dan tidak boleh dihapus untuk menutupi regresi. Board R01 tidak boleh dipakai sebagai sprite sheet atau aset background produksi.
