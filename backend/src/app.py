# Ajout pour corriger le chemin d'importation sur Render
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import os
import socket
import logging
from quart import Quart, request, jsonify
from quart_cors import cors
from dotenv import load_dotenv
from services.llama_service import LlamaService
from services.openai_service import OpenAIService
# Services Agno spécialisés dans un seul module maintenant
from services.agno_services import AgnoService, PresentationAgnoService, ProjectAgnoService, InfoAgnoService
from werkzeug.utils import secure_filename
import asyncio

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Chargement des variables d'environnement
load_dotenv()

app = Quart(__name__)
app = cors(app, allow_origin="*")

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'mp3', 'wav'}

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Initialisation des services
llama_service = LlamaService()
openai_service = OpenAIService()
# Activation des agents Agno
agno_service = AgnoService()
# Nouveaux agents spécialisés
presentation_service = PresentationAgnoService()
project_service = ProjectAgnoService()
info_service = InfoAgnoService()

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/api/chat', methods=['POST'])
async def chat():
    try:
        data = await request.get_json()
        message = data.get('message', '')
        
        # Récupérer le contexte pertinent
        context = await llama_service.get_relevant_context(message)
        
        # Générer une réponse avec le contexte
        response = await openai_service.generate_response(message, context)
        
        return jsonify({
            'response': response,
            'context': context
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/agno_chat', methods=['POST'])
async def agno_chat():
    """Endpoint utilisant Agno pour générer des réponses"""
    try:
        data = await request.get_json()
        message = data.get('message', '')
        session_id = data.get('session_id', None)
        
        # Récupérer le contexte pertinent
        context = await llama_service.get_relevant_context(message)
        
        # Générer une réponse avec Agno
        if session_id:
            # Si un session_id est fourni, l'ajouter aux metadata
            metadata = {"session_id": session_id}
            response = await agno_service.generate_response(message, context, metadata)
        else:
            response = await agno_service.generate_response(message, context)
        
        # Si c'est déjà un dictionnaire, le traiter directement
        if isinstance(response, dict):
            # Ajouter le contexte si nécessaire
            if 'context' not in response:
                response['context'] = context
            return jsonify(response)
        
        # Sinon, construire une réponse propre
        return jsonify({
            'response': str(response),
            'context': context
        })
        
    except Exception as e:
        logger.error(f"Error in agno_chat: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/presentation', methods=['POST'])
async def presentation():
    """Endpoint utilisant l'agent de présentation pour Lucas Bometon"""
    try:
        data = await request.get_json()
        message = data.get('message', '')
        
        # Récupérer le contexte pertinent
        context = await llama_service.get_relevant_context(message)
        
        # Générer une réponse avec l'agent de présentation
        response = await presentation_service.generate_response(message, context)
        
        # Traitement de la réponse pour s'assurer qu'elle est compatible JSON
        if isinstance(response, dict):
            return jsonify(response)
        else:
            return jsonify({
                'response': str(response),
                'context': context
            })
    except Exception as e:
        logger.error(f"Erreur dans presentation: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/project', methods=['POST'])
async def project():
    """Endpoint utilisant l'agent de définition de projet et conversion commerciale"""
    try:
        data = await request.get_json()
        message = data.get('message', '')
        session_id = data.get('session_id', None)
        
        # Ajouter un préfixe pour forcer l'orientation commerciale
        # cela garantit que le message sera traité comme un projet potentiel
        enhanced_message = f"[PROJET COMMERCIAL] {message} - BESOIN DE QUALIFICATION"
        
        # Récupérer le contexte pertinent
        context = await llama_service.get_relevant_context(enhanced_message)
        
        # Utiliser l'agent Commercial au lieu de l'agent Project pour la qualification de projet
        # Cela nous permet de maintenir la continuité de la qualification
        response = await project_service.generate_response(enhanced_message, context)
        
        # Traitement de la réponse pour s'assurer qu'elle est compatible JSON
        if isinstance(response, dict):
            # Ajouter le contexte si non présent
            if 'context' not in response:
                response['context'] = context
            return jsonify(response)
        else:
            return jsonify({
                'response': str(response),
                'context': context
            })
    except Exception as e:
        logger.error(f"Erreur dans project: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/info', methods=['POST'])
async def info():
    """Endpoint utilisant l'agent d'information"""
    try:
        data = await request.get_json()
        message = data.get('message', '')
        
        # Récupérer le contexte pertinent
        context = await llama_service.get_relevant_context(message)
        
        # Générer une réponse avec l'agent d'information
        response = await info_service.generate_response(message, context)
        
        # Traitement de la réponse pour s'assurer qu'elle est compatible JSON
        if isinstance(response, dict):
            return jsonify(response)
        else:
            return jsonify({
                'response': str(response),
                'context': context
            })
    except Exception as e:
        logger.error(f"Erreur dans info: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/context', methods=['POST'])
async def get_context():
    try:
        data = await request.get_json()
        message = data.get('message', '')
        
        # Récupérer le contexte pertinent
        context = await llama_service.get_relevant_context(message)
        
        return jsonify({
            'context': context
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/query', methods=['POST'])
async def query():
    try:
        data = await request.get_json()
        message = data.get('message', '')
        
        # Générer une réponse avec le contexte
        response = await llama_service.query_with_context(message)
        
        return jsonify({
            'response': response
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/upload', methods=['POST'])
async def upload_file():
    try:
        files = await request.files
        if 'file' not in files:
            return {'error': 'No file part'}, 400
            
        file = files['file']
        if file.filename == '':
            return {'error': 'No selected file'}, 400
            
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            await file.save(filepath)
            
            return {
                'message': 'File uploaded successfully',
                'filename': filename
            }
            
        return {'error': 'File type not allowed'}, 400

    except Exception as e:
        logger.error(f"Error in upload endpoint: {str(e)}")
        return {'error': str(e)}, 500

@app.route('/', methods=['GET'])
async def root():
    return jsonify({
        'message': 'Bienvenue sur l\'API Portfolio',
        'endpoints': {
            'health': '/api/health',
            'chat': '/api/chat',
            'context': '/api/context',
            'query': '/api/query',
            'upload': '/api/upload',
            'agno_chat': '/api/agno_chat',
            'presentation': '/api/presentation',
            'project': '/api/project',
            'info': '/api/info'
        }
    })

@app.route('/api/health', methods=['GET'])
async def health_check():
    return jsonify({'status': 'healthy'})

@app.route('/api/chat/commercial', methods=['POST'])
async def chat_commercial():
    """
    API pour les discussions avec l'agent commercial - maintient une session
    """
    try:
        data = request.json
        query = data.get('query', '')
        context = data.get('context', '')
        session_id = data.get('session_id', None)
        
        # Log pour déboguer la session
        app.logger.info(f"Appel API commercial - Session ID reçue: {session_id[:8] if session_id else 'None'}")
        
        # Instancier le service commercial
        commercial_service = CommercialAgnoService()
        
        if session_id:
            # Si un session_id est fourni, l'ajouter aux metadata
            metadata = {"session_id": session_id}
            app.logger.info(f"Utilisation de la session commerciale existante: {session_id[:8]}")
            response = await commercial_service.generate_response(query, context, session_id)
        else:
            # S'il n'y a pas de session_id, en créer une nouvelle
            app.logger.info("Création d'une nouvelle session commerciale")
            response = await commercial_service.generate_response(query, context)
            
        # S'assurer que la réponse contient une session_id valide
        if isinstance(response, dict) and "session_id" not in response:
            app.logger.warning("La réponse ne contient pas de session_id")
            # Récupérer l'agent commercial pour obtenir sa session_id
            commercial_agent = None
            for agent in commercial_service.team_service.agents:
                if agent.name == "Commercial Agent":
                    commercial_agent = agent
                    break
            
            if commercial_agent and hasattr(commercial_agent, 'session_id'):
                response["session_id"] = commercial_agent.session_id
                app.logger.info(f"Session ID ajoutée à la réponse: {commercial_agent.session_id[:8] if commercial_agent.session_id else 'None'}")
        
        # Vérifier si la réponse est un dictionnaire
        if not isinstance(response, dict):
            response = {"response": str(response)}
        
        # Renvoyer la réponse
        return jsonify(response)
    except Exception as e:
        app.logger.error(f"Erreur lors du traitement de la demande commerciale: {str(e)}")
        return jsonify({
            "response": "Je rencontre un problème technique. Veuillez réessayer.",
            "error": str(e)
        }), 500

# Fonction pour trouver un port disponible
def find_available_port(start_port=5003, max_attempts=10):
    """Trouve un port disponible en commençant par start_port"""
    for port_offset in range(max_attempts):
        port = start_port + port_offset
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(1)
        try:
            result = sock.connect_ex(('127.0.0.1', port))
            sock.close()
            if result != 0:  # Le port n'est pas utilisé
                logging.info(f"Port disponible trouvé: {port}")
                return port
        except Exception as e:
            logging.warning(f"Erreur lors du test du port {port}: {e}")
        sock.close()
    
    # Fallback sur un port aléatoire
    logging.warning(f"Aucun port disponible trouvé entre {start_port} et {start_port + max_attempts - 1}")
    return 0  # Utiliser un port aléatoire

if __name__ == "__main__":
    logger.info("Démarrage de l'application...")
    port = int(os.getenv("PORT", 5003))
    
    # Vérifier si le port est disponible, sinon en trouver un autre
    port = find_available_port(start_port=port)
    
    if port > 0:
        logger.info(f"Lancement de l'application sur le port {port}")
        app.run(host='0.0.0.0', port=port)
    else:
        # Utiliser un port aléatoire si aucun port spécifique n'est disponible
        logger.info("Lancement de l'application sur un port aléatoire")
        app.run(host='0.0.0.0')
