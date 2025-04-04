"""
Configuration Hypercorn pour l'application portfolio backend
"""
import os

# Port d'écoute, par défaut 10000 si non spécifié par une variable d'environnement
bind = f"0.0.0.0:{os.environ.get('PORT', 10000)}"

# Nombre de workers
workers = 4

# Workers class
worker_class = "asyncio"

# Timeout en secondes
timeout = 120

# Debug mode
debug = os.environ.get("DEBUG", "false").lower() == "true"

# Loglevel
loglevel = os.environ.get("LOG_LEVEL", "info").lower()

# Access log
accesslog = "-"

# Error log
errorlog = "-"

# Application à charger
application_path = "wsgi:app" 