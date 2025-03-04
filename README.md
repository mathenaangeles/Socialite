# Social Media Analytics

### Prerequisites
- [Python 3.9+](https://www.python.org/downloads/)
- [Node.js](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
- [Redis](https://redis.io/downloads/)

### Getting Started
1. Create a virtual environment by running `python -m venv .venv`. 
2. Activate the virtual environment by running `source .venv/bin/activate/`.
3. Navigate to the `server` directory and run `pip install -r requirements.txt`.
4. Create a `.env` file in the `server` directory. Add the following:
```
FLASK_APP = 'app.py'
FLASK_ENV = development
SECRET_KEY = <INSERT SECRET KEY HERE>
SQLALCHEMY_DATABASE_URI = <INSERT DATABASE URI HERE (e.g., 'sqlite:///db.sqlite')>
SQLALCHEMY_TRACK_MODIFICATIONS = False
SQLALCHEMY_ECHO = True
SESSION_TYPE = 'redis'
SESSION_PERMANENT = False
SESSION_USE_SIGNER = True
SESSION_REDIS = <INSERT SESSION REDIS HERE (e.g., 'redis://localhost:6379/0')> 
```
5. In the `server` directory, run `flask run`.
6. Navigate to the `client` directory and run `npm install`.
7. In the `client` directory, run `npm start`.

### Database
- If this is your first time setting up migrations, you need to initialize the migration directory by running `flask db init`.
- Every time you modify your SQLAlchemy models, generate a migration file by running `flask db migrate -m "<INSERT DESCRIPTION OF CHANGES HERE>"`.
- To apply the migrations to the database, run `flask db upgrade`.
- To undo the last migration, run `flask db downgrade`.

