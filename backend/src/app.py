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
            response = await agno_service.generate_response(message, context, {"session_id": session_id})
        else:
            response = await agno_service.generate_response(message, context)
        
        # Extraction du contenu de la réponse selon son type
        response_content = ""
        current_session_id = None
        
        # Si c'est un dictionnaire avec content et session_id
        if isinstance(response, dict) and 'content' in response:
            response_content = response.get('content', "")
            current_session_id = response.get('session_id', None)
        # Si c'est un objet Pydantic
        elif hasattr(response, "model_dump"):
            response_data = response.model_dump()
            response_content = response_data.get("content", str(response))
            current_session_id = response_data.get("session_id", None)
        # Si c'est une chaîne
        elif isinstance(response, str):
            response_content = response
        else:
            # Fallback: convertir en string
            response_content = str(response)
        
        # Construction de la réponse JSON
        response_json = {
            'response': response_content,
            'context': context
        }
        
        # Ajouter session_id à la réponse si disponible
        if current_session_id:
            response_json['session_id'] = current_session_id
        
        return jsonify(response_json)
        
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
        
        return jsonify({
            'response': response,
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
        response = await commercial_service.generate_response(enhanced_message, context, session_id)
        
        # Extraire session_id pour permettre la continuité des conversations
        session_id = None
        if isinstance(response, dict) and 'session_id' in response:
            session_id = response.get('session_id')
            content = response.get('content', str(response))
        else:
            content = str(response)
        
        return jsonify({
            'response': content,
            'context': context,
            'session_id': session_id
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
        
        return jsonify({
            'response': response,
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
