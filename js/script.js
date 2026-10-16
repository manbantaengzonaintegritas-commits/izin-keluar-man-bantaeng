// URL Web App Google Apps Script Anda
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz5IwgVlRnGbqNc2KTdrE_8CEm04sma-nM9cPZ43aSMYMSP7-f8O1mFVcWpdgknvwVs/exec'; 

const form = document.getElementById('izinForm');
const statusMsg = document.getElementById('statusMsg');
const submitBtn = document.getElementById('submitBtn');
const tableBody = document.getElementById('tableBody');

form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Menyimpan...';
    statusMsg.textContent = '';
    statusMsg.style.color = '#333';

    const formData = {
        nama: form.nama.value,
        kelas: form.kelas.value,
        hari: form.hari.value,
        tanggal: form.tanggal.value,
        jam: form.jam.value,
        bulan: form.bulan.value,
        pemberiIzin: form.pemberiIzin.value,
        alasan: form.alasan.value
    };

    // Menggunakan text/plain untuk menghindari masalah CORS preflight di Google Apps Script
    fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify(formData),
        headers: {
            'Content-Type': 'text/plain;charset=utf-8'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            statusMsg.textContent = '✅ ' + data.message;
            statusMsg.style.color = '#1b5e20';
            form.reset();
            loadDashboardData(); // Muat ulang dashboard
        } else {
            statusMsg.textContent = '❌ Gagal: ' + data.message;
            statusMsg.style.color = '#d32f2f';
        }
    })
    .catch(error => {
        statusMsg.textContent = '❌ Terjadi kesalahan jaringan.';
        statusMsg.style.color = '#d32f2f';
        console.error('Error:', error);
    })
    .finally(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Kirim Permohonan Izin';
    });
});

function loadDashboardData() {
    tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Memuat data...</td></tr>';
    
    fetch(`${SCRIPT_URL}?action=getData`)
    .then(response => response.json())
    .then(data => {
        tableBody.innerHTML = '';
        if (data.status === 'error') {
            tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:red;">${data.message}</td></tr>`;
            return;
        }
        
        if (data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Belum ada data izin.</td></tr>';
            return;
        }

        data.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${row.timestamp}</td>
                <td><strong>${row.nama}</strong></td>
                <td><span style="background:#d4af37; color:#fff; padding:2px 6px; border-radius:4px; font-size:12px;">${row.kelas}</span></td>
                <td>${row.hari}, ${row.tanggal} ${row.bulan}</td>
                <td>${row.jam}</td>
                <td>${row.pemberiIzin}</td>
                <td><em>${row.alasan}</em></td>
            `;
            tableBody.appendChild(tr);
        });
    })
    .catch(error => {
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:red;">Gagal memuat data.</td></tr>';
        console.error('Error:', error);
    });
}

// Muat data saat halaman pertama kali dibuka
document.addEventListener('DOMContentLoaded', loadDashboardData);
