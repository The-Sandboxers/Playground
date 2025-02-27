from requests import get

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

