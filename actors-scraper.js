const requestPromise = require("request-promise");
const cheerio = require("cheerio");
var scraper = require("table-scraper");
//import * as C from "./constants";
const fs = require("fs");

const url1 =
  "https://www.cinemaofisrael.co.il/%D7%90%D7%9C%D7%95%D7%9F-%D7%90%D7%95%D7%9C%D7%90%D7%A8%D7%A6%27%D7%99%D7%A7/";
const url2 =
  "https://www.cinemaofisrael.co.il/%D7%90%D7%91%D7%95-%D7%90%D7%9C-%D7%91%D7%A0%D7%90%D7%AA/";
const url3 =
  "https://www.cinemaofisrael.co.il/%D7%90%D7%91%D7%99%D7%91%D7%94-%D7%90%D7%94%D7%95%D7%91%D7%AA%D7%99/";
  const url4 = "https://www.cinemaofisrael.co.il/%d7%99%d7%94%d7%95%d7%93%d7%94-%d7%91%d7%a8%d7%a7%d7%9f/";


const extractActorsName = async html => {
  //const html = await requestPromise(url);
  const $ = cheerio.load(html);
  let name = $(`[itemprop="name"]`).text();

  return name;
};


/*
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
*/

/*
const scrapeAndOrganize = async url => {
  let count = 0;
  let maxTries = 6;
  let tableData;
  while (true) {
    try {
      tableData = await scraper.get(url);
      break;
    } catch (err) {
      if (++count == maxTries) throw e;
    }
  }
  let actor_data = tableData[0]; //all the data exists in the first table
  let res = [];
  if (!Array.isArray(actor_data)) return [];
  actor_data.forEach(element => {
    let clean_dict = {};
    let another_data = {}; //for data after ',' if exists
    let i = 0;
    let j = 0;
    let into_actors = 0;
    let into_brief = 0;
    let into_movie_name = 0;
    let into_awards = 0;
    let into_biography = 0;

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
      else if(value == 'ביוגראפיה')
        into_biography = 1;

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
        
      }

      if (
        value != "" &&
        ((into_actors && value.indexOf("\t") == -1) || !into_actors)
      )
        if (
          !(into_actors || into_brief || into_movie_name || into_awards || into_biography) &&
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
    into_biography = 0;
  });

  return res;
};
*/

const scrapeAndOrganize = async url => {
  let count = 0;
  let maxTries = 6;
  let tableData;
  while (true) {
    try {
      tableData = await scraper.get(url);
      break;
    } catch (err) {
      if (++count == maxTries) throw e;
    }
  }
  let actor_data = tableData[0]; //all the data exists in the first table
  let res = [];
  if (!Array.isArray(actor_data)) return [];
  actor_data.forEach(element => {
    let clean_dict = {};
    let i = 0;
    let into_actors = 0;
    let into_brief = 0;
    let into_movie_name = 0;
    let into_awards = 0;
    let into_biography = 0;

    for (var key in element) {
      let value = element[key];
      let actor = {};
      let end_idx = -1;

      if (value == "משחק") {
        into_actors = 1;
      } else if (value == "תקציר") into_brief = 1;
      else if (value == "שם אחר/לועזי") into_movie_name = 1;
      else if (
        value == 'פרסים/פסטיבלים חו"ל' ||
        value == "פרסים/פסטיבלים ישראל"
      )
        into_awards = 1;
      else if(value == 'ביוגראפיה')
        into_biography = 1;


      if (value.indexOf(",") != -1) {
        let splited_val = value.split(", ");

        if (into_actors && i++ != 1) {  //ignore double record in first movie
          end_idx = splited_val[0].indexOf(" (");
          if(end_idx != -1) {
            actor["שם הסרט"] = splited_val[0].substring(0, end_idx);
            actor["שנה"] = splited_val[0].substring(end_idx + 2, end_idx + 6);  //assume year has 4 digits
          }
          else {
            actor["שם הסרט"] = splited_val[0];
            actor["שנה"] = null;
          }

          actor["דמות"] = null;

          if (splited_val[1].indexOf("\t") == -1)
            actor["דמות"] = splited_val[1]; //get character's name
        } 
        else if (into_awards) {
          value = splited_val[0];
        }
      } else if (into_actors) {   //actor without character's name
        end_idx = value.indexOf(" (");
        if(end_idx != -1)  {
          actor["שם הסרט"] = value.substring(0, end_idx);
          actor["שנה"] = value.substring(end_idx + 2, end_idx + 6);  //assume year has 4 digits
          actor["דמות"] = null;
        }
        else
          actor = { 'שם' : value, 'שנה' : null,'דמות' : null };
      }
      

      
      // if (
      //   value != "" &&
      //   ((into_actors && value.indexOf("\t") == -1) || !into_actors)
      // )
      //   if (
      //     !(into_actors || into_brief || into_movie_name || into_awards || into_biography) &&
      //     value.indexOf(", ") != -1
      //   ) {
      //     //multiple entities
      //     value.split(", ").forEach(element => {
      //       clean_dict[i++] = element;
      //     });
      //   } else clean_dict[i++] = value;
        

       if (
        value != "" &&
        ((into_actors && value.indexOf("\t") == -1) || !into_actors)
      )
        if (
          !(into_actors || into_brief || into_movie_name || into_awards || into_biography) &&
          value.indexOf(", ") != -1
        ) {
          //multiple entities
          value.split(", ").forEach(element => {
            clean_dict[i++] = element;
          });
        } else if (into_actors && value != "משחק") {
          clean_dict[i++] = actor;
        } else clean_dict[i++] = value;

    }

    if (clean_dict != {}) res.push(clean_dict);

    into_actors = 0;
    into_brief = 0;
    into_movie_name = 0;
    into_awards = 0;
    into_biography = 0;
  });

  return res;
};


//return a promise for movie record as js object
const scrapeActor = async url => {
  let clean_obj = await scrapeAndOrganize(url);
  let res = {};
  let relevant_details = [
    "תקציר",
    "תאריך לידה",
    "ביוגראפיה",
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
  while (true) {
    try {
      const html = await requestPromise(url);
      res["שם"] = await extractActorsName(html);
      break;
    } catch (err) {
      if (++count == maxTries) throw e;
    }
  }

  clean_obj.forEach(element => {
    if (Object.keys(element).length > 2) need_arr = 1;
    else need_arr = 0;

    for (var key in element) {
      let value = element[key];
      let clean_val = value;

      if (detail == "" && relevant_details.includes(value)) {
        detail = value;
        continue;
      } else if (detail == "") break; //not relevant information

      if(detail != "ביוגראפיה" && detail != "משחק") {
        let end_idx = value.indexOf(" (");
        if(end_idx == -1)
          end_idx = value.indexOf("("); //no space befor '('
        if(end_idx == -1)
          end_idx = value.length;
        clean_val =   value.substring(0, end_idx); //value without "(year)"
      }

      if (need_arr && !data_arr.includes(clean_val)) data_arr.push(clean_val);
      else res[detail] = clean_val;
    }

    if (need_arr && detail != "") {
      res[detail] = data_arr;
      data_arr = [];
    }

    detail = "";
  });

  return res;
  //return cleanResult(res);
};

//export
export const getActorsRecord = async url => {
  const rec = await scrapeActor(url);

  // console.log(rec);

  return rec;
};

// getActorsRecord(url4);

const extractActorsUrls = async (moviePage, personsGuid) => {
  let count = 0;
  let maxTries = 3;
  let html;
  while (true) {
    try {
      html = await requestPromise(moviePage);
      break;
    } catch (err) {
      if (++count == maxTries) return;
    }
  }

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
      let suff = $(value.parent)
        .find("a")
        .get(0);
      if (suff && suff.attribs && suff.attribs.href)
        // console.log(suff && suff.attribs && suff.attribs.href);
        suffixes.push(suff.attribs.href);
    }
  });

  // create urls
  suffixes.forEach(suffix => personsGuid.add(suffix.slice(1)));
};

const asyncForEach = async (array, callback, startFrom = 0) => {
  for (let index = startFrom; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};

(async () => {
  // await getActorsRecord(url1);
  const movieUrls = require("./movie-urls.json");
  const movieUrlsAsArray = movieUrls["moviesUrls"];
  const personsGuid = new Set();

  await asyncForEach(movieUrlsAsArray, async (letterArray, index) => {
    console.log("letter no. ", index);
    await asyncForEach(letterArray, async url => {
      console.log(url);
      await extractActorsUrls(url, personsGuid);
    });
  });

  const personsAsArray = Array.from(personsGuid);
  fs.writeFile(
    "./persons-urls.json",

    JSON.stringify({ personsAsArray }),

    function(err) {
      if (err) {
        console.error("Crap happens");
      }
    }
  );
})();
