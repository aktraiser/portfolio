from flask import Blueprint, jsonify

main_bp = Blueprint('main', __name__)

@main_bp.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok", "message": "API is working correctly"})

@main_bp.route('/api/projects', methods=['GET'])
def get_projects():
    # Mock data - in a real app, this would come from a database
    projects = [
        {
            "id": 1,
            "title": "Project 1",
            "description": "Description for project 1",
            "image": "https://via.placeholder.com/300"
        },
        {
            "id": 2,
            "title": "Project 2",
            "description": "Description for project 2",
            "image": "https://via.placeholder.com/300"
        }
    ]
    return jsonify(projects) 