const express=require('express');

const cors=require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app=express();
const port=process.env.PORT||3000;

//middleware
app.use(cors())
app.use(express.json())
//my-krishilink
//QTN6YtLu78Uy4FFQ
const uri = "mongodb+srv://my-krishilink:QTN6YtLu78Uy4FFQ@cluster0.cerdjzv.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

app.get('/',(req,res)=>{
    res.send('Krishi Framing server is running')
})
async function run() {
  try {
    await client.connect();

    const db=client.db('krishi_bd');
    const krishiCardCollection=db.collection('krishiCard')
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
     
    app.get('/krishiCard',async(req,res)=>{
        const cursor=krishiCardCollection.find();
        const result=await cursor.toArray();
        res.send(result);
    })
    app.get('/products/:id',async(req,res)=>{
        const id=req.params.id;
        const query={_id:new ObjectId(id)}
        const result=await krishiCardCollection.findOne(query);
        res.send(result);
    })

    app.post('/krishiCard',async(req,res)=>{
        const newKrishiCard=req.body;
        const result=await krishiCardCollection.insertOne(newKrishiCard);
        res.send(result)
    })
    app.patch('/krishiCard/:id',async(req,res)=>{
        const id =req.params.id;
        const krishiCardUpdated=req.body;
        const query={_id:new ObjectId(id)};
        const update={
            $set:{
                name:krishiCardUpdated.name,
                price:krishiCardUpdated.price
            }
        }
        const result=await krishiCardCollection.updateOne(query,update);
        res.send(result);

    })
    app.delete('/krishiCard/:id',async(req,res)=>{
        const id=req.params.id;
        const query={_id: new ObjectId(id)}
        const result=await krishiCardCollection.deleteOne(query);
        res.send(result)
    })


  } 
  finally {
    //await client.close();
  }
}
run().catch(console.dir);
app.listen(port,()=>{
    console.log(`Krishi Framing server is running on :${port}`)
})