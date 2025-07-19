from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models.user import db, User, Runner, Booking, Review, Service
from datetime import datetime, timedelta
from sqlalchemy import func, desc

admin_bp = Blueprint('admin', __name__)

def admin_required(f):
    """Decorator to check if user is admin"""
    def decorated_function(*args, **kwargs):
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        if not user or user.role != 'admin':
            return {'error': 'Admin access required'}, 403
        return f(*args, **kwargs)
    decorated_function.__name__ = f.__name__
    return decorated_function

@admin_bp.route('/dashboard/stats', methods=['GET'])
@jwt_required()
@admin_required
def get_dashboard_stats():
    """Get dashboard statistics"""
    try:
        # User statistics
        total_users = User.query.filter_by(role='user').count()
        total_runners = User.query.filter_by(role='runner').count()
        new_users_this_month = User.query.filter(
            User.created_at >= datetime.utcnow() - timedelta(days=30)
        ).count()
        
        # Booking statistics
        total_bookings = Booking.query.count()
        completed_bookings = Booking.query.filter_by(status='completed').count()
        pending_bookings = Booking.query.filter_by(status='pending').count()
        
        # Revenue statistics
        total_revenue = db.session.query(func.sum(Booking.total_amount)).filter_by(status='completed').scalar() or 0
        monthly_revenue = db.session.query(func.sum(Booking.total_amount)).filter(
            Booking.status == 'completed',
            Booking.completed_at >= datetime.utcnow() - timedelta(days=30)
        ).scalar() or 0
        
        # Review statistics
        total_reviews = Review.query.count()
        average_rating = db.session.query(func.avg(Review.rating)).scalar() or 0
        
        return jsonify({
            'users': {
                'total_users': total_users,
                'total_runners': total_runners,
                'new_users_this_month': new_users_this_month
            },
            'bookings': {
                'total_bookings': total_bookings,
                'completed_bookings': completed_bookings,
                'pending_bookings': pending_bookings,
                'completion_rate': (completed_bookings / total_bookings * 100) if total_bookings > 0 else 0
            },
            'revenue': {
                'total_revenue': float(total_revenue),
                'monthly_revenue': float(monthly_revenue)
            },
            'reviews': {
                'total_reviews': total_reviews,
                'average_rating': float(average_rating)
            }
        })
    except Exception as e:
        return {'error': str(e)}, 500

@admin_bp.route('/users', methods=['GET'])
@jwt_required()
@admin_required
def get_all_users():
    """Get all users with pagination"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        role = request.args.get('role')
        search = request.args.get('search')
        
        query = User.query
        
        if role:
            query = query.filter_by(role=role)
        
        if search:
            query = query.filter(
                (User.first_name.contains(search)) |
                (User.last_name.contains(search)) |
                (User.email.contains(search))
            )
        
        users = query.order_by(desc(User.created_at)).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'users': [{
                'id': user.id,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'email': user.email,
                'role': user.role,
                'is_active': user.is_active,
                'created_at': user.created_at.isoformat(),
                'last_login': user.last_login.isoformat() if user.last_login else None
            } for user in users.items],
            'pagination': {
                'page': users.page,
                'pages': users.pages,
                'per_page': users.per_page,
                'total': users.total
            }
        })
    except Exception as e:
        return {'error': str(e)}, 500

@admin_bp.route('/users/<int:user_id>/toggle-status', methods=['POST'])
@jwt_required()
@admin_required
def toggle_user_status(user_id):
    """Toggle user active status"""
    try:
        user = User.query.get_or_404(user_id)
        user.is_active = not user.is_active
        db.session.commit()
        
        return jsonify({
            'message': f'User {"activated" if user.is_active else "deactivated"} successfully',
            'is_active': user.is_active
        })
    except Exception as e:
        return {'error': str(e)}, 500

@admin_bp.route('/bookings', methods=['GET'])
@jwt_required()
@admin_required
def get_all_bookings():
    """Get all bookings with pagination"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        status = request.args.get('status')
        
        query = Booking.query
        
        if status:
            query = query.filter_by(status=status)
        
        bookings = query.order_by(desc(Booking.created_at)).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'bookings': [{
                'id': booking.id,
                'title': booking.title,
                'status': booking.status,
                'total_amount': float(booking.total_amount),
                'created_at': booking.created_at.isoformat(),
                'user': {
                    'id': booking.user.id,
                    'name': f"{booking.user.first_name} {booking.user.last_name}",
                    'email': booking.user.email
                },
                'runner': {
                    'id': booking.runner.user.id,
                    'name': f"{booking.runner.user.first_name} {booking.runner.user.last_name}",
                    'email': booking.runner.user.email
                } if booking.runner else None,
                'service': {
                    'id': booking.service.id,
                    'name': booking.service.name
                } if booking.service else None
            } for booking in bookings.items],
            'pagination': {
                'page': bookings.page,
                'pages': bookings.pages,
                'per_page': bookings.per_page,
                'total': bookings.total
            }
        })
    except Exception as e:
        return {'error': str(e)}, 500

@admin_bp.route('/reviews', methods=['GET'])
@jwt_required()
@admin_required
def get_all_reviews():
    """Get all reviews with pagination"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        flagged_only = request.args.get('flagged_only', False, type=bool)
        
        query = Review.query
        
        if flagged_only:
            query = query.filter_by(is_flagged=True)
        
        reviews = query.order_by(desc(Review.created_at)).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'reviews': [{
                'id': review.id,
                'rating': review.rating,
                'comment': review.comment,
                'is_flagged': review.is_flagged,
                'created_at': review.created_at.isoformat(),
                'reviewer': {
                    'id': review.reviewer.id,
                    'name': f"{review.reviewer.first_name} {review.reviewer.last_name}",
                    'email': review.reviewer.email
                },
                'runner': {
                    'id': review.runner.user.id,
                    'name': f"{review.runner.user.first_name} {review.runner.user.last_name}",
                    'email': review.runner.user.email
                },
                'booking': {
                    'id': review.booking.id,
                    'title': review.booking.title
                }
            } for review in reviews.items],
            'pagination': {
                'page': reviews.page,
                'pages': reviews.pages,
                'per_page': reviews.per_page,
                'total': reviews.total
            }
        })
    except Exception as e:
        return {'error': str(e)}, 500

@admin_bp.route('/reviews/<int:review_id>/flag', methods=['POST'])
@jwt_required()
@admin_required
def flag_review(review_id):
    """Flag or unflag a review"""
    try:
        review = Review.query.get_or_404(review_id)
        review.is_flagged = not review.is_flagged
        db.session.commit()
        
        return jsonify({
            'message': f'Review {"flagged" if review.is_flagged else "unflagged"} successfully',
            'is_flagged': review.is_flagged
        })
    except Exception as e:
        return {'error': str(e)}, 500

@admin_bp.route('/reviews/<int:review_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_review(review_id):
    """Delete a review"""
    try:
        review = Review.query.get_or_404(review_id)
        db.session.delete(review)
        db.session.commit()
        
        return jsonify({'message': 'Review deleted successfully'})
    except Exception as e:
        return {'error': str(e)}, 500

@admin_bp.route('/services', methods=['GET'])
@jwt_required()
@admin_required
def get_all_services():
    """Get all services"""
    try:
        services = Service.query.all()
        
        return jsonify({
            'services': [{
                'id': service.id,
                'name': service.name,
                'description': service.description,
                'category': service.category,
                'is_active': service.is_active,
                'created_at': service.created_at.isoformat()
            } for service in services]
        })
    except Exception as e:
        return {'error': str(e)}, 500

@admin_bp.route('/services', methods=['POST'])
@jwt_required()
@admin_required
def create_service():
    """Create a new service"""
    try:
        data = request.get_json()
        
        service = Service(
            name=data['name'],
            description=data['description'],
            category=data['category'],
            is_active=data.get('is_active', True)
        )
        
        db.session.add(service)
        db.session.commit()
        
        return jsonify({
            'message': 'Service created successfully',
            'service': {
                'id': service.id,
                'name': service.name,
                'description': service.description,
                'category': service.category,
                'is_active': service.is_active
            }
        }), 201
    except Exception as e:
        return {'error': str(e)}, 500

@admin_bp.route('/services/<int:service_id>/toggle-status', methods=['POST'])
@jwt_required()
@admin_required
def toggle_service_status(service_id):
    """Toggle service active status"""
    try:
        service = Service.query.get_or_404(service_id)
        service.is_active = not service.is_active
        db.session.commit()
        
        return jsonify({
            'message': f'Service {"activated" if service.is_active else "deactivated"} successfully',
            'is_active': service.is_active
        })
    except Exception as e:
        return {'error': str(e)}, 500

