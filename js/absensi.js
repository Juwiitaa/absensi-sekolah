const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyge3Is9gm24r_5nbXnkRlPEyJfOE42SkF1zPVjZTBOETVkotYsHAerjKigcUXJ0OM/exec";
const kelas = localStorage.getItem('kelasAktif');
const namaGuru = localStorage.getItem('namaGuru');
const mapel = localStorage.getItem('mapelAktif') || '-'; 

// Sinkronisasi data ke komponen Header HTML
document.getElementById('labelKelas').innerText = kelas || '-';
document.getElementById('labelGuru').innerText = namaGuru || 'Guru';
document.getElementById('labelTanggal').innerText = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

// Menampilkan data mata pelajaran pada komponen badge dengan tambahan emoji dinamis
if (document.getElementById('labelMapel')) {
    document.getElementById('labelMapel').innerText = "📖 " + mapel;
}

let dataSiswaGlobal = [];

window.onload = function() {
    muatSiswa();
};

async function muatSiswa() {
    try {
        const response = await fetch(WEB_APP_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'getSiswa', kelas: kelas })
        });
        const siswa = await response.json();
        
        // Membuang baris pertama jika itu baris header (berisi kata "Nama Siswa")
        dataSiswaGlobal = siswa.filter(row => row[2] !== "Nama Siswa" && row[2] !== "" && row[2] !== undefined);
        
        // Memperbarui isi badge total siswa secara otomatis
        if (document.getElementById('totalSiswaBadge')) {
            document.getElementById('totalSiswaBadge').innerText = dataSiswaGlobal.length + " Siswa";
        }

        tampilkanSiswa(dataSiswaGlobal);
    } catch (error) {
        alert("Gagal memuat daftar siswa dari database!");
        document.getElementById('daftarSiswa').innerHTML = `
            <div class="bg-white p-6 rounded-2xl border border-red-100 text-center shadow-sm">
                <p class="text-sm font-semibold text-red-500">Gagal terhubung dengan server database.</p>
                <p class="text-xs text-slate-400 mt-1">Periksa kembali koneksi internet Anda.</p>
            </div>`;
    }
}

function tampilkanSiswa(siswa) {
    const wadah = document.getElementById('daftarSiswa');
    wadah.innerHTML = '';

    if (!siswa || siswa.length === 0) {
        wadah.innerHTML = `
            <div class="bg-white p-6 rounded-2xl border border-slate-100 text-center shadow-sm">
                <p class="text-sm font-semibold text-slate-700">Tidak ada data siswa</p>
                <p class="text-xs text-slate-400 mt-1">Data siswa kelas ${kelas} tidak ditemukan.</p>
            </div>`;
        return;
    }

    siswa.forEach((s, index) => {
        const namaSiswa = s[2];           // Kolom C: Nama Siswa
        const jenisKelamin = s[3] || '-';  // Kolom D: L/P

        // Modifikasi desain card item siswa agar lebih minimalis & elegan sewaktu di-render
        wadah.innerHTML += `
            <div class="bg-white p-5 rounded-2xl shadow-sm border border-slate-100/80 transition-all hover:shadow-md hover:border-slate-200/60">
                <div class="flex justify-between items-start mb-3.5">
                    <div>
                        <h3 class="font-bold text-slate-800 text-sm tracking-tight">${index + 1}. ${namaSiswa}</h3>
                        <p class="text-[10px] font-semibold text-slate-400 mt-0.5 tracking-wider uppercase">Jenis Kelamin: ${jenisKelamin}</p>
                    </div>
                </div>
                
                <div class="grid grid-cols-4 gap-2 mb-3">
                    <label class="text-center">
                        <input type="radio" name="absen_${index}" value="H" class="hidden peer" checked>
                        <div class="py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-600 peer-checked:bg-emerald-500 peer-checked:text-white peer-checked:border-emerald-500 cursor-pointer font-bold text-xs tracking-wider transition-all shadow-sm">HADIR</div>
                    </label>
                    <label class="text-center">
                        <input type="radio" name="absen_${index}" value="S" class="hidden peer">
                        <div class="py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-600 peer-checked:bg-amber-500 peer-checked:text-white peer-checked:border-amber-500 cursor-pointer font-bold text-xs tracking-wider transition-all shadow-sm">SAKIT</div>
                    </label>
                    <label class="text-center">
                        <input type="radio" name="absen_${index}" value="I" class="hidden peer">
                        <div class="py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-600 peer-checked:bg-blue-500 peer-checked:text-white peer-checked:border-blue-500 cursor-pointer font-bold text-xs tracking-wider transition-all shadow-sm">IZIN</div>
                    </label>
                    <label class="text-center">
                        <input type="radio" name="absen_${index}" value="A" class="hidden peer">
                        <div class="py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-600 peer-checked:bg-rose-500 peer-checked:text-white peer-checked:border-rose-500 cursor-pointer font-bold text-xs tracking-wider transition-all shadow-sm">ALPA</div>
                    </label>
                </div>
                
                <input type="text" id="ket_${index}" class="w-full p-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50/50 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-700 transition-all font-medium" placeholder="Tambahkan catatan alasan di sini...">
            </div>
        `;
    });
}

async function simpanAbsen() {
    const btn = document.getElementById('btnSimpan');
    const teksAwal = btn.innerHTML;
    
    btn.innerHTML = "⏳ Memproses Penyimpanan...";
    btn.disabled = true;

    let rekap = [];
    dataSiswaGlobal.forEach((s, index) => {
        const radioTerpilih = document.querySelector(`input[name="absen_${index}"]:checked`);
        const status = radioTerpilih ? radioTerpilih.value : "H";
        const keterangan = document.getElementById(`ket_${index}`).value;
        
        rekap.push({ 
            nama: s[2], 
            status: status,
            rekapKeterangan: keterangan || "-"
        });
    });

    try {
        await fetch(WEB_APP_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: 'simpanAbsen',
                kelas: kelas,
                namaGuru: namaGuru,
                mapel: mapel, 
                kehadiran: rekap
            })
        });
        
        alert("Absensi kelas " + kelas + " untuk mata pelajaran " + mapel + " sukses disimpan!");
        window.location.href = 'dashboard.html';
    } catch (error) {
        alert("Terjadi masalah sistem saat menyimpan absensi!");
        btn.innerHTML = teksAwal;
        btn.disabled = false;
    }
}