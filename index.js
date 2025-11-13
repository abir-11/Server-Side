const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

const uri = "mongodb+srv://my-krishilink:QTN6YtLu78Uy4FFQ@cluster0.cerdjzv.mongodb.net/?appName=Cluster0";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

app.get('/', (req, res) => {
  res.send('Krishi Farming server is running');
});

async function run() {
  try {
    await client.connect();

    const db = client.db('krishi_bd');
    const krishiCardCollection = db.collection('krishiCard');
    //const usersCollection = db.collection('user');
    const bidsCollection = db.collection('bids');
    const myKrishiCardCollection=db.collection('my_krishi_card');

    console.log("✅ Connected to MongoDB successfully");

    // 🧑‍🌾 User API
    // app.post('/user', async (req, res) => {
    //   const newUser = req.body;
    //   const email = req.body.email;
    //   const existingUser = await usersCollection.findOne({ email });
    //   if (existingUser) {
    //     return res.send('User already exists. No need to insert again.');
    //   }
    //   const result = await usersCollection.insertOne(newUser);
    //   res.send(result);
    // });

    //my_krishi_card
    app.get("/my_krishi_card",async(req,res)=>{
      const result=await myKrishiCardCollection.find().toArray();
      res.send(result);
    })
    app.post('/my_krishi_card',async(req,res)=>{
      const myNewkrishiCard=req.body;
      const result=await myKrishiCardCollection.insertOne(myNewkrishiCard);
      res.send(result)
    })
    app.patch('/my_krishi_card/:id', async (req, res) => {
      const id = req.params.id;
      const updateData = req.body;
      const result = await myKrishiCardCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );
      res.send(result);
    });

     app.delete('/my_krishi_card/:id', async (req, res) => {
      const id = req.params.id;
      const result = await myKrishiCardCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });
    //  KrishiCard APIs
    app.get('/krishiCard', async (req, res) => {
      const result = await krishiCardCollection.find().toArray();
      res.send(result);
    });

    app.get('/latest-krishiCard', async (req, res) => {
      const result = await krishiCardCollection.find().sort({ quantity: -1 }).limit(6).toArray();
      res.send(result);
    });

    app.get('/krishiCard/:id', async (req, res) => {
      const id = req.params.id;
      const result = await krishiCardCollection.findOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    app.post('/krishiCard', async (req, res) => {
      const newKrishiCard = req.body;
      const result = await krishiCardCollection.insertOne(newKrishiCard);
      res.send(result);
    });


    // 💰 Bids API (Cleaned)
    app.get('/bids', async (req, res) => {
      const email = req.query.email;
      const query = email ? { buyer_email: email } : {};
      const result = await bidsCollection.find(query).toArray();
      res.send(result);
    });

    app.post('/bids', async (req, res) => {
      const newBid = req.body;
      const result = await bidsCollection.insertOne(newBid);
      res.send(result);
    });

    app.delete('/bids/:id', async (req, res) => {
      const id = req.params.id;
      const result = await bidsCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });

  } finally {
    // keep connection open
  }
}

run().catch(console.dir);

app.listen(port, () => {
  console.log(`🚀 Krishi Farming server is running on port: ${port}`);
});
