# Urban Assist

A full-stack web application that connects users with local service providers ("Runners") for various tasks like errands, transportation, moving, tours, and more.

## 🚀 Features

- **User Management**: Registration, login, and profile management
- **Runner Profiles**: Service providers can create detailed profiles with services offered
- **Service Booking**: Users can book runners for various tasks
- **Real-time Chat**: Built-in messaging system between users and runners
- **Review System**: Rating and review system for quality assurance
- **Admin Dashboard**: Administrative tools for platform management
- **Responsive Design**: Mobile-first design that works on all devices

## 🛠 Tech Stack

### Backend
- **Framework**: Flask (Python)
- **Database**: SQLite with SQLAlchemy ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: Socket.io for chat functionality
- **API**: RESTful API design

### Frontend
- **Framework**: React 18
- **Styling**: TailwindCSS + Shadcn/ui components
- **Build Tool**: Vite
- **Routing**: React Router
- **State Management**: React Context API

## 📁 Project Structure

```
urban-assist/
├── backend/                 # Flask API server
│   ├── src/
│   │   ├── main.py         # Application entry point
│   │   ├── config.py       # Configuration settings
│   │   ├── models/         # Database models
│   │   ├── routes/         # API route handlers
│   │   ├── static/         # Static files
│   │   └── database/       # Database files
│   ├── requirements.txt    # Python dependencies
│   └── test_api.py        # API tests
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   └── lib/           # Utility functions
│   ├── package.json       # Node.js dependencies
│   └── vite.config.js     # Vite configuration
├── docs/                  # Documentation
│   ├── Urban_Assist_Testing_Report.md
│   ├── UI_Debug_Report.md
│   └── testing_findings.md
└── README.md              # This file
```

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the backend server:
```bash
python -m src.main
```

The backend will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install --legacy-peer-deps
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5174`

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh JWT token

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Runners
- `GET /api/runners` - List runners with pagination
- `GET /api/runners/{id}` - Get runner details
- `POST /api/runners/profile` - Create/update runner profile

### Services
- `GET /api/services` - List all services
- `GET /api/services/categories` - Get service categories

### Bookings
- `GET /api/bookings` - List user bookings
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings/{id}` - Update booking status

### Reviews
- `GET /api/reviews/runner/{id}` - Get runner reviews
- `POST /api/reviews` - Create review

## 🎯 Key Features Implemented

### ✅ Working Features
- Complete backend API with all endpoints
- User authentication and authorization
- Database with comprehensive seed data
- Frontend routing and navigation
- Responsive home page
- Working runners listing page
- Service browsing functionality
- Real-time chat infrastructure
- Admin dashboard backend

### 🔧 Recent Fixes
- Fixed CORS configuration for frontend-backend communication
- Resolved CSS variable compatibility issues
- Fixed component rendering problems
- Implemented working UI for data display
- Added comprehensive error handling

## 🧪 Testing

The application has been thoroughly tested:
- All backend APIs tested and working
- Frontend-backend integration verified
- UI components tested across different browsers
- Database operations validated
- Authentication flow tested

See `docs/Urban_Assist_Testing_Report.md` for detailed testing results.

## 🚀 Deployment

### Backend Deployment
The backend is ready for deployment on platforms like:
- Heroku
- Railway
- DigitalOcean App Platform
- AWS Elastic Beanstalk

### Frontend Deployment
The frontend can be deployed on:
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

## 📚 Documentation

- [Testing Report](docs/Urban_Assist_Testing_Report.md) - Comprehensive testing results
- [UI Debug Report](docs/UI_Debug_Report.md) - UI fixes and debugging process
- [Original Documentation](docs/Urban_Assist_Documentation.md) - Initial project documentation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with modern web technologies
- Responsive design principles
- RESTful API best practices
- Comprehensive testing methodology

## 📞 Support

For support, please open an issue in the GitHub repository or contact the development team.

---

**Status**: ✅ Fully functional with working backend APIs and frontend interface
**Last Updated**: July 2025

