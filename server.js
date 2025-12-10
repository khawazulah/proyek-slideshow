const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config(); // Memuat variabel dari .env

const app = express();
const PORT = process.env.PORT || 3000;

// Konfigurasi Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Menyajikan file statis dari folder 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Konfigurasi Multer untuk penyimpanan ke Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'slideshow-tv', // Nama folder di Cloudinary
        format: async (req, file) => 'jpg', // Otomatis konversi ke jpg
        public_id: (req, file) => Date.now() + '-' + file.originalname.split('.').slice(0, -1).join('.'),
    },
});

const upload = multer({ storage: storage });

// Endpoint untuk mengunggah gambar (dari halaman admin.html)
app.post('/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('Tidak ada file yang diunggah.');
    }
    // req.file.path sekarang adalah URL dari Cloudinary
    res.send(`File berhasil diunggah ke Cloudinary!`);
});

// Endpoint untuk mendapatkan daftar semua gambar di folder 'uploads'
app.get('/images', async (req, res) => {
    try {
        const { resources } = await cloudinary.search.expression('folder:slideshow-tv').sort_by('public_id', 'desc').max_results(100).execute();
        const imageUrls = resources.map(file => file.secure_url);
        res.json(imageUrls);
    } catch (error) {
        console.error("Gagal mengambil gambar dari Cloudinary:", error);
        res.status(500).send('Gagal mengambil daftar gambar.');
    }
});

// Export app untuk Vercel
module.exports = app;

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server berjalan di http://localhost:${PORT}`);
    });
}