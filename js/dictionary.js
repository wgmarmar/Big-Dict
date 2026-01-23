let dictionaryData = [];
const resultsDiv = document.getElementById('results');

// 1. โหลดข้อมูลจาก API
async function loadData() {
    try {
        const res = await fetch('/api/get-dictionary');
        dictionaryData = await res.json();
        // แสดงข้อมูลทั้งหมดทันทีที่โหลดเสร็จ
        renderResults(dictionaryData); 
    } catch (err) {
        console.error("Load Error:", err);
    }
}

// 2. ฟังก์ชันค้นหา (Search)
function search() {
    const query = document.getElementById('search').value.toLowerCase().trim();
    const resultsDiv = document.getElementById('results');
    
    if (!query) {
        renderResults(dictionaryData); // ถ้าช่องว่าง ให้โชว์ทั้งหมด
        return;
    }

    const cleanQuery = query.replace('#', ''); 

    const filtered = dictionaryData.filter(item => {
        // ดึงค่ามาให้ครบทุก Field เพื่อใช้ค้นหา
        const word = (item.word || "").toLowerCase();
        const meaning = (item.meaning || "").toLowerCase();
        const define = (item.define || "").toLowerCase();
        const pos = (item.pos || "").toLowerCase();
        const note = (item.note || "").toLowerCase();
        const refer = (item.refer || "").toLowerCase(); // ✅ เพิ่ม refer ตรงนี้
        const tag = (item.tag || "").toLowerCase();
        const keyword = (item.keyword || "").toLowerCase();
        const misspelled = (item.misspelled || "").toLowerCase();
        const related = (item.related || "").toLowerCase();

        // คืนค่า true ถ้าเจอ cleanQuery ในช่องใดช่องหนึ่ง
        return word.includes(cleanQuery) || 
               meaning.includes(cleanQuery) || 
               define.includes(cleanQuery) ||
               pos.includes(cleanQuery) ||
               note.includes(cleanQuery) ||
               refer.includes(cleanQuery) || // ✅ เช็ค refer ด้วย
               tag.includes(cleanQuery) || 
               keyword.includes(cleanQuery) ||
               misspelled.includes(cleanQuery) ||
               related.includes(cleanQuery);
    });
    
    renderResults(filtered);
    
    // บันทึกสถิติ (ถ้ามีฟังก์ชัน trackSearch)
    if (typeof trackSearch === "function") {
        trackSearch(query, filtered.length > 0);
    }
}

// 3. ฟังก์ชันแสดงผล (Render)
function renderResults(data) {
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
// 4. บันทึกสถิติการค้นหา
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

// 5. ระบบส่ง Feedback
async function sendFeedback() {
    const text = document.getElementById('feedback-text').value.trim();
    const btn = document.getElementById('submit-btn');
    const msg = document.getElementById('feedback-msg');

    if (!text) {
        alert("กรุณาพิมพ์ข้อความก่อนส่งนะครับ");
        return;
    }

    btn.disabled = true;
    btn.innerText = "กำลังส่ง...";

    try {
        const response = await fetch('/api/submit-feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text })
        });

        if (response.ok) {
            document.getElementById('feedback-text').value = '';
            msg.style.display = 'block';
            setTimeout(() => { msg.style.display = 'none'; }, 3000);
        }
    } catch (err) {
        alert("เกิดข้อผิดพลาดในการส่งข้อมูล");
    } finally {
        btn.disabled = false;
        btn.innerText = "ส่งข้อความ";
    }
}

// เริ่มโหลดข้อมูล
loadData();
