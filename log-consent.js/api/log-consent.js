// api/log-consent.js
const { MongoClient } = require('mongodb');

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }

    // ใส่ Connection String ของ MongoDB ของคุณ (แนะนำให้ใช้ Environment Variable)
    const uri = process.env.MONGODB_URI; 
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const database = client.db('your_database_name'); // เปลี่ยนชื่อ DB ของคุณ
        const collection = database.collection('consents');

        const { event, userAgent } = req.body;
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

        const newLog = {
            event,
            userAgent,
            ip,
            timestamp: new Date()
        };

        await collection.insertOne(newLog);
        res.status(200).json({ message: 'Success' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to log to MongoDB' });
    } finally {
        await client.close();
    }
}
