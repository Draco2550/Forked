#signup page
from flask import Flask, request, jsonify
from models import db, User, Profile


app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///fitness.db"
db.init_app(app)


with app.app_context():
    db.create_all
    
def set_defaults(gender: str) -> dict:
    gender= gender.lower()
    
    if gender== "male":
        return {
                "height_in" : 69,
                "weight_lb": 170, 
                "goal_weight_lb": 170}
    else:
        return{
            "height_in": 64,
            'weight_lb': 135,
            'goal_weight_lb': 135
        }

        
        
@app.route("/signup", methods = ['POST'])
def signup():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    gender = data.get("gender")
    
    defaults = set_defaults(gender)
    
    user = User(email = email, password= password)
    db.session.add(user)
    db.session.flush()
    
    profile = Profile(user_id = user.id, gender = gender, **defaults)
    db.session.add(profile)
    db.session.commit()
    
    return jsonify({
        "user": {"id": user.id, 'email': user.email},
        "profile": {"gender": profile.gender, "height_in": profile.height_in, "weight_lb": profile.weight_lb, "goal_type":profile.goal_type, "goal_weight_lb": profile.goal_weight_lb, "activity_level": profile.activity_level,}
    }), 201
    
    