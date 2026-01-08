import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export default async function handler(req, res) {
    if (req.method !== 'GET') return res.status(405).send('Method Not Allowed');

    try {
        await client.connect();
        const db = client.db('legal_analytics');
        // ดึงข้อมูลจากคอลเลกชัน dictionary และเรียงตามตัวอักษร A-Z
        const data = await db.collection('dictionary').find({}).sort({ word: 1 }).toArray();
        
        // ส่งข้อมูลกลับไปที่หน้าเว็บ
        res.status(200).json(data);
    } catch (e) {
        res.status(500).json({ error: e.message });
    } finally {
        await client.close();
    }
}
