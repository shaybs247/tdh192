

import networkx as nx
import matplotlib.pyplot as plt
from pylab import *
from networkx.readwrite import json_graph
import json
from pymongo import MongoClient


#return array with movie's name and movie's crew
def get_movie_cast(movieRec):
    cast = []
    relevant_keys = ["איפור", "בום", "בימוי", "הפקה", "הקלטת קול", "ליהוק", "מוזיקה" , "משחק", "סטילס", "תסריט", "ע"]

    for key in movieRec:
        if key in relevant_keys:
            if key == "משחק":
                for actor in movieRec[key]:
                    cast.append(actor["שם"])
            elif key == "ע":
                for role in movieRec[key]:
                    if isinstance(movieRec[key][role], list):
                        for x in movieRec[key][role]:
                            cast.append(x)
                    else:
                        cast.append(movieRec[key][role])
            else:
                #check if there is multiple entities
                if isinstance(movieRec[key], list):
                    for x in movieRec[key]:
                        cast.append(x)
                else:
                    cast.append(movieRec[key])

    return [movieRec["שם הסרט"], cast]



client = MongoClient('localhost', 27017)
db = client["cinema-of-israel-db"]["movies"]

# m = db.find_one({'שם הסרט': 'אבא גנוב'})
# print(m.count_documents())
# print(get_movie_cast(m))
# print(m["שם הסרט"])
# ar = [1,2,3] + [4]
# print(isinstance("יהודה ברקן", list))
# print(ar)


movies_list = db.find({})
all_casts = []
for rec in movies_list:
    all_casts.append(get_movie_cast(rec))

#every movie represents by clique sub graph
all_subgraph = [nx.complete_graph(x[1]) for x in all_casts]

#set edges attribute to movie's name for each sub graph
for x in range (0, len(all_casts)):
    nx.set_edge_attributes(all_subgraph[x], all_casts[x][0], "שם הסרט")

#union graph includes all movies
israel_cinema_relations = nx.compose_all(all_subgraph)

#save graph in json format
data = json_graph.adjacency_data(israel_cinema_relations)
with open('json_graph.txt', 'w') as outfile:
    json.dump(data, outfile)


nx.draw(israel_cinema_relations, with_labels=True, font_weight='bold')
plt.show()


########## until here relevant code ##############







# G = nx.Graph()
#
# G.add_nodes_from([1, 2, 3])
# G.add_edges_from([(1, 2), (1, 3)])
#
# G.add_edge(1, 2, movie= "אבא גנוב" )

movie_subGraph1 = nx.complete_graph(["יהודה ברקן", "זאב רווח", "ליאור מזרחי", "אלעד כהן", "act 1", "act 2"])
movie_subGraph2 = nx.complete_graph(["משה יבגי", "זאב רווח", "ליאור אשכנזי", "אסי כהן", "act 2", "act 3"])
movie_subGraph3 = nx.complete_graph(["act 3", "אסי לוי"])

nx.set_edge_attributes(movie_subGraph1, "אבא גנוב", "שם הסרט")
nx.set_edge_attributes(movie_subGraph2, "שקר כלשהו 2", "שם הסרט")
nx.set_edge_attributes(movie_subGraph3, "אביבה אהובתי", "שם הסרט")


# there is compose_all method for multiple movies
#U = nx.compose(movie_subGraph1, movie_subGraph2)
U = nx.compose_all([movie_subGraph1, movie_subGraph2, movie_subGraph3])

#save graph as json
data = json_graph.adjacency_data(U)
with open('json_graph.txt', 'w') as outfile:
    json.dump(data, outfile)



#nx.draw_networkx_edge_labels(U, pos=nx.spring_layout(U))
# nx.draw(U, with_labels = True, font_weight = 'bold')
# plt.show()


#restore graph from json, find and show connection
with open('json_graph.txt', 'r') as json_file:
    restoreG = json_graph.adjacency_graph(json.load(json_file))
    connection = nx.Graph()
    try:
        name1 = "יהודה ברקן"
        name2 = "אסי לוי"
        relation_path = nx.shortest_path(restoreG, source= name1, target= name2)
        nx.add_path(connection, relation_path)

        #add movie wich connect
        for x in range (0, len(relation_path) - 1):
            movie_name = restoreG[relation_path[x]][relation_path[x + 1]]["שם הסרט"]
            connection[relation_path[x]][relation_path[x + 1]]["שם הסרט"] = movie_name
            # print(movie_name)

        nx.draw_networkx_edge_labels(connection, pos=nx.spring_layout(connection))
        nx.draw(connection, with_labels=True, font_weight='bold')
        plt.show()
    except:
        print("There is no connection between " , name1, " and ", name2)






# find way append save big graph as json and retrieve data at each query


# print(movie_subGraph.size(), movie_subGraph.nodes())
# nx.set_edge_attributes(movie_subGraph1, "אבא גנוב", "שם הסרט")
# edge_labels = nx.draw_networkx_edge_labels(movie_subGraph1, pos=nx.spring_layout(movie_subGraph1))
# nx.draw(movie_subGraph1, with_labels = True, font_weight = 'bold')
# plt.show()



