let dictionaryData = [];

function search() {
    const query = document.getElementById('search').value.toLowerCase().trim();
    const resultsDiv = document.getElementById('results');
    
    if (!query) {
        resultsDiv.innerHTML = ''; 
        return;
    }

    const cleanQuery = query.replace('#', '');

    // 1. กรองข้อมูลที่มีคำค้นหาปรากฏอยู่
    let filtered = dictionaryData.filter(item => {
        const searchableText = [
            item.word, item.meaning, item.misspelled, item.keyword, 
            item.note, item.tag, item.refer, item.related
        ].join(" ").toLowerCase();
        return searchableText.includes(cleanQuery);
    });

    // 2. จัดลำดับตามกฎความสำคัญ (1-8)
    filtered.sort((a, b) => {
        function getScore(item) {
            const q = cleanQuery;
            if ((item.word || "").toLowerCase().includes(q)) return 1;
            if ((item.meaning || "").toLowerCase().includes(q)) return 2;
            if ((item.misspelled || "").toLowerCase().includes(q)) return 3;
            if ((item.keyword || "").toLowerCase().includes(q)) return 4;
            if ((item.note || "").toLowerCase().includes(q)) return 5;
            if ((item.tag || "").toLowerCase().includes(q)) return 6;
            if ((item.refer || "").toLowerCase().includes(q)) return 7;
            if ((item.related || "").toLowerCase().includes(q)) return 8;
            return 99;
        }

        const scoreA = getScore(a);
        const scoreB = getScore(b);

        if (scoreA === scoreB) {
            return (a.word || "").length - (b.word || "").length;
        }
        return scoreA - scoreB;
    });

    // 3. 🔥 จำกัดผลลัพธ์ให้แสดงเพียง 10 อันดับแรก
    const limitedResults = filtered.slice(0, 10);

    renderResults(limitedResults);
}
// 2. ฟังก์ชันแสดงผล
function renderResults(data) {
    const resultsDiv = document.getElementById('results');
    if (!resultsDiv) return;
    
    resultsDiv.innerHTML = data.length === 0 ? '<div class="no-result">ไม่พบคำศัพท์ที่ใกล้เคียง</div>' : '';
    
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

// 3. ฟังก์ชันโหลดข้อมูล
async function loadData() {
    try {
        const res = await fetch('/api/get-dictionary');
        dictionaryData = await res.json();
    } catch (err) {
        console.error("Load Error:", err);
    }
}

// 4. ฟังก์ชันจัดการ Cookie (ตัวการที่เกิด Error เมื่อกี้)
function checkConsent() {
    const consent = localStorage.getItem('cookie_consent');
    const banner = document.getElementById('cookie-banner');
    
    if (consent === 'accepted') {
        if (banner) banner.style.display = 'none';
        loadData(); 
    } else {
        if (banner) banner.style.display = 'flex';
    }
}

function acceptCookie() {
    localStorage.setItem('cookie_consent', 'accepted');
    checkConsent();
}

function declineCookie() {
    window.location.href = "https://www.google.com";
}

// 5. ฟังก์ชันส่ง Feedback
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
    } catch (e) { alert("เกิดข้อผิดพลาด"); }
}

// 6. จุดเริ่มทำงาน (เรียกใช้ checkConsent หลังจากโหลดหน้าเสร็จ)
window.onload = function() {
    checkConsent();
};
