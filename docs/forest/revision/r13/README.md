# R13 — Baseline visual dari browser sebenarnya

**R13 sudah dijalankan: 141 screenshot Chromium dan 16 pemeriksaan interaksi berhasil direkam dari dua rute × empat ukuran layar.** Tahap ini adalah pengumpulan bukti visual dan audit, bukan revisi ilustrasi R14–R18.
Status akhir art direction tetap **NOT SIGNED OFF** sampai PNG hasil Chromium diperiksa secara manusiawi.

## Cara melihat

1. Buka GitHub Actions → **Forest R13 - rendered visual baseline**.
2. Download artefak bernama `forest-r13-visual-<SHA>`: screenshot PNG kelima bab, seluruh poster, Atrium pada 0/50/100, galeri sesudah Back, rescue kertas, rumah dalam kondisi terang, dari **dua rute** × **empat viewport** (1440×900, 390×844, 320×720, 844×390).
3. Baca `manifest.json` untuk SHA sumber, dimensi, SHA-256 tiap PNG, status decode foto, posisi object-fit, posisi Paperkeeper dan kertas, nilai gallery scroll, fokus setelah Back, serta overflow.
4. Baca `AUDIT.md` untuk temuan otomatis dan catatan yang **belum** diverifikasi secara visual.
5. 10 screenshot pembanding desktop/ponsel dan keadaan Atrium serta cerita sungai–rumah telah dibekukan di [evidence](./evidence/), sumber commit `e6c4f80`. Baca juga [rendered visual review](./RENDERED-VISUAL-REVIEW.md) yang mendokumentasikan inspeksi gambar nyata. Versi ini tidak boleh ditimpa oleh sprint berikutnya.

## Rubrik review gambar

| Adegan | Evaluasi pada screenshot asli | Manual sign-off |
| --- | --- | --- |
| Entrance | Siluet gerbang dan Paperkeeper; ruang negatif; keterbacaan judul/CTA; pijakan | NOT SIGNED OFF |
| Winding Path | Diagonal akar dan jalan; kontras di bawah kaki; kedalaman | NOT SIGNED OFF |
| Work Clearing | Atrium menjadi fokus; poster berikut terlihat; kontrol tidak bertabrakan | NOT SIGNED OFF |
| River Stories | Hanya satu kertas yang dominan; kertas, lentera dan tangan terbaca; tidak bertabrakan dengan tombol | NOT SIGNED OFF |
| House on the Hill | Suasana senja; cahaya jendela menjadi fokus; kertas terkait fisik dengan jendela | NOT SIGNED OFF |
| Atrium | Geometri pintu konsisten dengan poster; posisi cahaya dan panjang bayangan terasa wajar | NOT SIGNED OFF |

**Hipotesis audit aset yang harus diverifikasi pada PNG:** lukisan dasar sungai punya beberapa kertas, galeri potret masih memakai crop lukisan landscape, rumah belum benar-benar senja, dan Atrium memakai material SVG geometris. Ini **bukan** klaim bahwa browser screenshot sudah diinspeksi.

Pengujian R12 tetap terpisah. Screenshot otomatis tidak menggantikan uji satu tangan pada ponsel fisik, screen reader, atau uji manusia tanpa instruksi.

## Temuan terukur dari screenshot R13

Pada potret 390×844, kotak Paperkeeper di sungai tertimpa 83% oleh panel navigasi catatan (pengukuran DOM pixel pada output Chromium). Penilaian artistik tetap dipisahkan dari verifikasi otomatis; capture script sekarang melaporkan kejadian ini sebagai `PAPERKEEPER_OBSCURED_BY_RIVER_NAV` agar tidak luput pada regresi berikutnya.
