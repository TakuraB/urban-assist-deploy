import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import {
  AlertTriangle,
  Flag,
  User,
  MessageSquare,
  Star,
  CheckCircle,
  XCircle,
  Eye,
  Shield,
  Users,
  FileText,
  Settings
} from 'lucide-react'

const ModeratorDashboard = () => {
  const { user, authFetch, API_BASE_URL } = useAuth()
  const [loading, setLoading] = useState(true)
  const [flaggedReviews, setFlaggedReviews] = useState([])
  const [flaggedMessages, setFlaggedMessages] = useState([])
  const [reportedUsers, setReportedUsers] = useState([])
  const [stats, setStats] = useState({
    totalFlagged: 0,
    pendingReview: 0,
    resolvedToday: 0,
    activeModerators: 0
  })

  useEffect(() => {
    fetchModeratorData()
  }, [])

  const fetchModeratorData = async () => {
    try {
      const [reviewsRes, messagesRes, usersRes, statsRes] = await Promise.all([
        authFetch(`${API_BASE_URL}/admin/flagged-reviews`),
        authFetch(`${API_BASE_URL}/admin/flagged-messages`),
        authFetch(`${API_BASE_URL}/admin/reported-users`),
        authFetch(`${API_BASE_URL}/admin/moderator-stats`)
      ])

      if (reviewsRes.ok) {
        const reviewsData = await reviewsRes.json()
        setFlaggedReviews(reviewsData.reviews || [])
      }

      if (messagesRes.ok) {
        const messagesData = await messagesRes.json()
        setFlaggedMessages(messagesData.messages || [])
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json()
        setReportedUsers(usersData.users || [])
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }
    } catch (error) {
      console.error('Error fetching moderator data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReviewAction = async (reviewId, action, reason = '') => {
    try {
      const response = await authFetch(`${API_BASE_URL}/admin/reviews/${reviewId}/${action}`, {
        method: 'POST',
        body: JSON.stringify({ reason })
      })

      if (response.ok) {
        fetchModeratorData() // Refresh data
      }
    } catch (error) {
      console.error('Error handling review action:', error)
    }
  }

  const handleMessageAction = async (messageId, action, reason = '') => {
    try {
      const response = await authFetch(`${API_BASE_URL}/admin/messages/${messageId}/${action}`, {
        method: 'POST',
        body: JSON.stringify({ reason })
      })

      if (response.ok) {
        fetchModeratorData() // Refresh data
      }
    } catch (error) {
      console.error('Error handling message action:', error)
    }
  }

  const handleUserAction = async (userId, action, reason = '') => {
    try {
      const response = await authFetch(`${API_BASE_URL}/admin/users/${userId}/${action}`, {
        method: 'POST',
        body: JSON.stringify({ reason })
      })

      if (response.ok) {
        fetchModeratorData() // Refresh data
      }
    } catch (error) {
      console.error('Error handling user action:', error)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Moderator Dashboard
          </h1>
          <p className="text-gray-600">
            Manage flagged content and user reports
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Flagged</CardTitle>
              <Flag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalFlagged}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingReview}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.resolvedToday}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Moderators</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeModerators}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="reviews" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="reviews">Flagged Reviews</TabsTrigger>
            <TabsTrigger value="messages">Flagged Messages</TabsTrigger>
            <TabsTrigger value="users">Reported Users</TabsTrigger>
          </TabsList>

          {/* Flagged Reviews Tab */}
          <TabsContent value="reviews" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Flagged Reviews</h2>
              <Badge variant="outline">{flaggedReviews.length} items</Badge>
            </div>

            <div className="grid gap-4">
              {flaggedReviews.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No flagged reviews to review</p>
                  </CardContent>
                </Card>
              ) : (
                flaggedReviews.map((review) => (
                  <Card key={review.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={review.reviewer?.profile_image} />
                            <AvatarFallback>
                              {review.reviewer?.first_name?.[0]}{review.reviewer?.last_name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold">
                              {review.reviewer?.first_name} {review.reviewer?.last_name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Review for {review.reviewee?.first_name} {review.reviewee?.last_name}
                            </p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(review.status)}>
                          {review.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-600">{review.rating}/5</span>
                        </div>
                        
                        <div>
                          <p className="text-gray-900">{review.comment}</p>
                        </div>

                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReviewAction(review.id, 'approve')}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReviewAction(review.id, 'reject')}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Flagged Messages Tab */}
          <TabsContent value="messages" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Flagged Messages</h2>
              <Badge variant="outline">{flaggedMessages.length} items</Badge>
            </div>

            <div className="grid gap-4">
              {flaggedMessages.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No flagged messages to review</p>
                  </CardContent>
                </Card>
              ) : (
                flaggedMessages.map((message) => (
                  <Card key={message.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={message.sender?.profile_image} />
                            <AvatarFallback>
                              {message.sender?.first_name?.[0]}{message.sender?.last_name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold">
                              {message.sender?.first_name} {message.sender?.last_name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Message in booking #{message.booking_id}
                            </p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(message.status)}>
                          {message.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-gray-900">{message.message}</p>
                        </div>

                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMessageAction(message.id, 'approve')}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMessageAction(message.id, 'delete')}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Reported Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Reported Users</h2>
              <Badge variant="outline">{reportedUsers.length} items</Badge>
            </div>

            <div className="grid gap-4">
              {reportedUsers.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No reported users to review</p>
                  </CardContent>
                </Card>
              ) : (
                reportedUsers.map((user) => (
                  <Card key={user.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.profile_image} />
                            <AvatarFallback>
                              {user.first_name?.[0]}{user.last_name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold">
                              {user.first_name} {user.last_name}
                            </h3>
                            <p className="text-sm text-gray-600">@{user.username}</p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(user.status)}>
                          {user.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Report Details:</h4>
                          <p className="text-gray-600">{user.report_reason || 'No reason provided'}</p>
                        </div>

                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUserAction(user.id, 'warn')}
                          >
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            Warn User
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUserAction(user.id, 'suspend')}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Suspend
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUserAction(user.id, 'ban')}
                          >
                            <Shield className="h-4 w-4 mr-2" />
                            Ban User
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default ModeratorDashboard 