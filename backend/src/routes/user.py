from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from src.models.user import User, Runner, Service, Booking, Review, ChatMessage, db
from datetime import datetime
import re

user_bp = Blueprint('user', __name__)

# Helper function to validate email
def is_valid_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

# Authentication Routes
@user_bp.route('/auth/register', methods=['POST'])
def register():
    try:
        data = request.json
        
        # Validate required fields
        required_fields = ['username', 'email', 'password', 'first_name', 'last_name']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Validate email format
        if not is_valid_email(data['email']):
            return jsonify({'error': 'Invalid email format'}), 400
        
        # Check if user already exists
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'error': 'Username already exists'}), 400
        
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already exists'}), 400
        
        # Create new user
        user = User(
            username=data['username'],
            email=data['email'],
            first_name=data['first_name'],
            last_name=data['last_name'],
            phone=data.get('phone')
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        # Create tokens
        access_token = create_access_token(identity=str(user.id))
        refresh_token = create_refresh_token(identity=str(user.id))
        
        return jsonify({
            'message': 'User registered successfully',
            'user': user.to_dict(),
            'access_token': access_token,
            'refresh_token': refresh_token
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@user_bp.route('/auth/login', methods=['POST'])
def login():
    try:
        data = request.json
        
        if not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email and password are required'}), 400
        
        user = User.query.filter_by(email=data['email']).first()
        
        if not user or not user.check_password(data['password']):
            return jsonify({'error': 'Invalid email or password'}), 401
        
        if not user.is_active:
            return jsonify({'error': 'Account is deactivated'}), 401
        
        # Create tokens
        access_token = create_access_token(identity=str(user.id))
        refresh_token = create_refresh_token(identity=str(user.id))
        
        print(f"DEBUG: Login successful for user {user.username} (ID: {user.id})")
        print(f"DEBUG: Generated access token: {access_token[:20]}...")
        
        return jsonify({
            'message': 'Login successful',
            'user': user.to_dict(),
            'access_token': access_token,
            'refresh_token': refresh_token
        }), 200
        
    except Exception as e:
        print(f"DEBUG: Login exception: {str(e)}")
        return jsonify({'error': str(e)}), 500

@user_bp.route('/auth/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    try:
        current_user_id = get_jwt_identity()
        user_id = int(current_user_id)
        user = User.query.get(user_id)
        
        if not user or not user.is_active:
            return jsonify({'error': 'User not found or inactive'}), 404
        
        access_token = create_access_token(identity=str(user.id))
        
        return jsonify({
            'access_token': access_token,
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# User Profile Routes
@user_bp.route('/users/profile', methods=['GET'])
@jwt_required()
def get_profile():
    try:
        current_user_id = get_jwt_identity()
        print(f"DEBUG: JWT Identity extracted: {current_user_id}")
        print(f"DEBUG: Authorization header: {request.headers.get('Authorization')}")
        
        # Convert string ID back to integer for database lookup
        user_id = int(current_user_id)
        user = User.query.get(user_id)
        
        if not user:
            print(f"DEBUG: User not found for ID: {user_id}")
            return jsonify({'error': 'User not found'}), 404
        
        print(f"DEBUG: User found: {user.username}")
        return jsonify(user.to_dict()), 200
        
    except Exception as e:
        print(f"DEBUG: Exception in get_profile: {str(e)}")
        return jsonify({'error': str(e)}), 500

@user_bp.route('/users/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    try:
        current_user_id = get_jwt_identity()
        user_id = int(current_user_id)
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.json
        
        # Update allowed fields
        if 'first_name' in data:
            user.first_name = data['first_name']
        if 'last_name' in data:
            user.last_name = data['last_name']
        if 'phone' in data:
            user.phone = data['phone']
        if 'profile_image' in data:
            user.profile_image = data['profile_image']
        
        user.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Profile updated successfully',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Runner Profile Routes
@user_bp.route('/runners', methods=['GET'])
def get_runners():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 12, type=int)
        city = request.args.get('city')
        service_id = request.args.get('service_id', type=int)
        min_rating = request.args.get('min_rating', type=float)
        max_rate = request.args.get('max_rate', type=float)
        available_only = request.args.get('available_only', 'true').lower() == 'true'
        
        query = Runner.query.join(User).filter(User.is_active == True)
        
        if city:
            query = query.filter(Runner.city.ilike(f'%{city}%'))
        
        if service_id:
            query = query.filter(Runner.services.any(Service.id == service_id))
        
        if min_rating:
            query = query.filter(Runner.rating >= min_rating)
        
        if max_rate:
            query = query.filter(Runner.hourly_rate <= max_rate)
        
        if available_only:
            query = query.filter(Runner.is_available == True)
        
        # Order by rating and total reviews
        query = query.order_by(Runner.rating.desc(), Runner.total_reviews.desc())
        
        runners = query.paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'runners': [runner.to_dict() for runner in runners.items],
            'total': runners.total,
            'pages': runners.pages,
            'current_page': page,
            'per_page': per_page
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@user_bp.route('/runners/<int:runner_id>', methods=['GET'])
def get_runner(runner_id):
    try:
        runner = Runner.query.get_or_404(runner_id)
        return jsonify(runner.to_dict()), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@user_bp.route('/runners/profile', methods=['GET'])
@jwt_required()
def get_runner_profile():
    try:
        current_user_id = get_jwt_identity()
        user_id = int(current_user_id)
        runner = Runner.query.filter_by(user_id=user_id).first()
        
        if not runner:
            return jsonify({'error': 'Runner profile not found'}), 404
        
        return jsonify(runner.to_dict()), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@user_bp.route('/runners/profile', methods=['POST'])
@jwt_required()
def create_runner_profile():
    try:
        current_user_id = get_jwt_identity()
        user_id = int(current_user_id)
        
        # Check if runner profile already exists
        existing_runner = Runner.query.filter_by(user_id=user_id).first()
        if existing_runner:
            return jsonify({'error': 'Runner profile already exists'}), 400
        
        data = request.json
        
        # Validate required fields
        required_fields = ['hourly_rate', 'city', 'country']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        runner = Runner(
            user_id=user_id,
            bio=data.get('bio', ''),
            hourly_rate=data['hourly_rate'],
            city=data['city'],
            state=data.get('state'),
            country=data['country'],
            latitude=data.get('latitude'),
            longitude=data.get('longitude')
        )
        
        db.session.add(runner)
        
        # Add services if provided
        if 'service_ids' in data:
            services = Service.query.filter(Service.id.in_(data['service_ids'])).all()
            runner.services.extend(services)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Runner profile created successfully',
            'runner': runner.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@user_bp.route('/runners/profile', methods=['PUT'])
@jwt_required()
def update_runner_profile():
    try:
        current_user_id = get_jwt_identity()
        runner = Runner.query.filter_by(user_id=current_user_id).first()
        
        if not runner:
            return jsonify({'error': 'Runner profile not found'}), 404
        
        data = request.json
        
        # Update allowed fields
        if 'bio' in data:
            runner.bio = data['bio']
        if 'hourly_rate' in data:
            runner.hourly_rate = data['hourly_rate']
        if 'city' in data:
            runner.city = data['city']
        if 'state' in data:
            runner.state = data['state']
        if 'country' in data:
            runner.country = data['country']
        if 'latitude' in data:
            runner.latitude = data['latitude']
        if 'longitude' in data:
            runner.longitude = data['longitude']
        if 'is_available' in data:
            runner.is_available = data['is_available']
        
        # Update services if provided
        if 'service_ids' in data:
            runner.services.clear()
            services = Service.query.filter(Service.id.in_(data['service_ids'])).all()
            runner.services.extend(services)
        
        runner.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Runner profile updated successfully',
            'runner': runner.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Services Routes
@user_bp.route('/services', methods=['GET'])
def get_services():
    try:
        category = request.args.get('category')
        
        query = Service.query.filter_by(is_active=True)
        
        if category:
            query = query.filter_by(category=category)
        
        services = query.order_by(Service.name).all()
        
        return jsonify([service.to_dict() for service in services]), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@user_bp.route('/services/categories', methods=['GET'])
def get_service_categories():
    try:
        categories = db.session.query(Service.category).filter_by(is_active=True).distinct().all()
        return jsonify([category[0] for category in categories]), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
