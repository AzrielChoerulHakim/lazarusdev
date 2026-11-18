# R13 — Review screenshot hasil render yang benar-benar diuji

**Tanggal review:** 18 November 2026  
**Source capture commit:** [e6c4f80](https://github.com/AzrielChoerulHakim/lazarusdev/commit/e6c4f80e3c38f74938c343c2a90ae5709be962db)  
**Frozen evidence commit:** [a470d11](https://github.com/AzrielChoerulHakim/lazarusdev/commit/a470d11b043b8c200ae702bc3669ef54d672f188)  
**Automated workflow:** [Forest R13 — run 44255198740](https://github.com/AzrielChoerulHakim/lazarusdev/actions/runs/44255198740)  
**Evidence:** [PNG dan manifest](./evidence/)  
**ART SIGN-OFF: NOT SIGNED OFF.**

## Apa yang benar-benar telah diverifikasi
- **141 file screenshot PNG nyata** dihasilkan oleh Chromium pada halaman **Vite production build**, dua rute `/lazarusdev/` dan `/lazarusdev/storybook/`, viewport 1440×900, 390×844, 320×720 dan 844×390.
- `manifest.json` mencatat SHA sumber, SHA-256 tiap screenshot, object-fit/position aset, posisi bbox Paperkeeper, prop kertas, posisi galeri, dan status setelah Back. **16 check interaksi** tercatat; hasil capture pertama **0 error** dan **0 warning dari detektor awal**.
- Inspeksi gambar *sungguh dirender* dilakukan pada **lima screenshot scene portrait 390×844**, **Entrance desktop 1440×900**, serta **Atrium posisi 0/50/100, rescue-carrying dan house-lit portrait**. Berkas screenshot desktop lainnya dan landscape termasuk dalam artefak, tetapi **tidak semuanya telah ditinjau secara manual pada sesi ini**.
- Setelah inspeksi manual menemukan benturan yang terlewat pada detektor awal, capture script R13 diperkuat dengan peringatan persentase tumpang-tindih Paperkeeper/halaman terhadap kontrol sungai. Revisi script tidak mengubah lukisan, layout, atau hasil baseline yang telah dibekukan.

## Skor visual baseline sementara (dari gambar hasil render)

**Skala 0–10.** Penilaian ini membantu mengarahkan R14–R18 dan **bukan** skor kelulusan final art direction yang mensyaratkan inspeksi semua viewport serta reviewer manusia. Angka di bawah mencakup pengamatan screenshot potret dan aset asli yang sebelumnya diperiksa; jangan disebut pengujian semua viewport.

| Adegan | Skor sementara | Temuan yang terlihat di PNG |
| --- | ---: | --- |
| Entrance | **8.6** | Gerbang mempunyai siluet kuat dan Paperkeeper terlihat pada skala nyaman; art desktop dan mobile koheren |
| Winding Path | **7.4** | Perspektif akar dan tikungan kuat, tetapi Paperkeeper potret tinggal **36×38 CSS px** dan menyatu dengan detail latar |
| Work Clearing | **8.0** | Pintu Atrium terlihat dan poster Oracle berikutnya terintip, tetapi Paperkeeper **56×58 CSS px** sangat kecil; CTA masuk berada di bawah frame galeri |
| River Stories | **5.7** | **Paperkeeper 56×58 CSS px tertutup area navigasi sebanyak 83% kotak karakternya** pada screenshot 390×844; ada kertas yang sudah tergambar dalam air dan prop overlay tersendiri |
| House on the Hill | **6.4** | Bangunan bagus tetapi masih lebih mirip siang/sore terang daripada senja; kertas 35×45 px terlihat ditumpangkan di fasad dekat jendela, bukan benar-benar dijemur pada garis fisik |
| The Atrium | **6.8** | Pindah cahaya 0 → 50 → 100 **terlihat jelas**, namun tekstur dan bayangan masih geometris/terlalu halus dibanding halaman krayon |

**Rata-rata indikatif enam adegan: 7,15/10.** Tidak menyatakan kualitas semua viewport sudah diberi nilai.

## Bukti penting dan tindakan perbaikan

### A — P1 / Paperkeeper tertutup panel catatan di sungai
Pada [screenshot sungai portrait](./evidence/390x844-river.png), Paperkeeper tampak hampir hilang di balik dua kontrol catatan. Dari manifest:
- Kotak karakter: `x=248, y=570, w=56, h=58`.
- Kotak navigasi: `x=193, y=580, w=165, h=104`.
- Irisan bbox: **2.688 dari 3.248 px² = 82,76%**.
- Navigasi berada pada layer lebih tinggi; itu **visual defect**, meski semua tombol secara teknis berfungsi.

**Perbaikan R16:** reposition karakter/adegan dan safe-area kontrol berdasarkan gambar mobile asli; jangan semata meninggikan `z-index` yang membuat Paperkeeper menutupi tombol. Pertahankan native scroll.

### B — P1 / Gestur dan identitas satu kertas belum koheren
Pada [screenshot rescue-carrying](./evidence/390x844-river-rescue-carrying.png), prop kertas tampak terangkat sendiri tetapi karakter tidak terbaca dengan jelas. Lukisan dasar sungai juga mempunyai lembar kertas yang berbeda posisinya. Aset sobekan overlay sungai dan rumah memang mempunyai geometri SVG yang sama menurut DOM, namun **kesamaan kode tidak menjamin cerita terbaca**.

**Perbaikan R16:** satu lembar dasar, satu titik pickup, pose tangan/lentera tertanam dalam lukisan, dan satu kelanjutan visual sampai rumah.

### C — P1 / Klimaks rumah kehilangan perubahan waktu
Pada [screenshot rumah](./evidence/390x844-house.png) dan [rumah dengan lampu dinaikkan](./evidence/390x844-house-lit.png), jendela bersinar tetapi langit, jalan dan pepohonan tetap terlalu terang. Kertas terlihat di depan rumah sekitar area jendela tetapi tidak memiliki logika penjepit/bayangan yang kuat.

**Perbaikan R17:** relight seluruh komposisi sebagai senja, bukannya menambah opacity glow; pertautkan halaman ke struktur jendela/pengait dan tunjukkan kertas bersih yang terpisah di Field Letter.

### D — P2 / Paperkeeper hampir tidak terbaca di Winding Path
[Screenshot jalan potret](./evidence/390x844-path.png) menunjukkan lukisan sangat padat; bbox walker hanya **36×38 CSS px** di gambar 348 px lebar. Ini bukan kesalahan jalur cerita, melainkan hirarki skala dan kontras.

**Perbaikan R18:** zona hening/groundline yang cukup luas, pose yang memiliki proporsi terlihat tanpa menghilangkan kekayaan tekstur krayon.

### E — P2 / Galeri ponsel sudah menjanjikan tetapi butuh komposisi native
[Galeri portrait](./evidence/390x844-clearing.png) mempertahankan poster Atrium sebagai pembuka, dengan Oracle di tepinya. Tombol masuk jelas dan tidak menutup poster, namun jarak antara Paperkeeper dan lembar Atrium tidak membangun gestur melihat karya yang kuat. Latar masih menggunakan crop lukisan landscape.

**Perbaikan R18:** art-direct portrait berdasar posisi poster dan karakter, bukan mengganti konsep grid/gambar.

### F — P2 / The Atrium belum menyatu materialnya dengan poster
[0%](./evidence/390x844-atrium-light-0.png) · [50%](./evidence/390x844-atrium-light-50.png) · [100%](./evidence/390x844-atrium-light-100.png). Perpindahan cahaya terlihat di screenshot dan relief muncul makin jelas. Namun lighting lebih seperti gradien digital, geometri pilar terlalu bersih, dan arah/ukuran bayangan belum memiliki persepsi material sekuat ilustrasi krayon di hutan.

**Perbaikan R15:** samakan bentuk gerbang poster dengan scene; gunakan tekstur pigmentasi nyata, shadow projection yang konsisten secara spasial, dan relevansi reveal relief terhadap posisi sumber cahaya.

## Apa yang lolos dan apa yang belum

| Pemeriksaan | Status |
| --- | --- |
| Capture gambar aktual 2 rute × 4 viewport | **PASS — 141 PNG** |
| Build production root dan storybook | **PASS** |
| Metadata screenshot, sha, object fit, prop bbox | **PASS** |
| Tes pemulihan galeri / Back dan catatan cek interaksi | **PASS — 16 check tercatat** |
| Screenshot Atrium pada 0 / 50 / 100 | **PASS** |
| Screenshot rescue, keadaan rumah, reduced motion | **PASS (sebagai bukti capture)** |
| Pengecekan semua screenshot oleh manusia | **NOT VERIFIED** |
| Uji satu jempol pada ponsel fisik | **NOT VERIFIED** |
| Persetujuan art direction final | **NOT SIGNED OFF** |

**Keputusan R13:** baseline browser telah didapat dan dipertahankan. Lanjutkan R14 menggunakan bukti ini; prioritas visual berat ada di R16 (sungai) dan R17 (rumah). R13 sendiri **tidak** mengubah kode tampilan situs.
