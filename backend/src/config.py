import os
from datetime import timedelta

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'asdf#FGSgvasgf$5$WGT'
    
    # Database Configuration - Handle PostgreSQL URL format
    database_url = os.environ.get('DATABASE_URL')
    if database_url and database_url.startswith('postgres://'):
        # SQLAlchemy 2.0+ requires 'postgresql://' scheme for PostgreSQL
        database_url = database_url.replace('postgres://', 'postgresql://', 1)
    
    SQLALCHEMY_DATABASE_URI = database_url or f"sqlite:///{os.path.join(os.path.dirname(__file__), 'database', 'app.db')}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # JWT Configuration
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'jwt-secret-string'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    
    # File Upload Configuration
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'static', 'uploads')
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'pdf', 'doc', 'docx'}
    
    # CORS Configuration - IMPORTANT: Specific origins required when supports_credentials=True
    # These are default development origins. ProductionConfig will override for production.
    CORS_ORIGINS = [
        'http://localhost:3000',  # Example for React/Vue development server
        'http://127.0.0.1:3000',
        'http://localhost:5173',  # Example for Vite development server
        'http://127.0.0.1:5173',
        'http://localhost:5174',
        'http://127.0.0.1:5174',
    ]
    
    # Pagination
    POSTS_PER_PAGE = 20
    RUNNERS_PER_PAGE = 12
    
    # Email Configuration (for future use)
    MAIL_SERVER = os.environ.get('MAIL_SERVER')
    MAIL_PORT = int(os.environ.get('MAIL_PORT') or 587)
    MAIL_USE_TLS = os.environ.get('MAIL_USE_TLS', 'true').lower() in ['true', 'on', '1']
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD')
    
    @staticmethod
    def init_app(app):
        pass

class DevelopmentConfig(Config):
    DEBUG = True

class ProductionConfig(Config):
    DEBUG = False
    
    # Production-specific settings
    # IMPORTANT: Explicitly set the frontend URL(s) for production
    # Replace 'https://urban-assist-frontend.onrender.com' with your actual frontend URL
    CORS_ORIGINS = [
        'https://urban-assist-frontend.onrender.com'
        # Add other production frontend URLs if applicable, e.g.,
        # 'https://another-production-frontend.onrender.com'
    ]

    @staticmethod
    def init_app(app):
        Config.init_app(app)
        
        # Log to stderr in production
        import logging
        from logging import StreamHandler
        file_handler = StreamHandler()
        file_handler.setLevel(logging.INFO)
        app.logger.addHandler(file_handler)

class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}
