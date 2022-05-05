const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;




// Middleware

app.use(cors());
app.use(express.json());






const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5cdr5.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {

  try {
    await client.connect();
    const bikeCollection = client.db('Bike_House').collection('bikes');



    //  Get Items from DB

    app.get('/bikes', async (req, res) => {
      const query = {};
      const cursor = bikeCollection.find(query);
      const bikes = await cursor.toArray();
      res.send(bikes);

  });


    // POST Items

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