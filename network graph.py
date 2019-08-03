import networkx as nx
import matplotlib.pyplot as plt
from pylab import *
from networkx.readwrite import json_graph
import json
from pymongo import MongoClient
from bidi import algorithm as bidialg


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



#input: graph g X flag edgeData X source and target nodes. When edgeData = True , present which movie connect the entities
#output: g chart
def draw_graph(g, edgeData, source, target):
    pos = nx.spring_layout(g)

    internal_nodes = []
    for n in g.nodes:
        if n != source and n != target:
            internal_nodes.append(n)

    nx.draw_networkx_nodes(g, pos,
                           nodelist= [source, target],
                           node_color='red',
                           node_size=600,
                           alpha=0.8)
    nx.draw_networkx_nodes(g, pos,
                           nodelist= internal_nodes,
                           node_color='blue',
                           node_size=500,
                           alpha=0.8)

    nx.draw_networkx_edges(g, pos, width=1.0, alpha=0.5)

    #graph labels
    node_labels = {}
    node_labels[target] = target
    node_labels[source] = source
    for node in internal_nodes:
        node_labels[node] = node
    if edgeData:
        edge_labels = {e: g.get_edge_data(*e)["טרסה םש"] for e in g.edges}
        nx.draw_networkx_edge_labels(g, pos, edge_labels)


    nx.draw_networkx_labels(g, pos, node_labels, font_size=16)
    plt.axis('off')
    plt.savefig("connection_graph.png")  # save as png
    plt.show()

    return



def create_relations_graph():
    client = MongoClient('localhost', 27017)
    db = client["cinema-of-israel-db"]["movies"]

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
    with open('json_graph.json', 'w') as outfile:
        json.dump(data, outfile)

    return



#input: name of json graph file to restore X first entity name X second entity name
#restore relations graph from json,find and show connection between name1 and name2 (if exists)
def find_connection(graph_file, name1, name2):
    try:
        with open(graph_file, 'r') as json_file:
            restore_graph = json_graph.adjacency_graph(json.load(json_file))
            connection = nx.Graph()


            relation_path = nx.shortest_path(restore_graph, source = name1, target = name2)
            #name right to left
            relation_rtl = [bidialg.get_display(y) for y in relation_path]
            nx.add_path(connection, relation_rtl)

            # add movie which connect
            for x in range(0, len(relation_path) - 1):
                movie_name = bidialg.get_display(restore_graph[relation_path[x]][relation_path[x + 1]]["שם הסרט"])
                connection[relation_rtl[x]][relation_rtl[x + 1]][bidialg.get_display("שם הסרט")] = movie_name

            draw_graph(connection, True, relation_rtl[0], relation_rtl[len(relation_rtl) - 1])

    except FileNotFoundError:
        print("Failed open json file")
    except:
        print("There is no connection between " , name1, " and ", name2)

    return




#this is the query
find_connection("json_graph.json", "גיל רוזנטל", "פיני טבגר")
