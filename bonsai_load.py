from elasticsearch import Elasticsearch
from elasticsearch.helpers import streaming_bulk
from dotenv import load_dotenv
import os
import json
import re
import ast

load_dotenv()
ELASTIC_PASSWORD = os.getenv('ELASTIC_PASSWORD')

# create index in elasticsearch 
# TODO AVA add the rest of the mappings here so we can search by them
def create_index(es):
    es.indices.create(
        index="games", 
        body={
            "mappings":{
                "properties":{
                    "name":{"type":"text"},
                }
            }, 
        },
    )

# map JSON array to readable JSON format for elasticsearch
def format_data(games):
    for g in games:
        doc = {
            'name': g['name']
        }
        yield doc



es = Elasticsearch('http://localhost:9200', basic_auth=("elastic", ELASTIC_PASSWORD))

# grab json from file
games=[]
with open("esdata/game_data.json") as file:
    #print(json.load(file))
    #for line in file:
    games += ast.literal_eval(json.load(file))

num_games = len(games)

print("Creating index")
create_index(es)

print("Indexing documents")

successes=0
for (ok, action) in streaming_bulk(
    client=es, index="games", actions=format_data(games),
):
    successes += ok
    print("Indexed %d/%d documents" % (successes, num_games))
    
    