import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext' // Ensure this path is correct
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Calendar,
  Clock,
  DollarSign,
  MapPin,
  Star,
  User,
  Settings,
  Plus,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'

const Dashboard = () => {
  // Destructure authFetch from useAuth
  const { user, loading: authLoading, API_BASE_URL, authFetch, getBookings, getRunners } = useAuth() // Added authFetch, getBookings, getRunners
  const [bookings, setBookings] = useState([])
  const [runnerBookings, setRunnerBookings] = useState([])
  const [runnerProfile, setRunnerProfile] = useState(null)
  const [loading, setLoading] = useState(true) // Local loading state for dashboard data
  const [stats, setStats] = useState({
    totalBookings: 0,
    completedBookings: 0,
    totalSpent: 0,
    averageRating: 0
  })

  // Combine loading states: dashboard data loading AND auth context loading
  const overallLoading = loading || authLoading;

  // Memoize fetchDashboardData to ensure stable dependency for useEffect
  const fetchDashboardData = useCallback(async () => {
    if (!user) { // Only fetch if user is authenticated
      setLoading(false);
      return;
    }
    try {
      // Use Promise.all to fetch data concurrently
      await Promise.all([
        fetchBookings(),
        fetchRunnerProfile(),
        fetchRunnerBookings()
      ])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }, [user]); // Depend on user from auth context

  // Fetch dashboard data when user or authLoading state changes
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]); // Depend on the memoized fetchDashboardData

  // Memoize fetchBookings
  const fetchBookings = useCallback(async () => {
    try {
      // Use authFetch for this API call
      const response = await authFetch(`${API_BASE_URL}/bookings`);
      const data = await response.json();

      if (response.ok) {
        setBookings(data.bookings)
        
        // Calculate stats
        const completed = data.bookings.filter(b => b.status === 'completed')
        const totalSpent = completed.reduce((sum, b) => sum + b.total_amount, 0)
        
        setStats({
          totalBookings: data.bookings.length,
          completedBookings: completed.length,
          totalSpent,
          averageRating: 4.5 // This would come from reviews, consider fetching actual reviews
        })
      } else {
        console.error('Failed to fetch bookings:', data.error || response.statusText);
        setBookings([]); // Clear bookings on error
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]); // Clear bookings on error
    }
  }, [API_BASE_URL, authFetch]); // Dependencies for useCallback

  // Memoize fetchRunnerProfile
  const fetchRunnerProfile = useCallback(async () => {
    try {
      // Use authFetch for this API call
      const response = await authFetch(`${API_BASE_URL}/runners/profile`);
      const data = await response.json();

      if (response.ok) {
        setRunnerProfile(data);
      } else {
        // A 404 here means the user is not a runner, which is expected for some users.
        // Only log if it's not a 404 to avoid excessive console noise.
        if (response.status !== 404) {
          console.error('Failed to fetch runner profile:', data.error || response.statusText);
        }
        setRunnerProfile(null); // Clear runner profile if not found or error
      }
    } catch (error) {
      console.error('Error fetching runner profile:', error);
      setRunnerProfile(null); // Clear runner profile on error
    }
  }, [API_BASE_URL, authFetch]); // Dependencies for useCallback

  // Memoize fetchRunnerBookings
  const fetchRunnerBookings = useCallback(async () => {
    try {
      // Use authFetch for this API call
      const response = await authFetch(`${API_BASE_URL}/bookings?as_runner=true`);
      const data = await response.json();

      if (response.ok) {
        setRunnerBookings(data.bookings);
      } else {
        // A 404 here means the user is not a runner, which is expected for some users.
        if (response.status !== 404) {
          console.error('Failed to fetch runner bookings:', data.error || response.statusText);
        }
        setRunnerBookings([]); // Clear runner bookings on error
      }
    } catch (error) {
      console.error('Error fetching runner bookings:', error);
      setRunnerBookings([]); // Clear runner bookings on error
    }
  }, [API_BASE_URL, authFetch]); // Dependencies for useCallback


  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'accepted': return 'bg-blue-100 text-blue-800'
      case 'in_progress': return 'bg-purple-100 text-purple-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'declined': return 'bg-red-100 text-red-800'
      case 'cancelled': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'declined': 
      case 'cancelled': return <XCircle className="h-4 w-4" />
      case 'pending': return <AlertCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  if (overallLoading) { // Use overallLoading
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Redirect to login if user is not authenticated after loading
  if (!user) {
    // This scenario should ideally be handled by a ProtectedRoute or similar wrapper
    // but as a fallback, we can redirect here.
    // However, given the AuthProvider setup, this might not be strictly necessary
    // if the parent routes are protected.
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">Please log in to view your dashboard.</p>
          <Button asChild>
            <Link to="/login">Go to Login</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.first_name}!
          </h1>
          <p className="text-gray-600">
            Manage your bookings and profile from your dashboard
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBookings}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedBookings}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalSpent.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageRating}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="bookings">My Bookings</TabsTrigger>
            <TabsTrigger value="runner">Runner Dashboard</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* My Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">My Bookings</h2>
              <Button asChild>
                <Link to="/runners">
                  <Plus className="h-4 w-4 mr-2" />
                  New Booking
                </Link>
              </Button>
            </div>

            <div className="grid gap-4">
              {bookings.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-gray-500 mb-4">You haven't made any bookings yet.</p>
                    <Button asChild>
                      <Link to="/runners">Find Runners</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                bookings.map((booking) => (
                  <Card key={booking.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{booking.title}</CardTitle>
                          <CardDescription>
                            with {booking.runner?.user?.first_name} {booking.runner?.user?.last_name}
                          </CardDescription>
                        </div>
                        <Badge className={getStatusColor(booking.status)}>
                          {getStatusIcon(booking.status)}
                          <span className="ml-1 capitalize">{booking.status}</span>
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">
                            {new Date(booking.scheduled_date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{booking.location || 'Location TBD'}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">${booking.total_amount}</span>
                        </div>
                      </div>
                      <div className="mt-4 flex justify-end">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/booking/${booking.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Runner Dashboard Tab */}
          <TabsContent value="runner" className="space-y-6">
            {runnerProfile ? (
              <>
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Runner Dashboard</h2>
                  <Button variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Profile Stats</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between">
                        <span>Rating:</span>
                        <span className="font-semibold">{runnerProfile.rating}/5</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Reviews:</span>
                        <span className="font-semibold">{runnerProfile.total_reviews}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Bookings:</span>
                        <span className="font-semibold">{runnerProfile.total_bookings}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Hourly Rate:</span>
                        <span className="font-semibold">${runnerProfile.hourly_rate}/hr</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle>Recent Booking Requests</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {runnerBookings.length === 0 ? (
                        <p className="text-gray-500">No booking requests yet.</p>
                      ) : (
                        <div className="space-y-4">
                          {runnerBookings.slice(0, 3).map((booking) => (
                            <div key={booking.id} className="flex justify-between items-center p-4 border rounded-lg">
                              <div>
                                <h4 className="font-medium">{booking.title}</h4>
                                <p className="text-sm text-gray-600">
                                  {booking.user?.first_name} {booking.user?.last_name}
                                </p>
                              </div>
                              <Badge className={getStatusColor(booking.status)}>
                                {booking.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <h3 className="text-lg font-semibold mb-2">Become a Runner</h3>
                  <p className="text-gray-600 mb-4">
                    Start earning by helping others with their daily tasks
                  </p>
                  <Button>Create Runner Profile</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Manage your personal information and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={user.profile_image} />
                    <AvatarFallback className="text-lg">
                      {user.first_name[0]}{user.last_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">
                      {user.first_name} {user.last_name}
                    </h3>
                    <p className="text-gray-600">@{user.username}</p>
                    <p className="text-gray-600">{user.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <p className="text-gray-900">{user.first_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <p className="text-gray-900">{user.last_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <p className="text-gray-900">{user.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <p className="text-gray-900">{user.phone || 'Not provided'}</p>
                  </div>
                </div>

                <Button>Edit Profile</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Manage your account preferences and security settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">Email Notifications</h4>
                    <p className="text-sm text-gray-600">Receive booking updates via email</p>
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">Privacy Settings</h4>
                    <p className="text-sm text-gray-600">Control your profile visibility</p>
                  </div>
                  <Button variant="outline" size="sm">Manage</Button>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">Change Password</h4>
                    <p className="text-sm text-gray-600">Update your account password</p>
                  </div>
                  <Button variant="outline" size="sm">Change</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default Dashboard
