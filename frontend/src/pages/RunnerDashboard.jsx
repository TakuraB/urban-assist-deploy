import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, DollarSign, CheckCircle, XCircle, Eye } from 'lucide-react'
import { Link } from 'react-router-dom'

const RunnerDashboard = () => {
  const { user, authFetch, API_BASE_URL } = useAuth()
  const [pendingBookings, setPendingBookings] = useState([])
  const [otherBookings, setOtherBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchBookings() }, [])

  const fetchBookings = async () => {
    setLoading(true)
    try {
      const response = await authFetch(`${API_BASE_URL}/bookings?as_runner=true`)
      const data = await response.json()
      if (response.ok) {
        setPendingBookings((data.bookings || []).filter(b => b.status === 'pending'))
        setOtherBookings((data.bookings || []).filter(b => b.status !== 'pending'))
      } else {
        setPendingBookings([])
        setOtherBookings([])
      }
    } catch {
      setPendingBookings([])
      setOtherBookings([])
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (bookingId, action) => {
    await authFetch(`${API_BASE_URL}/bookings/${bookingId}/${action}`, { method: 'POST' })
    fetchBookings()
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-green-900 mb-8">Runner Dashboard</h1>
        <h2 className="text-xl font-semibold mb-4 text-green-800">Incoming Booking Requests</h2>
        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600"></div></div>
        ) : pendingBookings.length === 0 ? (
          <Card><CardContent className="text-center py-8">No pending booking requests.</CardContent></Card>
        ) : (
          <div className="space-y-4">
            {pendingBookings.map(booking => (
              <Card key={booking.id}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{booking.title || 'Booking'}</CardTitle>
                    <div className="text-sm text-gray-500">from {booking.user?.first_name} {booking.user?.last_name}</div>
                  </div>
                  <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {new Date(booking.scheduled_date).toLocaleDateString()}</div>
                    <div className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {booking.location || 'TBD'}</div>
                    <div className="flex items-center gap-1"><DollarSign className="h-4 w-4" /> ${booking.total_amount || 'TBD'}</div>
                  </div>
                  <div className="mt-4 flex gap-2 justify-end">
                    <Button asChild variant="outline" size="sm"><Link to={`/booking/${booking.id}`}><Eye className="h-4 w-4 mr-1" />View</Link></Button>
                    <Button variant="success" size="sm" onClick={() => handleAction(booking.id, 'accept')}><CheckCircle className="h-4 w-4 mr-1" />Accept</Button>
                    <Button variant="destructive" size="sm" onClick={() => handleAction(booking.id, 'decline')}><XCircle className="h-4 w-4 mr-1" />Decline</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        <h2 className="text-xl font-semibold mt-10 mb-4 text-green-800">Your Bookings</h2>
        {otherBookings.length === 0 ? (
          <Card><CardContent className="text-center py-8">No other bookings yet.</CardContent></Card>
        ) : (
          <div className="space-y-4">
            {otherBookings.map(booking => (
              <Card key={booking.id}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{booking.title || 'Booking'}</CardTitle>
                    <div className="text-sm text-gray-500">from {booking.user?.first_name} {booking.user?.last_name}</div>
                  </div>
                  <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {new Date(booking.scheduled_date).toLocaleDateString()}</div>
                    <div className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {booking.location || 'TBD'}</div>
                    <div className="flex items-center gap-1"><DollarSign className="h-4 w-4" /> ${booking.total_amount || 'TBD'}</div>
                  </div>
                  <div className="mt-4 flex gap-2 justify-end">
                    <Button asChild variant="outline" size="sm"><Link to={`/booking/${booking.id}`}><Eye className="h-4 w-4 mr-1" />View</Link></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default RunnerDashboard 