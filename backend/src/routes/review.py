from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models.user import User, Runner, Booking, Review, db
from datetime import datetime
from sqlalchemy import func

review_bp = Blueprint('review', __name__)

# Review Routes
@review_bp.route('/reviews', methods=['POST'])
@jwt_required()
def create_review():
    try:
        current_user_id = get_jwt_identity()
        data = request.json
        
        # Validate required fields
        required_fields = ['booking_id', 'reviewee_id', 'rating']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Validate rating
        rating = int(data['rating'])
        if rating < 1 or rating > 5:
            return jsonify({'error': 'Rating must be between 1 and 5'}), 400
        
        # Validate booking exists and is completed
        booking = Booking.query.get(data['booking_id'])
        if not booking:
            return jsonify({'error': 'Booking not found'}), 404
        
        if booking.status != 'completed':
            return jsonify({'error': 'Can only review completed bookings'}), 400
        
        # Check if user is part of this booking
        runner = Runner.query.filter_by(user_id=current_user_id).first()
        if booking.user_id != current_user_id and (not runner or booking.runner_id != runner.id):
            return jsonify({'error': 'Access denied'}), 403
        
        # Check if review already exists for this booking and reviewer
        existing_review = Review.query.filter_by(
            booking_id=data['booking_id'],
            reviewer_id=current_user_id
        ).first()
        
        if existing_review:
            return jsonify({'error': 'Review already exists for this booking'}), 400
        
        # Validate reviewee
        reviewee_id = int(data['reviewee_id'])
        reviewee = User.query.get(reviewee_id)
        if not reviewee:
            return jsonify({'error': 'Reviewee not found'}), 404
        
        # Ensure reviewee is part of the booking
        if reviewee_id != booking.user_id and (not runner or reviewee_id != runner.user_id):
            return jsonify({'error': 'Invalid reviewee for this booking'}), 400
        
        # Create review
        review = Review(
            booking_id=data['booking_id'],
            reviewer_id=current_user_id,
            reviewee_id=reviewee_id,
            rating=rating,
            comment=data.get('comment', '')
        )
        
        db.session.add(review)
        
        # Update runner rating if reviewee is a runner
        reviewee_runner = Runner.query.filter_by(user_id=reviewee_id).first()
        if reviewee_runner:
            # Calculate new average rating
            reviews = Review.query.filter_by(reviewee_id=reviewee_id, is_approved=True).all()
            if reviews:
                total_rating = sum([r.rating for r in reviews]) + rating
                total_reviews = len(reviews) + 1
                reviewee_runner.rating = round(total_rating / total_reviews, 1)
                reviewee_runner.total_reviews = total_reviews
        
        db.session.commit()
        
        return jsonify({
            'message': 'Review created successfully',
            'review': review.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@review_bp.route('/reviews', methods=['GET'])
def get_reviews():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        reviewee_id = request.args.get('reviewee_id', type=int)
        reviewer_id = request.args.get('reviewer_id', type=int)
        booking_id = request.args.get('booking_id', type=int)
        min_rating = request.args.get('min_rating', type=int)
        
        query = Review.query.filter_by(is_approved=True)
        
        if reviewee_id:
            query = query.filter_by(reviewee_id=reviewee_id)
        
        if reviewer_id:
            query = query.filter_by(reviewer_id=reviewer_id)
        
        if booking_id:
            query = query.filter_by(booking_id=booking_id)
        
        if min_rating:
            query = query.filter(Review.rating >= min_rating)
        
        query = query.order_by(Review.created_at.desc())
        
        reviews = query.paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'reviews': [review.to_dict() for review in reviews.items],
            'total': reviews.total,
            'pages': reviews.pages,
            'current_page': page,
            'per_page': per_page
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@review_bp.route('/reviews/<int:review_id>', methods=['GET'])
def get_review(review_id):
    try:
        review = Review.query.get_or_404(review_id)
        
        if not review.is_approved:
            return jsonify({'error': 'Review not found'}), 404
        
        return jsonify(review.to_dict()), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@review_bp.route('/reviews/<int:review_id>', methods=['PUT'])
@jwt_required()
def update_review():
    try:
        current_user_id = get_jwt_identity()
        review = Review.query.get_or_404(review_id)
        
        # Only the reviewer can update their review
        if review.reviewer_id != current_user_id:
            return jsonify({'error': 'Access denied'}), 403
        
        data = request.json
        
        # Update allowed fields
        if 'rating' in data:
            rating = int(data['rating'])
            if rating < 1 or rating > 5:
                return jsonify({'error': 'Rating must be between 1 and 5'}), 400
            review.rating = rating
        
        if 'comment' in data:
            review.comment = data['comment']
        
        review.updated_at = datetime.utcnow()
        
        # Recalculate runner rating if rating changed
        if 'rating' in data:
            reviewee_runner = Runner.query.filter_by(user_id=review.reviewee_id).first()
            if reviewee_runner:
                # Recalculate average rating
                reviews = Review.query.filter_by(reviewee_id=review.reviewee_id, is_approved=True).all()
                if reviews:
                    total_rating = sum([r.rating for r in reviews])
                    total_reviews = len(reviews)
                    reviewee_runner.rating = round(total_rating / total_reviews, 1)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Review updated successfully',
            'review': review.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@review_bp.route('/reviews/<int:review_id>', methods=['DELETE'])
@jwt_required()
def delete_review():
    try:
        current_user_id = get_jwt_identity()
        review = Review.query.get_or_404(review_id)
        
        # Only the reviewer can delete their review
        if review.reviewer_id != current_user_id:
            return jsonify({'error': 'Access denied'}), 403
        
        # Update runner stats before deleting
        reviewee_runner = Runner.query.filter_by(user_id=review.reviewee_id).first()
        if reviewee_runner and reviewee_runner.total_reviews > 0:
            # Recalculate rating without this review
            other_reviews = Review.query.filter(
                Review.reviewee_id == review.reviewee_id,
                Review.id != review.id,
                Review.is_approved == True
            ).all()
            
            if other_reviews:
                total_rating = sum([r.rating for r in other_reviews])
                total_reviews = len(other_reviews)
                reviewee_runner.rating = round(total_rating / total_reviews, 1)
                reviewee_runner.total_reviews = total_reviews
            else:
                reviewee_runner.rating = 0.0
                reviewee_runner.total_reviews = 0
        
        db.session.delete(review)
        db.session.commit()
        
        return jsonify({'message': 'Review deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@review_bp.route('/reviews/<int:review_id>/flag', methods=['POST'])
@jwt_required()
def flag_review():
    try:
        review = Review.query.get_or_404(review_id)
        
        review.is_flagged = True
        review.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({'message': 'Review flagged for moderation'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Statistics Routes
@review_bp.route('/reviews/stats/<int:user_id>', methods=['GET'])
def get_review_stats(user_id):
    try:
        user = User.query.get_or_404(user_id)
        
        # Get review statistics
        reviews = Review.query.filter_by(reviewee_id=user_id, is_approved=True).all()
        
        if not reviews:
            return jsonify({
                'total_reviews': 0,
                'average_rating': 0.0,
                'rating_distribution': {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
            }), 200
        
        total_reviews = len(reviews)
        average_rating = round(sum([r.rating for r in reviews]) / total_reviews, 1)
        
        # Calculate rating distribution
        rating_distribution = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
        for review in reviews:
            rating_distribution[review.rating] += 1
        
        return jsonify({
            'total_reviews': total_reviews,
            'average_rating': average_rating,
            'rating_distribution': rating_distribution
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

