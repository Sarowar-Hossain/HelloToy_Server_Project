const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();

// middle ware

const corConfig = {
  origin: "*",
  credentials: true,
  methods: ["GET", "POST", "DELETE", "PATCH", "OPTIONS"],
};

app.use(cors(corConfig));
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
    // await client.connect();
    const dataCollection = client.db("helloToys").collection("toyCollection");

    const indexKeys = { name: 1, subCategory: 1 };
    const indexOptions = { title: "subCategoryName" };
    // const result = await dataCollection.createIndex(indexKeys);


    // Get all category data

    app.get("/categoryData", async (req, res) => {
      const result = await dataCollection.find().toArray();
      res.send(result);
    });

    // Get products with search and limit parameters

    app.get("/products", async (req, res) => {
      const limit = parseInt(req.query.limit);
      const searchString = req.query.search;
      const query = {
        $or: [
          { name: { $regex: searchString, $options: "i" } },
          { subCategory: { $regex: searchString, $options: "i" } },
        ],
      };
      const result = await dataCollection.find(query).limit(limit).toArray();
      res.send(result);
      console.log(result);
    });

    
    // Add a new toy product

    app.post("/addtoys", async (req, res) => {
      const product = req.body;
      const result = await dataCollection.insertOne(product);
      res.send(result);
      console.log(result);
    });

 // Get product details by ID
    app.get("/productDetails/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await dataCollection.findOne(query);
      res.send(result);
    });

// Get "my toys" with optional query parameters for filtering and sorting
    app.get("/mytoys", async (req, res) => {
      let query = {};
      if (req.query?.sellerEmail) {
        query = { sellerEmail: req.query.sellerEmail };
      }
      const sortOrder = req.query?.sortOrder === "desc" ? -1 : 1;
      const sortBy = req.query?.sortBy || "name";
      const cursor = dataCollection.find(query).sort({ [sortBy]: sortOrder });
      const result = await cursor.toArray();
      res.send(result);
    });


    // Update a toy product by ID

    app.patch("/mytoys/:id", async (req, res) => {
      const info = req.body;
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateInfo = {
        $set: {
          price: info.price,
          quantity: info.quantity,
          picture: info.picture,
          description: info.description,
        },
      };
      const result = await dataCollection.updateOne(query, updateInfo, options);
      res.send(result);
    });

 // Delete a toy product by ID
    app.delete("/mytoys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const deleteUser = await dataCollection.deleteOne(query);
      res.send(deleteUser);
    });


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
