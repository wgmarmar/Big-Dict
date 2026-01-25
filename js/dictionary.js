let dictionaryData = [];

// 1. โหลดข้อมูล (โหลดเงียบๆ ไว้ใน Memory ไม่แสดงผลทันที)
async function loadData() {
    try {
        const res = await fetch('/api/get-dictionary');
        dictionaryData = await res.json();
        // ลบ renderResults(dictionaryData) ออกจากตรงนี้ เพื่อไม่ให้โชว์ A-Z ตอนเริ่ม
    } catch (err) {
        console.error("Load Error:", err);
    }
}

// 2. ฟังก์ชันค้นหา (ปรับปรุงใหม่ให้แม่นยำ)
function search() {
    const query = document.getElementById('search').value.toLowerCase().trim();
    const resultsDiv = document.getElementById('results');
    
    // ถ้าช่องค้นหาว่าง ให้ล้างหน้าจอให้ว่างเปล่า
    if (!query) {
        resultsDiv.innerHTML = '';
        return;
    }

    const cleanQuery = query.replace('#', '');

    // กรองข้อมูล: ค้นหาจากทุกช่อง (รวม Tag, Note, Misspelled ที่ซ่อนไว้)
    const filtered = dictionaryData.filter(item => {
        return (
            (item.word || "").toLowerCase().includes(cleanQuery) ||
            (item.meaning || "").toLowerCase().includes(cleanQuery) ||
            (item.define || "").toLowerCase().includes(cleanQuery) ||
            (item.tag || "").toLowerCase().includes(cleanQuery) || // ค้นจาก Tag
            (item.note || "").toLowerCase().includes(cleanQuery) || // ค้นจาก Note
            (item.keyword || "").toLowerCase().includes(cleanQuery) ||
            (item.misspelled || "").toLowerCase().includes(cleanQuery)
        );
    });

    renderResults(filtered);
}

// 3. ฟังก์ชันแสดงผล (โชว์เฉพาะฟิลด์ที่ต้องการ)
function renderResults(data) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = data.length === 0 ? '<div class="no-result">ไม่พบคำศัพท์ที่ใกล้เคียง</div>' : '';
    
    data.forEach(item => {
        const div = document.createElement('div');
        div.className = 'card';
        
        // ตรงนี้จะโชว์เฉพาะ Word, Pos, Meaning, Define, Note, Refer
        // ส่วน Tag, Keyword, Misspelled จะ 'ไม่ถูกเขียนลง HTML' (จึงมองไม่เห็นแต่หาเจอ)
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
            ${item.refer ? `<div class="refer">อ้างอิง: ${item.refer}</div>` : ''}
        `;
        resultsDiv.appendChild(div);
    });
}

// ส่วนของ Cookie และอื่นๆ คงเดิม...
window.onload = checkConsent;
