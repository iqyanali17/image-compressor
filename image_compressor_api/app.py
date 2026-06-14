from flask import Flask
from flask_cors import CORS
from config import Config
from middleware.error_handler import register_error_handlers
from routes.image_routes import image_bp
from routes.auth_routes import auth_bp
import os

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Configure CORS - allow all for MVP
    CORS(app)
    
    # Register Error Handlers
    register_error_handlers(app)
    
    # Register Blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/v1/auth')
    app.register_blueprint(image_bp, url_prefix='/api/v1/images')
    
    # Ensure upload folders exist
    os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
    os.makedirs(Config.COMPRESSED_FOLDER, exist_ok=True)
    
    @app.route('/', methods=['GET'])
    def health_check():
        return {"status": "success", "message": "Image Compressor API is running"}
        
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, host='0.0.0.0', port=5000)
