// api/log-consent.js
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'ต้องใช้ POST เท่านั้น' });
    }

    try {
        await client.connect();
        const database = client.db(); 
        const collection = database.collection('consents');

        // รับข้อมูลจาก body
        const { event, userAgent } = req.body;
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';

        const result = await collection.insertOne({
            event: event || 'cookie_action',
            userAgent: userAgent || 'unknown',
            ip: ip,
            timestamp: new Date()
        });

        return res.status(200).json({ success: true, id: result.insertedId });
    } catch (error) {
        console.error("❌ MongoDB Error:", error.message);
        return res.status(500).json({ success: false, error: error.message });
    }
    // ไม่ต้องปิด client เพื่อให้ Vercel นำการเชื่อมต่อกลับมาใช้ใหม่ได้ (ช่วยให้เร็วขึ้น)
}
