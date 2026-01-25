let dictionaryData = [];

// 1. ฟังก์ชันหลัก: ตรวจสอบคุ้กกี้ก่อนเริ่มงาน
function checkConsent() {
    const consent = localStorage.getItem('cookie_consent');
    const banner = document.getElementById('cookie-banner');
    
    if (consent === 'accepted') {
        if (banner) banner.style.display = 'none';
        loadData(); // ยอมรับแล้วค่อยไปดึงข้อมูลจาก MongoDB
    } else {
        if (banner) banner.style.display = 'flex';
    }
}

// 2. โหลดข้อมูลจาก API
async function loadData() {
    try {
        const res = await fetch('/api/get-dictionary');
        dictionaryData = await res.json();
        renderResults(dictionaryData); // แสดงข้อมูลทั้งหมดตอนเริ่มต้น
    } catch (err) {
        console.error("Load Error:", err);
    }
}

// 3. ฟังก์ชันค้นหา (Search) - ค้นได้ทุก Field รวมถึงตัวที่ซ่อน
function search() {
    const query = document.getElementById('search').value.toLowerCase().trim();
    if (!query) {
        renderResults(dictionaryData);
        return;
    }

    const cleanQuery = query.replace('#', '');
    const filtered = dictionaryData.filter(item => {
        return Object.values(item).some(val => 
            String(val).toLowerCase().includes(cleanQuery)
        );
    });
    renderResults(filtered);
}

// 4. แสดงผลการ์ดคำศัพท์ (แสดง 6 ฟิลด์ตามสั่ง)
function renderResults(data) {
    const resultsDiv = document.getElementById('results');
    if (!resultsDiv) return;

    resultsDiv.innerHTML = data.length === 0 ? '<div class="no-result">ไม่พบข้อมูล</div>' : '';
    
    data.forEach(item => {
        const div = document.createElement('div');
        div.className = 'card';
        div.innerHTML = `
            <div class="word-header">
                <div class="word-group">
                    <span class="word">${item.word || ''}</span>
                    <span class="pos">${item.pos || ''}</span>
                </div>
                <div class="meaning">${item.meaning || ''}</div>
            </div>
            <div class="definition">${item.define || ''}</div>
            ${item.note ? `<div class="note"><strong>Note:</strong> ${item.note}</div>` : ''}
            ${item.refer ? `<div class="refer" style="font-size: 0.85em; color: #888; margin-top: 12px; border-top: 1px solid #eee; padding-top: 8px;">อ้างอิง: ${item.refer}</div>` : ''}
        `;
        resultsDiv.appendChild(div);
    });
}

// 5. ปุ่มตอบรับคุ้กกี้
function acceptCookie() {
    localStorage.setItem('cookie_consent', 'accepted');
    checkConsent();
}

function declineCookie() {
    window.location.href = "https://www.google.com";
}

// 6. ส่วนของ Feedback
async function sendFeedback() {
    const text = document.getElementById('feedback-text').value.trim();
    if (!text) return alert("กรุณาพิมพ์ข้อความก่อนส่งนะครับ");

    try {
        await fetch('/api/submit-feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text })
        });
        document.getElementById('feedback-text').value = '';
        document.getElementById('feedback-msg').style.display = 'block';
    } catch (err) { alert("เกิดข้อผิดพลาด"); }
}

// --- เริ่มทำงานเมื่อโหลดหน้าจอเสร็จ ---
window.onload = checkConsent;
