import os
from dotenv import load_dotenv

load_dotenv()
basedir = os.path.abspath(os.path.dirname(__file__))

class Configuration(object):
    SECRET_KEY = os.getenv('SECRET_KEY')
    SQLALCHEMY_DATABASE_URI = os.getenv('SQLALCHEMY_DATABASE_URI')
    SQLALCHEMY_TRACK_MODIFICATIONS = os.getenv('SQLALCHEMY_TRACK_MODIFICATIONS')
    SQLALCHEMY_ECHO = os.getenv('SQLALCHEMY_ECHO')
    SESSION_TYPE = os.getenv('SESSION_TYPE')
    SESSION_PERMANENT = os.getenv('SESSION_PERMANENT')
    SESSION_USE_SIGNER = os.getenv('SESSION_USE_SIGNER')