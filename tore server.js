warning: in the working copy of 'server.js', LF will be replaced by CRLF the next time Git touches it
[1mdiff --git a/server.js b/server.js[m
[1mindex 47bfff8..98c4406 100644[m
[1m--- a/server.js[m
[1m+++ b/server.js[m
[36m@@ -1,156 +1,821 @@[m
[31m-const express = require("express");[m
[31m-const midtransClient = require("midtrans-client");[m
[31m-const path = require("path");[m
[31m-require("dotenv").config();[m
[31m-[m
[31m-const app = express();[m
[31m-const PORT = 3000;[m
[31m-[m
[31m-const GOOGLE_SCRIPT_URL =[m
[31m-  "https://script.google.com/macros/s/AKfycbyveHvyVVFHAgEXh6dANiVxw9RsnYf2hGzl22Nc3Ca6Ovcmol3yJPRahSpsiSddJDqD/exec";[m
[31m-[m
[31m-app.use(express.json({ type: ["application/json", "text/plain"] }));[m
[31m-app.use(express.static(path.join(__dirname)));[m
[31m-[m
[31m-const snap = new midtransClient.Snap({[m
[31m-  isProduction: false,[m
[31m-  serverKey: process.env.MIDTRANS_SERVER_KEY,[m
[31m-  clientKey: process.env.MIDTRANS_CLIENT_KEY[m
[31m-});[m
[31m-[m
[31m-app.get("/api/test", (req, res) => {[m
[31m-  res.json({ success: true, message: "Server Kopi Avicena aktif" });[m
[31m-});[m
[31m-[m
[31m-// Client Key boleh dikirim ke browser karena memang digunakan oleh Snap.js.[m
[31m-app.get("/api/midtrans-config", (req, res) => {[m
[31m-  if (!process.env.MIDTRANS_CLIENT_KEY) {[m
[31m-    return res.status(500).json({[m
[31m-      success: false,[m
[31m-      message: "MIDTRANS_CLIENT_KEY belum ada di file .env"[m
[31m-    });[m
[32m+[m[32m/* =========================================================[m
[32m+[m[32m   DATA[m
[32m+[m[32m   ========================================================= */[m
[32m+[m[32mconst INSTAGRAM_URL = 'https://www.instagram.com/'; // Ganti dengan profil Instagram Kopi Avicena yang sebenarnya[m
[32m+[m
[32m+[m[32mconst REGIONS = {[m
[32m+[m[32m  aceh: {[m
[32m+[m[32m    id:'aceh', name:'Gayo, Aceh', short:'Aceh', loc:'Dataran Tinggi Gayo, Aceh Tengah',[m
[32m+[m[32m    tagline:'Rumah kopi organik terluas di Sumatra.',[m
[32m+[m[32m    story:'Di ketinggian 1.200–1.700 mdpl, kebun-kebun kopi Gayo tumbuh berdampingan dengan hutan lindung Taman Nasional Gunung Leuser. Sebagian besar petani Gayo mengelola kebun secara organik turun-temurun, menjadikan kawasan ini salah satu penghasil kopi organik tersertifikasi terbesar di dunia.',[m
[32m+[m[32m    farmer:'Kelompok tani di Kecamatan Bebesen memilih memproses sebagian panen dengan metode wine process — fermentasi panjang dalam tangki tertutup — untuk menonjolkan karakter buah yang jarang ditemui pada kopi Sumatra pada umumnya.',[m
[32m+[m[32m    motif:'aceh', accent:'#8C3B2E',[m
[32m+[m[32m    image:'gayoaceh.png'[m
[32m+[m[32m  },[m
[32m+[m
[32m+[m[32m  toraja: {[m
[32m+[m[32m    id:'toraja', name:'Sapan, Toraja', short:'Toraja', loc:'Tana Toraja, Sulawesi Selatan',[m
[32m+[m[32m    tagline:'Kopi dari tanah leluhur Tongkonan.',[m
[32m+[m[32m    story:'Dataran tinggi Sapan berada di lereng pegunungan Toraja, dikelilingi rumah adat Tongkonan dan tradisi pertanian yang dijaga ketat oleh adat setempat. Tanah vulkanik dan naungan pohon dadap membuat biji kopi Toraja dikenal bertubuh tebal dengan keasaman rendah.',[m
[32m+[m[32m    farmer:'Petani Sapan memilih proses honey — sebagian lendir buah dipertahankan saat pengeringan — menghasilkan rasa manis alami menyerupai gula aren yang khas.',[m
[32m+[m[32m    motif:'toraja', accent:'#8f6427',[m
[32m+[m[32m    image:'sapantoraja.png'[m
[32m+[m[32m  },[m
[32m+[m
[32m+[m[32m  bali: {[m
[32m+[m[32m    id:'bali', name:'Kintamani, Bali', short:'Bali', loc:'Kintamani, Kabupaten Bangli, Bali',[m
[32m+[m[32m    tagline:'Kopi yang tumbuh berdampingan dengan jeruk.',[m
[32m+[m[32m    story:'Petani Kintamani menanam kopi dalam sistem subak abian — pola tanam tumpang sari khas Bali yang diatur oleh awig-awig (aturan adat) dan berdampingan dengan pura kahyangan tiga. Kopi ditanam berdekatan dengan pohon jeruk bali, memberi aroma citrus alami yang menjadi ciri khasnya.',[m
[32m+[m[32m    farmer:'Proses natural (dikeringkan utuh bersama kulit buah) dipilih untuk mempertahankan rasa manis dan aroma jeruk yang menonjol.',[m
[32m+[m[32m    motif:'bali', accent:'#33503f',[m
[32m+[m[32m    image:'kintamanibali.png'[m
[32m+[m[32m  },[m
[32m+[m
[32m+[m[32m  flores: {[m
[32m+[m[32m    id:'flores', name:'Bajawa, Flores', short:'Flores', loc:'Bajawa, Kabupaten Ngada, NTT',[m
[32m+[m[32m    tagline:'Ditanam di kaki Gunung Inerie.',[m
[32m+[m[32m    story:'Bajawa terletak di kaki Gunung Inerie yang masih aktif, dengan tanah vulkanik subur dan suhu sejuk sepanjang tahun. Kebun kopi di sini umumnya dikelola keluarga kecil dalam skala 0,5–2 hektare, dinaungi pohon kayu keras untuk menjaga kelembapan tanah.',[m
[32m+[m[32m    farmer:'Full wash dipilih agar karakter cokelat hitam dan karamel dari biji tetap bersih dan konsisten dari panen ke panen.',[m
[32m+[m[32m    motif:'flores', accent:'#33503f',[m
[32m+[m[32m    image:'bajawaflores.png'[m
[32m+[m[32m  },[m
[32m+[m
[32m+[m[32m  sidikalang: {[m
[32m+[m[32m    id:'sidikalang', name:'Mandailing, Sidikalang', short:'Sidikalang', loc:'Sidikalang, Kabupaten Dairi, Sumatra Utara',[m
[32m+[m[32m    tagline:'Karakter klasik kopi Sumatra.',[m
[32m+[m[32m    story:'Sidikalang adalah kota pasar bagi kopi-kopi dataran tinggi Dairi, sebuah kawasan yang menjadi tolok ukur rasa "kopi Sumatra klasik" — body berat, keasaman rendah, dan jejak rempah earthy yang khas berkat metode giling basah warisan Belanda.',[m
[32m+[m[32m    farmer:'Proses giling basah (wet-hulled) dilakukan saat biji masih lembap, mempercepat pengeringan di iklim tropis dan menghasilkan karakter rasa yang tebal dan intens.',[m
[32m+[m[32m    motif:'sidikalang', accent:'#8C3B2E',[m
[32m+[m[32m    image:'mandailingsi.png'[m
[32m+[m[32m  },[m
[32m+[m
[32m+[m[32m  preanger: {[m
[32m+[m[32m    id:'preanger', name:'Preanger, Jawa Barat', short:'Jawa Barat', loc:'Dataran Tinggi Priangan, Jawa Barat',[m
[32m+[m[32m    tagline:'Warisan varietas heirloom Priangan.',[m
[32m+[m[32m    story:'Nama "Preanger" merujuk pada kejayaan kopi Priangan sejak abad ke-18. Kini, petani di lereng Gunung Malabar dan Puntang menghidupkan kembali varietas heirloom peninggalan masa itu, ditanam berdampingan dengan kebun teh di ketinggian 1.000–1.600 mdpl.',[m
[32m+[m[32m    farmer:'Diproses full wash secara tradisional, menghasilkan cangkir bersih dengan sentuhan rempah manis dan tembakau ringan yang menjadi ciri khas Preanger.',[m
[32m+[m[32m    motif:'preanger', accent:'#B8863B',[m
[32m+[m[32m    image:'preangerja.png'[m
[32m+[m[32m  },[m
[32m+[m
[32m+[m[32m  humbahas: {[m
[32m+[m[32m    id:'humbahas', name:'Lintong, Humbahas', short:'Humbahas', loc:'Humbang Hasundutan, tepian Danau Toba',[m
[32m+[m[32m    tagline:'Tumbuh di tanah vulkanik tepi Danau Toba.',[m
[32m+[m[32m    story:'Kawasan Lintong berada di dataran tinggi Humbang Hasundutan, tak jauh dari Danau Toba — kaldera vulkanik terbesar di dunia. Tanah vulkanik yang kaya mineral membuat kopi Lintong menjadi salah satu varian Sumatra yang paling dicari kolektor.',[m
[32m+[m[32m    farmer:'Petani Batak setempat menjaga tradisi giling basah dari generasi ke generasi, menghasilkan cangkir dengan body creamy dan sentuhan herbal segar.',[m
[32m+[m[32m    motif:'humbahas', accent:'#33503f',[m
[32m+[m[32m    image:'lintonglum.png'[m
[32m+[m[32m  },[m
[32m+[m
[32m+[m[32m  papua: {[m
[32m+[m[32m    id:'papua', name:'Baliem, Wamena', short:'Papua', loc:'Lembah Baliem, Wamena, Papua Pegunungan',[m
[32m+[m[32m    tagline:'Salah satu kopi tertinggi dan termurni di Indonesia.',[m
[32m+[m[32m    story:'Lembah Baliem berada di ketinggian 1.600–2.000 mdpl, dikelilingi pegunungan Jayawijaya. Suku Lani dan Dani menanam kopi secara organik turun-temurun tanpa pupuk maupun pestisida kimia — sebagian besar kebun bahkan belum pernah tersentuh bahan kimia sama