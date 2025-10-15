import os
import shutil
import docker
from datetime import datetime
import json
import re
import ast

SERVICES_WORKSPACE = "/app/workspace"
TEMPLATES_PATH = "/app"
DB_FILE_PATH = "/app/data/db.json"

_microservices_db = []
client = docker.from_env()

def _find_user_function_name(user_code: str) -> str:

    try:
        tree = ast.parse(user_code)
        for node in ast.walk(tree):
            if isinstance(node, ast.FunctionDef):
                return node.name
    except SyntaxError as e:
        raise ValueError(f"El código proporcionado tiene un error de sintaxis: {e}")
    
    raise ValueError("No se encontró ninguna definición de función ('def ...') en el código.")

def _save_db():
    os.makedirs(os.path.dirname(DB_FILE_PATH), exist_ok=True)
    with open(DB_FILE_PATH, "w") as f:
        json.dump(_microservices_db, f, indent=4)

def _load_db():
    global _microservices_db
    try:
        if os.path.exists(DB_FILE_PATH) and os.path.getsize(DB_FILE_PATH) > 0:
            with open(DB_FILE_PATH, "r") as f:
                _microservices_db = json.load(f)
    except Exception:
        _microservices_db = []

def get_all_services():
    return _microservices_db

def create_new_microservice(service_name: str, user_code: str, language: str, is_roble: bool):
    if not re.match("^[a-zA-Z0-9_-]+$", service_name):
        raise ValueError("El nombre solo puede contener letras, números, guiones y guiones bajos.")
    if language != "python":
        raise ValueError("Esta versión solo soporta Python.")

    user_function_name = _find_user_function_name(user_code)

    master_template = f"""
import os
from flask import Flask, request, jsonify
import requests
import json

app = Flask(__name__)

class RobleClient:
    def __init__(self, project_token, user_access_token):
        self.base_url = "https://roble-api.openlab.uninorte.edu.co"
        self.project_id = project_token
        self.db_url = f"{{self.base_url}}/database/{{project_token}}"
        self.session = requests.Session()
        self.http = requests
        if user_access_token:
            auth_token = user_access_token if user_access_token.startswith("Bearer ") else f"Bearer {{user_access_token}}"
            self.session.headers.update({{'Authorization': auth_token, 'Content-Type': 'application/json'}})

# --- INICIO CÓDIGO USUARIO ---
{user_code}
# --- FIN CÓDIGO USUARIO ---

@app.route("/", methods=["POST", "GET"])
def main_handler():
    try:
        auth_header = request.headers.get("Authorization")
        
        json_data = request.get_json(silent=True) or {{}}
        project_id = json_data.get('project_id')
        json_payload = json_data.get('payload', {{}})
        
        query_args = request.args.to_dict()

        final_payload = {{**query_args, **json_payload}}
        
        client = RobleClient(project_id, auth_header)
        
        result = None
        try:
            result = {user_function_name}(client, final_payload)
        except TypeError:
            try:
                result = {user_function_name}(final_payload)
            except TypeError:
                result = {user_function_name}()

        if not isinstance(result, tuple) and not hasattr(result, 'json'):
             return jsonify({{"ok": True, "data": result}}), 200
        else:
             return result

    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return jsonify({{"ok": False, "error": str(e)}}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
"""
    final_code = master_template
    
    template_dir = os.path.join(TEMPLATES_PATH, "python_flask_template")
    if not os.path.isdir(template_dir):
        raise ValueError(f"La plantilla base 'python_flask_template' no existe.")
        
    service_path = os.path.join(SERVICES_WORKSPACE, service_name)
    if os.path.exists(service_path):
        raise ValueError(f"El servicio '{service_name}' ya existe.")
    os.makedirs(service_path)
    
    try:
        with open(os.path.join(service_path, "app.py"), "w") as f:
            f.write(final_code)
        shutil.copy(os.path.join(template_dir, "Dockerfile"), service_path)
        shutil.copy(os.path.join(template_dir, "requirements.txt"), service_path)
        image, _ = client.images.build(path=service_path, tag=f"{service_name}:latest", rm=True)
        traefik_labels = {"traefik.enable": "true",f"traefik.http.routers.{service_name}.rule": f"Host(`localhost`) && PathPrefix(`/{service_name}`)",f"traefik.http.middlewares.{service_name}-stripprefix.stripprefix.prefixes": f"/{service_name}",f"traefik.http.routers.{service_name}.middlewares": f"{service_name}-stripprefix",f"traefik.http.services.{service_name}.loadbalancer.server.port": "5000","traefik.docker.network": "proyecto-docker-microservicios_plataforma-net"}
        container = client.containers.run(image, detach=True,name=service_name, labels=traefik_labels, network="proyecto-docker-microservicios_plataforma-net")
        new_service = {"id": service_name, "name": service_name, "language": language, "code": user_code,"isRoble": is_roble,"containerId": container.short_id, "port": 8000, "status": "running","endpoint": f"http://localhost:8000/{service_name}", "createdAt": datetime.now().isoformat()}
        _microservices_db.append(new_service)
        _save_db()
        return new_service
    except Exception as e:
        if os.path.exists(service_path):
            shutil.rmtree(service_path)
        print(f"ERROR al crear servicio: {e}")
        raise e

def get_microservice_code(service_name: str):
    service_info = next((s for s in _microservices_db if s['name'] == service_name), None)
    if not service_info:
        raise ValueError("Servicio no encontrado.")
    return {
        "name": service_info.get("name"),
        "language": service_info.get("language"),
        "code": service_info.get("code"),
        "isRoble": service_info.get("isRoble")
    }

def update_microservice(service_name: str, new_name: str, new_code: str, new_language: str, is_roble: bool):
    delete_microservice(service_name)
    return create_new_microservice(new_name, new_code, new_language, is_roble)

def delete_microservice(service_name: str):
    global _microservices_db
    try:
        container = client.containers.get(service_name)
        container.stop()
        container.remove()
        service_path = os.path.join(SERVICES_WORKSPACE, service_name)
        if os.path.exists(service_path):
            shutil.rmtree(service_path)
        _microservices_db = [s for s in _microservices_db if s['name'] != service_name]
        _save_db()
        return {"ok": True, "message": f"Servicio '{service_name}' eliminado."}
    except Exception as e:
        _microservices_db = [s for s in _microservices_db if s['name'] != service_name]
        _save_db()
        if "No such container" in str(e):
             return {"ok": True, "message": f"Servicio '{service_name}' limpiado de la base de datos."}
        raise Exception(f"Error al eliminar el servicio: {e}")


def stop_microservice(service_name: str):
    global _microservices_db
    try:
        container = client.containers.get(service_name)
        container.stop()
        for s in _microservices_db:
            if s['name'] == service_name:
                s['status'] = 'stopped'
        _save_db()
        return {"ok": True, "message": f"Servicio '{service_name}' detenido."}
    except Exception as e:
        raise Exception(f"Error al detener el servicio: {e}")

def restart_microservice(service_name: str):
    global _microservices_db
    try:
        container = client.containers.get(service_name)
        container.restart()
        for s in _microservices_db:
            if s['name'] == service_name:
                s['status'] = 'running'
        _save_db()
        return {"ok": True, "message": f"Servicio '{service_name}' reiniciado."}
    except Exception as e:
        raise Exception(f"Error al reiniciar el servicio: {e}")

_load_db()
