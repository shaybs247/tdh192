# Project: Israeli cinema industry social network

## Description
As part of course [Topics in Digital Humanities](https://www.cs.bgu.ac.il/~tdh192/Main) we decided to focus in Israeli cinema industry from country establishment (1948) since today (2019). Our topic to explore was **mapping social network** of every involved people in this industry \- from derectors and actors to sound men and cinematographers. (לוודא ירידת שורה)
A **connection** between two entities is a transitive relation. Connection means x related to y If and only if x,y took part in same movie.

We extracted the data for the social network from [cinemaofisrael site](https://www.cinemaofisrael.co.il/%d7%aa%d7%95%d7%9b%d7%9f-%d7%a2%d7%a0%d7%99%d7%99%d7%a0%d7%99%d7%9d/) by a web crawler writen in JavaScript. The data has expanded by Wikidata in order to create a wide and comprehensive MongoDB database (database details below). 
Web crawler files:
+ [Movies scraper](https://github.com/shaybensimon/tdh192/blob/master/movie-page-scraper.js)
+ [Actors scraper](https://github.com/shaybensimon/tdh192/blob/master/actors-scraper.js)
+ [Wikidata scraper](https://github.com/shaybensimon/tdh192/blob/master/wikidata-handler.js)

All the connections in Israeli cinema industry has mapped from our database to massive [social network graph](https://github.com/shaybensimon/tdh192/blob/master/json_graph.json.zip) which saved in Json format.
For discover connection between two cinema entities, use `find_connection("json_graph.json", name1, name2)` from [this file](https://github.com/shaybensimon/tdh192/blob/master/network%20graph.py). To build and handle the graphs we use NetworkX library.


## The database
[cinema-of-israel-db](https://github.com/shaybensimon/tdh192/tree/master/db-backup/cinema-of-israel-db) with MongoDB.
Includes two collections:
+ movies: 1021 movie records. You can find information (Hebrew) like: cast, characters, brief, years et cetera.
+ persons: 16352 cinema entity records. You can find information like: gender, years, acting career et cetera.

To restore [DB](https://github.com/shaybensimon/tdh192/tree/master/db-backup/cinema-of-israel-db): install mongodb server and then from project directory (tdh192) type in console 'mongorestore --db cinema-of-israel-db ./db-backup/cinema-of-israel-db'.


## Query and output
**find_connection**: 
Input: name of json graph file to restore X first entity name (source) X second entity name (target).
Output: connection (a path graph) between name1 and name2 (if exists).
This function restore relations graph from json, find and display connection between name1 and name2 (if exists).
For discover connection between two cinema entities, use `find_connection("json_graph.json", name1, name2)` from [this file](https://github.com/shaybensimon/tdh192/blob/master/network%20graph.py).
Source and target nodes will be in red color. Each edge specipies the movie which connect the entities.

example:
'find_connection("json_graph.json", "גיל רוזנטל", "פיני טבגר")`
output: ![image](https://github.com/shaybensimon/tdh192/blob/master/example_connection_graph.png?raw=true)


