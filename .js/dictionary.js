let dictionaryData = [];
const resultsDiv = document.getElementById('results');

// 1. โหลดข้อมูลจาก API (MongoDB)
async function loadData() {
    try {
        const res = await fetch('/api/get-dictionary');
        dictionaryData = await res.json();
        console.log("Dictionary Synced");
    } catch (err) {
        console.error("DB Error:", err);
    }
}

// 2. ฟังก์ชันค้นหา
function search() {
    const query = document.getElementById('search').value.toLowerCase().trim();
    if (!query) { resultsDiv.innerHTML = ''; return; }

    const filtered = dictionaryData.filter(item => 
        item.word.toLowerCase().includes(query) || 
        item.meaning.toLowerCase().includes(query) ||
        (item.keyword && item.keyword.toLowerCase().includes(query))
    );
    
    renderResults(filtered);
    trackSearch(query, filtered.length > 0);
}

// 3. แสดงผล
function renderResults(data) {
    resultsDiv.innerHTML = data.length === 0 ? '<div class="no-result">ไม่พบข้อมูล...</div>' : '';
    data.forEach(item => {
        const div = document.createElement('div');
        div.className = 'card';
        div.innerHTML = `
            <div class="word-header">
                <div class="word">${item.word}</div>
                <div class="meaning">${item.meaning}</div>
            </div>
            <div class="definition">${item.define}</div>
            <div class="law-systems">
                <div class="law-box"><span class="law-label">Common Law</span>${item.common}</div>
                <div class="law-box"><span class="law-label">Civil Law</span>${item.civil}</div>
            </div>
            <div class="refer">อ้างอิง: ${item.refer}</div>
        `;
        resultsDiv.appendChild(div);
    });
}

// 4. บันทึกสถิติ (เฉพาะคนที่กดยอมรับ)
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
