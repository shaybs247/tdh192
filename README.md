# Project: Israeli cinema industry social network

## Description
As part of course [Topics in Digital Humanities](https://www.cs.bgu.ac.il/~tdh192/Main) we decided to focus in Israeli cinema industry since country establishment (1948) until today (2019). Our topic to explore was **mapping social network** of every involved people in this industry \- from directors and actors to soundmen and cinematographers.<br />
A **connection** between two entities is a transitive relation. Connection means x related to y If and only if x,y took part in same movie.

We extracted the data for the social network from [cinemaofisrael site](https://www.cinemaofisrael.co.il/%d7%aa%d7%95%d7%9b%d7%9f-%d7%a2%d7%a0%d7%99%d7%99%d7%a0%d7%99%d7%9d/) by a web crawler writen in JavaScript. The data has expanded by Wikidata in order to create a wide and comprehensive MongoDB database (database details below). <br />
Web crawler files:
+ [Movies scraper](https://github.com/shaybensimon/tdh192/blob/master/movie-page-scraper.js)
+ [Actors scraper](https://github.com/shaybensimon/tdh192/blob/master/actors-scraper.js)
+ [Wikidata scraper](https://github.com/shaybensimon/tdh192/blob/master/wikidata-handler.js)

Crawlers and Database integation:
+ [JS index file](https://github.com/shaybensimon/tdh192/blob/master/index.js)

All the connections in Israeli cinema industry has mapped from our database to massive [social network graph](https://github.com/shaybensimon/tdh192/blob/master/json_graph.json.zip) which saved in Json format.
For discover connection between two cinema entities, use `find_connection("json_graph.json", name1, name2)` from [this file](https://github.com/shaybensimon/tdh192/blob/master/network%20graph.py). To build and handle the graphs we use NetworkX library. <br />
For discover more than one connection, use `find_all_connections(graph_file, name1, name2, maximal_length)`.


## The database
[cinema-of-israel-db](https://github.com/shaybensimon/tdh192/tree/master/db-backup/cinema-of-israel-db) with MongoDB.
Includes two collections:
+ movies: 1021 movie records. You can find information (Hebrew) like: cast, characters, brief, years et cetera.
+ persons: 16352 cinema entity records. You can find information like: gender, years, acting career et cetera.

To restore [DB](https://github.com/shaybensimon/tdh192/tree/master/db-backup/cinema-of-israel-db): install mongodb server and then from project directory (tdh192) type in console 'mongorestore --db cinema-of-israel-db ./db-backup/cinema-of-israel-db'.


## Queries and outputs
1) **find_connection:** <br />
Input: name of json graph file to restore X first entity name (source) X second entity name (target). <br />
Output: connection information as dictionary, connection chart (a path graph) between name1 and name2 (if exists). <br />
This function restore relations graph from json, find and display connection between name1 and name2 (if exists).
For discover connection between two cinema entities, use `find_connection("json_graph.json", name1, name2)`. <br />
Source and target nodes will be in red color. Each edge specipies the movie which connect the entities.

2) **find_all_connections:** <br />
Input: name of json graph file to restore X first entity name (source) X second entity name (target) X maximal connection length. <br />
Output: array icludes information of each connection which has found, connection chart for each connection which has found. <br />
Similar to find_connection, but this function find **all connections** between name1 and name2 (if exists) with at most maximal_length connecting movies (edges). <br />
Call this query by `find_all_connections(graph_file, name1, name2, maximal_length)`.

Queries from [this file](https://github.com/shaybensimon/tdh192/blob/master/network%20graph.py).

Examples: <br />
`find_connection("json_graph.json", "גיל רוזנטל", "פיני טבגר")` <br />
Output:<br />
![find_connection img](https://github.com/shaybensimon/tdh192/blob/master/results/connection_graph1.png?raw=true)

`find_all_connections("json_graph.json", "גיל רוזנטל", "פיני טבגר", 6)` <br />
Output:<br />
![find_all_connections img](https://github.com/shaybensimon/tdh192/blob/master/results/connection_graph2.png?raw=true)


