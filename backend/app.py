from flask import Flask, request, jsonify, redirect, url_for
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, get_jwt_identity, jwt_required, get_jwt, create_refresh_token
from flask_migrate import Migrate
from flask_cors import CORS
from config import ApplicationConfig
from urllib.parse import urlencode
from elasticsearch import Elasticsearch
from dotenv import load_dotenv
from helpers import get_owned_steam_game_ids, get_cover_url, get_igdb_ids, verify_open_id
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

STEAM_OPENID_URL = "https://steamcommunity.com/openid/login"

STEAM_API_KEY = app.config["STEAM_API_KEY"]

# initialize elasticsearch instance
load_dotenv()
ELASTIC_PASSWORD = os.getenv('ELASTIC_PASSWORD')
es = Elasticsearch('http://playground-elasticsearch-1:9200', basic_auth=("elastic", ELASTIC_PASSWORD))



@app.route('/test', methods=["GET"])
def test_request():
    pic_link = "https://cdn.pixabay.com/photo/2017/05/29/15/34/kitten-2354016_1280.jpg"
    username = "Request worked"

    return jsonify({
        "username": username,
        "profile_pic": pic_link
    }), 200

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
    db.session.commit()
    
    return jsonify({
        "id": new_user.id,
        "email": new_user.email,
        "username": new_user.username
    }), 200

# Login Route that requires user to be signed out    
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
       
        

@app.route("/profile", methods=["GET"])
@jwt_required()
def user_profile():
    username = get_jwt_identity()
    user = User.query.filter_by(username=username).first()
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
        
    return jsonify({"username": user.username,
                    "played_games": played_games_ids,
                    "liked_games": liked_games_ids,
                    "played_games_sources": played_games,
                    "liked_games_sources": liked_games,
        }), 200


@app.route("/logout", methods=["DELETE"])
@jwt_required(verify_type=False)
def logout_user():
    token = get_jwt()
    jti = token["jti"]
    ttype = token["type"]
    redis_client.set(jti, "", ex=app.config["JWT_ACCESS_TOKEN_EXPIRES"])
    return jsonify({"msg":"Successfully logged out",
                    "token-type": ttype}), 200



@jwt.token_in_blocklist_loader
def check_if_token_blacklisted(jwt_header, jwt_payload:dict):
    jti = jwt_payload["jti"]
    token_in_redis = redis_client.get(jti)
    return token_in_redis is not None


# route to verify if a token is valid, very lightweight and can be called by frontend
@app.route("/verify-token", methods=["GET"])
@jwt_required()
def verify_token():
    identity = get_jwt_identity()
    return jsonify(logged_in_as=identity), 200

# route to refresh access token
@app.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    identity = get_jwt_identity()
    access_token = create_access_token(identity=identity)
    return jsonify(access_token=access_token)


@app.route("/profile/connect_steam", methods=["GET"])
@jwt_required()
def connect_steam():
    params = {
        "openid.ns": "http://specs.openid.net/auth/2.0",
        "openid.mode": "checkid_setup",
        "openid.return_to": url_for("steam_auth_callback", _external=True),
        "openid.realm": request.host_url,
        "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
        "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select"
    }
    return redirect(f"{STEAM_OPENID_URL}?{urlencode(params)}")

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
    

# Route to add games to a user's profile manually
@app.route("/profile/add_games", methods=["POST"])
@jwt_required()
def add_games():
    try:
        username = get_jwt_identity()
        user = User.query.filter_by(username=username).first()
        games_list = request.json.get("added_games")
        added_games = []
        for game_id in games_list:
            if UserGame.query.filter_by(user_id=user.id, igdb_id=game_id).first() is None:
                new_added_game = UserGame(igdb_id=game_id, user_id=user.id, played_status=True)
                db.session.add(new_added_game)
                db.session.commit()
                added_games.append(game_id)
        return jsonify(user=username, added_games=added_games), 200
    except:
        return jsonify(error="Error adding games"), 500

# route to check the health of the elasticsearch cluster
@app.route("/elasticsearch/health", methods=["GET"])
def es_health():
    result = es.cluster.health(
    wait_for_status="yellow",
    timeout="50s")
    return jsonify(result.body)


# route to return information for a hard-coded example game
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

# route to return game information for a given igdb id
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
        # result = es.search(index=index, query=query, fields=fields, size=5)
        result = es.search(index=index, query=query, size=5)
        result_games = []
        for doc in result["hits"]["hits"]:
            if doc["_source"]["cover_url"]==None:
                doc_id = doc["_id"]
                cover_url = get_cover_url(doc["_source"]["igdb_id"])
                doc["_source"]["cover_url"]=[cover_url]
                es.update(index=index, id=doc_id, body={"doc":doc["_source"]})
            result_games.append(doc["_source"])
        # conversion ensures unique items but compatibility with jsonify()
        return jsonify(result=result_games)
    except Exception as e:
        return jsonify(error=f"Error getting search results:\n{e}"), 500

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


# TO-DO: Finish Implemnting load steam games 
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
        # conversion ensures unique items but compatibility with jsonify()
        return jsonify(added_games)
    except Exception as e:
        return jsonify(error=e), 500
    
@app.route("/recs/load_recs", methods=["POST"])
@jwt_required()
# parameter played_games: list of igdb_ids
def recommendation_algorithm():
    games_list = request.json.get("curr_games_list")
    username = get_jwt_identity()
    user = User.query.filter_by(username=username).first()
    played_games = []
    
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
    unlike_docs = []
    # Get unlike games:
    # TODO get disliked games from the user's profile ?
    for game_id in games_list:
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
    liked_game_id = request.json.get("liked_game_id")
    username = get_jwt_identity()
    user = User.query.filter_by(username=username).first()
    
    # Checks if game already exists in user's profile
    game_exists = UserGame.query.filter_by(user_id = user.id, igdb_id = liked_game_id).first() is not None
    if game_exists:
        return jsonify({"error": "Game already in likes"}), 406

    new_added_game = UserGame(user_id=user.id, igdb_id = liked_game_id, liked_status = True)
    db.session.add(new_added_game)
    db.session.commit()
    
    return jsonify({"success":True}),200

@app.route("/recs/disliked_game", methods=["POST"])
@jwt_required()
def add_disliked_game():
    disliked_game_id = request.json.get("disliked_game_id")
    username = get_jwt_identity()
    user = User.query.filter_by(username=username).first()
    
    # Checks if game already exists in user's profile
    game_exists = UserGame.query.filter_by(user_id = user.id, igdb_id = disliked_game_id).first() is not None
    if game_exists:
        return jsonify({"error": "Game already in likes"}), 406

    new_added_game = UserGame(user_id=user.id, igdb_id = disliked_game_id, liked_status = True)
    db.session.add(new_added_game)
    db.session.commit()
    
    return jsonify({"success":True}),200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

