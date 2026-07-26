# ResQFood 🥦
> Platform Penyelamat Makanan Surplus Bisnis F&B Indonesia

ResQFood adalah MVP (Minimum Viable Product) untuk platform manajemen makanan surplus. Aplikasi ini memungkinkan merchant F&B (restoran, kafe, bakery) untuk menjual makanan yang hampir kedaluwarsa dengan harga diskon, sehingga mengurangi food waste dan membantu lingkungan.

## Fitur Utama ✨
- **Dynamic Pricing:** Harga diskon otomatis bertambah seiring mendekatnya waktu kedaluwarsa (hingga 50% tambahan diskon!).
- **Dashboard Merchant:** Untuk mengelola listing makanan surplus, melihat analitik penjualan, dan mengonfirmasi klaim pesanan.
- **Portal Konsumen:** Untuk mencari, memesan, dan melacak penghematan uang.
- **Gamifikasi:** Pengguna mendapatkan ResQ Poin dari setiap makanan yang diselamatkan.

## Prototipe Mobile (Figma) 📱🎨
Lihat rancangan dan prototipe desain aplikasi mobile (Pembeli & Penjual) di Figma:
👉 **[Prototipe Mobile ResQFood di Figma](https://www.figma.com/design/EApYu5MVVVyH2OnEqu2UJy/ResQFood?node-id=0-1&t=chphF15VGhsWxSGC-1)**


## Arsitektur & Teknologi 🛠️
Aplikasi ini dibangun menggunakan arsitektur micro-services:
- **Frontend:** HTML, CSS, Vanilla JS (Nginx)
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL
- **Orkestrasi:** Docker Compose

## Tutorial Menjalankan MVP (Panduan untuk Temanmu) 🚀

### Prasyarat:
1. Pastikan **Docker Desktop** sudah terinstall dan berjalan di komputermu. Kamu bisa mengunduhnya di [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/).
2. Kamu juga perlu **Git** untuk meng-clone repository ini.

### Langkah-langkah:

**1. Clone Repository Ini**
Buka terminal (Command Prompt/PowerShell) dan jalankan:
```bash
git clone https://github.com/favia/KWUproject.git
cd KWUproject
```
*(Ganti `favia` dengan username GitHub-mu jika URL-nya berbeda).*

**2. Setup Environment Variables**
Aplikasi ini membutuhkan file `.env`. Kamu bisa menyalin dari template yang sudah disediakan:
```bash
# Di Windows/Linux/Mac:
cp .env.example .env
```
File `.env` berisi konfigurasi database (DB_USER, DB_PASSWORD, dll). Default-nya sudah cukup untuk dijalankan secara lokal.

**3. Jalankan Aplikasi dengan Docker Compose**
Di dalam folder `KWUproject`, jalankan perintah ajaib ini:
```bash
docker-compose up -d --build
```
*Tunggu beberapa saat sampai Docker selesai mengunduh image dan membangun container untuk Frontend, Backend, dan Database.*

**4. Akses Aplikasi! 🎉**
- Buka browsermu (Chrome/Safari/Firefox).
- Kunjungi **[http://localhost:8080](http://localhost:8080)**.

**5. Cara Mencoba (Role-play):**
*   **Sebagai Konsumen:** Di pojok kanan atas, pilih akun "ResQ Hero". Coba cari makanan, filter berdasarkan kategori, dan lakukan pemesanan!
*   **Sebagai Merchant:** Di pojok kanan atas, ganti akun ke salah satu Merchant (misal: Sakura Sushi). Coba tambahkan listing makanan baru, kelola stok, dan lihat laporan pendapatanmu di tab "Laporan Keuangan & Analitik".

### Jika Ingin Mematikan Aplikasi:
Jalankan perintah ini di terminal:
```bash
docker-compose down
```

---
*Dibuat untuk project Kewirausahaan - Selamat menyelamatkan makanan! 🌍*
