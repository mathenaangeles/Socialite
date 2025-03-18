import os
import urllib.parse
from dotenv import load_dotenv
from azure.storage.blob import BlobServiceClient

load_dotenv()
basedir = os.path.abspath(os.path.dirname(__file__))

class Configuration(object):
    SECRET_KEY = os.getenv('SECRET_KEY')
    SQLALCHEMY_ECHO = os.getenv('SQLALCHEMY_ECHO')
    SQLALCHEMY_TRACK_MODIFICATIONS = os.getenv('SQLALCHEMY_TRACK_MODIFICATIONS')

    SESSION_TYPE = os.getenv('SESSION_TYPE')
    SESSION_PERMANENT = os.getenv('SESSION_PERMANENT')
    SESSION_USE_SIGNER = os.getenv('SESSION_USE_SIGNER')

    server = os.getenv("DB_SERVER")
    database = os.getenv("DB_NAME")
    username = os.getenv("DB_USERNAME")
    password = os.getenv("DB_PASSWORD")
    driver = os.getenv("DB_DRIVER")
    encrypt = os.getenv("DB_ENCRYPT")
    trust_cert = os.getenv("DB_TRUST_SERVER_CERTIFICATE")
    timeout = os.getenv("DB_TIMEOUT")

    params = urllib.parse.quote_plus(
        f"DRIVER={{{driver}}};"
        f"SERVER=tcp:{server},1433;"
        f"DATABASE={database};"
        f"UID={username};"
        f"PWD={password};"
        f"Encrypt={encrypt};"
        f"TrustServerCertificate={trust_cert};"
        f"Connection Timeout={timeout};"
    )
    SQLALCHEMY_DATABASE_URI = f"mssql+pyodbc:///?odbc_connect={params}"

    from sqlalchemy import create_engine

    try:
        engine = create_engine(SQLALCHEMY_DATABASE_URI)
        conn = engine.connect()
        print("Connected successfully to Azure SQL...")
        conn.close()
    except Exception as e:
        print("ERROR: Connection to Azure SQL failed...", e)




    

    