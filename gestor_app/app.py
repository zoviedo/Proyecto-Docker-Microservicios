from flask import Flask, request, jsonify, Blueprint
from services import docker_service
import os

app = Flask(__name__)

api_blueprint = Blueprint('api', __name__)

@api_blueprint.route('/microservices', methods=['GET'])
def get_microservices():
    services = docker_service.get_all_services()
    return jsonify(services)

@api_blueprint.route('/microservices', methods=['POST'])
def create_microservice():
    data = request.get_json()
    service_name = data.get("name")
    code = data.get("code")
    language = data.get("language")
    is_roble = data.get("isRoble")
    try:
        new_service = docker_service.create_new_microservice(service_name, code, language, is_roble)
        return jsonify(new_service), 201
    except ValueError as e:
        return jsonify({"ok": False, "error": str(e)}), 409
    except Exception as e:
        return jsonify({"ok": False, "error": f"Error inesperado: {str(e)}"}), 500

@api_blueprint.route('/microservices/<service_name>', methods=['DELETE'])
def delete_service_api(service_name):
    try:
        result = docker_service.delete_microservice(service_name)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500

@api_blueprint.route('/microservices/<service_name>/stop', methods=['POST'])
def stop_service_api(service_name):
    try:
        result = docker_service.stop_microservice(service_name)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500

@api_blueprint.route('/microservices/<service_name>/restart', methods=['POST'])
def restart_service_api(service_name):
    try:
        result = docker_service.restart_microservice(service_name)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500

@api_blueprint.route('/microservices/<service_name>/code', methods=['GET'])
def get_service_code_api(service_name):
    try:
        code_data = docker_service.get_microservice_code(service_name)
        return jsonify(code_data)
    except ValueError as e:
        return jsonify({"ok": False, "error": str(e)}), 404
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500

@api_blueprint.route('/microservices/<service_name>', methods=['PUT'])
def update_service_api(service_name):
    data = request.get_json()
    try:
        updated_service = docker_service.update_microservice(
            service_name,
            data.get("name"),
            data.get("code"),
            data.get("language"),
            data.get("isRoble")
        )
        return jsonify(updated_service), 200
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500

app.register_blueprint(api_blueprint, url_prefix='/api')

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080, debug=True)