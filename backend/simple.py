from quart import Quart, jsonify
from quart_cors import cors
import os

app = Quart(__name__)
app = cors(app, allow_origin="*")

@app.route('/', methods=['GET'])
async def root():
    return jsonify({
        'message': 'API Portfolio - Serveur de test',
        'status': 'opérationnel'
    })

@app.route('/api/health', methods=['GET'])
async def health_check():
    return jsonify({'status': 'healthy'})

@app.route('/api/articles', methods=['GET'])
async def articles():
    # Données statiques pour simuler les articles du blog
    articles_data = [
        {
            "id": "1",
            "titre": "Comment créer une application web moderne avec Next.js",
            "resume": "Un guide pour construire une application web fullstack.",
            "date_publication": "2023-09-01T10:00:00Z"
        },
        {
            "id": "2",
            "titre": "Les avantages de Docker pour le déploiement",
            "resume": "Docker simplifie le déploiement d'applications.",
            "date_publication": "2023-08-15T10:00:00Z"
        }
    ]
    return jsonify(articles_data)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5003))
    app.run(host='0.0.0.0', port=port) 