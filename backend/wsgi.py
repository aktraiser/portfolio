import os
from quart import Quart, jsonify
from quart_cors import cors

app = Quart(__name__)
app = cors(app, allow_origin="*")

@app.route('/', methods=['GET'])
async def root():
    return jsonify({
        'message': 'API Portfolio de Lucas Bometon',
        'status': 'opérationnel',
        'endpoints': {
            'health': '/api/health',
            'articles': '/api/articles'
        }
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
            "resume": "Un guide complet pour construire une application web fullstack.",
            "date_publication": "2023-09-01T10:00:00Z",
            "image_url": "https://picsum.photos/id/1/800/600"
        },
        {
            "id": "2",
            "titre": "Les avantages de Docker pour le déploiement",
            "resume": "Docker simplifie le déploiement d'applications.",
            "date_publication": "2023-08-15T10:00:00Z",
            "image_url": "https://picsum.photos/id/2/800/600"
        },
        {
            "id": "3",
            "titre": "Tailwind CSS vs Bootstrap",
            "resume": "Comparaison des deux frameworks CSS populaires.",
            "date_publication": "2023-07-01T10:00:00Z",
            "image_url": "https://picsum.photos/id/3/800/600"
        }
    ]
    return jsonify(articles_data)

@app.route('/api/articles/<article_id>', methods=['GET'])
async def article_detail(article_id):
    # Données statiques pour simuler un article spécifique
    articles = {
        "1": {
            "id": "1",
            "titre": "Comment créer une application web moderne avec Next.js",
            "contenu": "Contenu complet de l'article sur Next.js...",
            "resume": "Un guide complet pour construire une application web fullstack.",
            "date_publication": "2023-09-01T10:00:00Z",
            "image_url": "https://picsum.photos/id/1/800/600",
            "auteur": "Lucas Bometon"
        },
        "2": {
            "id": "2",
            "titre": "Les avantages de Docker pour le déploiement",
            "contenu": "Contenu complet de l'article sur Docker...",
            "resume": "Docker simplifie le déploiement d'applications.",
            "date_publication": "2023-08-15T10:00:00Z",
            "image_url": "https://picsum.photos/id/2/800/600",
            "auteur": "Lucas Bometon"
        },
        "3": {
            "id": "3",
            "titre": "Tailwind CSS vs Bootstrap",
            "contenu": "Contenu complet de l'article sur Tailwind vs Bootstrap...",
            "resume": "Comparaison des deux frameworks CSS populaires.",
            "date_publication": "2023-07-01T10:00:00Z",
            "image_url": "https://picsum.photos/id/3/800/600",
            "auteur": "Lucas Bometon"
        }
    }
    
    if article_id in articles:
        return jsonify(articles[article_id])
    else:
        return jsonify({"error": "Article non trouvé"}), 404

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))  # Utiliser PORT=10000 comme défaut selon la doc Render
    app.run(host='0.0.0.0', port=port) 