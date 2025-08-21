import Link from 'next/link';
import { Calendar, MessageCircle, Clock, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ChatWidget from '@/components/chat/ChatWidget';
import MargeAvatar from '@/components/chat/MargeAvatar';

// For MVP, we'll use a hardcoded business ID
const DEMO_BUSINESS_ID = '00000000-0000-0000-0000-000000000001';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <MargeAvatar size={40} />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Marge</h1>
                <p className="text-xs text-gray-500">AI Receptionist</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="outline">Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <MargeAvatar size={80} />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            Meet Marge
          </h1>
          <p className="mt-3 text-xl text-gray-600 sm:mt-5 sm:text-2xl">
            Your Trusted AI Receptionist
          </p>
          <p className="mt-5 max-w-md mx-auto text-lg text-gray-500 sm:max-w-2xl">
            The AI receptionist who never takes a coffee break. Available 24/7 to handle your appointment bookings with a warm, professional touch.
          </p>
          <div className="mt-8">
            <Button size="lg" className="text-lg px-8 py-3">
              <MessageCircle className="mr-2" size={20} />
              Chat with Marge
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">What Marge Can Do</h2>
          <p className="mt-4 text-lg text-gray-600">
            Everything a great receptionist should do, powered by AI
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="text-center">
              <Calendar className="mx-auto mb-4 text-blue-600" size={48} />
              <CardTitle>Book Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Schedule appointments through natural conversation. Just tell Marge when you&apos;d like to come in.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Clock className="mx-auto mb-4 text-green-600" size={48} />
              <CardTitle>Check Availability</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Get real-time availability for any date. Marge knows the schedule inside and out.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <MessageCircle className="mx-auto mb-4 text-purple-600" size={48} />
              <CardTitle>Cancel & Reschedule</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Need to change your appointment? Marge handles cancellations and rescheduling with ease.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Shield className="mx-auto mb-4 text-orange-600" size={48} />
              <CardTitle>Remember You</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Returning client? Marge remembers your preferences and history for personalized service.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Demo Business Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Try It Now</h2>
            <p className="mt-4 text-lg text-gray-600">
              Experience Marge with our demo business. Click the chat button to get started!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>🦷 Sunshine Dental Clinic</CardTitle>
                <CardDescription>
                  Healthcare Practice - Dental Services
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p><strong>Hours:</strong> Mon-Fri 9:00 AM - 5:00 PM, Sat 10:00 AM - 2:00 PM</p>
                  <p><strong>Services:</strong> General dentistry, cleanings, checkups</p>
                  <p><strong>Location:</strong> 123 Main St, City, State</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>💅 Bella Beauty Spa</CardTitle>
                <CardDescription>
                  Beauty & Wellness - Spa Services
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p><strong>Hours:</strong> Mon-Fri 9:00 AM - 5:00 PM, Sat 10:00 AM - 2:00 PM</p>
                  <p><strong>Services:</strong> Facials, massages, beauty treatments</p>
                  <p><strong>Location:</strong> 456 Oak Ave, City, State</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center items-center gap-3 mb-4">
              <MargeAvatar size={32} />
              <span className="text-lg font-semibold">Marge AI Receptionist</span>
            </div>
            <p className="text-gray-400">
              Built with ❤️ for businesses that care about their clients
            </p>
          </div>
        </div>
      </footer>

      {/* Chat Widget */}
      <ChatWidget businessId={DEMO_BUSINESS_ID} />
    </div>
  );
}
