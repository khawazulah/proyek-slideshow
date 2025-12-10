document.addEventListener('DOMContentLoaded', () => {
    const slideshowImage = document.getElementById('slideshow-image');
    const durationInput = document.getElementById('duration');

    let images = [];
    let currentIndex = 0;
    let slideshowInterval;

    // Fungsi untuk memulai atau me-restart slideshow
    function startSlideshow() {
        // Hentikan interval yang sedang berjalan jika ada
        if (slideshowInterval) {
            clearInterval(slideshowInterval);
        }

        // Pastikan ada gambar untuk ditampilkan
        if (images.length === 0) {
            slideshowImage.alt = "Tidak ada gambar untuk ditampilkan. Silakan unggah gambar melalui halaman admin.";
            return;
        }

        // Tampilkan gambar pertama segera
        changeImage();

        // Atur interval baru berdasarkan durasi dari input
        const duration = parseInt(durationInput.value, 10) * 1000;
        slideshowInterval = setInterval(changeImage, duration);
    }

    // Fungsi untuk mengganti gambar
    function changeImage() {
        if (images.length === 0) return;

        // Efek fade out
        slideshowImage.style.opacity = 0;

        setTimeout(() => {
            currentIndex = (currentIndex + 1) % images.length;
            slideshowImage.src = images[currentIndex]; // Langsung gunakan URL dari array
            // Efek fade in
            slideshowImage.style.opacity = 1;
        }, 1000); // Tunggu 1 detik (sesuai transisi CSS) sebelum ganti gambar
    }

    // Fungsi untuk mengambil daftar gambar dari server
    async function fetchImages() {
        try {
            const response = await fetch('/images');
            if (!response.ok) {
                throw new Error('Gagal mengambil data gambar');
            }
            images = await response.json();
            console.log('Gambar berhasil dimuat:', images);
            startSlideshow(); // Mulai slideshow setelah gambar didapat
        } catch (error) {
            console.error(error);
            slideshowImage.alt = "Gagal memuat gambar dari server.";
        }
    }

    // Event listener saat nilai durasi diubah
    durationInput.addEventListener('change', () => {
        // Validasi agar durasi tidak kurang dari 1
        if (parseInt(durationInput.value, 10) < 1) {
            durationInput.value = 1;
        }
        // Restart slideshow dengan durasi baru
        startSlideshow();
    });

    // Ambil gambar saat halaman pertama kali dimuat
    fetchImages();
});
