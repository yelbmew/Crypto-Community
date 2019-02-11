#!/usr/bin/env python3

from flask import Flask, render_template, request, jsonify, flash, redirect
from flask_bootstrap import Bootstrap
from flask_mail import Mail, Message
from flask_marshmallow import Marshmallow
from flask_sqlalchemy import SQLAlchemy
from wtforms import Form, TextField, SubmitField, validators, StringField, TextAreaField
from wtforms.fields import DateTimeField, TextField, SubmitField, SelectField, HiddenField
import json
import os
import requests
import simplejson

# read credentials from external config file
with open('config.json', 'r') as f:
    config = json.load(f)


app = Flask(__name__)
basedir = os.path.abspath(os.path.dirname(__file__))
Bootstrap(app)

mail_settings = {
    "MAIL_SERVER": 'smtp.gmail.com',
    "MAIL_PORT": 465,
    "MAIL_USE_TLS": False,
    "MAIL_USE_SSL": True,
    "MAIL_USERNAME": os.environ['EMAIL_USER'],
    "MAIL_PASSWORD": os.environ['EMAIL_PASSWORD']
}


app.config['SECRET_KEY'] = 'secret'


# GCP SQL Config has move to external config file {config.json}
# for Cloud Computing assignment purpose config.json will be include in version control
USER   = config['DEFAULT']['USER']
PASS   = config['DEFAULT']['PASS']
HOST   = config['DEFAULT']['HOST']
DBNAME = config['DEFAULT']['DBNAME']

app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://{}:{}@{}/maps'.format(USER,
                                                                       PASS,
                                                                       HOST,
                                                                       DBNAME)

app.config.update(mail_settings)
mail = Mail(app)
# binding SQLAlchemy & Marshmallow to Flask apps
db = SQLAlchemy(app)
ma = Marshmallow(app)


# form used for subscriber to register
class subscriberForm(Form):
    firstname = TextField('firstname:', validators=[validators.required()])
    lastname = TextField('lastname:', validators=[validators.required()])
    email = TextField('email:', validators=[validators.required()])
    bitaddr = TextField('bitaddr', validators=[validators.required()])
    submit = SubmitField("Submit")


class sendOutForm(Form):
    toemail = TextField('toemail:', validators=[validators.required()])
    subject = TextField('subject:', validators=[validators.required()])
    message = TextAreaField('message:', validators=[validators.required()])
    submit = SubmitField("Submit")


# SQLAlchemy ORM model
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    firstname = db.Column(db.String(80))
    lastname = db.Column(db.String(80))
    email = db.Column(db.String(120), unique=True)
    bitaddr = db.Column(db.String(120))

    def __init__(self, firstname, lastname, email, bitaddr):
        self.firstname = firstname
        self.lastname = lastname
        self.email = email
        self.bitaddr = bitaddr


class UserSchema(ma.Schema):
    class Meta:
        fields = ('firstname', 'lastname', 'email', 'bitaddr')


# define user_schema as instance of UserSchema
# users_schema as instances of list of UserSchema
user_schema = UserSchema()
users_schema = UserSchema(many=True)


@app.route("/admin")
def admin():
    allusers = User.query.order_by(User.firstname).limit(15).all()
    return render_template('admin.html', allusers=allusers)

@app.route('/admin', methods=['POST'])
def admin_contact():
    form = sendOutForm(request.form)
    if request.method == 'POST':
        toemail = request.form['toemail']
        subject = request.form['subject']
        message  = request.form['message']

        if form.validate():
            msg = Message(sender=app.config.get("MAIL_USERNAME"),
                          subject = request.form['subject'],
                          recipients = request.form['toemail'].split(),
                          body    = request.form['message'])
            mail.send(msg)
            flash('your message has been sent')
        else:
            flash('all forms are require to fill in')
    return render_template('emailconfirm.html')


@app.route("/graph")
def graph():
    return render_template('graph.html')


@app.route("/home")
def home():

    response = {}
    response = requests.get("https://blockchain.info/ticker")
    loadr    = json.loads(response.text)

    return render_template('home.html', bit=loadr)


@app.route("/subscribe")
def subscribe():
    return render_template('subscribe.html')


@app.route('/subscribe', methods=['POST'])
def add_subscriber():
    """Endpoint to add record to Google CloudSQL""" 
    form = subscriberForm(request.form)

    if request.method == 'POST':
        firstname = request.form['firstname']
        lastname  = request.form['lastname']
        email     = request.form['email']
        bitaddr       = request.form['bitaddr']

        if form.validate():
            new_subscriber = User(firstname, lastname, email, bitaddr)
            db.session.add(new_subscriber)
            db.session.commit()
            flash('your information has been captured')
        else:
            flash('all forms are require to fill in')
    return render_template('confirm.html')


def get_subscriber():
    """Endpoint to retrieve all subscriber information
    from the database."""
    all_subscriber = User.query.all()
    result = users_schema.dump(all_subscriber)
    return jsonify(result.data)

@app.route("/confirm")
def confirm():
    return render_template('confirm.html')


if __name__ == "__main__":
    host = os.popen('hostname -I').read()
    app.run(host=host, port=5000, debug=False)
