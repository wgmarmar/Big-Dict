let dictionaryData = [];
const resultsDiv = document.getElementById('results');

// 1. โหลดข้อมูลจาก API
async function loadData() {
    try {
        const res = await fetch('/api/get-dictionary');
        dictionaryData = await res.json();
        // ตรวจสอบใน Console ว่าข้อมูลที่มาถึงหน้าบ้าน หน้าตาเป็นอย่างไร
        console.log("✅ ข้อมูลที่ดึงมาจาก MongoDB:", dictionaryData);
    } catch (err) {
        console.error("❌ ดึงข้อมูลไม่สำเร็จ:", err);
    }
}

// 2. ฟังก์ชันค้นหา (เปลี่ยนกลับมาใช้ item.word)
function search() {
    const query = document.getElementById('search').value.toLowerCase().trim();
    if (!query) { 
        resultsDiv.innerHTML = ''; 
        return; 
    }

    const filtered = dictionaryData.filter(item => {
        // ดึงค่าจาก Object โดยใช้ชื่อ 'word' ตามใน Database
        const wordText = (item.word || "").toLowerCase();
        const meaningText = (item.meaning || "").toLowerCase();
        const keywordText = (item.keyword || "").toLowerCase();

        return wordText.includes(query) || 
               meaningText.includes(query) || 
               keywordText.includes(query);
    });
    
    renderResults(filtered);
    trackSearch(query, filtered.length > 0);
}

// 3. แสดงผล (เปลี่ยนกลับมาใช้ item.word)
function renderResults(data) {
    resultsDiv.innerHTML = data.length === 0 ? '<div class="no-result">ไม่พบข้อมูล...</div>' : '';
    
    data.forEach(item => {
        const div = document.createElement('div');
        div.className = 'card';
        div.innerHTML = `
            <div class="word-header">
                <div class="word">${item.word || "ไม่มีชื่อคำศัพท์"}</div>
                <div class="meaning">${item.meaning || ""}</div>
            </div>
            <div class="definition">${item.define || ""}</div>
            <div class="law-systems">
                <div class="law-box">
                    <span class="law-label">Common Law / Civil Law</span>
                    ${item.common || '-'} / ${item.civil || '-'}
                </div>
            </div>
            <div class="refer">อ้างอิง: ${item.refer || 'ไม่ระบุ'}</div>
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
