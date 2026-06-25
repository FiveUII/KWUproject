# 🥦 Business Model Canvas – ResQFood
> *Platform Penyelamat Makanan Surplus Bisnis F&B Indonesia*
> Dibuat berdasarkan sistem: `backend/server.js`, `frontend/index.html`, `backend/db.js`

---

## 🤝 1. Mitra Utama *(Key Partners)*
> *Siapa yang kamu butuhkan agar bisnis ini berjalan?*

- 🍣 **Restoran, kafe, dan bakery** yang mau mendaftarkan surplus makanan mereka
  - *(Contoh: Sakura Sushi Dago, La Boulangerie French Bakery, Healthy & Co Salad Bar)*
- 🛒 **Pelanggan konsumen** yang peduli lingkungan dan ingin berhemat
- ☁️ **Penyedia layanan cloud/hosting** untuk menjalankan server (Docker, PostgreSQL)
- 🌐 **Komunitas open-source** Node.js & PostgreSQL

---

## ⚙️ 2. Aktivitas Utama *(Key Activities)*
> *Apa yang dilakukan sistem setiap harinya?*

- 📢 Merchant mendaftarkan makanan surplus dengan harga diskon dan batas waktu kedaluwarsa
- 🤖 Sistem menghitung **diskon otomatis bertingkat** berdasarkan sisa waktu kedaluwarsa:

  | Sisa Waktu       | Tambahan Diskon |
  |-----------------|-----------------|
  | > 24 jam         | +10%            |
  | 12 – 24 jam      | +25%            |
  | 6 – 12 jam       | +25%            |
  | < 6 jam          | +50%            |
  | Sudah kedaluwarsa | Tidak aktif     |

- 🛍️ Konsumen memesan makanan dan mengambilnya langsung di toko *(bayar di kasir)*
- 📊 Merchant memantau pesanan masuk & laporan keuangan harian
- 🌍 Sistem mencatat dampak lingkungan: **kg CO₂ yang berhasil dicegah** per transaksi

---

## 💎 3. Nilai Utama yang Ditawarkan *(Value Propositions)*
> *Mengapa orang mau menggunakan ResQFood?*

### Untuk Konsumen 🛒
- ✅ Beli makanan berkualitas dari restoran terpercaya dengan **diskon hingga 70%**
- ✅ Makin mendekati kedaluwarsa → **makin murah secara otomatis**
- ✅ Dapat **ResQ Poin** dari setiap pembelian
- ✅ Tahu berapa **CO₂ dan uang yang berhasil dihemat** secara real-time

### Untuk Merchant F&B 🏪
- ✅ Hasilkan **pendapatan tambahan** dari makanan yang sebelumnya akan dibuang
- ✅ Kurangi kerugian dari *food waste*
- ✅ Dapatkan **laporan keuangan & analitik penjualan** harian (pendapatan, kategori, tingkat klaim)
- ✅ Nilai tambah: citra bisnis yang **ramah lingkungan**

---

## 👥 4. Segmen Pelanggan *(Customer Segments)*
> *Siapa yang dilayani ResQFood?*

| Segmen | Deskripsi |
|--------|-----------|
| 🌱 **Konsumen Hemat & Peduli Lingkungan** | Pembeli yang mau makanan enak dengan harga lebih murah |
| 🍽️ **Restoran & Kafe (Merchant F&B)** | Bisnis yang punya sisa makanan tidak terjual setiap hari |
| 🍞 **Bakery & Coffee Shop** | Usaha yang selalu punya roti/kue sisa di akhir hari |
| 🥗 **Dapur Sehat & Salad Bar** | Penyedia makanan sehat dengan bahan segar yang cepat kedaluwarsa |

---

## 🔗 5. Hubungan dengan Pelanggan *(Customer Relationships)*
> *Bagaimana ResQFood berinteraksi dengan pelanggan?*

- 🧭 Konsumen bisa langsung **jelajahi, pesan, dan lacak pesanan** secara mandiri lewat aplikasi
- 🏪 Merchant mendapat **dashboard mandiri** untuk kelola toko & laporan keuangan
- 🔔 Sistem **notifikasi langsung** (toast) di aplikasi saat pesanan dikonfirmasi
- 📋 **Transparansi penuh**: konsumen tahu berapa porsi tersisa, jam pengambilan, dan dampak lingkungan
- 🏆 Sistem **gamifikasi**: ResQ Poin dan papan CO₂ saved untuk mendorong loyalitas

---

## 📣 6. Saluran *(Channels)*
> *Bagaimana orang menemukan dan menggunakan ResQFood?*

- 🌐 **Aplikasi web** yang bisa diakses langsung dari browser *(tidak perlu install)*
- 📱 Media sosial & komunitas pencinta lingkungan
- 🤝 Kerja sama langsung dengan restoran & kafe lokal
- 👄 Mulut ke mulut dari konsumen yang sudah hemat dan puas

---

## 💰 7. Cara Menghasilkan Uang *(Revenue Streams)*
> *Dari mana pendapatan ResQFood berasal?*

| Sumber Pendapatan | Deskripsi |
|-------------------|-----------|
| 💳 **Komisi per transaksi** | Persentase dari setiap makanan yang berhasil terjual melalui platform |
| 📦 **Langganan merchant** | Akses fitur premium: analitik lanjutan, prioritas tampil di listing |
| 📣 **Promosi berbayar** | Merchant bisa membayar untuk listing-nya tampil di urutan teratas |

---

## 🏗️ 8. Aset Penting *(Key Resources)*
> *Apa modal utama ResQFood?*

- 💻 **Platform web** (backend API Node.js + frontend HTML/CSS/JS) yang sudah dibangun
- 🗄️ **Database terpusat** (PostgreSQL) yang menyimpan data merchant, listing, pesanan, dan dampak lingkungan
- 🤖 **Algoritma dynamic pricing** otomatis berdasarkan waktu kedaluwarsa
- 📊 **Sistem analitik** & laporan keuangan untuk merchant (pendapatan harian, kategori, tingkat klaim)
- 🌍 **Merek ResQFood** & kepercayaan komunitas
- 🐳 **Infrastruktur Docker** untuk deployment yang cepat dan andal

---

## 💸 9. Biaya Utama *(Cost Structure)*
> *Apa yang perlu dikeluarkan untuk menjalankan ResQFood?*

| Jenis Biaya | Keterangan |
|-------------|------------|
| ☁️ **Biaya server/cloud** | Menjalankan backend, database PostgreSQL, dan frontend |
| 👨‍💻 **Pengembangan & pemeliharaan** | Gaji tim developer & DevOps |
| 📣 **Pemasaran** | Akuisisi merchant dan konsumen baru |
| 🎧 **Dukungan pelanggan** | Layanan bantuan untuk merchant & konsumen |
| 🔐 **Keamanan & infrastruktur** | SSL, backup database, monitoring sistem |

---

## 🌍 Proposisi Inti ResQFood

> **ResQFood menjadi jembatan antara makanan surplus dari restoran dan konsumen yang ingin berhemat, sambil secara nyata mengurangi sampah makanan dan emisi CO₂ di Indonesia.**

```
Merchant punya sisa makanan → ResQFood tampilkan dengan harga diskon → 
Konsumen pesan & ambil → Makanan terselamatkan → 
Bumi lebih hijau 🌱 + Merchant dapat pendapatan + Konsumen hemat
```

---

*© 2026 ResQFood – Dibuat dengan cinta untuk masa depan bumi yang lebih hijau* 🥦
