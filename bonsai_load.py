from elasticsearch import Elasticsearch, helpers
from dotenv import load_dotenv
import os
import json
import re

load_dotenv()

ELASTIC_PASSWORD = os.getenv('ELASTIC_PASSWORD')

es = Elasticsearch('http://localhost:9200', basic_auth=("elastic", ELASTIC_PASSWORD))

with open("esdata/docs.json") as file:
    docs = json.loads(file.read())
    # print(docs)
    helpers.bulk(es, docs)
    