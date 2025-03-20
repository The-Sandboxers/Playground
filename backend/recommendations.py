from elasticsearch import Elasticsearch, helpers
from dotenv import load_dotenv
import os

load_dotenv()

ELASTIC_PASSWORD = os.getenv('ELASTIC_PASSWORD')

es = Elasticsearch('http://localhost:9200', basic_auth=("elastic", ELASTIC_PASSWORD))

# hardcoded list of igdb ids to create recommendations off of for now
played_games = [72, 71, 17000, 1879]
for game in played_games:
  index="games"
  query={
          "match":{
            "igdb_id": game
          }
        }
  fields=["name"]
  result = es.search(index=index, query=query, fields=fields)
  for doc in result["hits"]["hits"]:
    print(doc["_source"]["name"])
