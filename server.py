# server.py - Backend Servidor para SAMPLAST Certificados (Flask + Google OAuth + Gemini)

import os
import io
import json
import requests
from flask import Flask, send_from_directory, request, jsonify

# Cargar variables de entorno manualmente si python-dotenv no está instalado o falla
def load_env():
    env_path = os.path.join(os.path.dirname(__file__), '.env')
    if os.path.exists(env_path):
        with open(env_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith('#'):
                    continue
                parts = line.split('=', 1)
                if len(parts) == 2:
                    key = parts[0].strip()
                    val = parts[1].strip()
                    # Quitar comillas si tiene
                    if (val.startswith('"') and val.endswith('"')) or (val.startswith("'") and val.endswith("'")):
                        val = val[1:-1]
                    os.environ[key] = val
                    print(f"Cargado del .env: {key}")
    else:
        print("Aviso: Archivo .env no encontrado. Asegúrese de crearlo a partir de .env.example")

# Cargar configuración
try:
    from dotenv import load_dotenv
    load_dotenv()
    print("Variables de entorno cargadas con python-dotenv")
except ImportError:
    load_env()

# Inicializar Flask
app = Flask(__name__, static_folder='.', static_url_path='')

# Claves requeridas
GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")

# Validar que estén las configuraciones
if not GOOGLE_CLIENT_ID:
    print("⚠️ ADVERTENCIA: GOOGLE_CLIENT_ID no configurado en el archivo .env")
if not GEMINI_API_KEY:
    print("⚠️ ADVERTENCIA: GEMINI_API_KEY no configurado en el archivo .env")

# Endpoint para obtener el Client ID del frontend
@app.route('/api/config', methods=['GET'])
def get_config():
    return jsonify({
        "google_client_id": GOOGLE_CLIENT_ID or ""
    })

# Endpoint para procesar la imagen de la etiqueta con Gemini
@app.route('/api/leer-etiqueta', methods=['POST'])
def leer_etiqueta():
    # 1. Validar Token de Google OAuth
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"error": "unauthorized", "notas": "Token de sesión de Google no proporcionado."}), 401
    
    token = auth_header.split(" ")[1]
    
    try:
        # Verificar token JWT con el endpoint oficial de Google
        # Esta llamada es stateless y no requiere compilar la librería nativa de Google Auth
        google_res = requests.get(f"https://oauth2.googleapis.com/tokeninfo?id_token={token}", timeout=5)
        if google_res.status_code != 200:
            return jsonify({"error": "unauthorized", "notas": "Sesión de Google no válida o expirada."}), 401
        
        user_info = google_res.json()
        print(f"[AUTH] Petición autorizada para el usuario: {user_info.get('email')}")
    except Exception as e:
        print(f"[AUTH ERROR] Error validando el token de Google: {e}")
        return jsonify({"error": "unauthorized", "notas": "No se pudo verificar la sesión con Google."}), 401

    # 2. Validar que venga la imagen
    if 'image' not in request.files:
        return jsonify({"error": "bad_request", "notas": "No se cargó ninguna imagen."}), 400
    
    image_file = request.files['image']
    image_bytes = image_file.read()

    if not GEMINI_API_KEY:
        return jsonify({"error": "server_error", "notas": "La API Key de Gemini no está configurada en el servidor."}), 500

    try:
        # Importar SDK de Gemini y Pillow
        import google.generativeai as genai
        from PIL import Image

        # Configurar la API key
        genai.configure(api_key=GEMINI_API_KEY)

        # Cargar el prompt del archivo de texto
        prompt_path = os.path.join(os.path.dirname(__file__), "PROMPT_LECTURA_ETIQUETA_GEMINI.txt")
        system_instruction = ""
        if os.path.exists(prompt_path):
            with open(prompt_path, "r", encoding="utf-8") as pf:
                system_instruction = pf.read()
        else:
            return jsonify({"error": "server_error", "notas": "No se encontró el archivo de prompt del sistema."}), 500

        # Cargar imagen en Pillow
        image = Image.open(io.BytesIO(image_bytes))

        # Inicializar el modelo con las instrucciones del sistema y JSON de salida
        model = genai.GenerativeModel(
            model_name=GEMINI_MODEL,
            system_instruction=system_instruction
        )

        print(f"[GEMINI] Enviando imagen al modelo {GEMINI_MODEL}...")
        
        response = model.generate_content(
            [image, "Decodifica esta etiqueta de lote de stretch film y genera el JSON de salida."],
            generation_config={"response_mime_type": "application/json"}
        )

        response_text = response.text.strip()
        print(f"[GEMINI RESPONSE] {response_text}")

        # Limpiar posibles bloques de código markdown que Gemini a veces devuelve
        if response_text.startswith("```"):
            if response_text.startswith("```json"):
                response_text = response_text[7:]
            else:
                response_text = response_text[3:]
            if response_text.endswith("```"):
                response_text = response_text[:-3]
            response_text = response_text.strip()

        # Parsear JSON para verificar que sea correcto
        result_json = json.loads(response_text)
        return jsonify(result_json)

    except ImportError:
        return jsonify({
            "error": "server_error", 
            "notas": "Error de dependencias. Ejecute ABRIR_CERTIFICADO.bat para instalar las librerías necesarias."
        }), 500
    except json.JSONDecodeError as je:
        print(f"[JSON ERROR] No se pudo parsear el JSON de Gemini: {je}")
        return jsonify({
            "error": "json_parse_error",
            "notas": "El modelo no generó un formato JSON válido. Reintente con otra foto."
        }), 500
    except Exception as ex:
        print(f"[GEMINI ERROR] Error en la llamada a Gemini: {ex}")
        return jsonify({
            "error": "gemini_error",
            "notas": f"Error de comunicación con la IA de Google: {str(ex)}"
        }), 500

# Servir index.html y estáticos del proyecto en la raíz
@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_files(path):
    # Evitar problemas si buscan directorios no deseados
    return send_from_directory('.', path)

if __name__ == '__main__':
    PORT = 8765
    print(f"===========================================================")
    print(f" Servidor SAMPLAST en funcionamiento en http://127.0.0.1:{PORT}")
    print(f" Habilitado para inicio de sesión y lectura con Gemini IA  ")
    print(f"===========================================================")
    app.run(host='0.0.0.0', port=PORT, debug=True)
