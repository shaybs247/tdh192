const wdk = require("wikibase-sdk")({
  instance: "https://www.wikidata.org",
  sparqlEndpoint: "https://query.wikidata.org/sparql"
});
const fetch = require("node-fetch");

const movieRelatedOccupations = [
  "Q2526255",
  "Q28389",
  "Q36180",
  "Q947873",
  "Q947873",
  "Q33999",
  "Q10800557",
  "Q2259451",
  "Q4610556",
  "Q3282637",
  "Q3357567",
  "Q488205",
  "Q1930187"
];

const getValue = (obj, key) => {
  if (!obj) return null;
  if (obj.hasOwnProperty(key))
    return Array.isArray(obj[key]) ? obj[key][0] : obj[key];
  else return null;
};

const getWikidataById = async id => {
  const url = wdk.getEntities({
    ids: [id],
    languages: "he",
    props: ["labels", "id", "descriptions", "claims"]
  });
  const res = await fetch(url);
  const jsonEntity = await res.json();
  let parsedId;
  try {
    parsedId = (await wdk.parse.wd.entities(jsonEntity))[id];
    return id;
  } catch {
    return -1;
  }
};

const getLabelById = async id => {
  const entity = await getWikidataById(id);
  if (entity === -1) return -1;
  const labels = getValue(entity, "labels");
  return getValue(labels, "he");
};

// get data from wikidata by wdId.
// extract only necessary keys and translate them to their value.
const getPersonDataById = async id => {
  const entity = await getWikidataById(id);
  const claims = entity.claims;
  const occupation = getValue(claims, "P106");
  if (!movieRelatedOccupations.includes(occupation))
    return { wdId: "entered the wrong wikidata entity" };
  const wdId = getValue(entity, "id");
  const imdbId = getValue(claims, "P345");
  const מין =
    getValue(claims, "P21") === "Q6581097"
      ? "זכר"
      : getValue(claims, "P21") === "Q6581072"
      ? "נקבה"
      : `טרנסג'נדר`;
  const אזרחות = await getLabelById(getValue(claims, "P27"));
  const placeOfBirth = await getLabelById(getValue(claims, "P19"));
  const dateOfBirth = getValue(claims, "P569");
  const dateOfDeath = getValue(claims, "P570");
  const ans = {
    wdId,
    imdbId,
    מין,
    אזרחות,
    "מקום לידה": placeOfBirth,
    "תאריך לידה": dateOfBirth,
    "תאריך מוות": dateOfDeath
  };
  return ans;
};

export const getPersonDataByName = async name => {
  const url = await wdk.searchEntities(name);
  const res = await fetch(url);
  const serachResults = await res.json();
  const firstResult = getValue(serachResults, "search");
  if (!firstResult) return { wdId: "noWikiData" };
  const id = getValue(firstResult, "id");

  return await getPersonDataById(id);
};

const run = async () => {
  console.log(await getPersonDataByName("שייקה אופיר"));
};

// run();
