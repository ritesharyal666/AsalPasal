import { HousePlug, LogOut, Menu, Search, ShoppingCart, UserCog } from "lucide-react";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import { shoppingViewHeaderMenuItems } from "@/config";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { logoutUser } from "@/store/auth-slice";
import UserCartWrapper from "./cart-wrapper";
import { useEffect, useState } from "react";
import { fetchCartItems } from "@/store/shop/cart-slice";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import logo from "../../assets/logo.png";

function MenuItems() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  function handleNavigate(getCurrentMenuItem) {
    // Clear previous filters
    sessionStorage.removeItem("filters");

    // Only treat the click as a category filter when the target path is the listing
    // and the menu item is intended to represent a category (i.e. points to listing)
    const isListingTarget = getCurrentMenuItem.path === "/shop/listing";

    if (isListingTarget) {
      // Only set a category filter when the menu item id actually represents a category
      // (exclude special ids like 'home' and 'products')
      const isCategoryId =
        getCurrentMenuItem.id !== "home" && getCurrentMenuItem.id !== "products";

      if (isCategoryId) {
        const currentFilter = { category: [getCurrentMenuItem.id] };
        sessionStorage.setItem("filters", JSON.stringify(currentFilter));

        if (location.pathname.includes("listing")) {
          setSearchParams(new URLSearchParams(`?category=${getCurrentMenuItem.id}`));
        } else {
          navigate("/shop/listing");
        }

        return;
      }

      // Not a category id (e.g. 'products') -> navigate to listing without filters
      navigate("/shop/listing");
      return;
    }

    // Default behavior: navigate to the explicit path (About, Home, etc.)
    navigate(getCurrentMenuItem.path);
  }

  return (
    <nav className="flex flex-col mb-3 lg:mb-0 lg:items-center gap-8 lg:flex-row">
      {shoppingViewHeaderMenuItems.filter(item => item.id !== 'search').map((menuItem) => (
        <Label
          onClick={() => handleNavigate(menuItem)}
          className="text-base font-semibold cursor-pointer text-slate-200 hover:text-white transition-colors duration-200 relative group"
          key={menuItem.id}
        >
          {menuItem.label}
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 group-hover:w-full transition-all duration-300"></span>
        </Label>
      ))}
    </nav>
  );
}

function HeaderRightContent() {
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const [openCartSheet, setOpenCartSheet] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  function handleLogout() {
    dispatch(logoutUser());
  }

  useEffect(() => {
    dispatch(fetchCartItems(user?.id));
  }, [dispatch]);

  

  return (
    <div className="flex lg:items-center lg:flex-row flex-col gap-5">
      <Sheet open={openCartSheet} onOpenChange={() => setOpenCartSheet(false)}>
        <Button
          onClick={() => setOpenCartSheet(true)}
          variant="outline"
          size="icon"
          className="relative bg-slate-900/50 border-slate-700 hover:bg-slate-800 hover:border-slate-600 text-slate-200 hover:text-white transition-all duration-300 backdrop-blur-sm w-12 h-12"
        >
          <ShoppingCart className="w-6 h-6" />
          {cartItems?.items?.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
              {cartItems.items.length}
            </span>
          )}
          <span className="sr-only">User cart</span>
        </Button>
        <UserCartWrapper
          setOpenCartSheet={setOpenCartSheet}
          cartItems={
            cartItems && cartItems.items && cartItems.items.length > 0
              ? cartItems.items
              : []
          }
        />
      </Sheet>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar className="bg-gradient-to-br from-purple-600 to-pink-600 cursor-pointer hover:scale-110 transition-transform duration-300 ring-2 ring-slate-700 hover:ring-slate-600 w-11 h-11">
            <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-600 text-white font-bold text-xl">
              {user?.userName[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" className="w-64 bg-slate-900 border-slate-700 text-slate-200">
          <DropdownMenuLabel className="text-slate-200 text-base py-3">Logged in as {user?.userName}</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-slate-700" />
          <DropdownMenuItem 
            onClick={() => navigate("/shop/account")}
            className="cursor-pointer hover:bg-slate-800 focus:bg-slate-800 text-slate-200 hover:text-white py-3 text-base"
          >
            <UserCog className="mr-3 h-5 w-5" />
            Account
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-slate-700" />
          <DropdownMenuItem 
            onClick={handleLogout}
            className="cursor-pointer hover:bg-slate-800 focus:bg-slate-800 text-slate-200 hover:text-white py-3 text-base"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function ShoppingHeader() {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  function handleSearch() {
    if (searchQuery.trim()) {
      navigate(`/shop/listing?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  }

  function handleKeyPress(e) {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Poppins:wght@400;500;600;700;800&display=swap');
        
        * {
          font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
      `}</style>
      
      <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/95 backdrop-blur-md shadow-lg shadow-slate-950/50">
        <div className="flex h-20 items-center justify-between px-6 md:px-8">
          {/* Logo */}
          <Link to="/shop/home" className="flex items-center group">
            <img 
              src={logo} 
              alt="Logo" 
              className="h-12 w-auto group-hover:scale-105 transition-transform duration-300"
            />
          </Link>
          
          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <Input
                type="text"
                placeholder="Search for products, brands and more..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full h-12 pl-5 pr-12 bg-slate-900/50 border-slate-700 text-slate-100 text-base placeholder:text-slate-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 rounded-full transition-all duration-300"
              />
              <Button
                onClick={handleSearch}
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1 h-10 w-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white transition-all duration-300"
              >
                <Search className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden bg-slate-900/50 border-slate-700 hover:bg-slate-800 text-slate-200 hover:text-white w-11 h-11">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle header menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full max-w-xs bg-slate-950 border-slate-800">
              {/* Mobile Search */}
              <div className="mb-6">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full h-12 pl-5 pr-12 bg-slate-900/50 border-slate-700 text-slate-100 text-base placeholder:text-slate-400 focus:border-purple-500 rounded-full"
                  />
                  <Button
                    onClick={handleSearch}
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1 h-10 w-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                  >
                    <Search className="w-5 h-5" />
                  </Button>
                </div>
              </div>
              <MenuItems />
              <HeaderRightContent />
            </SheetContent>
          </Sheet>
          
          {/* Desktop Menu */}
          <div className="hidden lg:block">
            <MenuItems />
          </div>

          {/* Desktop Right Content */}
          <div className="hidden lg:block">
            <HeaderRightContent />
          </div>
        </div>
      </header>
    </>
  );
}

export default ShoppingHeader;