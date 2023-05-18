const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();

// middle ware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.USER}:${process.env.PASS}@cluster0.ean6llt.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const dataCollection = client.db("helloToys").collection("toyCollection");

    app.get("/categoryData", async (req, res) => {
      const result = await dataCollection.find().toArray();
      res.send(result);
    });

    app.get("/products", async (req, res) => {
      const result = await dataCollection.find().toArray();
      res.send(result);
    });

    app.get('/productDetails/:id', async(req, res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await dataCollection.findOne(query);
      res.send(result);
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("hello from toy server");
});

app.listen(port, () => {
  console.log(`this port is running on port: ${port}`);
});
