# Socialite

### Prerequisites
- [Python 3.9+](https://www.python.org/downloads/)
- [Node.js](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)

### Getting Started
1. Create a virtual environment by running `python -m venv .venv`. 
2. Activate the virtual environment by running `source .venv/bin/activate/`.
3. Navigate to the `server` directory and run `pip install -r requirements.txt`.
4. Create a `.env` file in the `server` directory. Add the following:
```
FLASK_APP=app.py
FLASK_DEBUG=1
FLASK_ENV=development
SECRET_KEY=<INSERT_SECRET_KEY_HERE>
SQLALCHEMY_TRACK_MODIFICATIONS=False
SQLALCHEMY_ECHO=False
SESSION_TYPE=filesystem
SESSION_PERMANENT=False
SESSION_USE_SIGNER=True
DB_SERVER=<INSERT_DB_SERVER_HERE>
DB_NAME=<INSERT_DB_NAME_HERE>
DB_USERNAME=<INSERT_DB_USERNAME_HERE>
DB_PASSWORD=<INSERT_DB_PASSWORD_HERE>
DB_DRIVER=ODBC Driver 17 for SQL Server
DB_ENCRYPT=yes
DB_TRUST_SERVER_CERTIFICATE=no
DB_TIMEOUT=30
AZURE_STORAGE_CONNECTION_STRING=<INSERT_AZURE_STORAGE_CONNECTION_STRING_HERE>
AZURE_CONTAINER_NAME=images
AZURE_STORAGE_ACCOUNT_NAME=<INSERT_STORAGE_ACCOUNT_NAME_HERE>
AZURE_OPENAI_API_KEY=<INSERT_OPENAI_API_KEY_HERE>
AZURE_OPENAI_ENDPOINT=<INSERT_OPENAI_ENDPOINT_HERE>
AZURE_OPENAI_API_VERSION=<INSERT_OPENAI_API_VERSION_HERE>
AZURE_OPENAI_DEPLOYMENT_NAME=<INSERT_OPENAI_DEPLOYMENT_NAME_HERE>
AZURE_DALLE_DEPLOYMENT_NAME=<INSERT_DALLE_DEPLOYMENT_NAME_HERE>
```
5. In the `server` directory, run `flask run`.
6. Navigate to the `client` directory and run `npm install`.
7. In the `client` directory, run `npm start`.

### Database
- Add your IP address to the Azure SQL server under under `Networking`.
- If this is your first time setting up migrations, you need to initialize the migration directory by running `flask db init`.
- Every time you modify your SQLAlchemy models, generate a migration file by running `flask db migrate -m "<INSERT DESCRIPTION OF CHANGES HERE>"`.
- To apply the migrations to the database, run `flask db upgrade`.
- To undo the last migration, run `flask db downgrade`.

