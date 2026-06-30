import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Mail, Clock, Award, Users, Truck, Shield } from "lucide-react";

function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Poppins:wght@400;500;600;700;800&display=swap');
        
        * {
          font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        
        h1, h2, h3, h4, h5, h6 {
          font-family: 'Poppins', sans-serif;
          font-weight: 700;
        }
      `}</style>

      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            About Asal Pasal
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Your trusted online marketplace for quality products. We bring you the best deals on electronics, fashion, home goods, and more, right to your doorstep.
          </p>
        </div>

        {/* Mission Section */}
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-2xl text-white flex items-center gap-3">
                <Award className="w-8 h-8 text-purple-400" />
                Our Mission
              </CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300">
              <p className="leading-relaxed">
                At Asal Pasal, our mission is to revolutionize online shopping in Nepal by providing an unparalleled e-commerce experience. We strive to connect customers with high-quality products while ensuring convenience, affordability, and exceptional customer service.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-2xl text-white flex items-center gap-3">
                <Users className="w-8 h-8 text-pink-400" />
                Our Vision
              </CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300">
              <p className="leading-relaxed">
                To become Nepal's leading e-commerce platform, fostering trust, innovation, and community. We envision a future where shopping online is seamless, secure, and enjoyable for every Nepali household.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="bg-slate-800/50 border-slate-700 text-center">
            <CardContent className="pt-8">
              <Truck className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Fast Delivery</h3>
              <p className="text-slate-300">
                Quick and reliable delivery across Nepal with real-time tracking and secure packaging.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 text-center">
            <CardContent className="pt-8">
              <Shield className="w-16 h-16 text-pink-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Secure Shopping</h3>
              <p className="text-slate-300">
                Your security is our priority. We use advanced encryption and secure payment gateways.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 text-center">
            <CardContent className="pt-8">
              <Award className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Quality Assurance</h3>
              <p className="text-slate-300">
                All products are carefully selected and verified to ensure the highest quality standards.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Team Section */}
        {/* Team Section */}
<div className="text-center mb-16">
  <h2 className="text-4xl font-bold text-white mb-8">Meet Our Team</h2>
  <div className="grid md:grid-cols-4 gap-8">
    
    <Card className="bg-slate-800/50 border-slate-700">
      <CardContent className="pt-8">
        <img
          src="https://randomuser.me/api/portraits/men/32.jpg"
          alt="Ritesh Aryal"
          className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
        />
        <h3 className="text-xl font-semibold text-white mb-2">Ritesh Aryal</h3>
        <Badge className="bg-purple-500 text-white mb-3">Co-Founder</Badge>
        <p className="text-slate-300 text-sm">
          Lead visionary responsible for strategy, product direction, and growth.
        </p>
      </CardContent>
    </Card>

    <Card className="bg-slate-800/50 border-slate-700">
      <CardContent className="pt-8">
        <img
          src="https://randomuser.me/api/portraits/men/45.jpg"
          alt="Bimarsh Mahat"
          className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
        />
        <h3 className="text-xl font-semibold text-white mb-2">Bimarsh Mahat</h3>
        <Badge className="bg-purple-500 text-white mb-3">Co-Founder</Badge>
        <p className="text-slate-300 text-sm">
          Focused on operations, logistics, and platform efficiency.
        </p>
      </CardContent>
    </Card>

    <Card className="bg-slate-800/50 border-slate-700">
      <CardContent className="pt-8">
        <img
          src="https://randomuser.me/api/portraits/men/46.jpg"
          alt="Riwaj Ghimire"
          className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
        />
        <h3 className="text-xl font-semibold text-white mb-2">Riwaj Ghimire</h3>
        <Badge className="bg-purple-500 text-white mb-3">Co-Founder</Badge>
        <p className="text-slate-300 text-sm">
          Handles system architecture, development, and scalability.
        </p>
      </CardContent>
    </Card>

    <Card className="bg-slate-800/50 border-slate-700">
      <CardContent className="pt-8">
        <img
          src="https://randomuser.me/api/portraits/women/45.jpg"
          alt="Aavha Bhandari"
          className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
        />
        <h3 className="text-xl font-semibold text-white mb-2">Aavha Bhandari</h3>
        <Badge className="bg-pink-500 text-white mb-3">Co-Founder</Badge>
        <p className="text-slate-300 text-sm">
          Leads branding, user experience, and customer engagement.
        </p>
      </CardContent>
    </Card>

  </div>
</div>


        {/* Contact Section */}
        <Card className="bg-slate-800/50 border-slate-700 mb-16">
          <CardHeader>
            <CardTitle className="text-3xl text-white text-center">Get In Touch</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <MapPin className="w-6 h-6 text-purple-400" />
                  <div>
                    <h4 className="text-white font-semibold">Address</h4>
                    <p className="text-slate-300">Thamel, Kathmandu, Nepal</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Phone className="w-6 h-6 text-pink-400" />
                  <div>
                    <h4 className="text-white font-semibold">Phone</h4>
                    <p className="text-slate-300">+977-1-1234567</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Mail className="w-6 h-6 text-purple-400" />
                  <div>
                    <h4 className="text-white font-semibold">Email</h4>
                    <p className="text-slate-300">asalpasal@gmail.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Clock className="w-6 h-6 text-pink-400" />
                  <div>
                    <h4 className="text-white font-semibold">Business Hours</h4>
                    <p className="text-slate-300">Sun-Fri: 9AM-9PM, Sat: 10AM-8PM</p>
                  </div>
                </div>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-6">
                <h4 className="text-white font-semibold mb-4">Send us a message</h4>
                <form className="space-y-4">
                  <input
                    type="text"
                    placeholder="Your Name"
                    className="w-full p-3 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-400"
                  />
                  <input
                    type="email"
                    placeholder="Your Email"
                    className="w-full p-3 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-400"
                  />
                  <textarea
                    rows="4"
                    placeholder="Your Message"
                    className="w-full p-3 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-400 resize-none"
                  ></textarea>
                  <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3">
                    Send Message
                  </Button>
                </form>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Section */}
        <div className="grid md:grid-cols-4 gap-6 text-center">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-purple-400 mb-2">50K+</div>
              <p className="text-slate-300">Happy Customers</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-pink-400 mb-2">10K+</div>
              <p className="text-slate-300">Products Available</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-purple-400 mb-2">100+</div>
              <p className="text-slate-300">Partner Brands</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-pink-400 mb-2">7</div>
              <p className="text-slate-300">Cities Covered</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default AboutPage;