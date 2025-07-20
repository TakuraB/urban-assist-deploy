import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal' // If you have a modal component
import { Plus, Calendar, MapPin, DollarSign, XCircle, CheckCircle, AlertCircle, Eye } from 'lucide-react'
import { Link } from 'react-router-dom'

const UserDashboard = () => {
  const { user, authFetch, API_BASE_URL } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [runners, setRunners] = useState([])
  const [bookingForm, setBookingForm] = useState({ runnerId: '', service: '', date: '', details: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { fetchBookings() }, [])

  const fetchBookings = async () => {
    setLoading(true)
    try {
      const response = await authFetch(`${API_BASE_URL}/bookings`)
      const data = await response.json()
      if (response.ok) setBookings(data.bookings)
      else setBookings([])
    } catch {
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  const openBookingModal = async () => {
    setShowBookingModal(true)
    // Fetch runners for selection
    const response = await authFetch(`${API_BASE_URL}/runners`)
    const data = await response.json()
    if (response.ok) setRunners(data.runners || [])
  }

  const handleBookingChange = e => {
    setBookingForm({ ...bookingForm, [e.target.name]: e.target.value })
  }

  const submitBooking = async e => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const response = await authFetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        body: JSON.stringify({
          runner_id: bookingForm.runnerId,
          service: bookingForm.service,
          scheduled_date: bookingForm.date,
          description: bookingForm.details
        })
      })
      if (response.ok) {
        setShowBookingModal(false)
        setBookingForm({ runnerId: '', service: '', date: '', details: '' })
        fetchBookings()
      }
    } finally {
      setSubmitting(false)
    }
  }

  const cancelBooking = async (bookingId) => {
    await authFetch(`${API_BASE_URL}/bookings/${bookingId}/cancel`, { method: 'POST' })
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-blue-900">Welcome, {user.first_name}!</h1>
          <Button onClick={openBookingModal} className="flex items-center gap-2 bg-blue-600 text-white">
            <Plus className="h-5 w-5" /> Book a Runner
          </Button>
        </div>
        <h2 className="text-xl font-semibold mb-4 text-blue-800">Your Bookings</h2>
        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div></div>
        ) : bookings.length === 0 ? (
          <Card><CardContent className="text-center py-8">No bookings yet. Click 'Book a Runner' to get started!</CardContent></Card>
        ) : (
          <div className="space-y-4">
            {bookings.map(booking => (
              <Card key={booking.id}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{booking.title || 'Booking'}</CardTitle>
                    <div className="text-sm text-gray-500">with {booking.runner?.user?.first_name} {booking.runner?.user?.last_name}</div>
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
                    {booking.status === 'pending' && <Button variant="destructive" size="sm" onClick={() => cancelBooking(booking.id)}><XCircle className="h-4 w-4 mr-1" />Cancel</Button>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        {/* Booking Modal */}
        {showBookingModal && (
          <Modal open={showBookingModal} onClose={() => setShowBookingModal(false)}>
            <form onSubmit={submitBooking} className="p-6 space-y-4">
              <h2 className="text-xl font-bold mb-2">Book a Runner</h2>
              <div>
                <label className="block mb-1 font-medium">Runner</label>
                <select name="runnerId" value={bookingForm.runnerId} onChange={handleBookingChange} required className="w-full border rounded p-2">
                  <option value="">Select a runner</option>
                  {runners.map(r => <option key={r.id} value={r.id}>{r.user.first_name} {r.user.last_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block mb-1 font-medium">Service</label>
                <input name="service" value={bookingForm.service} onChange={handleBookingChange} required className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="block mb-1 font-medium">Date</label>
                <input type="date" name="date" value={bookingForm.date} onChange={handleBookingChange} required className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="block mb-1 font-medium">Details</label>
                <textarea name="details" value={bookingForm.details} onChange={handleBookingChange} className="w-full border rounded p-2" />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowBookingModal(false)}>Cancel</Button>
                <Button type="submit" disabled={submitting} className="bg-blue-600 text-white">{submitting ? 'Booking...' : 'Book'}</Button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </div>
  )
}

export default UserDashboard 