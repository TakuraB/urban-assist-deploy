import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Star, 
  MapPin, 
  DollarSign, 
  Clock, 
  Calendar,
  MessageCircle,
  Shield,
  Award,
  User
} from 'lucide-react'

const RunnerProfile = () => {
  const { id } = useParams()
  const { API_BASE_URL, user } = useAuth()
  const [runner, setRunner] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRunnerProfile()
    fetchRunnerReviews()
  }, [id])

  const fetchRunnerProfile = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/runners/${id}`)
      const data = await response.json()

      if (response.ok) {
        setRunner(data)
      }
    } catch (error) {
      console.error('Error fetching runner profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRunnerReviews = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/reviews?reviewee_id=${runner?.user_id}`)
      const data = await response.json()

      if (response.ok) {
        setReviews(data.reviews)
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    }
  }

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ))
  }

  const renderReviewStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!runner) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Runner not found</h2>
          <p className="text-gray-600 mb-4">The runner you're looking for doesn't exist.</p>
          <Button asChild>
            <Link to="/runners">Back to Runners</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={runner.user.profile_image} />
                <AvatarFallback className="text-2xl">
                  {runner.user.first_name[0]}{runner.user.last_name[0]}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {runner.user.first_name} {runner.user.last_name}
                  </h1>
                  {runner.is_verified && (
                    <Badge className="bg-blue-100 text-blue-800">
                      <Shield className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>

                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center space-x-1">
                    {renderStars(runner.rating)}
                    <span className="text-sm text-gray-600 ml-1">
                      {runner.rating} ({runner.total_reviews} reviews)
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {runner.city}, {runner.country}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <span className="text-2xl font-bold text-green-600">
                      ${runner.hourly_rate}/hr
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className={`text-sm ${runner.is_available ? 'text-green-600' : 'text-red-600'}`}>
                      {runner.is_available ? 'Available' : 'Busy'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col space-y-2">
                {user && (
                  <Button asChild>
                    <Link to={`/book/${runner.id}`}>
                      <Calendar className="h-4 w-4 mr-2" />
                      Book Now
                    </Link>
                  </Button>
                )}
                <Button variant="outline">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Message
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="about" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          {/* About Tab */}
          <TabsContent value="about" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About {runner.user.first_name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {runner.bio || 'No bio available.'}
                </p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Award className="h-5 w-5" />
                    <span>Stats</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Bookings:</span>
                    <span className="font-semibold">{runner.total_bookings}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Reviews:</span>
                    <span className="font-semibold">{runner.total_reviews}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Rating:</span>
                    <span className="font-semibold">{runner.rating}/5</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Member Since:</span>
                    <span className="font-semibold">
                      {new Date(runner.created_at).getFullYear()}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5" />
                    <span>Location</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>City:</span>
                    <span className="font-semibold">{runner.city}</span>
                  </div>
                  {runner.state && (
                    <div className="flex justify-between">
                      <span>State:</span>
                      <span className="font-semibold">{runner.state}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Country:</span>
                    <span className="font-semibold">{runner.country}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <Badge className={runner.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {runner.is_available ? 'Available' : 'Busy'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Services Offered</CardTitle>
                <CardDescription>
                  {runner.user.first_name} can help you with the following services
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {runner.services.map((service) => (
                    <div key={service.id} className="border rounded-lg p-4">
                      <h3 className="font-semibold text-lg mb-2">{service.name}</h3>
                      <p className="text-gray-600 text-sm mb-3">{service.description}</p>
                      <Badge variant="secondary">{service.category}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Reviews</CardTitle>
                <CardDescription>
                  See what others are saying about {runner.user.first_name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {reviews.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No reviews yet.</p>
                ) : (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b pb-6 last:border-b-0">
                        <div className="flex items-start space-x-4">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>
                              <User className="h-5 w-5" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <h4 className="font-semibold">
                                  {review.reviewer.first_name} {review.reviewer.last_name}
                                </h4>
                                <div className="flex items-center space-x-1">
                                  {renderReviewStars(review.rating)}
                                  <span className="text-sm text-gray-600 ml-1">
                                    {review.rating}/5
                                  </span>
                                </div>
                              </div>
                              <span className="text-sm text-gray-500">
                                {new Date(review.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-gray-700">{review.comment}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default RunnerProfile

