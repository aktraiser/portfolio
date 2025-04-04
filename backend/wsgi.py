# Ce fichier sert uniquement de point d'entrée pour Render
# Il importe l'application depuis app.py

import os
import sys
import pathlib
import logging

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Ajouter le répertoire backend au PYTHONPATH
current_file = pathlib.Path(__file__).resolve()
parent_dir = current_file.parent  # Dossier backend
sys.path.insert(0, str(parent_dir))

# Importer l'application depuis src.app
from src.app import app

# Configurer le port pour Render
port = int(os.environ.get("PORT", 10000))
# Cette configuration sera utilisée par certains serveurs WSGI
app.config['PORT'] = port

# Log des informations importantes
logger.info(f"Application configurée pour démarrer sur le port {port}")
logger.info(f"Répertoire courant: {os.getcwd()}")
logger.info(f"Variables d'environnement PORT: {os.environ.get('PORT')}")

# Si ce fichier est exécuté directement
if __name__ == "__main__":
    logger.info(f"Démarrage de l'application sur 0.0.0.0:{port}")
    app.run(host='0.0.0.0', port=port) 
else:
    # Ce code s'exécute lorsque le fichier est importé par un serveur WSGI comme Hypercorn
    logger.info(f"wsgi.py importé par un serveur WSGI (Hypercorn ou Gunicorn)")
    # Exporter les variables pour le serveur WSGI
    bind_host = "0.0.0.0"
    bind_port = port 