import { Outlet } from "react-router-dom";
import logo from "@/assets/logo.png";

function AuthLayout() {
  return (
    <div className="flex min-h-screen w-full geom">
        <div className="hidden lg:flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-gray-800 w-1/2 px-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10"></div>
          <div className="relative z-10 max-w-md space-y-6 text-center text-primary-foreground">
            <div className="flex justify-center">
              <img src={logo} alt="Logo" className="w-64 h-64 object-contain drop-shadow-2xl" />
            </div>
            <h1 className="text-4xl font-bold text-white">
              Welcome to Asal Pasal
            </h1>
            <p className="text-xl text-gray-300">
              Your trusted marketplace for quality products
            </p>
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </div>
    );
  }

export default AuthLayout;