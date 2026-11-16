# R01 — Matriks gerak v0.1

Semua waktu berikut target eksplorasi untuk R03–R06, belum hasil implementasi. 8–12 fps mengacu pada cadence gambar karakter; transisi UI mengikuti rendering browser yang mulus. Memperlambat CSS menjadi `steps()` bukan pengganti gambar pose.

| ID / tujuan | Trigger pointer / keyboard / touch | Aksi dan target waktu | Keadaan akhir / replay | Reduced motion / no-JS |
|---|---|---|---|---|
| M01 Entrance: mengarahkan perhatian ke jalan | Buka atlas lewat summary native: klik / Enter atau Space / tap | Kepala 0–180 ms; lengan naik 180–650; hold 650–950; tas/jubah settle 950–1250 | Pose akhir tenang. Satu respons per pembukaan setelah selesai; tutup atlas tidak memutar balik paksa | Pose lentera final statis; details langsung membuka. No-JS tetap memiliki atlas dan pose statis |
| M02 Path: menjelaskan arah | Aktifkan Reveal route: klik / keyboard / tap | Trace 450–700 ms; opsional satu langkah 900–1200 ms bila frame contact/down/passing/up tersedia | Rute terlihat; kaki berhenti pada tanah. Tidak berulang otomatis ketika scroll melintas | Rute langsung tampil, karakter diam; tanpa JS rute statis dan link bab tetap ada |
| M03 Work: mengakui pilihan | Buka folio: klik / Enter / tap | Head/hat turn ke arah folio 450–650 ms, shoulder follow kecil | Diam menghadap pilihan. Pilihan cepat terbaru menggantikan target, tanpa antrian gesture | Detail langsung buka; pose netral. Native details/anchor tetap bekerja |
| M04 River: membaca | Buka detail note: klik / Enter atau Space / tap | Kepala turun dan satu halaman berubah 650–900 ms | Diam membaca; aksi tidak terjadi saat sekadar hover | Pose membaca statis; isi langsung tersedia |
| M05 House: menghidupkan tempat | Toggle windows: klik / keyboard / tap | Jendela 200–300 ms; head/lantern acknowledgment 550–750 ms | Glow mengikuti status tombol; karakter diam. Off tidak meninggalkan cahaya menyala | Opacity/state berubah segera; tanpa JS window hangat statis |
| M06 Perpindahan bab: orientasi | Native scroll memasukkan seam ke viewport | Opsional satu ink mark 450–700 ms | Tetap tergambar, satu kali per page load | Mark sudah terlihat; isi tidak disembunyikan |
| M07 Kontrol UI | Focus/hover untuk indikator; aktivasi untuk aksi | Warna/underline 120–180 ms, buka details tidak menunggu | State sesuai kontrol, fokus jelas | State segera; underline/focus tetap jelas |

## Perilaku bersama

- Aksi klik, buka details atau navigasi selalu berlangsung segera; karakter tidak memblokir kontrol.
- M01 tidak berjalan pada page load. Karakter diam sudah harus menarik. Opening atlas menjadi aksi yang setara di semua input; tidak menambah tombol demo di halaman utama.
- Maksimal satu aksi karakter dalam viewport; tidak ada loop ambient atau scroll-driven puppet. Gesture opsional tidak dimuat sebelum scene mendekat.
- Menutup tab/berpindah ke background: hentikan scheduler. Kembali ke tab menampilkan pose stabil; tidak mengejar frame tertinggal.
- Keluar viewport: selesaikan secara logis pada pose akhir, hentikan render. Reduced motion yang berubah saat playback langsung memilih pose akhir.
- Navigasi anchor boleh meninggalkan scene kapan saja. Jangan menahan scroll, menggeser fokus, atau menunggu aksi selesai.
- Frame gagal decode: pose statis yang sudah ada tetap terlihat; aksi substantif tetap bekerja. Keadaan siap membutuhkan preload/decode frame yang benar-benar akan dipakai.
- Gesture tidak mengumumkan narasi dekoratif berulang di live region. Status fungsional seperti jendela/brief tetap diumumkan bila membantu pengguna.

## Kontrak produksi R03

Setiap frame menyertakan nama aksi, orientasi, ukuran canvas konsisten, baseline kaki, pivot, waktu hold, sumber dan hash. Ekspor resolusi cukup untuk ukuran CSS dan DPR sasaran; target awal master tinggi sekitar 900–1200 px untuk hero, optimalkan sesuai hasil. Jangan menganggap angka resolusi sebagai bukti kualitas.

Kaki contact menahan titik tanah ketika badan berpindah; timing tidak dibuat seragam jika fase aksi membutuhkan hold. Satchel strap dan tangan tetap tersambung. Transform seluruh cutout hanya boleh untuk penempatan scene, bukan simulasi head-turn. Detail motif tidak boleh berubah antarframe seperti gambar berbeda.

Preview R03 harus memperlihatkan gerak pada ukuran tampil dan kecepatan asli, ditambah urutan frame untuk menilai anatomi. R01 tidak memasang player animasi yang berpura-pura menjadi hasil produksi.
