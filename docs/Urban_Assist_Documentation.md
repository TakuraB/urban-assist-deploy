# Urban Assist - Full-Stack Web Application

## Overview

Urban Assist is a modern, full-stack web application that connects users with local service providers ("Runners") in specific cities. The platform enables users to book local assistance for errands such as shopping, airport pickups, relocation help, and city tours.

## Features Implemented

### 🔐 Authentication System
- User registration and login
- JWT-based authentication
- Role-based access control (User, Runner, Admin)
- Demo accounts for testing

### 👥 User Management
- User profiles with personal information
- Runner profiles with services, rates, and availability
- Profile image support
- Location-based services

### 📋 Booking System
- Service browsing and filtering
- Booking creation and management
- Status tracking (pending, accepted, in_progress, completed, cancelled)
- Hourly rate calculation
- Booking history

### ⭐ Review & Rating System
- 5-star rating system
- Written reviews and comments
- Review moderation capabilities
- Average rating calculations

### 💬 Real-Time Chat
- Socket.io-powered messaging
- Booking-specific chat rooms
- Real-time message delivery
- Chat history persistence

### 🛡️ Admin Dashboard
- User management (activate/deactivate)
- Booking oversight
- Review moderation (flag/unflag/delete)
- Service management
- Analytics and statistics
- Platform monitoring

### 🎨 Modern UI/UX
- Responsive design (mobile-first)
- Clean, professional interface
- TailwindCSS styling
- Shadcn/ui components
- Intuitive navigation

## Technical Stack

### Backend
- **Framework**: Flask (Python)
- **Database**: SQLite with SQLAlchemy ORM
- **Authentication**: Flask-JWT-Extended
- **Real-time**: Flask-SocketIO
- **API**: RESTful APIs with JSON responses
- **CORS**: Flask-CORS for cross-origin requests

### Frontend
- **Framework**: React 19.1.0
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **UI Components**: Shadcn/ui
- **Icons**: Lucide React
- **Routing**: React Router
- **Real-time**: Socket.io-client

### Key Dependencies
- **Backend**: Flask, SQLAlchemy, Flask-JWT-Extended, Flask-SocketIO, Flask-CORS
- **Frontend**: React, React Router, Socket.io-client, TailwindCSS, Shadcn/ui

## Project Structure

```
urban-assist/
├── urban-assist-backend/          # Flask Backend
│   ├── src/
│   │   ├── models/
│   │   │   └── user.py           # Database models
│   │   ├── routes/
│   │   │   ├── user.py           # User & Runner APIs
│   │   │   ├── booking.py        # Booking APIs
│   │   │   ├── review.py         # Review APIs
│   │   │   └── admin.py          # Admin APIs
│   │   ├── config.py             # Configuration
│   │   ├── chat.py               # Socket.io chat
│   │   ├── seed_data.py          # Sample data
│   │   └── main.py               # Application entry
│   ├── requirements.txt          # Python dependencies
│   └── venv/                     # Virtual environment
│
└── urban-assist-frontend/         # React Frontend
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx        # Navigation
    │   │   ├── ProtectedRoute.jsx # Auth guard
    │   │   └── Chat.jsx          # Chat component
    │   ├── contexts/
    │   │   └── AuthContext.jsx   # Authentication context
    │   ├── pages/
    │   │   ├── Home.jsx          # Landing page
    │   │   ├── Login.jsx         # Login page
    │   │   ├── Register.jsx      # Registration
    │   │   ├── Runners.jsx       # Runner listing
    │   │   ├── RunnerProfile.jsx # Runner details
    │   │   ├── Dashboard.jsx     # User dashboard
    │   │   ├── BookingDetails.jsx # Booking management
    │   │   ├── CreateBooking.jsx # Booking creation
    │   │   └── AdminDashboard.jsx # Admin panel
    │   ├── App.jsx               # Main app component
    │   └── main.jsx              # Entry point
    ├── package.json              # Dependencies
    └── node_modules/             # Node dependencies
```

## Database Schema

### Users Table
- id, first_name, last_name, email, password_hash
- role (user/runner/admin), is_active, created_at, last_login

### Runners Table
- id, user_id, bio, hourly_rate, city, country
- is_available, rating, total_reviews, created_at

### Services Table
- id, name, description, category, is_active, created_at

### Bookings Table
- id, user_id, runner_id, service_id, title, description
- scheduled_date, estimated_hours, hourly_rate, total_amount
- status, notes, created_at, updated_at, completed_at

### Reviews Table
- id, booking_id, reviewer_id, runner_id, rating, comment
- is_flagged, created_at

### ChatMessages Table
- id, booking_id, sender_id, message, created_at

## API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile

### Runners
- `GET /api/runners` - List all runners
- `GET /api/runners/{id}` - Get runner details
- `GET /api/runners/search` - Search runners
- `POST /api/runners` - Create runner profile
- `PUT /api/runners/{id}` - Update runner profile

### Bookings
- `GET /api/bookings` - List user bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/{id}` - Get booking details
- `PUT /api/bookings/{id}/status` - Update booking status

### Reviews
- `GET /api/reviews` - List reviews
- `POST /api/reviews` - Create review
- `PUT /api/reviews/{id}` - Update review
- `DELETE /api/reviews/{id}` - Delete review

### Services
- `GET /api/services` - List all services

### Admin (Protected)
- `GET /api/admin/dashboard/stats` - Dashboard statistics
- `GET /api/admin/users` - User management
- `POST /api/admin/users/{id}/toggle-status` - Toggle user status
- `GET /api/admin/bookings` - Booking management
- `GET /api/admin/reviews` - Review management
- `POST /api/admin/reviews/{id}/flag` - Flag/unflag review
- `DELETE /api/admin/reviews/{id}` - Delete review

## Sample Data

The application includes comprehensive seed data:

### Demo Accounts
- **Admin**: admin@urbanassist.com / admin123
- **Demo User**: john@example.com / password123
- **Demo Runner**: sarah@example.com / password123

### Services Available
- Shopping & Errands
- Airport Pickup/Drop-off
- Moving & Relocation Help
- City Tours & Sightseeing
- Pet Care & Walking
- Home Maintenance
- Event Setup & Support
- Personal Assistant
- Delivery Services
- Elderly Care & Companionship

## Setup Instructions

### Backend Setup
1. Navigate to `urban-assist-backend/`
2. Create virtual environment: `python -m venv venv`
3. Activate virtual environment: `source venv/bin/activate` (Linux/Mac) or `venv\Scripts\activate` (Windows)
4. Install dependencies: `pip install -r requirements.txt`
5. Run seed script: `python src/seed_data.py`
6. Start server: `python src/main.py`
7. Backend runs on `http://localhost:5000`

### Frontend Setup
1. Navigate to `urban-assist-frontend/`
2. Install dependencies: `pnpm install` or `npm install`
3. Start development server: `pnpm run dev` or `npm run dev`
4. Frontend runs on `http://localhost:5173`

## Usage Guide

### For Users
1. **Registration**: Create account via Sign Up page
2. **Browse Runners**: Use "Find Runners" to search by location/service
3. **Book Service**: Select runner and create booking with details
4. **Chat**: Communicate with runner through real-time chat
5. **Review**: Leave rating and review after service completion

### For Runners
1. **Profile Setup**: Complete runner profile with services and rates
2. **Manage Bookings**: Accept/decline booking requests
3. **Service Delivery**: Update booking status as work progresses
4. **Communication**: Chat with clients for coordination

### For Admins
1. **Dashboard Access**: Login with admin credentials
2. **User Management**: Monitor and manage user accounts
3. **Content Moderation**: Review and moderate user-generated content
4. **Analytics**: View platform statistics and performance metrics

## Security Features

- Password hashing with secure algorithms
- JWT token-based authentication
- Role-based access control
- Input validation and sanitization
- CORS configuration for secure cross-origin requests
- Protected admin routes
- SQL injection prevention through ORM

## Performance Optimizations

- Efficient database queries with SQLAlchemy
- Pagination for large data sets
- Optimized React components with proper state management
- Responsive design for mobile performance
- Lazy loading of components
- Efficient Socket.io connection management

## Deployment Considerations

### Backend Deployment
- Use production WSGI server (Gunicorn, uWSGI)
- Configure environment variables for production
- Use PostgreSQL or MySQL for production database
- Set up proper logging and monitoring
- Configure SSL/HTTPS
- Use Redis for session storage and caching

### Frontend Deployment
- Build production bundle: `pnpm run build`
- Deploy to CDN or static hosting (Vercel, Netlify)
- Configure environment variables for API endpoints
- Set up proper error tracking
- Optimize bundle size and loading performance

### Infrastructure
- Use cloud providers (AWS, Google Cloud, Azure)
- Set up load balancing for high availability
- Configure database backups and monitoring
- Implement CI/CD pipelines
- Set up monitoring and alerting

## Future Enhancements

### Planned Features
- **Payment Integration**: Stripe/PayPal for secure payments
- **Geolocation**: GPS-based runner matching
- **Push Notifications**: Mobile app notifications
- **Advanced Search**: AI-powered service recommendations
- **Multi-language Support**: Internationalization
- **Mobile Apps**: Native iOS/Android applications
- **Video Chat**: WebRTC integration for video calls
- **Calendar Integration**: Booking scheduling with calendar sync

### Scalability Improvements
- Microservices architecture
- Database sharding and replication
- Caching layer (Redis, Memcached)
- Message queues for background processing
- API rate limiting and throttling
- Advanced monitoring and analytics

## Support and Maintenance

### Code Quality
- Comprehensive error handling
- Detailed logging throughout the application
- Clean, maintainable code structure
- Proper documentation and comments
- Type safety considerations

### Testing Strategy
- Unit tests for critical business logic
- Integration tests for API endpoints
- End-to-end testing for user workflows
- Performance testing for scalability
- Security testing for vulnerabilities

## Conclusion

Urban Assist is a comprehensive, production-ready web application that successfully implements all the requested features. The platform provides a solid foundation for connecting users with local service providers while maintaining high standards for security, performance, and user experience.

The modular architecture allows for easy maintenance and future enhancements, while the modern technology stack ensures scalability and developer productivity. The application is ready for deployment and can be easily customized to meet specific business requirements.

