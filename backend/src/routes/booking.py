from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models.user import User, Runner, Service, Booking, Review, db
from datetime import datetime

booking_bp = Blueprint('booking', __name__)

# Booking Routes
@booking_bp.route('/bookings', methods=['POST'])
@jwt_required()
def create_booking():
    try:
        current_user_id = get_jwt_identity()
        data = request.json
        
        # Validate required fields
        required_fields = ['runner_id', 'service_id', 'title', 'scheduled_date', 'estimated_hours']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Validate runner exists and is available
        runner = Runner.query.get(data['runner_id'])
        if not runner:
            return jsonify({'error': 'Runner not found'}), 404
        
        if not runner.is_available:
            return jsonify({'error': 'Runner is not available'}), 400
        
        # Validate service exists
        service = Service.query.get(data['service_id'])
        if not service:
            return jsonify({'error': 'Service not found'}), 404
        
        # Parse scheduled date
        try:
            scheduled_date = datetime.fromisoformat(data['scheduled_date'].replace('Z', '+00:00'))
        except ValueError:
            return jsonify({'error': 'Invalid date format. Use ISO format.'}), 400
        
        # Calculate total amount
        estimated_hours = float(data['estimated_hours'])
        total_amount = estimated_hours * runner.hourly_rate
        
        # Create booking
        booking = Booking(
            user_id=current_user_id,
            runner_id=data['runner_id'],
            service_id=data['service_id'],
            title=data['title'],
            description=data.get('description', ''),
            location=data.get('location'),
            latitude=data.get('latitude'),
            longitude=data.get('longitude'),
            scheduled_date=scheduled_date,
            estimated_hours=estimated_hours,
            hourly_rate=runner.hourly_rate,
            total_amount=total_amount,
            notes=data.get('notes', '')
        )
        
        db.session.add(booking)
        db.session.commit()
        
        return jsonify({
            'message': 'Booking created successfully',
            'booking': booking.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@booking_bp.route('/bookings', methods=['GET'])
@jwt_required()
def get_bookings():
    try:
        current_user_id = get_jwt_identity()
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        status = request.args.get('status')
        as_runner = request.args.get('as_runner', 'false').lower() == 'true'
        
        if as_runner:
            # Get bookings where current user is the runner
            runner = Runner.query.filter_by(user_id=current_user_id).first()
            if not runner:
                return jsonify({'error': 'Runner profile not found'}), 404
            
            query = Booking.query.filter_by(runner_id=runner.id)
        else:
            # Get bookings where current user is the client
            query = Booking.query.filter_by(user_id=current_user_id)
        
        if status:
            query = query.filter_by(status=status)
        
        query = query.order_by(Booking.created_at.desc())
        
        bookings = query.paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'bookings': [booking.to_dict() for booking in bookings.items],
            'total': bookings.total,
            'pages': bookings.pages,
            'current_page': page,
            'per_page': per_page
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@booking_bp.route('/bookings/<int:booking_id>', methods=['GET'])
@jwt_required()
def get_booking(booking_id):
    try:
        current_user_id = get_jwt_identity()
        booking = Booking.query.get_or_404(booking_id)
        
        # Check if user has access to this booking
        runner = Runner.query.filter_by(user_id=current_user_id).first()
        if booking.user_id != current_user_id and (not runner or booking.runner_id != runner.id):
            return jsonify({'error': 'Access denied'}), 403
        
        return jsonify(booking.to_dict()), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@booking_bp.route('/bookings/<int:booking_id>/status', methods=['PUT'])
@jwt_required()
def update_booking_status():
    try:
        current_user_id = get_jwt_identity()
        booking_id = request.view_args['booking_id']
        booking = Booking.query.get_or_404(booking_id)
        data = request.json
        
        if not data.get('status'):
            return jsonify({'error': 'Status is required'}), 400
        
        new_status = data['status']
        valid_statuses = ['pending', 'accepted', 'declined', 'in_progress', 'completed', 'cancelled']
        
        if new_status not in valid_statuses:
            return jsonify({'error': 'Invalid status'}), 400
        
        # Check permissions based on status change
        runner = Runner.query.filter_by(user_id=current_user_id).first()
        
        if new_status in ['accepted', 'declined', 'in_progress']:
            # Only runner can accept, decline, or start booking
            if not runner or booking.runner_id != runner.id:
                return jsonify({'error': 'Only the runner can update this status'}), 403
        elif new_status in ['cancelled']:
            # Both user and runner can cancel
            if booking.user_id != current_user_id and (not runner or booking.runner_id != runner.id):
                return jsonify({'error': 'Access denied'}), 403
        elif new_status == 'completed':
            # Both can mark as completed, but let's allow runner to do it
            if not runner or booking.runner_id != runner.id:
                return jsonify({'error': 'Only the runner can mark booking as completed'}), 403
        
        # Update status
        booking.status = new_status
        booking.updated_at = datetime.utcnow()
        
        if new_status == 'completed':
            booking.completed_at = datetime.utcnow()
            # Update runner stats
            if runner:
                runner.total_bookings += 1
        
        db.session.commit()
        
        return jsonify({
            'message': f'Booking status updated to {new_status}',
            'booking': booking.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@booking_bp.route('/bookings/<int:booking_id>', methods=['PUT'])
@jwt_required()
def update_booking():
    try:
        current_user_id = get_jwt_identity()
        booking = Booking.query.get_or_404(booking_id)
        
        # Only the user who created the booking can update it
        if booking.user_id != current_user_id:
            return jsonify({'error': 'Access denied'}), 403
        
        # Can only update pending bookings
        if booking.status != 'pending':
            return jsonify({'error': 'Can only update pending bookings'}), 400
        
        data = request.json
        
        # Update allowed fields
        if 'title' in data:
            booking.title = data['title']
        if 'description' in data:
            booking.description = data['description']
        if 'location' in data:
            booking.location = data['location']
        if 'latitude' in data:
            booking.latitude = data['latitude']
        if 'longitude' in data:
            booking.longitude = data['longitude']
        if 'notes' in data:
            booking.notes = data['notes']
        
        # Update scheduled date if provided
        if 'scheduled_date' in data:
            try:
                booking.scheduled_date = datetime.fromisoformat(data['scheduled_date'].replace('Z', '+00:00'))
            except ValueError:
                return jsonify({'error': 'Invalid date format. Use ISO format.'}), 400
        
        # Update estimated hours and recalculate total
        if 'estimated_hours' in data:
            booking.estimated_hours = float(data['estimated_hours'])
            booking.total_amount = booking.estimated_hours * booking.hourly_rate
        
        booking.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Booking updated successfully',
            'booking': booking.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@booking_bp.route('/bookings/<int:booking_id>', methods=['DELETE'])
@jwt_required()
def delete_booking():
    try:
        current_user_id = get_jwt_identity()
        booking = Booking.query.get_or_404(booking_id)
        
        # Only the user who created the booking can delete it
        if booking.user_id != current_user_id:
            return jsonify({'error': 'Access denied'}), 403
        
        # Can only delete pending bookings
        if booking.status != 'pending':
            return jsonify({'error': 'Can only delete pending bookings'}), 400
        
        db.session.delete(booking)
        db.session.commit()
        
        return jsonify({'message': 'Booking deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

