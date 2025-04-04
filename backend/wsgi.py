# Ce fichier sert uniquement de point d'entrée pour Render
# Il importe l'application depuis app.py

import os
import sys
import pathlib

# Ajouter le répertoire backend au PYTHONPATH
current_file = pathlib.Path(__file__).resolve()
parent_dir = current_file.parent  # Dossier backend
sys.path.insert(0, str(parent_dir))

# Importer l'application depuis src.app
from src.app import app

# Si ce fichier est exécuté directement
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host='0.0.0.0', port=port) 