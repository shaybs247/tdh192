
const request = require("request");
const requestPromise = require("request-promise");
const cheerio = require("cheerio");
var scraper = require('table-scraper');
const fs = require("fs");



const url1 = "https://www.cinemaofisrael.co.il/%D7%90%D7%91%D7%90-%D7%92%D7%A0%D7%95%D7%91-2/";
const url2 = "https://www.cinemaofisrael.co.il/%D7%90%D7%91%D7%95-%D7%90%D7%9C-%D7%91%D7%A0%D7%90%D7%AA/";
const url3 = "https://www.cinemaofisrael.co.il/%D7%90%D7%91%D7%99%D7%91%D7%94-%D7%90%D7%94%D7%95%D7%91%D7%AA%D7%99/";


let async_extract_movie_name =  async (url) => {
    const html = await requestPromise(url);
    const $ = cheerio.load(html);
    let name = $(".movie_name").text();

    return name;
};

let async_extract_imdbID =  async (url) => {
    const html = await requestPromise(url);
    const $ = cheerio.load(html);
    let imdb_link = $("[href*=imdb]").attr("href");

    if(imdb_link == null)
        return null;

    let splited_link = imdb_link.split('/'); 
    let is_id = 0;
    let res = null;

    splited_link.forEach(element => {
        if(is_id == 1) {
            res = element;
            is_id = 0;
        }

        if(element == "title")
            is_id = 1;       
    });

    return res;
};


let async_extract_dateCreated =  async (url) => {
    const html = await requestPromise(url);
    const $ = cheerio.load(html);
    let year = $("[itemprop*=dateCreated]").text();

    return year;
};



//return a promise for array incudes movie data after first cleaning
let get_clean_arr =  (url) => {
    const result =  scraper.get(url).then(function(tableData) {
        let movie_data = tableData[0];  //all the data exists in the first table
        let res = [];

        movie_data.forEach(element => {
            let clean_dict = {};
            //let another_data = {};    //for data after ',' if exists
            let i = 0;
            let j = 0;
            let into_actors = 0;
            let into_brief = 0;
            let into_movie_name = 0;
            let into_awards = 0;

            for(var key in element) {
                let value = element[key];
                let actor = {};

                if(value == 'משחק') {
                    into_actors = 1;
                    //another_data[j++] = "דמויות";
                }
                else if(value == 'תקציר')
                    into_brief = 1;
                else if(value == 'שם אחר/לועזי')
                    into_movie_name = 1;
                else if(value ==  'פרסים/פסטיבלים חו"ל' || value == 'פרסים/פסטיבלים ישראל')
                    into_awards = 1;

                if(value.indexOf(',') != -1) {
                    let splited_val = value.split(', ');  

                    if(into_actors) {
                        actor['שם'] = splited_val[0];   //get actor's name
                        actor['דמות'] = null;

                        if(splited_val[1].indexOf('\t') == -1 && splited_val[1] != 'בתפקיד עצמו') {
                            actor['דמות'] = splited_val[1];      //get character's name
                        } 
                    }
                     
                    else if(into_awards) {
                        value = splited_val[0];  
                    }
                
                }
                else if(into_actors)    //actor without character's name
                    actor = {'שם' : value , 'דמות' : null};
  

                if (value != '' && ((into_actors && value.indexOf('\t') == -1) || !into_actors))
                    if(!(into_actors || into_brief || into_movie_name || into_awards) && value.indexOf(', ') != -1) { //multiple entities
                        value.split(', ').forEach(element => {
                            clean_dict[i++] = element;     
                        });
                    }
                    else if(into_actors && value != 'משחק') {
                        clean_dict[i++] = actor;
                    }
                    else
                        clean_dict[i++] = value;     
                
            }

            if(clean_dict != {})
                res.push(clean_dict);

            into_actors = 0;
            into_brief = 0;
            into_movie_name = 0;
            into_awards = 0;
        });

        return new Promise(resolve => { resolve(res);});

        });

        return result;
    };



//return a promise for movie record as js object
let get_movie_rec = async (url) => {
    let clean_obj =  await get_clean_arr(url);
    let res = {};
    let relevant_details = ['תקציר', 'שם אחר/לועזי', 'משחק', 'בימוי', 'ע.בימוי', 'תסריט', 'ניהול תסריט', 'ע.הפקה', 'ע.צילום', 'חברת הפקה', 'סטילס', 'ליהוק', 'ע.בימוי', 'הפקה','הקלטת קול', 'בום', 'איפור', 'צילום', 'ע.צילום','עריכה', 'ע.עריכה', 'מוזיקה', 'פרסים/פסטיבלים חו"ל', 'פרסים/פסטיבלים ישראל', 'מספר צופים בישראל', 'תקציב'];
    let detail = '';
    let need_arr = 0;
    let data_arr = [];

    res['שם הסרט']  = await async_extract_movie_name(url);
    res['שנת יציאה']  = await async_extract_dateCreated(url);
    res['imdbId']  = await async_extract_imdbID(url);
     
    clean_obj.forEach(element => {
        if(Object.keys(element).length > 2)
            need_arr = 1;
        else
            need_arr = 0;

        for(var key in element) {
            let value = element[key];

            if(detail == '' &&  relevant_details.includes(value)) {
                detail = value;
                continue;
            }
            else if(detail == '')
                break;   //not relevant information

            if(need_arr && !data_arr.includes(value))
                data_arr.push(value);
            else
                res[detail] = value;
        }

        if(need_arr && detail != '') {
            res[detail] = data_arr;
            data_arr = [];
        }

        detail = '';
    });

    return res;    
};


let test = async (url) => {
    const rec = await get_movie_rec(url);
     
    console.log(rec);
};


test(url1);
test(url2);
test(url3);






