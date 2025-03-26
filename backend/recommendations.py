from elasticsearch import Elasticsearch, helpers
from dotenv import load_dotenv
import os

load_dotenv()

ELASTIC_PASSWORD = os.getenv('ELASTIC_PASSWORD')

es = Elasticsearch('http://localhost:9200', basic_auth=("elastic", ELASTIC_PASSWORD), request_timeout=20)

# parameter played_games: list of igdb_ids
def recommendation_algorithm(played_games):
  query_docs = []
  for game in played_games:
    index="games"
    query={
            "match":{
              "igdb_id": game
            }
          }
    fields=["name"]
    result = es.search(index=index, query=query, fields=fields)

    # create query object of elasticsearch IDs for all games to use in querying
    for doc in result["hits"]["hits"]:
      doc_id = doc["_id"]
      dict_item = {}
      dict_item["_id"]=doc_id
      query_docs.append(dict_item)


  query ={
    "more_like_this" : {
      "fields" : ["keywords"],
      "like" : query_docs,
      "min_term_freq" : 0,
      "min_doc_freq" : 1,
      "minimum_should_match": '20%',
    }
  }

  result = es.search(index=index, query=query)
  return result
  