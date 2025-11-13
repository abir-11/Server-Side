const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId} = require('mongodb');

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
    const cropsCollection = db.collection('crops');
    const  interestsCollection = db.collection('interest');
   
    const myKrishiCardCollection=db.collection('my_krishi_card');

    console.log("✅ Connected to MongoDB successfully");

    //interest
    app.get('/interests/:cropId', async (req, res) => {
    try {
        const { cropId } = req.params;
        const interests = await interestsCollection.find({ cropId }).toArray();
        
        // Option 2: Or get from crop's interests array
        // const crop = await cropsCollection.findOne({ _id: new ObjectId(cropId) });
        // const interests = crop?.interests || [];
        
        res.json(interests);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
   
   // Submit new interest
app.post('/interests', async (req, res) => {
    try {
        const { cropId, userEmail, userName, quantity, message, status } = req.body;

        // Check if user already sent interest for this crop
        const existingInterest = await interestsCollection.findOne({
            cropId,
            userEmail
        });

        if (existingInterest) {
            return res.status(400).json({ 
                error: 'You have already sent an interest for this crop' 
            });
        }

        // Create new interest with unique ID
        const interestId = new ObjectId();
        const newInterest = {
            _id: interestId,
            cropId,
            userEmail,
            userName,
            quantity: parseInt(quantity),
            message,
            status: status || 'pending',
            createdAt: new Date()
        };

        // Insert into interests collection
        const result = await interestsCollection.insertOne(newInterest);

        // Also update crop's interests array (if you're maintaining both)
        await cropsCollection.updateOne(
            { _id: new ObjectId(cropId) },
            { 
                $push: { 
                    interests: newInterest 
                } 
            }
        );

        res.status(201).json({
            insertedId: result.insertedId,
            message: 'Interest submitted successfully'
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update interest status (Accept/Reject)
app.put('/interests/status', async (req, res) => {
    try {
        const { interestId, cropsId, status } = req.body;

        // Update in interests collection
        const result = await interestsCollection.updateOne(
            { _id: new ObjectId(interestId) },
            { $set: { status } }
        );

        // Also update in crop's interests array
        await cropsCollection.updateOne(
            { 
                _id: new ObjectId(cropsId),
                "interests._id": new ObjectId(interestId)
            },
            { 
                $set: { "interests.$.status": status } 
            }
        );

        res.json({ 
            modifiedCount: result.modifiedCount,
            message: `Interest ${status} successfully`
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get user's interests
app.get('/interests', async (req, res) => {
    try {
        const email = req.query.email;
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const userInterests = await interestsCollection.find({ userEmail: email }).toArray();
        res.json(userInterests);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get single crop by ID
app.get('/crops/:id', async (req, res) => {
    try {
        const crop = await cropsCollection.findOne({ 
            _id: new ObjectId(req.params.id) 
        });
        
        if (!crop) {
            return res.status(404).json({ error: 'Crop not found' });
        }
        
        res.json(crop);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all crops
app.get('/crops', async (req, res) => {
    try {
        const crops = await cropsCollection.find().toArray();
        res.json(crops);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create new crop
app.post('/crops', async (req, res) => {
    try {
        const newCrop = {
            ...req.body,
            interests: [], // Initialize empty interests array
            createdAt: new Date()
        };

        const result = await cropsCollection.insertOne(newCrop);
        res.status(201).json({ 
            insertedId: result.insertedId,
            ...newCrop 
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
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
    app.patch('/krishiCard/:id', async (req, res) => {
      const id = req.params.id;
      const updateData = req.body;
      const result = await krishiCardCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );
      res.send(result);
    });
     app.put('/krishiCard/:id',async(req,res)=>{
      const {id}=req.params;
      const data =req.body;
      const objectId=new ObjectId(id);
      const filter={_id: objectId}
      const update={
        $set:data
      }
      const result =await myNewkrishiCard.updateOne(filter,update)
      res.send(result)
    })
      
    app.delete('/krishiCard/:id', async (req, res) => {
      const id = req.params.id;
      const result = await krishiCardCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });
    // Bids API (Cleaned)
    app.get('/interest', async (req, res) => {
      const email = req.query.email;
      const query = email ? { buyer_email: email } : {};
      const result = await bidsCollection.find(query).toArray();
      res.send(result);
    });

    app.post('/interest', async (req, res) => {
      const newBid = req.body;
      const result = await bidsCollection.insertOne(newBid);
      res.send(result);
    });



//     app.delete('/interest/:id', async (req, res) => {
//       const id = req.params.id;
//       const result = await bidsCollection.deleteOne({ _id: new ObjectId(id) });
//       res.send(result);
//     });



  } finally {
    // keep connection open
  }
}

run().catch(console.dir);

app.listen(port, () => {
  console.log(`🚀 Krishi Farming server is running on port: ${port}`);
});
