import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  UserCheck, 
  Calendar, 
  DollarSign, 
  Star, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Flag
} from 'lucide-react'

const AdminDashboard = () => {
  const { API_BASE_URL, token, user } = useAuth()
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [bookings, setBookings] = useState([])
  const [reviews, setReviews] = useState([])
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (user?.role !== 'admin') {
      // Redirect non-admin users
      window.location.href = '/dashboard'
      return
    }
    
    fetchDashboardData()
  }, [user])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch dashboard stats
      const statsResponse = await fetch(`${API_BASE_URL}/admin/dashboard/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }

      // Fetch users
      const usersResponse = await fetch(`${API_BASE_URL}/admin/users?per_page=10`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (usersResponse.ok) {
        const usersData = await usersResponse.json()
        setUsers(usersData.users)
      }

      // Fetch bookings
      const bookingsResponse = await fetch(`${API_BASE_URL}/admin/bookings?per_page=10`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json()
        setBookings(bookingsData.bookings)
      }

      // Fetch reviews
      const reviewsResponse = await fetch(`${API_BASE_URL}/admin/reviews?per_page=10`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (reviewsResponse.ok) {
        const reviewsData = await reviewsResponse.json()
        setReviews(reviewsData.reviews)
      }

      // Fetch services
      const servicesResponse = await fetch(`${API_BASE_URL}/admin/services`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (servicesResponse.ok) {
        const servicesData = await servicesResponse.json()
        setServices(servicesData.services)
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleUserStatus = async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/toggle-status`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        fetchDashboardData() // Refresh data
      }
    } catch (error) {
      console.error('Error toggling user status:', error)
    }
  }

  const toggleReviewFlag = async (reviewId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/reviews/${reviewId}/flag`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        fetchDashboardData() // Refresh data
      }
    } catch (error) {
      console.error('Error flagging review:', error)
    }
  }

  const deleteReview = async (reviewId) => {
    if (!confirm('Are you sure you want to delete this review?')) return
    
    try {
      const response = await fetch(`${API_BASE_URL}/admin/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        fetchDashboardData() // Refresh data
      }
    } catch (error) {
      console.error('Error deleting review:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage users, bookings, and platform content</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {stats && (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.users.total_users}</div>
                      <p className="text-xs text-muted-foreground">
                        +{stats.users.new_users_this_month} this month
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Runners</CardTitle>
                      <UserCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.users.total_runners}</div>
                      <p className="text-xs text-muted-foreground">
                        Service providers
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.bookings.total_bookings}</div>
                      <p className="text-xs text-muted-foreground">
                        {stats.bookings.completion_rate.toFixed(1)}% completion rate
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">${stats.revenue.total_revenue.toFixed(2)}</div>
                      <p className="text-xs text-muted-foreground">
                        ${stats.revenue.monthly_revenue.toFixed(2)} this month
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Additional Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Reviews</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center space-x-2">
                        <Star className="h-5 w-5 text-yellow-500" />
                        <span className="text-2xl font-bold">{stats.reviews.average_rating.toFixed(1)}</span>
                        <span className="text-gray-600">/ 5.0</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        {stats.reviews.total_reviews} total reviews
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Pending Bookings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-5 w-5 text-orange-500" />
                        <span className="text-2xl font-bold">{stats.bookings.pending_bookings}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        Awaiting runner response
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Completed Bookings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="text-2xl font-bold">{stats.bookings.completed_bookings}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        Successfully completed
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage platform users and runners</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{user.first_name} {user.last_name}</h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant={user.role === 'runner' ? 'default' : 'secondary'}>
                            {user.role}
                          </Badge>
                          <Badge variant={user.is_active ? 'default' : 'destructive'}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant={user.is_active ? 'destructive' : 'default'}
                        size="sm"
                        onClick={() => toggleUserStatus(user.id)}
                      >
                        {user.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Booking Management</CardTitle>
                <CardDescription>Monitor and manage platform bookings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{booking.title}</h3>
                        <p className="text-sm text-gray-600">
                          {booking.user.name} → {booking.runner?.name || 'No runner assigned'}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant={
                            booking.status === 'completed' ? 'default' :
                            booking.status === 'pending' ? 'secondary' :
                            booking.status === 'cancelled' ? 'destructive' : 'outline'
                          }>
                            {booking.status}
                          </Badge>
                          <span className="text-sm text-gray-600">${booking.total_amount}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          {new Date(booking.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Review Management</CardTitle>
                <CardDescription>Moderate reviews and handle reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-600">
                              by {review.reviewer.name}
                            </span>
                            {review.is_flagged && (
                              <Badge variant="destructive">
                                <Flag className="h-3 w-3 mr-1" />
                                Flagged
                              </Badge>
                            )}
                          </div>
                          <p className="text-gray-700 mb-2">{review.comment}</p>
                          <p className="text-sm text-gray-600">
                            For: {review.runner.name} • Booking: {review.booking.title}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant={review.is_flagged ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => toggleReviewFlag(review.id)}
                          >
                            {review.is_flagged ? 'Unflag' : 'Flag'}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteReview(review.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Service Management</CardTitle>
                <CardDescription>Manage available services on the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {services.map((service) => (
                    <div key={service.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{service.name}</h3>
                        <p className="text-sm text-gray-600">{service.description}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="secondary">{service.category}</Badge>
                          <Badge variant={service.is_active ? 'default' : 'destructive'}>
                            {service.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant={service.is_active ? 'destructive' : 'default'}
                        size="sm"
                        onClick={() => {/* Toggle service status */}}
                      >
                        {service.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default AdminDashboard

