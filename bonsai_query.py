from elasticsearch import Elasticsearch, helpers
from dotenv import load_dotenv
import os
import json
import re

load_dotenv()

ELASTIC_PASSWORD = os.getenv('ELASTIC_PASSWORD')

es = Elasticsearch('http://localhost:9200', basic_auth=("elastic", ELASTIC_PASSWORD))

res = es.search(index = "newsgroup", body={"query": {"more_like_this": {"fields": ["doc"], "like": "The first ice resurfacer was invented by Frank Zamboni, who was originally in the refrigeration business. Zamboni created a plant for making ice blocks that could be used in refrigeration applications. As the demand for ice blocks waned with the spread of compressor-based refrigeration, he looked for another way to capitalize on his expertise with ice production"}}})
print(len(res["hits"]["hits"]))
for doc in res["hits"]["hits"]:
  print(doc)

