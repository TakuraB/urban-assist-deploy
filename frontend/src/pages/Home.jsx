import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  ShoppingCart, 
  Plane, 
  Truck, 
  Map, 
  Heart, 
  Home as HomeIcon,
  Calendar,
  User,
  Package,
  Users,
  Star,
  Clock,
  Shield
} from 'lucide-react'

const Home = () => {
  const services = [
    { icon: ShoppingCart, title: 'Shopping & Errands', description: 'Grocery shopping, pharmacy runs, and general errands' },
    { icon: Plane, title: 'Airport Pickup/Drop-off', description: 'Transportation to and from airports' },
    { icon: Truck, title: 'Moving & Relocation Help', description: 'Assistance with moving, packing, and relocation' },
    { icon: Map, title: 'City Tours & Sightseeing', description: 'Guided tours and local sightseeing experiences' },
    { icon: Heart, title: 'Pet Care & Walking', description: 'Pet sitting, dog walking, and pet care services' },
    { icon: HomeIcon, title: 'Home Maintenance', description: 'Basic home repairs, cleaning, and maintenance' },
    { icon: Calendar, title: 'Event Setup & Support', description: 'Help with event planning, setup, and coordination' },
    { icon: User, title: 'Personal Assistant', description: 'Administrative tasks, scheduling, and personal assistance' },
    { icon: Package, title: 'Delivery Services', description: 'Package delivery, document courier, and pickup services' },
    { icon: Users, title: 'Elderly Care & Companionship', description: 'Companionship and assistance for elderly individuals' }
  ]

  const features = [
    {
      icon: Star,
      title: 'Verified Runners',
      description: 'All our runners are background-checked and verified for your safety and peace of mind.'
    },
    {
      icon: Clock,
      title: '24/7 Availability',
      description: 'Find help whenever you need it with runners available around the clock.'
    },
    {
      icon: Shield,
      title: 'Secure Payments',
      description: 'Safe and secure payment processing with transparent pricing and no hidden fees.'
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Connect with Local
              <span className="text-blue-600"> Service Providers</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Urban Assist connects you with trusted local runners who can help with errands, 
              transportation, moving, tours, and more. Get things done efficiently and safely.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/runners">Find Runners</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/register">Become a Runner</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Services Available
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From everyday errands to specialized assistance, our runners are here to help
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {services.map((service, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="text-center">
                  <service.icon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <CardTitle className="text-lg">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">
                    {service.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Urban Assist?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We make it easy and safe to get help with your daily tasks
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="bg-blue-100 rounded-full p-6 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  <feature.icon className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of users who trust Urban Assist for their daily needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/register">Sign Up Now</Link>
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600" asChild>
              <Link to="/runners">Browse Runners</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home

