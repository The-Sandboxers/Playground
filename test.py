from dotenv import load_dotenv
import os
from steam_web_api import Steam

load_dotenv()

KEY = os.getenv("STEAM_WEB_API_KEY")
steam = Steam(KEY)

# Luke's steamid hard coded
steamID = 76561198446570527

# this is saying no results found
#print(steam.users.search_user("luke_glaze"))#['player']['steamid']

print(steam.users.get_user_details(steamID))
#print(steam.users.get_owned_games(steamID))
print(steam.users.get_user_recently_played_games(steamID))
