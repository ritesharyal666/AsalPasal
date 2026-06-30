import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, MapPin, Phone, Mail } from "lucide-react";

function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800">
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
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white">Asal Pasal</h3>
            <p className="text-slate-300 leading-relaxed">
              Your trusted online marketplace for quality products in Nepal. We bring you the best deals on electronics, fashion, home goods, and more.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-slate-400 hover:text-purple-400 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-pink-400 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-purple-400 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/shop/home" className="text-slate-300 hover:text-purple-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/shop/listing" className="text-slate-300 hover:text-purple-400 transition-colors">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/shop/about" className="text-slate-300 hover:text-purple-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/shop/terms-and-conditions" className="text-slate-300 hover:text-purple-400 transition-colors">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Categories</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-slate-300 hover:text-pink-400 transition-colors">
                  Electronics
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-300 hover:text-pink-400 transition-colors">
                  Fashion
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-300 hover:text-pink-400 transition-colors">
                  Home & Garden
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-300 hover:text-pink-400 transition-colors">
                  Sports & Outdoors
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <span className="text-slate-300 text-sm">Thamel, Kathmandu, Nepal</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-pink-400 flex-shrink-0" />
                <span className="text-slate-300 text-sm">+977-1-1234567</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <span className="text-slate-300 text-sm">asalpasal@gmail.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-8 text-center">
          <p className="text-slate-400 text-sm">
            © 2025 Asal Pasal. All rights reserved. |
            <Link to="/shop/terms-and-conditions" className="text-purple-400 hover:text-pink-400 transition-colors ml-1">
              Terms and Conditions
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;