import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from src.models.user import db, User, Runner, Service, Booking, Review, ChatMessage
from datetime import datetime, timedelta
import random

def seed_services():
    """Seed the database with initial services"""
    services = [
        {
            'name': 'Shopping & Errands',
            'description': 'Grocery shopping, pharmacy runs, and general errands',
            'category': 'errands',
            'icon': 'shopping-cart'
        },
        {
            'name': 'Airport Pickup/Drop-off',
            'description': 'Transportation to and from airports',
            'category': 'transportation',
            'icon': 'plane'
        },
        {
            'name': 'Moving & Relocation Help',
            'description': 'Assistance with moving, packing, and relocation',
            'category': 'moving',
            'icon': 'truck'
        },
        {
            'name': 'City Tours & Sightseeing',
            'description': 'Guided tours and local sightseeing experiences',
            'category': 'tourism',
            'icon': 'map'
        },
        {
            'name': 'Pet Care & Walking',
            'description': 'Pet sitting, dog walking, and pet care services',
            'category': 'pets',
            'icon': 'heart'
        },
        {
            'name': 'Home Maintenance',
            'description': 'Basic home repairs, cleaning, and maintenance',
            'category': 'home',
            'icon': 'home'
        },
        {
            'name': 'Event Setup & Support',
            'description': 'Help with event planning, setup, and coordination',
            'category': 'events',
            'icon': 'calendar'
        },
        {
            'name': 'Personal Assistant',
            'description': 'Administrative tasks, scheduling, and personal assistance',
            'category': 'personal',
            'icon': 'user'
        },
        {
            'name': 'Delivery Services',
            'description': 'Package delivery, document courier, and pickup services',
            'category': 'delivery',
            'icon': 'package'
        },
        {
            'name': 'Elderly Care & Companionship',
            'description': 'Companionship and assistance for elderly individuals',
            'category': 'care',
            'icon': 'users'
        }
    ]
    
    for service_data in services:
        existing_service = Service.query.filter_by(name=service_data['name']).first()
        if not existing_service:
            service = Service(**service_data)
            db.session.add(service)
    
    db.session.commit()
    print("Services seeded successfully!")

def seed_sample_users():
    """Seed the database with sample users and runners"""
    # Create admin user
    admin = User.query.filter_by(email='admin@urbanassist.com').first()
    if not admin:
        admin = User(
            username='admin',
            email='admin@urbanassist.com',
            first_name='Admin',
            last_name='User',
            phone='+1234567890',
            is_admin=True,
            is_moderator=True
        )
        admin.set_password('admin123')
        db.session.add(admin)
    
    # Create sample users
    sample_users = [
        {
            'username': 'john_doe',
            'email': 'john@example.com',
            'first_name': 'John',
            'last_name': 'Doe',
            'phone': '+1234567891'
        },
        {
            'username': 'jane_smith',
            'email': 'jane@example.com',
            'first_name': 'Jane',
            'last_name': 'Smith',
            'phone': '+1234567892'
        },
        {
            'username': 'mike_runner',
            'email': 'mike@example.com',
            'first_name': 'Mike',
            'last_name': 'Johnson',
            'phone': '+1234567893'
        },
        {
            'username': 'sarah_helper',
            'email': 'sarah@example.com',
            'first_name': 'Sarah',
            'last_name': 'Wilson',
            'phone': '+1234567894'
        }
    ]
    
    created_users = []
    for user_data in sample_users:
        existing_user = User.query.filter_by(email=user_data['email']).first()
        if not existing_user:
            user = User(**user_data)
            user.set_password('password123')
            db.session.add(user)
            created_users.append(user)
    
    db.session.commit()
    
    # Create sample runners
    cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix']
    services = Service.query.all()
    
    for i, user in enumerate(created_users[2:]):  # Last 2 users become runners
        runner = Runner.query.filter_by(user_id=user.id).first()
        if not runner:
            runner = Runner(
                user_id=user.id,
                bio=f"Experienced helper in {cities[i % len(cities)]}. I love helping people with their daily tasks and making their lives easier!",
                hourly_rate=round(random.uniform(15.0, 50.0), 2),
                city=cities[i % len(cities)],
                state='NY' if cities[i % len(cities)] == 'New York' else 'CA',
                country='USA',
                latitude=round(random.uniform(25.0, 45.0), 6),
                longitude=round(random.uniform(-125.0, -70.0), 6),
                is_available=True,
                is_verified=True,
                rating=round(random.uniform(4.0, 5.0), 1),
                total_reviews=random.randint(5, 50),
                total_bookings=random.randint(10, 100)
            )
            db.session.add(runner)
            
            # Assign random services to runner
            runner_services = random.sample(services, random.randint(2, 5))
            runner.services.extend(runner_services)
    
    db.session.commit()
    print("Sample users and runners seeded successfully!")

def seed_all():
    """Seed all initial data"""
    print("Starting database seeding...")
    seed_services()
    seed_sample_users()
    print("Database seeding completed!")

if __name__ == '__main__':
    from src.main import app
    with app.app_context():
        seed_all()

