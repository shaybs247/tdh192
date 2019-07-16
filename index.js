const MongoClient = require("mongodb").MongoClient;

const databaseUrl = "mongodb://localhost:27017";
const cinemaOfIsrael = "cinema-of-israel-db";
let db;

MongoClient.connect(databaseUrl, { useNewUrlParser: true })
  .then(client => {
    db = client.db(cinemaOfIsrael);
  })
  .catch(err => console.error(err, "Failed to connect to the database"));
