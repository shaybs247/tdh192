const MongoClient = require("mongodb").MongoClient;
import { getMovieRecord } from "./movie-page-scraper";

// if movies-urls.json not found you should run 'npm run scrape-urls'
const movieUrls = require("./movie-urls.json");

const databaseUrl = "mongodb://localhost:27017";
const cinemaOfIsrael = "cinema-of-israel-db";

const addMovieToDB = async (db, movie) => {
  const movieName = movie["שם הסרט"];
  const moviesCollection = db.collection("movies");
  return moviesCollection.findOneAndUpdate(
    { "שם הסרט": movieName },
    {
      $set: {
        ...movie
      }
    },
    {
      returnOriginal: false,
      upsert: true
    }
  );
};

const asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};

const insertMoviesToDb = async db => {
  const movieUrlsAsArray = movieUrls["movies_urls"];
  await asyncForEach(movieUrlsAsArray, async letterArray => {
    await asyncForEach(letterArray, async url => {
      const movieRecord = await getMovieRecord(url);
      try {
        await addMovieToDB(db, movieRecord);
      } catch (err) {
        throw err;
      }
    });
  });
  console.log("finished insert movies to db");
};

(async () => {
  let db;
  try {
    const client = await MongoClient.connect(databaseUrl, {
      useNewUrlParser: true
    });
    db = client.db(cinemaOfIsrael);
  } catch (err) {
    console.error(err, "Failed to connect to the database");
  }

  await insertMoviesToDb(db);
})();
