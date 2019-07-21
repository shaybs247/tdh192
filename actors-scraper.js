const requestPromise = require("request-promise");
const cheerio = require("cheerio");
var scraper = require("table-scraper");
import * as C from "./constants";

const url1 =
  "https://www.cinemaofisrael.co.il/%D7%90%D7%9C%D7%95%D7%9F-%D7%90%D7%95%D7%9C%D7%90%D7%A8%D7%A6%27%D7%99%D7%A7/";
const url2 =
  "https://www.cinemaofisrael.co.il/%D7%90%D7%91%D7%95-%D7%90%D7%9C-%D7%91%D7%A0%D7%90%D7%AA/";
const url3 =
  "https://www.cinemaofisrael.co.il/%D7%90%D7%91%D7%99%D7%91%D7%94-%D7%90%D7%94%D7%95%D7%91%D7%AA%D7%99/";

const extractActorsName = async url => {
  const html = await requestPromise(url);
  const $ = cheerio.load(html);
  let name = $(`[itemprop="name"]`).text();

  return name;
};

// let async_extract_imdbID = async url => {
//   const html = await requestPromise(url);
//   const $ = cheerio.load(html);
//   let imdb_link = $("[href*=imdb]").attr("href");
//   let splited_link = imdb_link.split("/");
//   let is_id = 0;
//   let res = -1;

//   splited_link.forEach(element => {
//     if (is_id == 1) {
//       res = element;
//       is_id = 0;
//     }

//     if (element == "title") is_id = 1;
//   });

//   return res;
// };
// --

//return a promise for array incudes movie data after first cleaning

const cleanResult = res => {
  Object.keys(res).forEach(key => {
    let curr = res[key];
    if (Array.isArray(curr)) {
      res[key] = curr.filter(str => !str.includes("\n") || !str.includes("\t"));
    } else if (typeof curr === "string") {
      res[key] = curr.replace(/\n/g, "").replace(/\t/g, "");
    }
  });
  return res;
};

const scrapeAndOrganize = async url => {
  const tableData = await scraper.get(url);
  let movie_data = tableData[0]; //all the data exists in the first table
  let res = [];
  movie_data.forEach(element => {
    let clean_dict = {};
    let another_data = {}; //for data after ',' if exists
    let i = 0;
    let j = 0;
    let into_actors = 0;
    let into_brief = 0;
    let into_movie_name = 0;
    let into_awards = 0;

    for (var key in element) {
      let value = element[key];

      if (value == "משחק") {
        into_actors = 1;
      } else if (value == "תקציר") into_brief = 1;
      else if (value == "שם אחר/לועזי") into_movie_name = 1;
      else if (
        value == 'פרסים/פסטיבלים חו"ל' ||
        value == "פרסים/פסטיבלים ישראל"
      )
        into_awards = 1;

      if ((into_actors || into_awards) && value.indexOf(",") != -1) {
        let splited_val = value.split(", ");
        value = splited_val[0]; //want only actor's name and not character's name
        if (
          into_actors &&
          splited_val[1].indexOf("\t") == -1 &&
          splited_val[1] != "בתפקיד עצמו"
        ) {
          let temp = {};
          temp[splited_val[0]] = splited_val[1];
          another_data[j++] = temp;
        }
        //another_data[j++] = splited_val[1];
      }

      if (
        value != "" &&
        ((into_actors && value.indexOf("\t") == -1) || !into_actors)
      )
        if (
          !(into_actors || into_brief || into_movie_name || into_awards) &&
          value.indexOf(", ") != -1
        ) {
          //multiple entities
          value.split(", ").forEach(element => {
            clean_dict[i++] = element;
          });
        } else clean_dict[i++] = value;
    }

    if (clean_dict != {}) res.push(clean_dict);
    if (into_actors && another_data != {}) res.push(another_data);

    into_actors = 0;
    into_brief = 0;
    into_movie_name = 0;
    into_awards = 0;
  });

  return res;
};

//return a promise for movie record as js object
const scrapeActor = async url => {
  let clean_obj = await scrapeAndOrganize(url);
  let res = {};
  let relevant_details = [
    "תקציר",
    "שם אחר/לועזי",
    "משחק",
    "בימוי",
    "ע.בימוי",
    "תסריט",
    "ניהול תסריט",
    "ע.הפקה",
    "ע.צילום",
    "חברת הפקה",
    "סטילס",
    "ליהוק",
    "ע.בימוי",
    "הפקה",
    "הקלטת קול",
    "בום",
    "איפור",
    "צילום",
    "ע.צילום",
    "עריכה",
    "ע.עריכה",
    "מוזיקה",
    'פרסים/פסטיבלים חו"ל',
    "פרסים/פסטיבלים ישראל",
    "מספר צופים בישראל",
    "דמויות",
    "תקציב",
    "תפקידים נוספים - מוזיקה מקורית",
    "תפקידים נוספים - תסריט",
    "תפקידים נוספים - בימוי",
    "תפקידים נוספים - עריכה"
  ];
  let detail = "";
  let need_arr = 0;
  let data_arr = [];

  res["שם"] = await extractActorsName(url);

  clean_obj.forEach(element => {
    if (Object.keys(element).length > 2) need_arr = 1;
    else need_arr = 0;

    for (var key in element) {
      let value = element[key];

      if (detail == "" && relevant_details.includes(value)) {
        detail = value;
        continue;
      } else if (detail == "") break; //not relevant information

      if (need_arr && !data_arr.includes(value)) data_arr.push(value);
      else res[detail] = value;
    }

    if (need_arr && detail != "") {
      res[detail] = data_arr;
      data_arr = [];
    }

    detail = "";
  });
  // return res;
  return cleanResult(res);
};

const getActorsRecord = async url => {
  const rec = await scrapeActor(url);

  return rec;
};

const extractActorsUrls = async moviePage => {
  const html = await requestPromise(moviePage);
  const $ = cheerio.load(html);
  const interstedIn = ["הפקה", "בימוי", "תסריט"];
  // get actors suffix
  const suffixes = [];
  $('[itemprop="actors"]').each((index, value) => {
    suffixes.push(value.parent.attribs.href);
  });

  // get interesting suffixes
  $('[style="color:#929496;"]').each((index, value) => {
    if (interstedIn.includes($(value).text())) {
      suffixes.push(
        $(value.parent)
          .find("a")
          .get(0).attribs.href
      );
    }
  });
  // create urls
  return suffixes.map(suffix => C.CINEMA_OF_ISRAEL.concat(suffix.slice(1)));
};

(async () => {
  // await getActorsRecord(url1);
  await extractActorsUrls(
    "https://www.cinemaofisrael.co.il/%d7%a0%d7%95%d7%a8%d7%9e%d7%9f-%d7%a2%d7%9c%d7%99%d7%99%d7%aa%d7%95-%d7%94%d7%9e%d7%aa%d7%95%d7%a0%d7%94-%d7%95%d7%a0%d7%a4%d7%99%d7%9c%d7%aa%d7%95-%d7%94%d7%aa%d7%9c%d7%95%d7%9c%d7%94-%d7%a9%d7%9c/"
  );
})();
