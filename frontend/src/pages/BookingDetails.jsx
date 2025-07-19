import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Chat from '../components/Chat'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Calendar,
  Clock,
  DollarSign,
  MapPin,
  User,
  MessageCircle,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Star
} from 'lucide-react'

const BookingDetails = () => {
  const { id } = useParams()
  const { API_BASE_URL, token, user } = useAuth()
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showChat, setShowChat] = useState(false)

  useEffect(() => {
    fetchBooking()
  }, [id])

  const fetchBooking = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (response.ok) {
        setBooking(data)
      } else {
        setError(data.error || 'Booking not found')
      }
    } catch (error) {
      setError('Error loading booking details')
    } finally {
      setLoading(false)
    }
  }

  const updateBookingStatus = async (newStatus) => {
    setUpdating(true)
    setError('')

    try {
      const response = await fetch(`${API_BASE_URL}/bookings/${id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })

      const data = await response.json()

      if (response.ok) {
        setBooking(data.booking)
      } else {
        setError(data.error || 'Failed to update booking status')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setUpdating(false)
    }
  }

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

  const isRunner = booking && user && booking.runner?.user_id === user.id
  const isClient = booking && user && booking.user_id === user.id

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking not found</h2>
          <p className="text-gray-600 mb-4">{error || 'The booking you\'re looking for doesn\'t exist.'}</p>
          <Button asChild>
            <Link to="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{booking.title}</h1>
              <p className="text-gray-600">Booking #{booking.id}</p>
            </div>
            <Badge className={getStatusColor(booking.status)}>
              {getStatusIcon(booking.status)}
              <span className="ml-1 capitalize">{booking.status}</span>
            </Badge>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Booking Details */}
            <Card>
              <CardHeader>
                <CardTitle>Booking Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Scheduled Date</p>
                      <p className="font-semibold">
                        {new Date(booking.scheduled_date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Scheduled Time</p>
                      <p className="font-semibold">
                        {new Date(booking.scheduled_date).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="font-semibold">{booking.location || 'To be determined'}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="font-semibold text-green-600">${booking.total_amount}</p>
                    </div>
                  </div>
                </div>

                {booking.description && (
                  <div>
                    <h4 className="font-semibold mb-2">Description</h4>
                    <p className="text-gray-700">{booking.description}</p>
                  </div>
                )}

                {booking.notes && (
                  <div>
                    <h4 className="font-semibold mb-2">Additional Notes</h4>
                    <p className="text-gray-700">{booking.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Service Information */}
            <Card>
              <CardHeader>
                <CardTitle>Service Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{booking.service?.name}</h3>
                    <p className="text-gray-600">{booking.service?.description}</p>
                    <Badge variant="secondary" className="mt-2">
                      {booking.service?.category}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Estimated Duration</p>
                    <p className="font-semibold">{booking.estimated_hours} hours</p>
                    <p className="text-sm text-gray-600 mt-1">Rate: ${booking.hourly_rate}/hr</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            {booking.status === 'pending' && (
              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    {isRunner && (
                      <>
                        <Button 
                          onClick={() => updateBookingStatus('accepted')}
                          disabled={updating}
                        >
                          Accept Booking
                        </Button>
                        <Button 
                          variant="destructive"
                          onClick={() => updateBookingStatus('declined')}
                          disabled={updating}
                        >
                          Decline Booking
                        </Button>
                      </>
                    )}
                    {isClient && (
                      <>
                        <Button variant="outline" asChild>
                          <Link to={`/book/${booking.runner_id}`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Booking
                          </Link>
                        </Button>
                        <Button 
                          variant="destructive"
                          onClick={() => updateBookingStatus('cancelled')}
                          disabled={updating}
                        >
                          Cancel Booking
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {booking.status === 'accepted' && isRunner && (
              <Card>
                <CardHeader>
                  <CardTitle>Start Service</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => updateBookingStatus('in_progress')}
                    disabled={updating}
                  >
                    Mark as In Progress
                  </Button>
                </CardContent>
              </Card>
            )}

            {booking.status === 'in_progress' && isRunner && (
              <Card>
                <CardHeader>
                  <CardTitle>Complete Service</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => updateBookingStatus('completed')}
                    disabled={updating}
                  >
                    Mark as Completed
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {isRunner ? 'Client Information' : 'Runner Information'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={
                      isRunner ? booking.user?.profile_image : booking.runner?.user?.profile_image
                    } />
                    <AvatarFallback>
                      {isRunner ? (
                        <>{booking.user?.first_name?.[0]}{booking.user?.last_name?.[0]}</>
                      ) : (
                        <>{booking.runner?.user?.first_name?.[0]}{booking.runner?.user?.last_name?.[0]}</>
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">
                      {isRunner ? (
                        `${booking.user?.first_name} ${booking.user?.last_name}`
                      ) : (
                        `${booking.runner?.user?.first_name} ${booking.runner?.user?.last_name}`
                      )}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {isRunner ? booking.user?.email : booking.runner?.user?.email}
                    </p>
                  </div>
                </div>

                {!isRunner && booking.runner && (
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Rating:</span>
                      <span className="text-sm font-semibold">{booking.runner.rating}/5</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Reviews:</span>
                      <span className="text-sm font-semibold">{booking.runner.total_reviews}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Location:</span>
                      <span className="text-sm font-semibold">
                        {booking.runner.city}, {booking.runner.country}
                      </span>
                    </div>
                  </div>
                )}

                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setShowChat(true)}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Open Chat
                </Button>
              </CardContent>
            </Card>

            {/* Booking Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Booking Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <div>
                      <p className="text-sm font-semibold">Booking Created</p>
                      <p className="text-xs text-gray-600">
                        {new Date(booking.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {booking.status !== 'pending' && (
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      <div>
                        <p className="text-sm font-semibold">Status Updated</p>
                        <p className="text-xs text-gray-600">
                          {new Date(booking.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}

                  {booking.completed_at && (
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                      <div>
                        <p className="text-sm font-semibold">Service Completed</p>
                        <p className="text-xs text-gray-600">
                          {new Date(booking.completed_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Leave Review */}
            {booking.status === 'completed' && isClient && (
              <Card>
                <CardHeader>
                  <CardTitle>Leave a Review</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Share your experience with {booking.runner?.user?.first_name}
                  </p>
                  <Button className="w-full">
                    <Star className="h-4 w-4 mr-2" />
                    Write Review
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        
        {/* Chat Modal */}
        {showChat && (
          <Chat 
            bookingId={booking.id} 
            onClose={() => setShowChat(false)} 
          />
        )}
      </div>
    </div>
  )
}

export default BookingDetails

