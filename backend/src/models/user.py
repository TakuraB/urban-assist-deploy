from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

# Association table for many-to-many relationship between runners and services
runner_services = db.Table('runner_services',
    db.Column('runner_id', db.Integer, db.ForeignKey('runner.id'), primary_key=True),
    db.Column('service_id', db.Integer, db.ForeignKey('service.id'), primary_key=True)
)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    phone = db.Column(db.String(20))
    profile_image = db.Column(db.String(255))
    is_active = db.Column(db.Boolean, default=True)
    is_admin = db.Column(db.Boolean, default=False)
    is_moderator = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    bookings_as_user = db.relationship('Booking', foreign_keys='Booking.user_id', backref='user', lazy='dynamic')
    reviews_given = db.relationship('Review', foreign_keys='Review.reviewer_id', backref='reviewer', lazy='dynamic')
    reviews_received = db.relationship('Review', foreign_keys='Review.reviewee_id', backref='reviewee', lazy='dynamic')
    sent_messages = db.relationship('ChatMessage', foreign_keys='ChatMessage.sender_id', backref='sender', lazy='dynamic')
    received_messages = db.relationship('ChatMessage', foreign_keys='ChatMessage.receiver_id', backref='receiver', lazy='dynamic')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f'<User {self.username}>'

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'phone': self.phone,
            'profile_image': self.profile_image,
            'is_active': self.is_active,
            'is_admin': self.is_admin,
            'is_moderator': self.is_moderator,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class Runner(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    bio = db.Column(db.Text)
    hourly_rate = db.Column(db.Float, nullable=False)
    city = db.Column(db.String(100), nullable=False)
    state = db.Column(db.String(50))
    country = db.Column(db.String(50), nullable=False)
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    is_available = db.Column(db.Boolean, default=True)
    is_verified = db.Column(db.Boolean, default=False)
    rating = db.Column(db.Float, default=0.0)
    total_reviews = db.Column(db.Integer, default=0)
    total_bookings = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', backref='runner_profile')
    bookings = db.relationship('Booking', backref='runner', lazy='dynamic')
    services = db.relationship('Service', secondary=runner_services, backref='runners')

    def __repr__(self):
        return f'<Runner {self.user.username}>'

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'user': self.user.to_dict() if self.user else None,
            'bio': self.bio,
            'hourly_rate': self.hourly_rate,
            'city': self.city,
            'state': self.state,
            'country': self.country,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'is_available': self.is_available,
            'is_verified': self.is_verified,
            'rating': self.rating,
            'total_reviews': self.total_reviews,
            'total_bookings': self.total_bookings,
            'services': [service.to_dict() for service in self.services],
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class Service(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    category = db.Column(db.String(50), nullable=False)
    icon = db.Column(db.String(100))
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<Service {self.name}>'

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'category': self.category,
            'icon': self.icon,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Booking(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    runner_id = db.Column(db.Integer, db.ForeignKey('runner.id'), nullable=False)
    service_id = db.Column(db.Integer, db.ForeignKey('service.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    location = db.Column(db.String(255))
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    scheduled_date = db.Column(db.DateTime, nullable=False)
    estimated_hours = db.Column(db.Float, nullable=False)
    hourly_rate = db.Column(db.Float, nullable=False)
    total_amount = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default='pending')  # pending, accepted, declined, in_progress, completed, cancelled
    payment_status = db.Column(db.String(20), default='pending')  # pending, paid, refunded
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    completed_at = db.Column(db.DateTime)
    
    # Relationships
    service = db.relationship('Service', backref='bookings')
    chat_messages = db.relationship('ChatMessage', backref='booking', lazy='dynamic')

    def __repr__(self):
        return f'<Booking {self.title}>'

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'runner_id': self.runner_id,
            'service_id': self.service_id,
            'user': self.user.to_dict() if self.user else None,
            'runner': self.runner.to_dict() if self.runner else None,
            'service': self.service.to_dict() if self.service else None,
            'title': self.title,
            'description': self.description,
            'location': self.location,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'scheduled_date': self.scheduled_date.isoformat() if self.scheduled_date else None,
            'estimated_hours': self.estimated_hours,
            'hourly_rate': self.hourly_rate,
            'total_amount': self.total_amount,
            'status': self.status,
            'payment_status': self.payment_status,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None
        }

class Review(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    booking_id = db.Column(db.Integer, db.ForeignKey('booking.id'), nullable=False)
    reviewer_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    reviewee_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    rating = db.Column(db.Integer, nullable=False)  # 1-5 stars
    comment = db.Column(db.Text)
    is_flagged = db.Column(db.Boolean, default=False)
    is_approved = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    booking = db.relationship('Booking', backref='reviews')

    def __repr__(self):
        return f'<Review {self.rating} stars>'

    def to_dict(self):
        return {
            'id': self.id,
            'booking_id': self.booking_id,
            'reviewer_id': self.reviewer_id,
            'reviewee_id': self.reviewee_id,
            'reviewer': self.reviewer.to_dict() if self.reviewer else None,
            'reviewee': self.reviewee.to_dict() if self.reviewee else None,
            'rating': self.rating,
            'comment': self.comment,
            'is_flagged': self.is_flagged,
            'is_approved': self.is_approved,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class ChatMessage(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    booking_id = db.Column(db.Integer, db.ForeignKey('booking.id'), nullable=False)
    sender_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    receiver_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    message = db.Column(db.Text, nullable=False)
    message_type = db.Column(db.String(20), default='text')  # text, image, file
    file_url = db.Column(db.String(255))
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<ChatMessage {self.id}>'

    def to_dict(self):
        return {
            'id': self.id,
            'booking_id': self.booking_id,
            'sender_id': self.sender_id,
            'receiver_id': self.receiver_id,
            'sender': self.sender.to_dict() if self.sender else None,
            'receiver': self.receiver.to_dict() if self.receiver else None,
            'message': self.message,
            'message_type': self.message_type,
            'file_url': self.file_url,
            'is_read': self.is_read,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
