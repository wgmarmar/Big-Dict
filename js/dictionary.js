let dictionaryData = [];
const resultsDiv = document.getElementById('results');

// 1. โหลดข้อมูลจาก API
async function loadData() {
    try {
        const res = await fetch('/api/get-dictionary');
        dictionaryData = await res.json();
        // 🔥 เพิ่มบรรทัดนี้: ให้แสดงข้อมูลทั้งหมดทันทีที่โหลดเสร็จ
        renderResults(dictionaryData); 
    } catch (err) {
        console.error("Load Error:", err);
    }
}

function search() {
    const query = document.getElementById('search').value.toLowerCase().trim();
    if (!query) { 
        resultsDiv.innerHTML = ''; 
        return; 
    }

    const filtered = dictionaryData.filter(item => {
        // ดึงค่าจากฟิลด์ต่างๆ มาทำเป็นตัวเล็กให้หมด
        const wordText = (item.word || "").toLowerCase();
        const meaningText = (item.meaning || "").toLowerCase();
        const keywordText = (item.keyword || "").toLowerCase();
        const tagText = (item.tag || "").toLowerCase(); // ✅ เพิ่มการดึง Tag มาเช็ค

        // ค้นหาว่าคำที่พิมพ์ (query) มีอยู่ในฟิลด์ไหนบ้าง
        return wordText.includes(query) || 
               meaningText.includes(query) || 
               keywordText.includes(query) || 
               tagText.includes(query); // ✅ ถ้าพิมพ์ #latin แล้วใน tag มีคำนี้ ก็จะเจอทันที
    });
    
    renderResults(filtered);
    trackSearch(query, filtered.length > 0);
}

function renderResults(data) {
    resultsDiv.innerHTML = data.length === 0 ? '<div class="no-result">ไม่พบข้อมูล...</div>' : '';
    
    data.forEach(item => {
        const div = document.createElement('div');
        div.className = 'card';
        
        // สร้าง HTML สำหรับ Tag (ถ้ามี)
        const tagHTML = item.tag ? `<span style="background: #e1f5fe; color: #039be5; padding: 2px 8px; border-radius: 10px; font-size: 11px; margin-left: 5px; vertical-align: middle;">${item.tag}</span>` : '';

        div.innerHTML = `
            <div class="word-header">
                <div class="word">${item.word || "ไม่มีชื่อคำศัพท์"} ${tagHTML}</div>
                <div class="meaning">${item.meaning || ""}</div>
            </div>
            <div class="definition">${item.define || ""}</div>
            <div class="law-systems">
                <div class="law-box">
                    <span class="law-label">Common / Civil</span>
                    ${item.common || '-'} / ${item.civil || '-'}
                </div>
            </div>
            <div class="refer">อ้างอิง: ${item.refer || '-'}</div>
        `;
        resultsDiv.appendChild(div);
    });
}

// 4. บันทึกสถิติ
async function trackSearch(query, isFound) {
    if (localStorage.getItem('cookie_consent') !== 'accepted') return;
    try {
        await fetch('/api/log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ word: query, found: isFound })
        });
    } catch (e) {}
}

loadData();
