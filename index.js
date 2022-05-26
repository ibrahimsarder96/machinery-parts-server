const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// middleware--------
app.use(cors());
app.use(express.json());


// verifyJWT---------
function verifyJWT(req, res, next){
  const authHeader = req.headers.authorization;
  if(!authHeader){
    return res.status(401).send({message: 'unAuthorized access'});
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err, decoded){
    if(err){
      return res.status(403).send({message: 'Forbidden access'});
    }
    req.decoded = decoded;
    next()
  })
}

// mongodb connected-----
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qw8fz.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
  try{
    await client.connect();
    const productCollection = client.db('machinery_parts').collection('products');
    const orderCollection = client.db('machinery_parts').collection('orders');
    const userCollection = client.db('machinery_parts').collection('users');
    const addProductCollection = client.db('machinery_parts').collection('addProducts');


    const verifyAdmin = async(req, res, next) => {
      const requester = req.decoded.email;
      const requesterAccount = await userCollection.findOne({email: requester});
      if(requesterAccount.role === 'admin'){
        next()
      }
      else{
        res.status(403).send({message: 'Forbidden access'});
       }
    }


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

    // user data --
    app.put('/user/:email', async(req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = {email: email};
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      const token = jwt.sign({email: email}, process.env.ACCESS_TOKEN_SECRET,{ expiresIn: '1d' });
      res.send({result, token});
    });

    // order data load---
    app.post('/order', async(req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      res.send(result);
    });

    // customer order dashboard data load---
    app.get('/order',verifyJWT, async(req, res) => {
      const customer = req.query.customer;
      const decodedEmail = req.decoded.email;
      if(decodedEmail === customer){
        const query = {customer: customer};
      const orders = await orderCollection.find(query).toArray();
      res.send(orders);
      }
      else{
        return res.status(403).send({message: 'Forbidden access'});
      }
    });

    // all users---
    app.get('/user',verifyJWT, async(req, res) => {
      const users = await userCollection.find().toArray();
      res.send(users);
    });

    // user admin-----
      app.put('/user/admin/:email', verifyJWT, verifyAdmin, async(req, res) => {
        const email = req.params.email;
          const filter = {email: email};
          const updateDoc = {
            $set: {role: 'admin'},
          };
          const result = await userCollection.updateOne(filter, updateDoc);
          res.send(result);
      });

      // admin
      app.get('/user/:email', async(req, res) =>{
        const email = req.params.email;
        const user = await userCollection.findOne({email: email});
        const isAdmin = user.role === 'admin';
        res.send({admin: isAdmin})
      });

      // product add---
      app.post('/product',verifyJWT, async(req, res) => {
        const product = req.body;
        const result = await addProductCollection.insertOne(product);
        res.send(result);
      });

      // product manage---
      app.get('/product',verifyJWT, verifyAdmin, async(req, res) =>{
        const products = await addProductCollection.find().toArray();
        res.send(products);
      });
      // delete product----
      app.delete('/product/:email',verifyJWT,verifyAdmin, async(req, res) => {
        const email = req.params.email;
        const filter = {email: email};
        const result = await addProductCollection.deleteOne(filter);
        res.send(result);
      });

      // delete order----
      app.delete('/order/:email',verifyJWT, async(req, res) => {
        const email = req.params.email;
        const filter = {email: email};
        const result = await addProductCollection.deleteOne(filter);
        res.send(result);
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