import os
import sys
import logging

# S'assurer que le répertoire parent est dans le PYTHONPATH
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Importer l'application
from src.app import app

if __name__ == "__main__":
    logging.info("Démarrage de l'application depuis __main__.py...")
    port = int(os.getenv("PORT", 5003))
    app.run(host='0.0.0.0', port=port) 