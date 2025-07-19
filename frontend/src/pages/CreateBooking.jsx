import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar, DollarSign, Clock, MapPin, User } from 'lucide-react'

const CreateBooking = () => {
  const { runnerId } = useParams()
  const navigate = useNavigate()
  const { API_BASE_URL, token } = useAuth()
  
  const [runner, setRunner] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    service_id: '',
    title: '',
    description: '',
    location: '',
    scheduled_date: '',
    scheduled_time: '',
    estimated_hours: '',
    notes: ''
  })

  useEffect(() => {
    fetchRunner()
  }, [runnerId])

  const fetchRunner = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/runners/${runnerId}`)
      const data = await response.json()

      if (response.ok) {
        setRunner(data)
      } else {
        setError('Runner not found')
      }
    } catch (error) {
      setError('Error loading runner information')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSelectChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value
    })
  }

  const calculateTotal = () => {
    const hours = parseFloat(formData.estimated_hours) || 0
    const rate = runner?.hourly_rate || 0
    return (hours * rate).toFixed(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    // Validation
    if (!formData.service_id || !formData.title || !formData.scheduled_date || 
        !formData.scheduled_time || !formData.estimated_hours) {
      setError('Please fill in all required fields')
      setSubmitting(false)
      return
    }

    if (parseFloat(formData.estimated_hours) <= 0) {
      setError('Estimated hours must be greater than 0')
      setSubmitting(false)
      return
    }

    try {
      // Combine date and time
      const scheduledDateTime = new Date(`${formData.scheduled_date}T${formData.scheduled_time}`)
      
      const bookingData = {
        runner_id: parseInt(runnerId),
        service_id: parseInt(formData.service_id),
        title: formData.title,
        description: formData.description,
        location: formData.location,
        scheduled_date: scheduledDateTime.toISOString(),
        estimated_hours: parseFloat(formData.estimated_hours),
        notes: formData.notes
      }

      const response = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookingData)
      })

      const data = await response.json()

      if (response.ok) {
        navigate(`/booking/${data.booking.id}`)
      } else {
        setError(data.error || 'Failed to create booking')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
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
          <p className="text-gray-600 mb-4">The runner you're trying to book doesn't exist.</p>
          <Button onClick={() => navigate('/runners')}>Back to Runners</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Book a Service</h1>
          <p className="text-gray-600">
            Create a booking request for {runner.user.first_name} {runner.user.last_name}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Booking Details</CardTitle>
                <CardDescription>
                  Fill in the details for your service request
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {/* Service Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="service_id">Service *</Label>
                    <Select 
                      value={formData.service_id} 
                      onValueChange={(value) => handleSelectChange('service_id', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a service" />
                      </SelectTrigger>
                      <SelectContent>
                        {runner.services.map((service) => (
                          <SelectItem key={service.id} value={service.id.toString()}>
                            {service.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="Brief description of what you need"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Detailed description of the task"
                      rows={3}
                    />
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="Where should the service be performed?"
                    />
                  </div>

                  {/* Date and Time */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="scheduled_date">Date *</Label>
                      <Input
                        id="scheduled_date"
                        name="scheduled_date"
                        type="date"
                        value={formData.scheduled_date}
                        onChange={handleChange}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="scheduled_time">Time *</Label>
                      <Input
                        id="scheduled_time"
                        name="scheduled_time"
                        type="time"
                        value={formData.scheduled_time}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  {/* Estimated Hours */}
                  <div className="space-y-2">
                    <Label htmlFor="estimated_hours">Estimated Hours *</Label>
                    <Input
                      id="estimated_hours"
                      name="estimated_hours"
                      type="number"
                      step="0.5"
                      min="0.5"
                      value={formData.estimated_hours}
                      onChange={handleChange}
                      placeholder="How many hours do you estimate this will take?"
                      required
                    />
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="notes">Additional Notes</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="Any special instructions or requirements"
                      rows={2}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting ? 'Creating Booking...' : 'Create Booking Request'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Runner Info & Summary */}
          <div className="space-y-6">
            {/* Runner Info */}
            <Card>
              <CardHeader>
                <CardTitle>Runner Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={runner.user.profile_image} />
                    <AvatarFallback>
                      {runner.user.first_name[0]}{runner.user.last_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">
                      {runner.user.first_name} {runner.user.last_name}
                    </h3>
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {runner.city}, {runner.country}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Rating:</span>
                    <span className="text-sm font-semibold">{runner.rating}/5</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Reviews:</span>
                    <span className="text-sm font-semibold">{runner.total_reviews}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Hourly Rate:</span>
                    <span className="text-sm font-semibold">${runner.hourly_rate}/hr</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Booking Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Hourly Rate:</span>
                    <span className="text-sm">${runner.hourly_rate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Estimated Hours:</span>
                    <span className="text-sm">{formData.estimated_hours || '0'}</span>
                  </div>
                  <hr />
                  <div className="flex justify-between">
                    <span className="font-semibold">Total Estimate:</span>
                    <span className="font-semibold text-green-600">
                      ${calculateTotal()}
                    </span>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-800">
                    This is an estimate. The final amount will be based on actual time spent.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateBooking

