from database import db
from datetime import datetime

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    email = db.Column(db.String(100), unique=True)
    password = db.Column(db.String(200))
    role = db.Column(db.String(20))
    provider = db.Column(db.String(20), default="email")


class MissingReport(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    name = db.Column(db.String(100))
    age = db.Column(db.String(10))
    gender = db.Column(db.String(10))
    last_seen_location = db.Column(db.String(200))
    additional_info = db.Column(db.Text)
    image_path = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class FoundReport(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    found_location = db.Column(db.String(200))
    contact_info = db.Column(db.String(200))
    additional_info = db.Column(db.Text)
    image_path = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class Alert(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    missing_id = db.Column(db.Integer)
    found_id = db.Column(db.Integer)
    similarity = db.Column(db.Float)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


