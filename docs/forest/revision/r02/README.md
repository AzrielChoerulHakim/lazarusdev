# R02 — Entrance statis

Implementasi pasangan Entrance desktop/mobile berdasarkan keputusan R01. Situs menggunakan teks HTML, ilustrasi environment baru, dan Paperkeeper transparan sebagai layer terpisah.

- [Preview dua ukuran](preview.html): iframe situs aktual pada 1440×900 dan 390×844, bukan screenshot.
- [Catatan keputusan dan verifikasi](review-record.md).
- [Sumber dan brief produksi](../../../../storybook/assets/entrance/r02/sources.json).
- [Manifest hash, ukuran, alpha dan baseline kaki](../../../../storybook/assets/entrance/r02/manifest.json).
- [CSS Entrance](../../../../src/storybook/styles/entrance-r02.css).

## Menjalankan

```sh
npm install --no-package-lock
npm run dev
```

Buka `/docs/forest/revision/r02/preview.html` dari alamat server Vite, atau langsung `/` dan `/storybook/`. Jalankan melalui HTTP; jangan membuka source HTML memakai `file://`.

## Ekspor dan pemeriksaan

```sh
npm run assets:r02
npm run check:r02:assets
npm run build
npm run build:storybook
```

`assets:r02` hanya resize proporsional dan encode PNG menjadi WebP. Ia tidak mengubah komposisi atau menggambar ulang. Versi Sharp dipatok di `package.json`; manifest merekam versi codec dan hash hasil. Audit menggunakan hasil yang tersimpan, sehingga perbedaan codec pada platform lain tidak mengganti hasil produksi tanpa sengaja.

Browser QA memakai Playwright 1.56.1 dan axe-core 4.10.3. Workflow `.github/workflows/forest-r02.yml` menyiapkan mirror kedua build di `/lazarusdev/`, kemudian menjalankan `npm run check:r02`, smoke Entrance, dan smoke editorial. `CHROME_PATH` dapat menunjuk Chromium lokal; default CI memakai Google Chrome. `R02_REPORT_PATH` memilih lokasi JSON diagnostik. Tidak ada pengambilan screenshot atau video.

R03 mengambil PNG karakter dan baseline alpha sebagai patokan untuk menggambar acting baru. R02 tidak menghasilkan frame animasi atau memperluas ilustrasi ke empat bab lain.
