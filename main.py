from dotenv import load_dotenv
from elasticsearch import Elasticsearch, helpers
from igdb.wrapper import IGDBWrapper
import datetime
import os
import requests
import json

load_dotenv()

ELASTIC_API_KEY= os.getenv('ELASTIC_API_KEY')
ELASTIC_SEARCH_URL = os.getenv('ELASTIC_SEARCH_URL')

TWITCH_SECRET_KEY = os.getenv('TWITCH_SECRET_KEY')
TWITCH_CLIENT_ID = os.getenv('TWITCH_CLIENT_ID')


index_name = "playgrounddb"

def fetch_access_token_Twitch(TWITCH_SECRET_KEY, TWITCH_CLIENT_ID):
    post_URL = f"https://id.twitch.tv/oauth2/token?client_id={TWITCH_CLIENT_ID}&client_secret={TWITCH_SECRET_KEY}&grant_type=client_credentials"
    x = requests.post(post_URL)
    return x.json()['access_token']

access_token = fetch_access_token_Twitch(TWITCH_SECRET_KEY, TWITCH_CLIENT_ID)
