
from igdb.wrapper import IGDBWrapper
from dotenv import load_dotenv
from igdb.wrapper import IGDBWrapper
import os
import requests
import json
from requests import get

load_dotenv()

TWITCH_SECRET_KEY = os.getenv('TWITCH_SECRET_KEY')
TWITCH_CLIENT_ID = os.getenv('TWITCH_CLIENT_ID')

EMPTY_API_RESULT = b'[]'

def fetch_access_token_Twitch(TWITCH_SECRET_KEY, TWITCH_CLIENT_ID):
    post_URL = f"https://id.twitch.tv/oauth2/token?client_id={TWITCH_CLIENT_ID}&client_secret={TWITCH_SECRET_KEY}&grant_type=client_credentials"
    x = requests.post(post_URL)
    return x.json()['access_token']

access_token = fetch_access_token_Twitch(TWITCH_SECRET_KEY, TWITCH_CLIENT_ID)

# create IGDB wrapper instance
wrapper = IGDBWrapper(TWITCH_CLIENT_ID, access_token)

# returns IGDB IDs for games given a list of steam IDs
def get_igdb_ids(steam_ids):
    # id for steam itself as a service in IGDB
    STEAM_SERVICE_ID = "1"
    igdb_ids = []
    for id in steam_ids:
        igdb_ids.append(json.loads(wrapper.api_request('external_games',f'fields id; where uid=({str(id)}) & external_game_source=({STEAM_SERVICE_ID});').decode())[0]["id"])
    return igdb_ids

  
# returns a list of game_ids given a steam_id and steam web api key
def get_owned_steam_game_ids(steam_id, STEAM_API_KEY):
    # Call to Steam Web API endpoint
    url = f"https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/"
    params = {
        "key": STEAM_API_KEY,
        "steamid": steam_id,
        "include_appinfo": 1,
        "include_played_free_games": 1,
        "format": "json"
    }
    
    response = get(url, params=params)
    data = response.json().get("response", {})
    
    return [game["appid"] for game in data.get("games", [])]

# returns a cover url for a given igdb_id
def get_cover_url(igdb_id):
    result = json.loads(wrapper.api_request(
        'games',
        f'fields name, cover.url; where id=({igdb_id});').decode())
    url_string = result[0]['cover']['url']
    # change t_thumb to t_cover_big to get proper sized cover and add https: prefix
    url_string="https:"+url_string.replace("t_thumb", "t_cover_big")
    return url_string



