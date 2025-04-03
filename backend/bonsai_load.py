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

# keyword: NOT mapped at time of indexing. have to search for full value
# text: mapped at time of indexing, can search by partial value
# for example, a search for "name: star (type text)" would return "Kirby Star Allies", but
# a search for "platform: Nintendo (type keyword)" would not return "Nintendo Switch"

# see https://api-docs.igdb.com/#game for what these are
def create_index(es):
    es.indices.create(
        index="games", 
        body={
            "mappings":{
                "properties":{
                    "name":{"type":"text"},
                    "igdb_id": {"type":"keyword"},
                    "age_ratings": {"type":"keyword"},
                    "aggregated_rating": {"type":"double"},
                    "aggregated_rating_count": {"type":"integer"},
                    "alternative_names": {"type":"keyword"},
                    "artworks": {"type":"keyword"},
                    "bundles": {"type": "keyword"},
                    "category": {"type":"keyword"},
                    "collections": {"type":"keyword"},
                    "cover": {"type":"keyword"},
                    "cover_url": {"type":"text"},
                    "created_at": {"type":"date"},
                    "expanded_games": {"type":"keyword"},
                    "expansions": {"type":"keyword"},
                    "external_games": {"type":"keyword"},
                    "first_release_date": {"type":"date"},
                    "franchises": {"type":"keyword"},
                    "game_engines": {"type":"keyword"},
                    "game_localizations": {"type":"keyword"},
                    "game_modes": {"type":"keyword"},
                    "genres": {"type":"keyword"},
                    "hypes": {"type":"integer"},
                    "involved_companies": {"type":"keyword"},
                    "keywords": {"type":"keyword"},
                    "language_supports": {"type":"keyword"},
                    "multiplayer_modes": {"type":"keyword"},
                    "platforms": {"type":"keyword"},
                    "player_perspectives": {"type":"keyword"},
                    "ports": {"type":"keyword"},
                    "rating": {"type":"double"},
                    "rating_count": {"type":"integer"},
                    "release_dates": {"type":"date"},
                    "remakes": {"type":"keyword"},
                    "remasters": {"type":"keyword"},
                    "screenshots": {"type":"keyword"},
                    "similar_games": {"type":"keyword"},
                    "slug": {"type":"text"},
                    "standalone_expansions": {"type":"keyword"},
                    "storyline": {"type":"text"},
                    "summary": {"type":"text"},
                    "tags": {"type":"keyword"},
                    "themes": {"type":"keyword"},
                    "total_rating": {"type":"double"},
                    "total_rating_count": {"type":"integer"},
                    "updated_at": {"type":"date"},
                    "url": {"type":"text"},
                    "version_parent": {"type":"keyword"},
                    "videos": {"type":"keyword"},
                    "websites": {"type":"keyword"}
                }
            }, 
        },
    )

# map JSON array to readable JSON format for elasticsearch
def format_data(games):
    for g in games:
        doc = {
            'name': g.get('name'),
            'igdb_id': g.get('id', None),
            'age_ratings':g.get('age_ratings', None),
            'aggregated_rating':g.get('aggregated_rating', None),
            'aggregated_rating_count':g.get('aggregated_rating_count', None),
            'alternative_names':g.get('alternative_names', None),
            'artworks':g.get('artworks', None),
            'bundles':g.get('bundles', None),
            'category':g.get('category', None),
            'collections':g.get('collections', None),
            'cover':g.get('cover', None),
            'cover_url': None,
            'created_at':g.get('created_at', None),
            'expanded_games':g.get('expanded_games', None),
            'expansions':g.get('expansions', None),
            'external_games':g.get('expansions', None),
            'first_release_date':g.get('first_release_date', None),
            'franchises':g.get('franchises', None),
            'game_engines':g.get('game_engines', None),
            'game_localizations':g.get('game_localizations', None),
            'game_modes':g.get('game_modes', None),
            'genres':g.get('genres', None),
            'hypes':g.get('hypes', None),
            'involved_companies':g.get('involved_companies', None),
            'keywords':g.get('keywords', None),
            'language_supports':g.get('language_supports', None),
            'multiplayer_modes':g.get('multiplayer_modes', None),
            'platforms':g.get('platforms', None),
            'player_perspectives':g.get('player_perspectives', None),
            'ports':g.get('ports', None),
            'rating':g.get('rating', None),
            'rating_count':g.get('rating_count', None),
            'release_dates':g.get('release_dates', None),
            'remakes':g.get('remakes', None),
            'remasters':g.get('remasters', None),
            'screenshots':g.get('screenshots', None),
            'similar_games':g.get('similar_games', None),
            'slug':g.get('slug', None),
            'standalone_expansions':g.get('standalone_expansions', None),
            'storyline':g.get('storyline', None),
            'summary':g.get('summary', None),
            'tags':g.get('tags', None),
            'themes':g.get('themes', None),
            'total_rating':g.get('total_rating', None),
            'total_rating_count':g.get('total_rating_count', None),
            'updated_at':g.get('updated_at', None),
            'url':g.get('url', None),
            'version_parent':g.get('version_parent', None),
            'videos':g.get('videos', None),
            'websites':g.get('websites', None)
        }
        yield doc



es = Elasticsearch('http://playground-elasticsearch-1:9200', basic_auth=("elastic", ELASTIC_PASSWORD))

# grab json from file
games=[]
with open("esdata/game_data.json") as file:
    #print(json.load(file))
    #for line in file:
    games += ast.literal_eval(json.load(file))

num_games = len(games)

# delete index if it already exists
es.options(ignore_status=[400, 404]).indices.delete(index="games")

print("Creating index")
create_index(es)

print("Indexing documents")

successes=0
for (ok, action) in streaming_bulk(
    client=es, index="games", actions=format_data(games),
):
    successes += ok
    print("Indexed %d/%d documents" % (successes, num_games))
    
    