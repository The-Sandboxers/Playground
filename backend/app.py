from flask import Flask, request, jsonify, redirect, url_for
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, get_jwt_identity, jwt_required, get_jwt, create_refresh_token
from flask_migrate import Migrate
from flask_cors import CORS
from config import ApplicationConfig
from urllib.parse import urlencode
from elasticsearch import Elasticsearch
from dotenv import load_dotenv
from helpers import get_owned_steam_game_ids, get_cover_url, get_igdb_ids, verify_open_id, get_platform_ids
import os
import logging
import redis
from requests import post

# import users table
from models import db, User, UserGame

app = Flask(__name__)
app.config.from_object(ApplicationConfig)

logging.basicConfig(level=logging.INFO)

# Create database for app
db.init_app(app)

# JWT Config
jwt = JWTManager(app)

# Enable CORS
CORS(app, origins=["http://localhost:5173"])

# Allow database migrations
migrate = Migrate(app, db)

# Initialize Bcrypt
bcrypt = Bcrypt(app)

# Initialize Redis
redis_client = redis.StrictRedis(host="redis", db=0, decode_responses=True)
BLACKLISTED_TOKENS_KEY = "blacklisted_tokens"

# Initialize Steam OpenID url and API key
STEAM_OPENID_URL = "https://steamcommunity.com/openid/login"

STEAM_API_KEY = app.config["STEAM_API_KEY"]

# initialize elasticsearch instance
load_dotenv()
ELASTIC_PASSWORD = os.getenv('ELASTIC_PASSWORD')
es = Elasticsearch('http://playground-elasticsearch-1:9200', basic_auth=("elastic", ELASTIC_PASSWORD))

'''
    Adds a new user to the User table.
    
    This POST route receives an email, password, and username from the request, 
    verifies that the email and username do not already exist in the User table,
    generates a password hash, and then adds that user's information
    (email, username, password hash) to the User table.
    
    Returns:
        Response: a json object with the new user's id, email, and username,
        or an error message and code
'''
@app.route("/register", methods=["POST"])
@jwt_required(optional=True)
def register_user():
    if get_jwt_identity():
        return jsonify({"error": "User already logged in"}), 404
    # get user's email, password, and username from request
    email = request.json["email"]
    password = request.json["password"]
    username = request.json["username"]
    
    # Check if email or username already exist
    email_exists = User.query.filter_by(email=email).first() is not None
    username_exists = User.query.filter_by(username=username).first() is not None
    if email_exists:
        return jsonify({"error": "Email already exists"}), 409
    if username_exists:
        return jsonify({"error": "Username already exists"}), 409
        
    # hash password
    hashed_password = bcrypt.generate_password_hash(password).decode()
    
    # Create user
    new_user = User(email=email,username=username,password_hash=hashed_password)
    db.session.add(new_user)

    # set user's platform choices to be all true (show games from all platforms)
    new_user.show_pc_windows = True
    new_user.show_playstation_5 = True
    new_user.show_xbox_series_x_s = True
    new_user.show_playstation_4 = True
    new_user.show_xbox_one = True
    new_user.show_linux = True
    new_user.show_mac = True
    new_user.show_nintendo_switch = True

    db.session.commit()
    
    return jsonify({
        "id": new_user.id,
        "email": new_user.email,
        "username": new_user.username
    }), 200

 
'''
    Logs in to an existing user account.
    
    This POST route receives an username and password from the request, 
    verifies that the email exists in the User table and that the
    password matches that user's password hash, and then returns 
    the access and refresh tokens for the user.
    
    Returns:
        Response: a json object with the access and refresh tokens,
        or an error message and code
'''  
@app.route("/login", methods=["POST"])
def login_user():
    username = request.json.get("username")
    password = request.json.get("password")
    
    # Get user
    user = User.query.filter_by(username=username).first()
    
    # If user doesn't exist, return error
    if not user:
        return jsonify({"error": "Username or password incorrect"}), 401
    
    # If password is correct, return access and refresh token
    if bcrypt.check_password_hash(user.password_hash, password):
        access_token = create_access_token(identity=username)
        refresh_token = create_refresh_token(identity=username)
        return jsonify(access_token=access_token, refresh_token=refresh_token), 200
    else:
        # If password doesn't exist return error
        return jsonify({"error": "Username or password incorrect"}), 401
       
        
'''
    Loads game information from a user's profile.
    
    This GET route retrieves the username from the JWT, gets
    that user's played and liked games from the UserGame table, 
    gets their chosen platforms from the User table,
    grabs the information about their games from ElasticSearch, 
    and returns all of the game and platform information.
    
    Returns:
        Response: a json object with the username, an array
        of selected platform names, an array of played game ids, 
        an array of liked game ids, an array of full played game 
        information (sources), and an array of full liked game information
        (sources)
'''  
@app.route("/profile", methods=["GET"])
@jwt_required()
def user_profile():
    username = get_jwt_identity()
    user = User.query.filter_by(username=username).first()
    steam_id_exists = user.steam_id is not None
    platforms = {}
    played_games_ids = []
    played_games = []
    liked_games_ids = []
    liked_games = []
    index="games"
    for game in UserGame.query.filter_by(user_id=user.id).all():
        # query igdb for game source
        query={
            "match":{
                "igdb_id": game.igdb_id
            }
        }
        fields=["name"]
        result = es.search(index=index, query=query, fields=fields)
        
        for doc in result["hits"]["hits"]:
            # load cover URL into ElasticSearch if it hasn't already been loaded
            if doc["_source"]["cover_url"]==None:
                doc_id = doc["_id"]
                cover_url = get_cover_url(doc["_source"]["igdb_id"])
                doc["_source"]["cover_url"]=[cover_url]
                es.update(index=index, id=doc_id, body={"doc":doc["_source"]})            
            
            # If game is liked append it to ids and list of sources    
            if game.liked_status == True:
                liked_games_ids.append(game.igdb_id)
                liked_games.append(doc["_source"])
            if game.played_status == True:
                played_games_ids.append(game.igdb_id)
                played_games.append(doc["_source"])

            # get user's selected platforms
            platforms["PC_Windows"] = user.show_pc_windows
            platforms["PlayStation_5"] = user.show_playstation_5
            platforms["Xbox_Series_X_S"] = user.show_xbox_series_x_s
            platforms["PlayStation_4"] = user.show_playstation_4
            platforms["Xbox_One"] = user.show_xbox_one
            platforms["Linux"] = user.show_linux
            platforms["Mac"] = user.show_mac
            platforms["Nintendo_Switch"] = user.show_nintendo_switch
        
    return jsonify({"username": user.username,
                    "platforms": platforms,
                    "played_games": played_games_ids,
                    "liked_games": liked_games_ids,
                    "played_games_sources": played_games,
                    "liked_games_sources": liked_games,
                    "steam_id_exists": steam_id_exists,
        }), 200

'''
    Logs out of a user's account, by deleting their received session tokens.
    
    This DELETE route receives a token and blacklists the token from Redis.
    This route must be called individually per token.
    
    Returns:
        Response: a json object with a success message and the token type deleted.
'''  
@app.route("/logout", methods=["DELETE"])
@jwt_required(verify_type=False)
def logout_user():
    token = get_jwt()
    jti = token["jti"]
    ttype = token["type"]
    redis_client.set(jti, "", ex=app.config["JWT_ACCESS_TOKEN_EXPIRES"])
    return jsonify({"msg":"Successfully logged out",
                    "token-type": ttype}), 200


'''
    Checks if the tokens are blacklisted.
'''  
@jwt.token_in_blocklist_loader
def check_if_token_blacklisted(jwt_header, jwt_payload:dict):
    jti = jwt_payload["jti"]
    token_in_redis = redis_client.get(jti)
    return token_in_redis is not None

'''
    Route to verify if a token is valid.
    
    This GET route gets the user's JWT identity from a token (usually access token),
    and returns the username and a success if their token exists and isn't blacklisted.
    
    Returns:
        Response: a json object with the username and 200 success.
'''  
@app.route("/verify-token", methods=["GET"])
@jwt_required()
def verify_token():
    identity = get_jwt_identity()
    return jsonify(logged_in_as=identity), 200

'''
    Route to refresh access token.
    
    This POST route takes a user's refresh token and
    returns a newly generated access token if the refresh token is valid.
    
    Returns:
        Response: a json object with an access token and 200 success.
'''  
@app.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    identity = get_jwt_identity()
    access_token = create_access_token(identity=identity)
    return jsonify(access_token=access_token), 200



'''
    Route to get user's steam id from steam auth.
    
    Route only called after frontend accesses steam OpenID,
    Receives request from frontend with OpenID info, verifies request and gets steam_id
    Registers steam id to the user's steam_id field in postgres
    Returns a message and 200 success if successful.

    Returns:
        Response: a json object with a message and 200 success.
'''  
@app.route("/profile/steam/callback", methods=["POST"])
@jwt_required()
def steam_auth_callback():
    steam_id = verify_open_id(request, STEAM_OPENID_URL)
    
    # Check if user is signed in
    username = get_jwt_identity()
    if not username:
        return jsonify({"error":"User not logged in"}), 401
    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({"error":"User does not exist"}), 500
    # if User.query.filter_by(steam_id=steam_id).first():
    #     return jsonify({"error": "This steam account is already linked to another account"}), 409
    user.steam_id = steam_id
    db.session.commit()
    return jsonify({"message": "Steam account linked successfully"}), 200
    

@app.route("/profile/remove_steam_id", methods=["DELETE"])
@jwt_required()
def remove_steam_id():
    """
    Removes user's steam id from their profile.
    
    This DELETE Route when called, checks if the user's steam_id field in postgres is not NULL.
    If not null, sets steam_id field to null, and returns a message of confirmation as well as their now none steamid

    Returns:
        Response: a JSON object containing a message and a status code.
    """
    try:
        username = get_jwt_identity()
        user = User.query.filter_by(username=username).first()
        if not user.steam_id:
            return jsonify(message="User steam id does not exist"), 401
    
        user.steam_id = None
        db.session.commit()
    
        return jsonify({"message":"Steam id removed from profile",
                    "steamid" : user.steam_id}), 200
    except Exception as e:
        return jsonify({"message" : str(e)}), 401




@app.route("/profile/add_games", methods=["POST"])
@jwt_required()
def add_games():
    '''
    Manually adds a list of games to the user's played games.
    
    This POST route retrieves the username from the JWT and a list of 
    added games from the json request and adds those games to the 
    UserGame table with the user's user id and played_status True.
    
    Returns:
        Response: a json object with the username and the array of games
        added to the UserGames table
    '''  
    try:
        username = get_jwt_identity()
        user = User.query.filter_by(username=username).first()
        games_list = request.json.get("added_games")
        added_games = []
        for game_id in games_list:
            # check that game does not already have a record for this user
            gameQuery = UserGame.query.filter_by(user_id = user.id, igdb_id=game_id).first()
            if gameQuery is None:
                new_added_game = UserGame(igdb_id=game_id, user_id=user.id, played_status=True)
                db.session.add(new_added_game)
                db.session.commit()
                added_games.append(game_id)
            elif gameQuery.played_status == False:
                gameQuery.played_status = True
                db.session.commit()
        return jsonify(user=username, added_games=added_games), 200
    except:
        return jsonify(error="Error adding games"), 500
    
    
    

@app.route("/profile/remove_games", methods=["DELETE"])
@jwt_required()
def remove_games():
    """
    Given a list, removes all games from the user profile.
    
    This DELETE route gets a list of games to be deleted from the json request,
    checks if the game is under the user's id, and deletes the matching record from the database.
    Returns the list of deleted game ids.

    Returns:
        Response: a json object with the username and the array of games deleted
        from the UserGames table.
    """
    try:
        username = get_jwt_identity()
        user = User.query.filter_by(username=username).first()
        games_list = request.json.get("removed_games")
        removed_games = []
        for game_id in games_list:
            # check that game does not already have a record for this user
            deleted_game = UserGame.query.filter_by(user_id=user.id, igdb_id=game_id).first()
            if deleted_game is not None:
                db.session.delete(deleted_game)
                db.session.commit()
                removed_games.append(game_id)
        return jsonify(user=username, removed_games=removed_games), 200
    except:
        return jsonify(error="Error removing games"), 500

@app.route("/profile/remove_all_games", methods=["DELETE"])
@jwt_required()
def remove_all_games():
    """
    Removes all games from user profile.
    
    This DELETE route deletes all records under the user's id from the database.
    Returns the list of deleted game ids and a message confirming deletion.

    Returns:
        Response: a json object with the username, the array of games deleted
        from the UserGames table, a message, and a 200 success.
    """
    try:
        username = get_jwt_identity()
        user = User.query.filter_by(username=username).first()
        removed_games = []
        # Get full user games list from postgres
        user_games_list = UserGame.query.filter_by(user_id=user.id).all()
        # remove each game in user played games list
        for game in user_games_list:
            db.session.delete(game)
            db.session.commit()
            removed_games.append(game.igdb_id)
        return jsonify(user=username, removed_games=removed_games, message="All games removed"), 200
    except:
        return jsonify(error="Error removing games"), 500



'''
    Edits a user's selected platforms in Postgres.
    
    This POST route retrieves the username from the JWT and a list
    of dictionary items of the platform statuses and updates the 
    "show_platform" booleans in the User table
    
    Returns:
        Response: a JSON object containing a message and a status code.
'''  
@app.route("/profile/edit_platforms", methods=["POST"])
@jwt_required()
def edit_platforms():
    try:
        username = get_jwt_identity()
        user = User.query.filter_by(username=username).first()
        platforms_list = request.json.get("platforms")
        
        for platform, platform_value in platforms_list.items():
            ''' required to do a manual switch because postgres does
            not allow for a variable to used as the column name
            when doing assignments '''
            match platform:
                case "PC_Windows":
                    user.show_pc_windows = platform_value
                case "PlayStation_5":
                    user.show_playstation_5 = platform_value
                case "Xbox_Series_X_S":
                    user.show_xbox_series_x_s = platform_value
                case "PlayStation_4":
                    user.show_playstation_4 = platform_value
                case "Xbox_One":
                    user.show_xbox_one = platform_value
                case "Linux":
                    user.show_linux = platform_value
                case "Mac":
                    user.show_mac = platform_value
                case "Nintendo_Switch":
                    user.show_nintendo_switch = platform_value

            db.session.commit()

        return jsonify(result="Successfully updated platforms"), 200
    except Exception as e:
        return jsonify(error=str(e)), 500

'''
    Checks the health of the ElasticSearch cluster.
    
    This GET route retrieves the health status of the ElasticSearch cluster.
    
    Returns:
        Response: see ElasticSearch documentation:
        https://www.elastic.co/guide/en/elasticsearch/reference/current/cluster-health.html#response_body

'''  
@app.route("/elasticsearch/health", methods=["GET"])
def es_health():
    result = es.cluster.health(
    wait_for_status="yellow",
    timeout="50s")
    return jsonify(result.body)


'''
    Returns information for a hard-coded example game.
    
    This GET route grabs the ElasticSearch data for an example
    game and returns it. 
    
    Returns:
        Response: a json object with the game's information
'''  
@app.route("/games/example_game", methods=["GET"])
def example_game():
    game_id = 11198
    index="games"
    try:
        query={
            "match":{
                "igdb_id": game_id
            }
        }
        fields=["name"]
        result = es.search(index=index, query=query, fields=fields)
        return jsonify(result=result.body)
    except:
        return jsonify(error="Error getting game info"), 500

'''
    Returns game information for a given IGDB id.
    
    This GET route retrieves the game's IGDB id from the json
    request and uses this to find the game's information in
    ElasticSearch and return it.
    
    Returns:
        Response: a json object with the game's information
'''  
@app.route("/games/game_info", methods=["GET"])
def game_info():
    game_id = request.args.get("igdb_id")
    index="games"
    try:
        query={
            "match":{
                "igdb_id": game_id
            }
        }
        fields=["name"]
        result = es.search(index=index, query=query, fields=fields)
        for doc in result["hits"]["hits"]:
            return jsonify(doc["_source"])
    except:
        return jsonify(error="Error getting game info"), 500


'''
    Searches for games based on inputted query.
    
    This GET route retrieves the search query from the request's
    arguments and searches ElasticSearch for the best matches, returning
    a list of up to 5.
    
    Returns:
        Response: a json object with an array of the game information
        of the games with names best matching the query string
'''  
@app.route("/games/search", methods=["GET"])
def search_games():
    search_term = request.args.get("search_term")
    index="games"
    fields=["name"]
    try:
        query={
            "match":{
                "name": search_term
            }
        }
        result = es.search(index=index, query=query, size=5)
        result_games = []
        for doc in result["hits"]["hits"]:
            # load cover URL into ElasticSearch if it hasn't already been loaded
            if doc["_source"]["cover_url"]==None:
                doc_id = doc["_id"]
                cover_url = get_cover_url(doc["_source"]["igdb_id"])
                doc["_source"]["cover_url"]=[cover_url]
                es.update(index=index, id=doc_id, body={"doc":doc["_source"]})
            result_games.append(doc["_source"])
        return jsonify(result=result_games)
    except Exception as e:
        return jsonify(error=f"Error getting search results:\n{e}"), 500

'''
    Gets a random game from the ElasticSearch database
    
    This GET route uses the function_score ElasticSearch query with
    a random score to return the information for a random game.
    
    Returns:
        Response: a json object with the game information for the 
        randomly chosen game
'''  
@app.route("/games/random_game", methods=["GET"])
def random_game():
    index="games"
    fields=["name"]
    try:
        query= {
            "function_score": {
                "query": { "match_all": {} },
                "random_score": {}, 
            }
        }
        result = es.search(index=index, query=query, size=1)
        for doc in result["hits"]["hits"]:
            if doc["_source"]["cover_url"]==None:
                doc_id = doc["_id"]
                cover_url = get_cover_url(doc["_source"]["igdb_id"])
                doc["_source"]["cover_url"]=[cover_url]
                es.update(index=index, id=doc_id, body={"doc":doc["_source"]})
            return jsonify(doc["_source"])
    except:
        return jsonify(error="Error getting random game"), 500


'''
    Loads games from Steam into a user's profile.
    
    This POST route retrieves the user's Steam ID from their profile,
    uses this to get a list of their owned games from the Steam API,
    converts the Steam IDs of these games to IGDB IDs, filters the
    games to the ones that exist in the ElasticSearch database, and
    then adds the final list to the UserGame table.
    
    Returns:
        Response: a json object with an array of IGDB ids of the
        games that were successfully added to the user's profile
'''  
@app.route("/profile/load_games_steam", methods=["POST"])
@jwt_required()
def load_games_from_steam():
    try:
        username = get_jwt_identity()
        user = User.query.filter_by(username=username).first()
        user_steamid = int(user.steam_id)
        
        # Get user's games from steam via steam id
        owned_steam_ids = get_owned_steam_game_ids(user_steamid, STEAM_API_KEY)
        print(f"Owned Games:{owned_steam_ids}")

        # Convert steam ids to igdb ids
        igdb_games = get_igdb_ids(owned_steam_ids)
        
        index="games"
        result_games = []
        # Search for the igdb_ids in the elasticsearch db
        for game_id in igdb_games:
            query={
                "match":{
                    "igdb_id": game_id
                }
            }
            fields=["igdb_id"]
            result = es.search(index=index, query=query, fields=fields)
            # If hits returns something after searching then append game_id
            if result["hits"]["hits"]:
                print(result["hits"]["hits"])
                result_games.append(game_id)
        
        added_games = []
        # Add games to user's games in database        
        for game_id in result_games:
            if UserGame.query.filter_by(user_id=user.id, igdb_id=game_id).first() is None:
                new_added_game = UserGame(igdb_id=game_id, user_id=user.id, played_status = True)
                db.session.add(new_added_game)
                db.session.commit()
                added_games.append(game_id)
        return jsonify(added_games)
    except Exception as e:
        return jsonify(error=e), 500

'''
    Loads recommendations based on a user's profile.
    
    This POST route retrieves the user's played games, liked games,
    disliked games, and platform information from their profile, 
    and uses this to query ElasticSearch for game recommendations.
    
    Returns:
        Response: a json object with an array of the game information
        for the recommended games.
'''  
@app.route("/recs/load_recs", methods=["POST"])
@jwt_required()
def recommendation_algorithm():
    games_list = request.json.get("curr_games_list")
    username = get_jwt_identity()
    user = User.query.filter_by(username=username).first()
    played_games = []
    
    # get the user's played games
    for game in UserGame.query.filter_by(user_id=user.id).all():
        played_games.append(game.igdb_id)

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


    # Get disliked games from the user's profile
    disliked_games=[]
    for game in UserGame.query.filter_by(user_id=user.id, disliked_status=True).all():
        disliked_games.append(game.igdb_id)

    # Grab ElasticSearch docs for disliked games
    unlike_docs = []
    for game_id in disliked_games:
        query_unlike={
            "match":{
                "igdb_id": game_id
            }
        }
        fields=["name"]
        result = es.search(index=index, query=query_unlike, fields=fields)
        for doc in result["hits"]["hits"]:
            doc_id = doc["_id"]
            dict_item = {}
            dict_item["_id"]=doc_id
            unlike_docs.append(dict_item)

    # Get the user's chosen platforms from their profile
    user_platforms = []
    ''' required to do a manual if statement for each
     platform because postgres does not allow for a variable 
     to used as the column name when getting values'''
    if user.show_pc_windows == True:
        user_platforms.append(get_platform_ids("show_pc_windows"))
    if user.show_playstation_5 == True:
        user_platforms.append(get_platform_ids("show_playstation_5"))
    if user.show_xbox_series_x_s == True:
        user_platforms.append(get_platform_ids("show_xbox_series_x_s"))
    if user.show_playstation_4 == True:
        user_platforms.append(get_platform_ids("show_playstation_4"))
    if user.show_xbox_one == True:
        user_platforms.append(get_platform_ids("show_xbox_one"))
    if user.show_linux == True:
        user_platforms.append(get_platform_ids("show_linux"))
    if user.show_mac == True:
        user_platforms.append(get_platform_ids("show_mac"))
    if user.show_nintendo_switch == True:
        user_platforms.append(get_platform_ids("show_nintendo_switch"))   

    query ={
        "more_like_this" : {
        "fields" : ["keywords"],
        "like" : query_docs,
        "unlike":unlike_docs,
        "min_term_freq" : 0,
        "min_doc_freq" : 1,
        "minimum_should_match": '0%',
        }
    }

    result = es.search(index=index, query=query, size=10)
    doc_games = []
    for doc in result["hits"]["hits"]:
    # check that this game is on a platform that the user has
        if any(x in doc["_source"]["platforms"] for x in user_platforms):
        # load cover URL into ElasticSearch if it hasn't already been loaded
            if doc["_source"]["cover_url"]==None:
                doc_id = doc["_id"]
                cover_url = get_cover_url(doc["_source"]["igdb_id"])
                doc["_source"]["cover_url"]=[cover_url]
                es.update(index=index, id=doc_id, body={"doc":doc["_source"]})
            doc_games.append(doc["_source"])
    return jsonify(doc_games)


@app.route("/recs/liked_game", methods=["POST"])
@jwt_required()
def add_liked_game():
    '''
    Adds/updates UserGame table with game with liked_status true.
    
    This POST route receieves an id from the request, checks if the game exists in the UserGame table
    and adds it to the table if it does not exist with the liked_status set to true.
    If game exists, updates liked_status of game to true, and disliked to false.
    
    Returns:
        Response: a json object verifying whether a success occurred.
    '''
    liked_game_id = request.json.get("liked_game_id")
    username = get_jwt_identity()
    user = User.query.filter_by(username=username).first()
    message = ""
    # Checks if game already exists in user's profile
    game = UserGame.query.filter_by(user_id = user.id, igdb_id = liked_game_id).first()
    if game is not None:
        # updates game liked and disliked status if game exists
        game.liked_status = True
        game.disliked_status = False
        db.session.commit()
        message = f"Game: {liked_game_id}, updated with liked status true."
    else:
        # creates new game with liked_status true (all boolean fields automatically false)
        new_added_game = UserGame(user_id=user.id, igdb_id = liked_game_id, liked_status = True)
        db.session.add(new_added_game)
        db.session.commit()    
        message = f"New Game: {liked_game_id}, created with liked_status true."
    
    return jsonify({"success":True,
                    "message": message}),200

@app.route("/recs/disliked_game", methods=["POST"])
@jwt_required()
def add_disliked_game():
    '''
    Adds/updates UserGame table with game with disliked_status true.
    
    This POST route receieves an id from the request, checks if the game exists in the UserGame table
    and adds it to the table if it does not exist with the disliked_status set to true.
    If game exists, updates liked_status of game to false, and disliked to true.
    
    Returns:
        Response: a json object verifying whether a success occurred.
    '''
    disliked_game_id = request.json.get("disliked_game_id")
    username = get_jwt_identity()
    user = User.query.filter_by(username=username).first()
    message = ""
    # Checks if game already exists in user's profile
    game = UserGame.query.filter_by(user_id = user.id, igdb_id = disliked_game_id).first()
    if game is not None:
        # updates game liked and disliked status if game exists
        game.liked_status = False
        game.disliked_status = True
        db.session.commit()
        message = f"Game: {disliked_game_id}, updated with disliked status true."
    else:
        # creates new game with liked_status true (all boolean fields automatically false)
        new_added_game = UserGame(user_id=user.id, igdb_id = disliked_game_id, disliked_status = True)
        db.session.add(new_added_game)
        db.session.commit()    
        message = f"New Game: {disliked_game_id}, created with disliked_status true."
    
    return jsonify({"success":True,
                    "message": message}),200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

