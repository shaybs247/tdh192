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

// // Get Aleph-Bet index elements
// const getAlephBetIndexes = async page => {
//   const abcListContainer = await page.$(C.ALPHABET);
//   const listElements = await abcListContainer.$$("li");

//   return listElements;
// };

// const getMovieUrls = async (page, letter) => {
//   await letter.click();
//   setTimeout(() => {}, 3000);

//   await page.waitForSelector(C.MOVIES_LIST);
//   await page.waitForSelector(".roll");
//   const moviesUList = await page.$(C.MOVIES_LIST);
//   await page.waitForSelector("[data-title]");

//   return await moviesUList.$$eval("a", anchors =>
//     anchors.map(el => el.getAttribute("href"))
//   );
// };

// const asyncForEach = async (array, callback, startFrom = 0) => {
//   for (let index = startFrom; index < array.length; index++) {
//     await callback(array[index], index, array);
//   }
// };

// const run = async () => {
//   const browser = await puppeteer.launch();
//   const page = await browser.newPage();
//   await page.goto(`${C.CINEMA_OF_ISRAEL}#`);
//   const abcElements = await getAlephBetIndexes(page);

//   // await Promise.all(
//   //   abcElements.map(async li =>
//   //     console.log(await li.$eval("a", el => el.innerHTML))
//   //   )
//   // );
//   let movies_urls = [];
//   for (let i = 0; i < abcElements.length; i++) {
//     const letter = abcElements[i];
//     const aTag = await letter.$("a");
//     const url = await getMovieUrls(page, aTag);
//     movies_urls.push(url);
//   }

//   console.log(movies_urls);

//   await browser.close();
// };
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
