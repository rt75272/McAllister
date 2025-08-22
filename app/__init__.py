from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import event
from sqlalchemy.engine import Engine
from flask_login import LoginManager

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key_here'
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://bob:Password@localhost/test'
db = SQLAlchemy(app)
login_manager = LoginManager(app)
login_manager.login_view = 'login'


from app import models, routes

# User loader for Flask-Login
@login_manager.user_loader
def load_user(user_id):
	return models.User.query.get(int(user_id))
