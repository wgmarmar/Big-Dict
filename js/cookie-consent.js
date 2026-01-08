document.addEventListener('DOMContentLoaded', function() {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
        showBanner();
    }
});

function showBanner() {
    const banner = document.createElement('div');
    banner.id = 'cookie-banner';
    banner.innerHTML = `
        <p style="margin-bottom: 10px;">เว็บไซต์นี้ใช้คุกกี้เพื่อบันทึกสถิติการค้นหา (แบบไม่ระบุตัวตน) เพื่อนำไปพัฒนาเนื้อหาให้ตรงความต้องการของคุณ</p>
        <button class="cookie-btn btn-accept" onclick="setConsent('accepted')">ยอมรับ</button>
        <button class="cookie-btn btn-decline" onclick="setConsent('declined')">ไม่ยอมรับ</button>
    `;
    document.body.appendChild(banner);
}

function setConsent(status) {
    localStorage.setItem('cookie_consent', status);
    const banner = document.getElementById('cookie-banner');
    if (banner) banner.remove();
}
