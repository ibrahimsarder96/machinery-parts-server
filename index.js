const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');

// middleware
app.use(cors());
app.use(express.json());

// mongodb connected
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qw8fz.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
  try{
    await client.connect();
    console.log('Database connected')
  }
  finally{

  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello Machinery-parts!')
})

app.listen(port, () => {
  console.log(`Machinery website listening on port ${port}`)
})