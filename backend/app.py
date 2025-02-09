from flask import Flask, request, Response, jsonify
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, get_jwt_identity, jwt_required
from flask_migrate import Migrate
from flask_cors import CORS
from config import ApplicationConfig
# import users table
from models import db, User


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

@app.route('/')
def hello_world():
    return 'Hello, World!'


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
    username = request.json["username"]
    password = request.json["password"]
    try:
        user = User.query.filter_by(username=username).first()
        
        if not user:
            raise ValueError("Invalid Credentials")
        
        if bcrypt.check_password_hash(user.password_hash, password):
            access_token = create_access_token(identity=username)
            return jsonify(access_token=access_token), 200
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
    return jsonify({"username": user.username,
                    "steam_id": user.steam_id
        }), 200


# TO-DO: BLACKLIST TOKENS
@app.route("/logout", methods=["POST"])
@jwt_required()
def logout_user():
    

    

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
