import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'

const RunnersSimple = () => {
  const [runners, setRunners] = useState([])
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const { API_BASE_URL } = useAuth()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      console.log('Fetching from:', API_BASE_URL)
      
      // Fetch runners
      const runnersResponse = await fetch(`${API_BASE_URL}/runners?page=1&per_page=12`)
      const runnersData = await runnersResponse.json()
      console.log('Runners data:', runnersData)
      
      // Fetch services
      const servicesResponse = await fetch(`${API_BASE_URL}/services`)
      const servicesData = await servicesResponse.json()
      console.log('Services data:', servicesData)
      
      if (runnersResponse.ok) {
        setRunners(runnersData.runners || [])
      }
      
      if (servicesResponse.ok) {
        setServices(servicesData || [])
      }
      
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-8">Find Runners</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Services ({services.length})</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {services.map((service) => (
            <div key={service.id} className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-medium">{service.name}</h3>
              <p className="text-sm text-gray-600">{service.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Runners ({runners.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {runners.map((runner) => (
            <div key={runner.id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                  {runner.user?.first_name?.[0]}{runner.user?.last_name?.[0]}
                </div>
                <div>
                  <h3 className="font-semibold">
                    {runner.user?.first_name} {runner.user?.last_name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {runner.city}, {runner.country}
                  </p>
                </div>
              </div>
              
              <p className="text-sm text-gray-700 mb-4">{runner.bio}</p>
              
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-green-600">
                  ${runner.hourly_rate}/hr
                </span>
                <span className="text-sm text-gray-600">
                  ⭐ {runner.rating} ({runner.total_reviews} reviews)
                </span>
              </div>
              
              <div className="mt-4">
                <p className="text-xs text-gray-500 mb-2">Services:</p>
                <div className="flex flex-wrap gap-1">
                  {runner.services?.slice(0, 3).map((service) => (
                    <span key={service.id} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      {service.name}
                    </span>
                  ))}
                  {runner.services?.length > 3 && (
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                      +{runner.services.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {runners.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500">No runners found.</p>
        </div>
      )}
    </div>
  )
}

export default RunnersSimple

