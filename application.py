import os
from cs50 import SQL
from flask import Flask, flash, jsonify, redirect, render_template, request, session
from flask_session import Session
from tempfile import mkdtemp
from werkzeug.exceptions import default_exceptions
from werkzeug.security import check_password_hash, generate_password_hash
from werkzeug.utils import secure_filename
from PIL import Image
import os.path
import secrets
import smtplib

from helpers import apology, login_required

UPLOAD_FOLDER = 'static/images/'
ALLOWED_EXTENSIONS = set(['txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif'])

# Configure application
app = Flask(__name__)

# Ensure templates are auto-reloaded
app.config["TEMPLATES_AUTO_RELOAD"] = True
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Ensure responses aren't cached
@app.after_request
def after_request(response):
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Expires"] = 0
    response.headers["Pragma"] = "no-cache"
    return response

# Configure session to use filesystem (instead of signed cookies)
app.config["SESSION_FILE_DIR"] = mkdtemp()
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

# Configure CS50 Library to use SQLite database
db = SQL("sqlite:///name.db")

@app.route("/")
def index():
    return render_template("welcome.html")

@app.route("/search")
@login_required
def search():
    users = db.execute("SELECT img, name_first, name_last, year, concentration, entryway, points, q1, q2, q3, a1, a2, a3 FROM users WHERE img IS NOT NULL AND img!=''")
    entryways = [ x["entryway"] for x in db.execute("SELECT DISTINCT(entryway) FROM users WHERE img IS NOT NULL AND img != '' AND entryway != ''")]
    years = [ x["year"] for x in db.execute("SELECT DISTINCT(year) FROM users WHERE img IS NOT NULL AND img != '' AND year != ''")]
    concs = [ x["concentration"] for x in db.execute("SELECT DISTINCT(concentration) FROM users WHERE img IS NOT NULL AND img != '' AND concentration != ''")]
    return render_template("search.html", users=users, entryways=entryways, years=years, concentrations=concs)

# TODO: For testing, remove after
@app.route("/results")
def results():
    latest_guesses = db.execute(
        """ SELECT users.img, users.name_first, guesses.correct, guesses.guess FROM users, guesses 
            WHERE guesses.user_id=:u AND bunch=(SELECT MAX(bunch) FROM guesses WHERE user_id=:u)
            AND users.id=guesses.face_id; """,
        u = session["user_id"]
    )
    total = len(latest_guesses)
    correct = 0
    for i in range(total):
        correct += latest_guesses[i]["correct"]
    stats = {
        "correct": correct,
        "incorrect": total - correct,
        "percentage": round(correct / total, 2)
    }
    return render_template("results.html", latest=latest_guesses, stats=stats)

@app.route("/learn", methods=["GET", "POST"])
@login_required
def learn():
    if request.method == "GET":
        year = request.args.get("year")
        entryway = request.args.get("entryway")
        rounds = int(request.args.get("rounds"))
        adapt = int(request.args.get("adapt"))
        
        rounds = 1 if rounds < 1 else rounds
        rounds = 25 if rounds > 25 else rounds

        if adapt:
            rows = db.execute("SELECT * FROM users WHERE (year LIKE :year AND entryway LIKE :entryway AND img IS NOT NULL AND img !='' AND id IN (SELECT face_id FROM guesses WHERE user_id=:id AND correct=0 GROUP BY face_id)) ORDER BY RANDOM() LIMIT :rounds", year=year, entryway=entryway, rounds=rounds, id=session["user_id"])
        else:
            rows = db.execute("SELECT * FROM users WHERE (year LIKE :year AND entryway LIKE :entryway AND img IS NOT NULL AND img !='' AND id != :me) ORDER BY RANDOM() LIMIT :rounds", year=year, entryway=entryway, rounds=rounds, me=session["user_id"])
        return render_template("learn.html", matherites=rows)
    else:
        ids = request.form.get("ids")
        names = request.form.get("names")
        if ids is not None and names is not None:
            ids, names = ids.split(","), names.split(",")
            if len(ids) != len(names):
                return apology("Not enough answers")
            top_bunch = db.execute("SELECT MAX(bunch) AS b, COUNT(*) AS c FROM guesses WHERE user_id=:u", u=session["user_id"])
            if top_bunch[0]["c"] == 0:
                top_bunch[0]["b"] = 1
            for i in range(len(ids)):
                user = db.execute("SELECT name_first FROM users WHERE id=:id", id=ids[i])
                db.execute("INSERT INTO guesses (user_id, face_id, correct, guess, bunch) VALUES (:u, :f, :c, :g, :b)",
                    u = session["user_id"],
                    f = int(ids[i]),
                    c = int(user[0]["name_first"].lower() == names[i].lower()),
                    g = names[i],
                    b = top_bunch[0]["b"] + 1
                )
            latest_guesses = db.execute(
                """ SELECT users.img, users.name_first, guesses.correct, guesses.guess FROM users, guesses 
                    WHERE guesses.user_id=:u AND bunch=(SELECT MAX(bunch) FROM guesses WHERE user_id=:u)
                    AND users.id=guesses.face_id; """,
                u = session["user_id"]
            )
            total = len(latest_guesses)
            correct = 0
            for i in range(total):
                correct += latest_guesses[i]["correct"]
            stats = {
                "correct": correct,
                "incorrect": total - correct,
                "percentage": round(correct / total, 2)
            }
            db.execute("UPDATE users SET points=(SELECT points FROM users WHERE id=:id)+:p WHERE id=:id",
                id = session["user_id"],
                p = 3 * stats["correct"] + stats["incorrect"]
            )
            return render_template("results.html", latest=latest_guesses, stats=stats)
        else:
            return apology("Missing fields")

@app.route("/learn_select", methods=["GET"])
@login_required
def learn_select():
    options = {}
    options["entryway"] = [ x["entryway"] for x in db.execute("SELECT entryway FROM users WHERE img IS NOT NULL AND img != '' AND entryway != '' GROUP BY entryway")]
    options["year"] = [ x["year"] for x in db.execute("SELECT year FROM users WHERE img IS NOT NULL AND img != '' AND year != '' GROUP BY year")]
    return render_template("learn_select.html", options=options)

@app.route("/review", methods=["GET", "POST"])
@login_required
def review():
    latest_guesses = db.execute(
        """ SELECT users.img, users.name_first, guesses.correct, guesses.guess FROM users, guesses 
            WHERE guesses.user_id=:u AND bunch=(SELECT MAX(bunch) FROM guesses WHERE user_id=:u)
            AND users.id=guesses.face_id; """,
        u = session["user_id"]
    )
    stats = {
        "correct": 0,
        "incorrect": 0,
        "points": 0,
    }
    for guess in latest_guesses:
        if guess["correct"] == 1:
            stats["correct"] += 1
        else:
            stats["incorrect"] += 1
    stats["points"] = stats["correct"] * 3 + stats["incorrect"]
    return render_template("review.html", latest=latest_guesses, stats=stats)

@app.route("/leaderboard", methods=["GET"])
@login_required
def leaderboard():
    people = db.execute("SELECT id, name_first, name_last, points FROM users WHERE img is NOT NULL AND img is NOT '' ORDER BY points DESC")
    return render_template("leaderboard.html", people=people, me=session["user_id"])

@app.route("/profile", methods=["GET", "POST"])
@login_required
def profile():
    user = str(session["user_id"])

    if request.method == "POST":
        # update everything except the image
        db.execute(
            "UPDATE users \
            SET name_first=:n1, name_last=:n2, year=:y, concentration=:c, city=:city, state=:state, country=:country, \
            q1=:q1, q2=:q2, q3=:q3, a1=:a1, a2=:a2, a3=:a3\
            WHERE id=:u",
            u=user,
            n1=request.form.get("name_first"),
            n2=request.form.get("name_last"),
            y=request.form.get("year"),
            c=request.form.get("concentration"),
            city=request.form.get("city"),
            state=request.form.get("state"),
            country=request.form.get("country"),
            q1=request.form.get("q1-statement"),
            q2=request.form.get("q2-statement"),
            q3=request.form.get("q3-statement"),
            a1=request.form.get("a1"),
            a2=request.form.get("a2"),
            a3=request.form.get("a3")
        )

        filename = None
        print(request.files)
        if 'img' in request.files:
            file = request.files['img']
            print(file)
            if file.filename != '':
                if file and allowed_file(file.filename):
                    filename = secure_filename(user + "." + file.filename.rsplit('.', 1)[1].lower())
                    file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
                else:
                    return apology("Profile picture must be an image file", 403)

        # If no new image is uploaded, keep old image
        if filename is not None:
            db.execute(
                "UPDATE users \
                SET img=:i WHERE id=:u",
                u=user,
                i=filename
            )

        return redirect("/profile")

    else:
        return render_template("profile.html", profile=db.execute(
            "SELECT id, img, name_first, name_last, city, state, country, year, concentration, entryway, points, q1, q2, q3, a1, a2, a3 FROM users WHERE id=:u",
            u=user)[0]
        )


@app.route("/login", methods=["GET", "POST"])
def login():
    """Log user in."""

    # Forget any user_id
    session.clear()

    # User reached route via POST (as by submitting a form via POST)
    if request.method == "POST":

        # Ensure username was submitted
        if not request.form.get("username"):
            return apology("must provide username", 403)

        # Ensure password was submitted
        elif not request.form.get("password"):
            return apology("must provide password", 403)

        # Query database for username
        rows = db.execute("SELECT * FROM users WHERE username = :username",
                          username=request.form.get("username"))

        # Ensure username exists and password is correct
        if len(rows) != 1 or not check_password_hash(rows[0]["hash"], request.form.get("password")):
            return apology("invalid username and/or password", 403)

        # Remember which user has logged in
        session["user_id"] = rows[0]["id"]

        # Redirect user to home page
        return redirect("/")

    # User reached route via GET (as by clicking a link or via redirect)
    else:
        return render_template("login.html")



@app.route("/register", methods=["GET", "POST"])
def register():
    """Register user for an account."""

    if request.method == "POST":

        username = request.form.get("username")

        # Validate form submission
        id = db.execute("SELECT id \
                          FROM users WHERE username=:u",
                          u=username)
        # If email is not in database, then the student is not authorized (not a Mather student)
        if not id:
            return apology("E-mail not authorized")

        # Check if account already exists
        check_register = db.execute("SELECT id \
                        FROM users WHERE username = :u AND img = ''",
                        u = username)

        if not check_register:
            return apology("Seems like you already have an account. Please login!")

        # Store email as username, create password and hash
        username = request.form.get("username")
        token = secrets.token_urlsafe(4)
        hash = generate_password_hash(token)

        # Add user to database
        add = db.execute("UPDATE users \
                         SET hash=:h WHERE username=:u",
                        u=username,
                        h=hash)
        if add:
            return apology("Password could not be generated")

        # Log user in
        session["user_id"] = id[0]["id"]

        # Email the password to the user
        message = 'Subject: {}\n\n{}'.format("Thanks for registering!", "Hi, thanks for signing up! Your password for 'Remind Me of Your Name is' " + token + ".")

        server = smtplib.SMTP_SSL("smtp.gmail.com", 465)
        server.ehlo()
        server.login("remindmecs50@gmail.com", "Laika12!")
        server.sendmail("remindmecs50@gmail.com", username, message)
        server.quit()

        # Let user know they're registered
        flash("This is your password: " + token + ". You should have received an email with this password. \n (Please check your spam folder).",'password')

        return redirect("/")

    else:
        return render_template("register.html")

@app.route("/reset", methods=["POST"])
def reset():
    return render_template("reset.html")

@app.route("/send_email", methods=["POST"])
def send_email():

    # Retrieve email
    username = request.form.get("username")

    # Make sure person is registered
    id = db.execute("SELECT id FROM users WHERE username=:u and img !='' AND img IS NOT NULL", u=username)

    if not id:
        return apology("This email is not associated with an account. Please register first!")

    token = secrets.token_urlsafe(4)
    hash = generate_password_hash(token)
    print(token)

    # Change user's password:
    add = db.execute("UPDATE users SET hash=:h WHERE username=:u",
                    u=username, h=hash)
    if add:
        return apology("Password could not be generated")

    # Email the password to the user
    forgot_message = 'Subject: {}\n\n{}'.format("Password Reset Instructions", "Hi! Your new password for 'Remind Me' is: " + token + ".")

    server = smtplib.SMTP_SSL("smtp.gmail.com", 465)
    server.ehlo()
    server.login("remindmecs50@gmail.com", "Laika12!")
    server.sendmail("remindmecs50@gmail.com", username, forgot_message)
    server.quit()

    # Let user know they're registered, with a parameter to specify how the information should be displayed
    flash("You should have received an email with your new password. \n (Please check your spam folder)",'password')

    return render_template("login.html")

@app.route("/logout")
def logout():
    return redirect("/login")

def errorhandler(e):
    """Handle error"""
    return apology(e.name, e.code)

for code in default_exceptions:
    app.errorhandler(code)(errorhandler)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS