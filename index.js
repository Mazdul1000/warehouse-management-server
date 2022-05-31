const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion,ObjectId } = require('mongodb');
const query = require('express/lib/middleware/query');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;




// Middleware

app.use(cors());
app.use(express.json());


function verifyToken(req, res, next){
  const headerAuth = req.headers.authorization;
  if(!headerAuth){
    return res.status(401).send({message:'Unauthorized access'})
  }
  const token = headerAuth.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
    if(err){
      return res.status(403).send({message: 'Forbidden access'});
    }
    req.decoded = decoded;
    next();
  })
 
}


// connect to mongodb:
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5cdr5.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {

  try {
    await client.connect();
    const bikeCollection = client.db('Bike_House').collection('bikes');

  //  AUTH

  app.post('/login', async(req,res) =>{
   const user = req.body;
   const accessToken = jwt.sign(user,process.env.ACCESS_TOKEN, {expiresIn: '30d'});
   res.send({accessToken});
  })


    //  Get Items from DB

    app.get('/bikes', async (req, res) => {
      const query = {};
      const cursor = bikeCollection.find(query);
      const bikes = await cursor.toArray();
      res.send(bikes);

  });

  // Get single item with Id

  app.get('/bike/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: ObjectId(id) };
    const bike = await bikeCollection.findOne(query);
    res.send(bike);
});

// Get My Items 

app.get('/myItems', verifyToken, async(req, res) => {
  const decodedEmail = req.decoded.email;
  const email = req.query.email;
  if(decodedEmail === email){
    const query = {email:email};
  const cursor = bikeCollection.find(query);
  const myItems = await cursor.toArray();
  res.send(myItems);
  } 
  else{
     res.status(403).send({message:'Forbidden access'});
  }
})

    // POST Items

    app.post('/bikes', async (req, res) => {
      const newItem = req.body;
      const result = await bikeCollection.insertOne(newItem);
      res.send(result);
  })


  // Update item

  app.put('/bikes/:id', async(req,res) => {
    const id = req.params.id;
    const updatedItem = req.body;
    const filter = {_id:ObjectId(id)};
    const option = {upsert: true};
    const updatedDoc = {
      $set:{
        quantity: updatedItem.quantity
      }
    };

    const result = await bikeCollection.updateOne(filter, updatedDoc,option)
    res.send(result);
  })
  // Delete Item

  app.delete('/bike/:id', async(req,res) => {
    const id = req.params.id;
    const query = {_id: ObjectId(id)};
    const result = await bikeCollection.deleteOne(query);
    res.send(result);
  })

  }

  finally {

  }


}

run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Running Bike house server')
});


app.listen(port, () => {
  console.log('Listening to port', port)
});