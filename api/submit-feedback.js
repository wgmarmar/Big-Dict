const { MongoClient } = require('mongodb');

module.exports = async (req, res) => {
  // รับเฉพาะ Method POST เท่านั้น
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'ต้องส่งแบบ POST เท่านั้น' });
  }

  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const db = client.db('legal_analytics');
    const collection = db.collection('feedbacks');

    const result = await collection.insertOne({
      message: req.body.message,
      timestamp: new Date()
    });

    return res.status(200).json({ success: true, id: result.insertedId });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  } finally {
    await client.close();
  }
};
