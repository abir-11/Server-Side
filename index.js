require('dotenv').config()
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


async function run() {
  try {


    const db = client.db('krishi_bd');
    const krishiCardCollection = db.collection('krishiCard');
    const interestsCollection = db.collection('interests');

    console.log("Connected to MongoDB successfully");

    // KrishiCard APIs
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

    app.patch('/krishiCard/:id', async (req, res) => {
      const id = req.params.id;
      const updateData = req.body;
      const result = await krishiCardCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );
      res.send(result);
    });

    app.put('/krishiCard/:id', async (req, res) => {
      const { id } = req.params;
      const data = req.body;
      const objectId = new ObjectId(id);
      const filter = { _id: objectId };
      const update = { $set: data };
      const result = await krishiCardCollection.updateOne(filter, update);
      res.send(result);
    });

    app.delete('/krishiCard/:id', async (req, res) => {
      const id = req.params.id;
      const result = await krishiCardCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });






    // Interests APIs
    app.post('/interests', async (req, res) => {
      try {
        const interest = req.body;
        const existingInterest = await interestsCollection.findOne({
          cropId: interest.cropId,
          userEmail: interest.userEmail
        });

        if (existingInterest) {
          return res.status(400).send({
            message: 'You have already submitted an interest for this crop'
          });
        }

        const interestId = new ObjectId();
        const newInterest = {
          _id: interestId,
          ...interest,
          createdAt: new Date()
        };

        const result = await interestsCollection.insertOne(newInterest);


        res.send({
          insertedId: interestId,
          message: 'Interest submitted successfully'
        });
      } catch (error) {
        res.status(500).send({ error: 'Failed to submit interest' });
      }
    });

    app.get('/interests/:cropId', async (req, res) => {
      const cropId = req.params.cropId;
      const result = await interestsCollection.find({ cropId: cropId }).toArray();
      res.send(result);
    });

    app.get('/interests/user/:userEmail', async (req, res) => {
      const userEmail = req.params.userEmail;
      const result = await interestsCollection.find({ userEmail: userEmail }).toArray();
      res.send(result);
    });


  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Krishi Farming server is running');
});


app.listen(port, () => {
  console.log(`Krishi Farming server is running on port: ${port}`);
});
