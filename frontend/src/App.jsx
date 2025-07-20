import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import RunnersSimple from './pages/RunnersSimple'
import RunnerProfile from './pages/RunnerProfile'
import Dashboard from './pages/Dashboard'
import BookingDetails from './pages/BookingDetails'
import CreateBooking from './pages/CreateBooking'
import AdminDashboard from './pages/AdminDashboard'
import ModeratorDashboard from './pages/ModeratorDashboard'
import Chat from './pages/Chat'
import Settings from './pages/Settings'
import ProtectedRoute from './components/ProtectedRoute'
import RoleBasedRoute from './components/RoleBasedRoute'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-background">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/runners" element={<RunnersSimple />} />
              <Route path="/runners/:id" element={<RunnerProfile />} />
              
              {/* Protected Routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/booking/:id" 
                element={
                  <ProtectedRoute>
                    <BookingDetails />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/book/:runnerId" 
                element={
                  <ProtectedRoute>
                    <CreateBooking />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/chat/:bookingId" 
                element={
                  <ProtectedRoute>
                    <Chat />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } 
              />
              
              {/* Role-Based Routes */}
              <Route 
                path="/admin" 
                element={
                  <RoleBasedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </RoleBasedRoute>
                } 
              />
              <Route 
                path="/moderator" 
                element={
                  <RoleBasedRoute allowedRoles={['moderator', 'admin']}>
                    <ModeratorDashboard />
                  </RoleBasedRoute>
                } 
              />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
