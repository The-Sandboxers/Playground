from elasticsearch import Elasticsearch, helpers
from dotenv import load_dotenv
import os
import json
import re

load_dotenv()

ELASTIC_PASSWORD = os.getenv('ELASTIC_PASSWORD')

es = Elasticsearch('http://localhost:9200', basic_auth=("elastic", ELASTIC_PASSWORD))

# search for all games with "star" in the name
res = es.search(index = "games", query={"match":{"name":"star"}})

print(len(res["hits"]["hits"]))
for doc in res["hits"]["hits"]:
  print(doc)

# search for games that are not part of a bundle
res = es.search(index = "games", query={
  "bool":{
    "must_not":{
      "exists":{
        "field": "bundles"
      }
    }
  }
})

print(len(res["hits"]["hits"]))
for doc in res["hits"]["hits"]:
  print(doc)
