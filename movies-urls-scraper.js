// /**
//  * Scraping data from the Cinema of Israel site.
//  *
//  * 1. Script will traverse all pages on the site and scrape the properties of each movie
//  * 2. Script will make a CVS out of the extracted information
//  *
//  * Authors: Shay Ben-Simon and Lior Mizrahi
//  */

// import puppeteer from "puppeteer";
import * as C from "./constants";
const fs = require("fs");

const axios = require("axios");
(async () => {
  const letters = [
    "א",
    "ב",
    "ג",
    "ד",
    "ה",
    "ו",
    "ז",
    "ח",
    "ט",
    "י",
    "כ",
    "ל",
    "מ",
    "נ",
    "ס",
    "ע",
    "פ",
    "צ",
    "ק",
    "ר",
    "ש",
    "ת"
  ];
  const url =
    "https://www.cinemaofisrael.co.il/wp-content/themes/cinemaforms/libs/pull_articles.php?letter=";

  let moviesUrls = await Promise.all(
    letters.map(async el => {
      const modifiedUrl = url.concat(encodeURIComponent(el));
      const getUrls = await axios.get(modifiedUrl);
      return getUrls.data.map(el => el.guid);
    })
  );

  moviesUrls = moviesUrls.map(suffixes =>
    suffixes.map(suffix => C.CINEMA_OF_ISRAEL.concat(suffix))
  );
  // console.log(moviesUrls);
  fs.writeFile(
    "./movie-urls.json",

    JSON.stringify({ moviesUrls }),

    function(err) {
      if (err) {
        console.error("Crap happens");
      }
    }
  );
})();
