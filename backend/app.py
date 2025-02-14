from flask import Flask, request, jsonify
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, get_jwt_identity, jwt_required, get_jwt, create_refresh_token
from flask_migrate import Migrate
from flask_cors import CORS
from config import ApplicationConfig
from datetime import timezone, datetime, timedelta
import redis
# import users table
from models import db, User, UserGame


app = Flask(__name__)
app.config.from_object(ApplicationConfig)
# Create database for app

db.init_app(app)

# JWT Config
jwt = JWTManager(app)

# Enable CORS
CORS(app)

# Allow database migrations
migrate = Migrate(app, db)

# Initialize Bcrypt
bcrypt = Bcrypt(app)

# Initialize Redis
redis_client = redis.StrictRedis(host="localhost", port=6379, db=0, decode_responses=True)
BLACKLISTED_TOKENS_KEY = "blacklisted_tokens"

@app.route('/')
def hello_world():
    return 'Hello, Mom!'


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

    
@app.route("/login", methods=["POST"])
def login_user():
    username = request.json.get("username")
    password = request.json.get("password")
    try:
        user = User.query.filter_by(username=username).first()
        
        if not user:
            raise ValueError("Invalid Credentials")
        
        if bcrypt.check_password_hash(user.password_hash, password):
            access_token = create_access_token(identity=username)
            refresh_token = create_refresh_token(identity=username)
            return jsonify(access_token=access_token, refresh_token=refresh_token), 200
        else:
            raise ValueError("Invalid Credentials")
       
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "Username or password incorrect"}), 401

@app.route("/profile", methods=["GET"])
@jwt_required()
def user_profile():
    username = get_jwt_identity()
    user = User.query.filter_by(username=username).first()
    all_games_ids = []
    liked_games_ids = []
    for game in UserGame.query.filter_by(user_id=user.id).all():
        all_games_ids.append(game.igdb_id)
        if game.liked_status == True:
            liked_games_ids.append(game.igdb_id)
        
    return jsonify({"username": user.username,
                    "steam_id": user.steam_id,
                    "all_games": all_games_ids,
                    "liked_games": liked_games_ids
        }), 200



@app.route("/logout", methods=["DELETE"])
@jwt_required(verify_type=False)
def logout_user():
    token = get_jwt()
    jti = token["jti"]
    ttype = token["type"]
    redis_client.set(jti, "", ex=ApplicationConfig.JWT_ACCESS_TOKEN_EXPIRES)
    return jsonify({"msg":"Successfully logged out",
                    "token-type": ttype}), 200

@jwt.token_in_blocklist_loader
def check_if_token_blacklisted(jwt_header, jwt_payload:dict):
    jti = jwt_payload["jti"]
    token_in_redis = redis_client.get(jti)
    return token_in_redis is not None

@app.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    identity = get_jwt_identity()
    access_token = create_access_token(identity=identity)
    return jsonify(access_token=access_token)

# TO-DO: Implement Steam Login

# TO-DO: Add games to users
@app.route("/add_games", methods=["POST"])
@jwt_required()
def add_games():
    try:
        username = get_jwt_identity()
        user = User.query.filter_by(username=username).first()
        games_list = request.json.get("added_games")
        added_games = []
        for game_id in games_list:
            if UserGame.query.filter_by(user_id=user.id, igdb_id=game_id).first() is None:
                new_added_game = UserGame(igdb_id=game_id, user_id=user.id)
                db.session.add(new_added_game)
                db.session.commit()
                added_games.append(game_id)
        return jsonify(user=username, added_games=added_games), 200
    except:
        return jsonify(error="Error adding games"), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
