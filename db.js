const { MongoClient } = require("mongodb")

const dotenv = require("dotenv")
dotenv.config()

const client = new MongoClient(process.env.URI, { useNewUrlParser: true, useUnifiedTopology: true })

client.connect(err => {
  module.exports = client.db()
  // const collection = client.db("test").collection("users");
  // perform actions on the collection object
  // client.close();

  const app = require("./app")
  app.listen(process.env.PORT)
})
