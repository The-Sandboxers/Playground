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

EMPTY_API_RESULT = b'[]'

index_name = "playgrounddb"

def fetch_access_token_Twitch(TWITCH_SECRET_KEY, TWITCH_CLIENT_ID):
    post_URL = f"https://id.twitch.tv/oauth2/token?client_id={TWITCH_CLIENT_ID}&client_secret={TWITCH_SECRET_KEY}&grant_type=client_credentials"
    x = requests.post(post_URL)
    return x.json()['access_token']

# gets list of platform IDs from platforms.json file
def get_platforms():
    # get data from platforms.json
    with open("esdata/platforms.json") as json_file:
        data = json.load(json_file)
    # append id for each platform to list
    plist = []
    for i in range(len(data)):
        plist.append(data[i]['id ']) # please leave the space after 'id' or it breaks lol
    # convert list to string (for use in parameters)
    return ', '.join(str(p) for p in plist)

access_token = fetch_access_token_Twitch(TWITCH_SECRET_KEY, TWITCH_CLIENT_ID)

# create IGDB wrapper instance
wrapper = IGDBWrapper(TWITCH_CLIENT_ID, access_token)

# get platforms to filter for
platforms = get_platforms()

offset = 500
limit = 500

# unix timestamp for first_release_date is for 1/1/2015 (~ 10 years ago)
byte_array = wrapper.api_request(
        'games',
        f'fields *; where rating_count>50 & category=0 & rating>5 & platforms=({platforms}); limit {limit}; offset 0;')
i=1
empty_result = False
while not empty_result:
    result = wrapper.api_request(
            'games',
            f'fields *; where rating_count>50 & category=0 & rating>5 & platforms=({platforms});  limit {limit}; offset {offset*i};')
    if result==EMPTY_API_RESULT:
        empty_result = True
    else:
        byte_array+=result
    i+=1
    
#print(byte_array)
print(type(byte_array))

byte_array = byte_array.decode()
print(byte_array)
print(json.dumps(byte_array))
with open('games.json', 'w') as f:
    f.write(json.dumps(byte_array, ensure_ascii=True))


# Consider using webhooks for up to date data.

#& platforms=({platforms})
#byte_array = byte_array.decode().replace("'", '"')

#with open('games.json', 'w') as f:
   # json.dump(byte_array, f)