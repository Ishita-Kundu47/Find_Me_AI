from flask import Flask, request, jsonify
from flask_cors import CORS
from database import db
from models import User, MissingReport, FoundReport, Alert
from werkzeug.security import generate_password_hash, check_password_hash
from flask import send_from_directory
import jwt
import datetime
import os

app = Flask(__name__)

# ✅ Config
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SECRET_KEY'] = 'secret123'
app.config['UPLOAD_FOLDER'] = 'uploads'

db.init_app(app)

# ✅ FIX CORS ERROR
# CORS(app, supports_credentials=True)
CORS(app, 
     resources={r"/*": {"origins": "http://localhost:3000"}},
     supports_credentials=True,
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
)

# Create DB
with app.app_context():
    db.create_all()

# =========================
# AUTH APIs
# =========================
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route("/auth/signup", methods=["POST"])
def signup():
    data = request.json

    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"detail": "User already exists"}), 400

    user = User(
        name=data["name"],
        email=data["email"],
        password=generate_password_hash(data["password"]),
        role=data["role"]
    )

    db.session.add(user)
    db.session.commit()

    token = jwt.encode({
        "user_id": user.id,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }, app.config['SECRET_KEY'], algorithm="HS256")

    return jsonify({
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "provider": "email",
            "role": user.role
        }
    })


@app.route("/auth/login", methods=["POST"])
def login():
    data = request.json
    user = User.query.filter_by(email=data["email"]).first()

    if not user or not check_password_hash(user.password, data["password"]):
        return jsonify({"detail": "Invalid credentials"}), 401

    token = jwt.encode({
        "user_id": user.id,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }, app.config['SECRET_KEY'], algorithm="HS256")

    return jsonify({
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "provider": "email",
            "role": user.role
        }
    })


@app.route("/auth/me", methods=["GET"])
def get_me():
    token = request.headers.get("Authorization").split(" ")[1]

    try:
        data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
        user = User.query.get(data["user_id"])
    except:
        return jsonify({"detail": "Invalid token"}), 401

    return jsonify({
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "provider": user.provider,
        "role": user.role
    })

# =========================
# MISSING REPORT
# =========================

@app.route("/missing/", methods=["POST"])
def create_missing():
    # Get user from token
    token = request.headers.get("Authorization", "").split(" ")[-1]
    try:
        data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
        user_id = data["user_id"]
    except:
        user_id = None

    file = request.files["image"]
    filename = file.filename
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    file.save(filepath)

    report = MissingReport(
        user_id=user_id,
        name=request.form["name"],
        age=request.form["age"],
        gender=request.form["gender"],
        last_seen_location=request.form["last_seen_location"],
        additional_info=request.form["additional_info"],
        image_path=filepath
    )

    db.session.add(report)
    db.session.commit()

    # AI matching — check against ALL existing found reports
    found_reports = FoundReport.query.all()
    for f in found_reports:
        try:
            from face_match import compare_faces
            result = compare_faces(filepath, f.image_path)
            # if result.get("match") and result.get("distance", 1) < 0.4:
            if result.get("distance", 1) < 0.68:
                alert = Alert(
                    missing_id=report.id,
                    found_id=f.id,
                    similarity=1 - result["distance"]
                )
                db.session.add(alert)
        except Exception as e:
            print("AI ERROR:", e)

    db.session.commit()
    return jsonify({"message": "Missing report created"})

    # return jsonify({"message": "Missing report created"})


# @app.route("/missing/", methods=["POST"])
# def create_missing():
#     file = request.files["image"]

#     filename = file.filename
#     filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
#     os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
#     file.save(filepath)

#     report = MissingReport(
#         name=request.form["name"],
#         age=request.form["age"],
#         gender=request.form["gender"],
#         last_seen_location=request.form["last_seen_location"],
#         additional_info=request.form["additional_info"],
#         image_path=filepath
#     )

#     db.session.add(report)
#     db.session.commit()

#     return jsonify({"message": "Missing report created"})


# =========================
# FOUND REPORT
# =========================

@app.route("/found/", methods=["POST"])
def create_found():
    if "image" not in request.files:
        return jsonify({"error": "No image"}), 400

    file = request.files["image"]
    filename = file.filename
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    file.save(filepath)

    report = FoundReport(
        found_location=request.form.get("found_location"),
        contact_info=request.form.get("contact_info"),
        additional_info=request.form.get("additional_info"),
        image_path=filepath
    )

    db.session.add(report)
    db.session.commit()

    # AI matching — loads DeepFace only when needed
    missing_reports = MissingReport.query.all()
    for m in missing_reports:
        try:
            from face_match import compare_faces
            result = compare_faces(m.image_path, filepath)
            if result.get("match") and result.get("distance", 1) < 0.4:
                alert = Alert(
                    missing_id=m.id,
                    found_id=report.id,
                    similarity=1 - result["distance"]
                )
                db.session.add(alert)
        except Exception as e:
            print("AI ERROR:", e)

    db.session.commit()
    return jsonify({"message": "Found report created + AI done"})

# @app.route("/found/", methods=["POST"])
# def create_found():
#     file = request.files["image"]

#     filename = file.filename
#     filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
#     os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
#     file.save(filepath)

#     report = FoundReport(
#         found_location=request.form["found_location"],
#         contact_info=request.form["contact_info"],
#         additional_info=request.form["additional_info"],
#         image_path=filepath
#     )

#     db.session.add(report)
#     db.session.commit()

#     return jsonify({"message": "Found report created"})

# @app.route("/found/", methods=["POST"])
# def create_found():
#     if "image" not in request.files:
#         return jsonify({"error": "No image"}), 400

#     file = request.files["image"]

#     filename = file.filename
#     filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
#     os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
#     file.save(filepath)

#     report = FoundReport(
#         found_location=request.form.get("found_location"),
#         contact_info=request.form.get("contact_info"),
#         additional_info=request.form.get("additional_info"),
#         image_path=filepath
#     )

#     db.session.add(report)
#     db.session.commit()

#     # AI matching
#     missing_reports = MissingReport.query.all()

#     for m in missing_reports:
#         try:
#             result = compare_faces(m.image_path, filepath)

#             if result.get("match") and result.get("distance", 1) < 0.4:
#                 alert = Alert(
#                     missing_id=m.id,
#                     found_id=report.id,
#                     similarity=1 - result["distance"]
#                 )
#                 db.session.add(alert)

#         except Exception as e:
#             print("AI ERROR:", e)

#     db.session.commit()

#     return jsonify({"message": "Found report created + AI done"})


# =========================
# ADMIN APIs
# =========================

@app.route("/admin/missing", methods=["GET"])
def get_missing():
    reports = MissingReport.query.all()

    return jsonify({
        "missing_reports": [
            {
                "_id": r.id,
                "name": r.name,
                "age": r.age,
                "gender": r.gender,
                "last_seen_location": r.last_seen_location,
                "additional_info": r.additional_info,
                "image_path": r.image_path,
                "created_at": r.created_at
            } for r in reports
        ]
    })


@app.route("/admin/found", methods=["GET"])
def get_found():
    reports = FoundReport.query.all()

    return jsonify({
        "found_reports": [
            {
                "_id": r.id,
                "found_location": r.found_location,
                "contact_info": r.contact_info,
                "additional_info": r.additional_info,
                "image_path": r.image_path,
                "created_at": r.created_at
            } for r in reports
        ]
    })


@app.route("/admin/alerts", methods=["GET"])
def get_alerts():
    alerts = Alert.query.all()
    result = []
    for a in alerts:
        missing = MissingReport.query.get(a.missing_id)
        found = FoundReport.query.get(a.found_id)
        result.append({
            "_id": a.id,
            "missing_id": a.missing_id,
            "found_id": a.found_id,
            "similarity": a.similarity,
            "created_at": a.created_at,
            "missing_name": missing.name if missing else "Unknown",
            "missing_age": missing.age if missing else "Unknown",
            "missing_gender": missing.gender if missing else "Unknown",
            "missing_location": missing.last_seen_location if missing else "Unknown",
            "missing_image": missing.image_path if missing else None,
            "found_location": found.found_location if found else "Unknown",
            "found_contact": found.contact_info if found else "Unknown",
            "found_image": found.image_path if found else None,
        })
    return jsonify({"alerts": result})


# @app.route("/admin/alerts", methods=["GET"])
# def get_alerts():
#     alerts = Alert.query.all()

#     return jsonify({
#         "alerts": [
#             {
#                 "_id": a.id,
#                 "missing_id": a.missing_id,
#                 "found_id": a.found_id,
#                 "similarity": a.similarity,
#                 "created_at": a.created_at
#             } for a in alerts
#         ]
#     })


# =========================
# RUN SERVER
# =========================

if __name__ == "__main__":
    app.run(debug=True, port=5000)