 app.post('/interest',async(req,res)=>{
        const newInterest =req.body;
        const result=await interestsCollection.insertOne(newInterest);
        res.send(result);
    })

    app.get('/interest/:id', async (req, res) => {
      const id = req.params.id;
      const result = await krishiCardCollection.findOne({ _id: new ObjectId(id) });
      res.send(result);
    });