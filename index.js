const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello Machinery-parts!')
})

app.listen(port, () => {
  console.log(`Machinery website listening on port ${port}`)
})