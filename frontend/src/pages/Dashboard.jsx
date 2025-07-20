import { useAuth } from '../contexts/AuthContext'
import UserDashboard from './UserDashboard'
import RunnerDashboard from './RunnerDashboard'
import { Navigate } from 'react-router-dom'

const Dashboard = () => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (user.role === 'RUNNER') {
    return <RunnerDashboard />
  }

  // Default to user dashboard
  return <UserDashboard />
}

export default Dashboard
