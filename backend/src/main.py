import os
import sys
from flask import Flask, send_from_directory, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager

# Ensure the parent directory of 'src' is in the Python path
# This helps with absolute imports like 'src.models.user'
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), os.pardir)))

# Import your extensions and blueprints
from src.models.user import db
from src.routes.user import user_bp
from src.routes.booking import booking_bp
from src.routes.review import review_bp
from src.routes.admin import admin_bp
from src.config import config # Your configuration object
from src.chat import init_socketio # Your Socket.IO initialization function

def create_app(config_name=None):
    """
    Creates and configures the Flask application.

    Args:
        config_name (str, optional): The name of the configuration to use
                                     ('development' or 'production').
                                     Defaults to FLASK_ENV environment variable or 'development'.

    Returns:
        tuple: A tuple containing the Flask app instance and the SocketIO instance.
    """
    if config_name is None:
        # Determine configuration based on FLASK_ENV or default to 'development'
        flask_env = os.environ.get('FLASK_ENV', 'development')
        config_name = 'production' if flask_env == 'production' else 'development'
    
    # Initialize Flask app
    app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
    app.config.from_object(config[config_name])

    # --- NEW: Configure SQLAlchemy Engine Options for Connection Pooling ---
    # This helps prevent 'SSL SYSCALL error: EOF detected' by managing database connections.
    app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
        'pool_pre_ping': True,  # Test connections before handing them out from the pool
        'pool_recycle': 3600    # Recycle connections every hour (3600 seconds)
                                # This closes connections that have been idle for too long,
                                # preventing them from becoming stale.
    }
    # --- END NEW ---
    
    # Initialize extensions
    db.init_app(app)
    
    # Configure CORS for HTTP requests
    # The 'origins' are read from app.config['CORS_ORIGINS']
    # Ensure CORS_ORIGINS is correctly set in your src/config.py for production
    CORS(app, origins=app.config['CORS_ORIGINS'], supports_credentials=True)
    
    jwt = JWTManager(app)
    
    # Initialize Socket.io
    # Ensure init_socketio also uses app.config['CORS_ORIGINS'] for its cors_allowed_origins
    socketio = init_socketio(app)
    
    # Add request logging middleware
    @app.before_request
    def log_request_info():
        if request.path.startswith('/api/'):
            print(f"DEBUG: Request to {request.path}")
            print(f"DEBUG: Method: {request.method}")
            print(f"DEBUG: Authorization header: {request.headers.get('Authorization')}")
            print(f"DEBUG: All headers: {dict(request.headers)}")
    
    # JWT error handlers
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        """Callback for expired JWT tokens."""
        print(f"DEBUG: JWT Token expired - Header: {jwt_header}, Payload: {jwt_payload}")
        return {'error': 'Token has expired'}, 401
    
    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        """Callback for invalid JWT tokens."""
        print(f"DEBUG: JWT Invalid token - Error: {error}")
        return {'error': 'Invalid token'}, 401
    
    @jwt.unauthorized_loader
    def missing_token_callback(error):
        """Callback for missing authorization tokens."""
        print(f"DEBUG: JWT Missing token - Error: {error}")
        return {'error': 'Authorization token is required'}, 401
    
    # Register blueprints
    app.register_blueprint(user_bp, url_prefix='/api')
    app.register_blueprint(booking_bp, url_prefix='/api')
    app.register_blueprint(review_bp, url_prefix='/api')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    
    # Create database tables within the application context
    # This ensures tables are created when the app starts.
    # For production, consider using Flask-Migrate (Alembic) for migrations.
    with app.app_context():
        db.create_all()
        # Optional: Seed database if it's empty.
        # It's generally better to have seeding as a separate command or a conditional check
        # to prevent re-seeding on every app restart in production.
        try:
            from src.seed_data import seed_all
            # Check if data already exists before seeding to avoid duplicates
            # Example: if not db.session.query(User).first():
            seed_all()
            print("Database seeded successfully (if conditions met)!")
        except ImportError:
            print("Seed data module not found or seeding skipped.")
        except Exception as e:
            print(f"Database seeding warning: {e}")

    # Route for serving static files (e.g., your React/Vue/Angular frontend build)
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve(path):
        """
        Serves static files from the 'static' folder, primarily for single-page applications.
        If a specific file is requested, it serves that file. Otherwise, it serves index.html.
        """
        static_folder_path = app.static_folder
        if static_folder_path is None:
            return "Static folder not configured", 404

        # Check if the requested path corresponds to an existing file in the static folder
        if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
            return send_from_directory(static_folder_path, path)
        else:
            # Otherwise, serve the main index.html for SPA routing
            index_path = os.path.join(static_folder_path, 'index.html')
            if os.path.exists(index_path):
                return send_from_directory(static_folder_path, 'index.html')
            else:
                return "index.html not found in static folder", 404
    
    return app, socketio

# This block ensures that create_app() is called once when the module is loaded
# and the app and socketio instances are available for gunicorn.
app, socketio = create_app()

if __name__ == '__main__':
    # When running directly (e.g., python main.py), use socketio.run
    # In production with Gunicorn, Gunicorn will handle running the app.
    print("Running Flask app with SocketIO...")
    socketio.run(app, host='0.0.0.0', port=5000, debug=True, allow_unsafe_werkzeug=True)

