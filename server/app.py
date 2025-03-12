from flask import Flask
from flask_cors import CORS
from config import Configuration
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
CORS(app, supports_credentials=True)

app.config.from_object(Configuration)
db = SQLAlchemy(app)
migrate = Migrate(app, db)

import routes.user
import routes.organization

if __name__ == '__main__':
    app.run(debug=True)

