const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// middleware--------
app.use(cors());
app.use(express.json());

// mongodb connected-----
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qw8fz.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
  try{
    await client.connect();
    const productCollection = client.db('machinery_parts').collection('products');
    const orderCollection = client.db('machinery_parts').collection('orders');

    // all products load-----
    app.get('/product', async(req, res) => {
      const query = {};
      const cursor  = productCollection.find(query);
      const products = await cursor.toArray();
      res.send(products);
    });

    // single product load---
    app.get('/product/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: ObjectId(id)};
      const product = await productCollection.findOne(query);
      res.send(product);
    });

    // order data load---
    app.post('/order', async(req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      res.send(result);
    });
    
    // customer order dashboard data load---
    app.get('/order', async(req, res) => {
      const customer = req.query.customer;
      const query = {customer: customer};
      const orders = await orderCollection.find(query).toArray();
      res.send(orders);
    });
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