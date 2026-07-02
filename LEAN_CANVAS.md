# 🥦 Lean Canvas – ResQFood
> *Platform Penyelamat Makanan Surplus Bisnis F&B Indonesia*
> Dibuat berdasarkan sistem: `backend/server.js`, `frontend/index.html`, `backend/db.js`

---

## ⚠️ 1. Masalah *(Problem)*
> *2 masalah utama yang ingin diselesaikan ResQFood*

- 🗑️ **Food waste masif:** Restoran & bakery membuang 20–40% makanan setiap hari karena tidak terjual sebelum kedaluwarsa
- 💸 **Kerugian merchant:** Makanan yang dibuang = uang yang hilang tanpa menghasilkan pendapatan sama sekali

### Alternatif yang Ada Saat Ini
- Membuang langsung ke tempat sampah
- Memberikan ke karyawan (tidak optimal & tidak terstruktur)
- Diskon manual yang tidak konsisten dan tidak terukur

---

## 💡 2. Solusi *(Solution)*
> *Fitur inti yang menjawab 3 masalah di atas*

- 🤖 **Dynamic Pricing Otomatis:** Diskon bertambah otomatis seiring mendekati waktu kedaluwarsa

  | Sisa Waktu        | Tambahan Diskon |
  |-------------------|-----------------|
  | > 24 jam          | +10%            |
  | 12 – 24 jam       | +25%            |
  | 6 – 12 jam        | +25%            |
  | < 6 jam           | +50%            |
  | Sudah kedaluwarsa | Tidak aktif     |

- 🌐 **Platform web langsung:** Merchant listing & konsumen pesan — tanpa perlu install aplikasi
- 📊 **Dashboard merchant:** Analitik penjualan, laporan keuangan harian, manajemen stok real-time
- 🏆 **Gamifikasi:** ResQ Poin dari setiap makanan yang berhasil diselamatkan

---

## ⭐ 3. Unique Value Proposition *(UVP)*
> *Mengapa orang memilih ResQFood dibanding yang lain?*

> **"Selamatkan makanan dan hemat uang — dari restoran terbaik, dengan harga terbaik, dalam satu klik."**

### Untuk Konsumen 🛒
- ✅ Makanan restoran berkualitas dengan **diskon hingga 70%**
- ✅ Makin dekat kedaluwarsa → **makin murah secara otomatis**
- ✅ **ResQ Poin** dari setiap makanan yang berhasil diselamatkan
- ✅ Transparansi penuh: porsi tersisa & jam pengambilan yang jelas

### Untuk Merchant F&B 🏪
- ✅ **Pendapatan tambahan** dari makanan yang sebelumnya akan dibuang
- ✅ Kurangi kerugian *food waste* secara signifikan
- ✅ **Laporan keuangan & analitik penjualan** harian otomatis
- ✅ Nilai tambah: citra bisnis yang **ramah lingkungan**

---

## 🔐 4. Keunggulan Tak Tertandingi *(Unfair Advantage)*
> *Apa yang sulit ditiru kompetitor?*

- 🤖 **Algoritma Dynamic Pricing** berbasis waktu kedaluwarsa yang sudah berjalan otomatis
- 🌐 Platform web **tanpa install** — *frictionless onboarding* untuk semua segmen
- 📈 Data historis transaksi yang terakumulasi → **network effect**
- 🥦 Branding **"food rescue"** yang kuat di komunitas peduli lingkungan
- 🐳 Infrastruktur **Docker** yang memudahkan scaling & deployment cepat

---

## 👥 5. Segmen Pelanggan *(Customer Segments)*
> *Siapa yang dilayani ResQFood?*

| Segmen | Deskripsi |
|--------|-----------|
| 🌱 **Konsumen Hemat & Peduli Lingkungan** | Pembeli yang mau makanan enak dari restoran terpercaya dengan harga lebih murah |
| 🍽️ **Restoran & Kafe (Merchant F&B)** | Bisnis yang selalu punya sisa makanan tidak terjual setiap harinya |
| 🍞 **Bakery & Coffee Shop** | Usaha yang selalu punya roti/kue sisa di akhir hari operasional |
| 🥗 **Dapur Sehat & Salad Bar** | Penyedia makanan sehat dengan bahan segar yang cepat kedaluwarsa |

### Early Adopters 🎯
- Mahasiswa & profesional muda yang **price-sensitive** tapi peduli kualitas
- Komunitas **zero-waste** & pecinta lingkungan hidup

---

## 📊 6. Metrik Utama *(Key Metrics)*
> *Angka apa yang menunjukkan ResQFood berjalan dengan baik?*

| Metrik | Deskripsi |
|--------|-----------|
| 💰 **GMV** | Gross Merchandise Value — total nilai transaksi per bulan |
| 📦 **Claim Rate** | Persentase listing aktif yang berhasil dipesan konsumen |
| 👤 **DAU** | Daily Active Users (merchant & konsumen) |
| 🏪 **Merchant Aktif** | Jumlah merchant yang listing secara rutin |
| 🔁 **Repeat Order Rate** | Persentase konsumen yang memesan lebih dari sekali |
| 💳 **Revenue Komisi** | Total pendapatan komisi platform per bulan |

---

## 📣 7. Saluran *(Channels)*
> *Bagaimana orang menemukan dan menggunakan ResQFood?*

- 🌐 **Aplikasi web** yang bisa diakses langsung dari browser *(tidak perlu install)*
- 📱 **Media sosial** & komunitas pencinta lingkungan (Instagram, TikTok, WhatsApp Group)
- 🤝 **Kerja sama B2B langsung** dengan restoran & kafe lokal
- 👄 **Word of mouth** dari konsumen yang sudah hemat dan puas
- 🐳 Kemudahan deploy via **Docker Compose** untuk mitra teknologi

---

## 💸 8. Struktur Biaya *(Cost Structure)*
> *Apa yang perlu dikeluarkan untuk menjalankan ResQFood?*

| Jenis Biaya | Keterangan | Prioritas |
|-------------|------------|-----------|
| ☁️ **Server & Cloud** | Menjalankan backend Node.js, database PostgreSQL, dan frontend Nginx | 🔴 Tinggi |
| 👨‍💻 **Pengembangan & Pemeliharaan** | Gaji tim developer & DevOps untuk maintain & iterasi fitur | 🔴 Tinggi |
| 📣 **Pemasaran & Akuisisi** | Digital marketing untuk onboarding merchant & konsumen baru | 🟡 Sedang |
| 🎧 **Dukungan Pelanggan** | Layanan bantuan untuk merchant & konsumen | 🟡 Sedang |
| 🔐 **Keamanan & Infrastruktur** | SSL, backup database, monitoring sistem, Docker orchestration | 🟡 Sedang |

---

## 💰 9. Aliran Pendapatan *(Revenue Streams)*
> *Dari mana pendapatan ResQFood berasal?*

| Sumber Pendapatan | Deskripsi | Model |
|-------------------|-----------|-------|
| 💳 **Komisi per Transaksi** | Persentase dari setiap makanan yang berhasil terjual melalui platform | Pay-per-use |
| 📦 **Langganan Merchant** | Akses fitur premium: analitik lanjutan & prioritas tampil di listing | Subscription |
| 📣 **Promosi Berbayar** | Merchant membayar agar listing-nya tampil di urutan teratas | Advertising |

---

## 🌍 Proposisi Inti ResQFood

> **ResQFood menjadi jembatan antara makanan surplus dari restoran dan konsumen yang ingin berhemat, sambil secara nyata mengurangi food waste di Indonesia.**

```
Merchant punya sisa makanan → ResQFood tampilkan dengan harga diskon otomatis →
Konsumen pesan & ambil langsung di toko → Makanan terselamatkan →
Bumi lebih hijau 🌱 + Merchant dapat pendapatan + Konsumen hemat
```

---

## 🔄 Perbedaan Lean Canvas vs Business Model Canvas

| Aspek | Business Model Canvas | Lean Canvas |
|-------|-----------------------|-------------|
| **Fokus** | Bisnis yang sudah berjalan | Startup / validasi ide awal |
| **Blok Unik** | Key Partners, Key Activities, Customer Relationships | Problem, Solution, Key Metrics, Unfair Advantage |
| **Tujuan** | Peta bisnis lengkap | Validasi hipotesis cepat |

---

*© 2026 ResQFood – Dibuat dengan cinta untuk masa depan bumi yang lebih hijau* 🥦
