import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        await client.connect();
        const database = client.db('legal_analytics');
        const collection = database.collection('search_logs');

        const data = JSON.parse(req.body);
        const result = await collection.insertOne({
            word: data.word,
            found: data.found,
            timestamp: new Date(),
            userAgent: req.headers['user-agent']
        });

        res.status(200).json({ success: true, id: result.insertedId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    } finally {
        await client.close();
    }
}
