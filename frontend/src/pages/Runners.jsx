import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Star, MapPin, Clock, DollarSign, Search, Filter } from 'lucide-react'

const Runners = () => {
  const [runners, setRunners] = useState([])
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedService, setSelectedService] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [minRating, setMinRating] = useState('')
  const [maxRate, setMaxRate] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const { API_BASE_URL } = useAuth()

  useEffect(() => {
    fetchRunners()
    fetchServices()
  }, [currentPage, selectedService, selectedCity, minRating, maxRate])

  const fetchRunners = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        per_page: '12'
      })

      if (selectedService) params.append('service_id', selectedService)
      if (selectedCity) params.append('city', selectedCity)
      if (minRating) params.append('min_rating', minRating)
      if (maxRate) params.append('max_rate', maxRate)

      console.log('Fetching runners from:', `${API_BASE_URL}/runners?${params}`)
      const response = await fetch(`${API_BASE_URL}/runners?${params}`)
      const data = await response.json()
      
      console.log('Runners response:', data)

      if (response.ok) {
        setRunners(data.runners || [])
        setTotalPages(data.pages || 1)
      } else {
        console.error('Failed to fetch runners:', data)
        setRunners([])
      }
    } catch (error) {
      console.error('Error fetching runners:', error)
      setRunners([])
    } finally {
      setLoading(false)
    }
  }

  const fetchServices = async () => {
    try {
      console.log('Fetching services from:', `${API_BASE_URL}/services`)
      const response = await fetch(`${API_BASE_URL}/services`)
      const data = await response.json()
      
      console.log('Services response:', data)

      if (response.ok) {
        setServices(data || [])
      } else {
        console.error('Failed to fetch services:', data)
        setServices([])
      }
    } catch (error) {
      console.error('Error fetching services:', error)
      setServices([])
    }
  }

  const filteredRunners = runners.filter(runner => {
    if (!runner || !runner.user) return false
    
    const searchLower = searchTerm.toLowerCase()
    return (
      runner.user.first_name?.toLowerCase().includes(searchLower) ||
      runner.user.last_name?.toLowerCase().includes(searchLower) ||
      runner.city?.toLowerCase().includes(searchLower) ||
      runner.bio?.toLowerCase().includes(searchLower)
    )
  })

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Runners</h1>
          <p className="text-gray-600">
            Discover trusted local service providers in your area
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search runners, cities, or services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={selectedService} onValueChange={setSelectedService}>
              <SelectTrigger>
                <SelectValue placeholder="Service" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Services</SelectItem>
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.id.toString()}>
                    {service.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              placeholder="City"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
            />

            <Select value={minRating} onValueChange={setMinRating}>
              <SelectTrigger>
                <SelectValue placeholder="Min Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any Rating</SelectItem>
                <SelectItem value="4">4+ Stars</SelectItem>
                <SelectItem value="4.5">4.5+ Stars</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="Max Rate ($)"
              type="number"
              value={maxRate}
              onChange={(e) => setMaxRate(e.target.value)}
            />
          </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRunners.map((runner) => (
            <Card key={runner.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={runner.user.profile_image} />
                    <AvatarFallback>
                      {runner.user.first_name[0]}{runner.user.last_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      {runner.user.first_name} {runner.user.last_name}
                    </CardTitle>
                    <div className="flex items-center space-x-1 mt-1">
                      <MapPin className="h-3 w-3 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {runner.city}, {runner.country}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    {renderStars(runner.rating)}
                    <span className="text-sm text-gray-600 ml-1">
                      ({runner.total_reviews})
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="font-semibold text-green-600">
                      ${runner.hourly_rate}/hr
                    </span>
                  </div>
                </div>

                <p className="text-sm text-gray-600 line-clamp-2">
                  {runner.bio}
                </p>

                <div className="flex flex-wrap gap-1">
                  {runner.services.slice(0, 3).map((service) => (
                    <Badge key={service.id} variant="secondary" className="text-xs">
                      {service.name}
                    </Badge>
                  ))}
                  {runner.services.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{runner.services.length - 3} more
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-600">
                      {runner.is_available ? 'Available' : 'Busy'}
                    </span>
                  </div>
                  <Button size="sm" asChild>
                    <Link to={`/runners/${runner.id}`}>
                      View Profile
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredRunners.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No runners found matching your criteria.</p>
            <p className="text-gray-400 mt-2">Try adjusting your search filters.</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8 space-x-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="flex items-center px-4 py-2 text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Runners

