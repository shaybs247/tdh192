/**
 * Scraping data from the Cinema of Israel site.
 *
 * 1. Script will traverse all pages on the site and scrape the properties of each movie
 * 2. Script will make a CVS out of the extracted information
 *
 * Authors: Shay Ben-Simon and Lior Mizrahi
 */

import puppeteer from "puppeteer";
import * as C from "./constants";
import { isArray } from "util";
const fs = require("fs");

// Get Aleph-Bet index elements
const getAlephBetIndexes = async page => {
  const abcListContainer = await page.$(C.ALPHABET);
  const listElements = await abcListContainer.$$("li");

  return listElements;
};

const getMovieUrls = async (page, letter) => {
  await letter.click();
  await page.waitForSelector(C.MOVIES_LIST);
  await page.waitForSelector(".roll");
  const moviesUList = await page.$(C.MOVIES_LIST);
  await page.waitForSelector("[data-title]");

  return await moviesUList.$$eval("a", anchors =>
    anchors.map(el => el.getAttribute("href"))
  );
};

const run = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(`${C.CINEMA_OF_ISRAEL}#`);
  const abcElements = await getAlephBetIndexes(page);

  let movies_urls = await Promise.all(
    abcElements.map(async li => await getMovieUrls(page, await li.$("a")))
  );
  movies_urls = movies_urls.map(suffixes =>
    suffixes.map(suffix => C.CINEMA_OF_ISRAEL.concat(suffix))
  );

  fs.writeFile(
    "./movie-urls.json",

    JSON.stringify(movies_urls),

    function(err) {
      if (err) {
        console.error("Crap happens");
      }
    }
  );
  await browser.close();
};

run();
