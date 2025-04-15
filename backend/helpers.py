
from igdb.wrapper import IGDBWrapper
from dotenv import load_dotenv
from igdb.wrapper import IGDBWrapper
import os, time
import requests
import json
from requests import get

load_dotenv(override=True)

# load Twitch secret key and client id from env
TWITCH_SECRET_KEY = os.getenv('TWITCH_SECRET_KEY')
TWITCH_CLIENT_ID = os.getenv('TWITCH_CLIENT_ID')

# store empty API result string
EMPTY_API_RESULT = b'[]'

# store dictionary of platform names and numbers
PLATFORMS = {"show_pc_windows":6, "show_playstation_5":167, "show_xbox_series_x_s":169, "show_playstation_4": 48, "show_xbox_one":49, "show_linux":3, "show_mac":14,"show_nintendo_switch":130}

'''
    Fetches the Twitch access token for the given secret key and client id.
    
    Returns:
        Response: a json object with the access token
'''
def fetch_access_token_Twitch(TWITCH_SECRET_KEY, TWITCH_CLIENT_ID):
    post_URL = f"https://id.twitch.tv/oauth2/token?client_id={TWITCH_CLIENT_ID}&client_secret={TWITCH_SECRET_KEY}&grant_type=client_credentials"
    x = requests.post(post_URL)
    return x.json()['access_token']

access_token = fetch_access_token_Twitch(TWITCH_SECRET_KEY, TWITCH_CLIENT_ID)

# create IGDB wrapper instance
wrapper = IGDBWrapper(TWITCH_CLIENT_ID, access_token)


'''
    Converts Platform strings to IGDB platform IDs.
    
    This function accepts a platform string, uses
    the platforms dictionary get the IGDB ID for the platform, and returns
    the IGDB platform ID.
    
    Returns: a list of IGDB platform IDs
'''
def get_platform_ids(platform_str):
    return PLATFORMS[platform_str]

'''
    Converts Steam IDs to IGDB IDs.
    
    This function accepts a list of one or more Steam game IDs, uses
    the IGDB API to get the IGDB IDs for each Steam game ID, and returns
    a list of one or more equivalent IGDB IDs.
    
    Returns: a list of IGDB IDs
'''
def get_igdb_ids(steam_ids):
    # id for steam itself as a service in IGDB
    STEAM_SERVICE_ID = "1"
    igdb_ids = []
    for id in steam_ids:
        time.sleep(.25)
        res = json.loads(wrapper.api_request('external_games',f'fields game; where uid=({str(id)}) & external_game_source=({STEAM_SERVICE_ID});').decode())
        # Check for edge case where game cannot be found in IGDB
        if len(res) == 1:
            igdb_ids.append(res[0]["game"])
        print(f"Games IGDB: {igdb_ids}")
    return igdb_ids

'''
    Gets owned Steam game IDs from a user profile.
    
    This function accepts a Steam User ID and a Steam API
    Key, requests the played game data for the user with 
    that Steam User ID, and returns a list of played games

    
    Returns: a list of Steam game IDs
'''
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

'''
    Gets the cover url for a given IGDB id
    
    This function accepts an IGDB id, uses the IGDB API
    to get the cover url for that game, and returns it
    with the correct sizing (big)
    
    Returns: a url for the game's cover
'''
def get_cover_url(igdb_id):
    time.sleep(.3)
    result = json.loads(wrapper.api_request(
        'games',
        f'fields name, cover.url; where id=({igdb_id});').decode())
    url_string = result[0]['cover']['url']
    # change t_thumb to t_cover_big to get proper sized cover and add https: prefix
    url_string="https:"+url_string.replace("t_thumb", "t_cover_big")
    return url_string

'''
    TODO: yeah victor you're gonna have to do this one

    
    Returns: 
'''
def verify_open_id(request, url):
    try:
        data = request.json
        params = {
            "openid.assoc_handle": request.args.get("openid.assoc_handle"),
            "openid.signed": request.args.get("openid.signed"),
            "openid.sig": request.args.get("openid.sig"),
            "openid.ns": "http://specs.openid.net/auth/2.0",
            "openid.mode": "check_authentication"
        }
        
        # Validate response with Steam
        response = requests.post(url, data=params)
        print(response.text)
        print(data)
        
        steam_id = data["steamId"].split("/")[-1]  # Extract Steam ID from URL
        
        return steam_id
        
    except Exception as e:
        raise e
    
