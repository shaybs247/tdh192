const MongoClient = require("mongodb").MongoClient;
const fs = require("fs");
let failedUrls = fs.createWriteStream("failed-urls.txt");
import * as C from "./constants";
import { getMovieRec } from "./movie-page-scraper";
import { getActorsRecord } from "./actors-scraper";

// if movies-urls.json not found you should run 'npm run scrape-urls'
const movieUrls = require("./movie-urls.json");
const personsUrls = require("./persons-urls.json");

const databaseUrl = "mongodb://localhost:27017";
const cinemaOfIsrael = "cinema-of-israel-db";

const addMovieToDB = async (db, movie, url) => {
  const movieName = movie["שם הסרט"];
  const moviesCollection = db.collection("movies");
  return moviesCollection.findOneAndUpdate(
    { "שם הסרט": movieName },
    {
      $setOnInsert: {
        ...movie,
        COFID: url.slice(73)
      }
    },
    {
      returnOriginal: false,
      upsert: true
    }
  );
};

const addPersonToDB = async (db, person, url) => {
  const name = person["שם"];
  const personsCollection = db.collection("persons");
  return personsCollection.findOneAndUpdate(
    { שם: name },
    {
      $setOnInsert: {
        ...person,
        COFID: url.slice(73)
      }
    },
    {
      returnOriginal: false,
      upsert: true
    }
  );
};

const asyncForEach = async (array, callback, startFrom = 0) => {
  for (let index = startFrom; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};

const insertMoviesToDb = async db => {
  const movieUrlsAsArray = movieUrls["moviesUrls"];
  await asyncForEach(
    movieUrlsAsArray,
    async (letterArray, index) => {
      console.log("letter no. ", index);
      await asyncForEach(letterArray, async url => {
        console.log(url);

        const movieRecord = await getMovieRec(url);
        if (!movieRecord) {
          failedUrls.write(url.concat("\n"), "utf-8");
          return;
        }
        try {
          await addMovieToDB(db, movieRecord, url);
        } catch (err) {
          throw err;
        }
      });
    },
    14
  );
  console.log("finished insert movies to db");
};

const insertPersonsToDb = async db => {
  const personsUrlsAsArray = personsUrls["personsAsArray"];
  await asyncForEach(personsUrlsAsArray, async (suffix, index) => {
    console.log(C.CINEMA_OF_ISRAEL.concat(suffix));
    const url = C.CINEMA_OF_ISRAEL.concat(suffix);
    const personRecord = await getActorsRecord(url);
    console.log(personRecord);
    if (!personRecord) {
      failedUrls.write(url.concat("\n"), "utf-8");
      return;
    }
    try {
      await addPersonToDB(db, personRecord, suffix);
    } catch (err) {
      throw err;
    }
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

  // await insertMoviesToDb(db);
  await insertPersonsToDb(db);
})();
