import os

from dotenv import load_dotenv

load_dotenv()  # read ml-service/.env if present

# Mongo connection (same database the Node server uses).
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/asalpasal")
# Optional explicit DB name (only needed if the URI has no /dbname path).
MONGO_DB = os.getenv("MONGO_DB")

# Where to persist the trained model artifact.
MODEL_PATH = os.getenv("MODEL_PATH", "model.pkl")

# Service port.
PORT = int(os.getenv("PORT", "8000"))
