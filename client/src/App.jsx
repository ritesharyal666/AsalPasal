import { Route, Routes } from "react-router-dom";
import AuthLayout from "./components/auth/layout";
import AuthLogin from "./pages/auth/login";
import AuthRegister from "./pages/auth/register";
import VerifyEmail from "./pages/auth/verify-email";
import ForgetPassword from "./pages/auth/forget-password";
import ResetPassword from "./pages/auth/reset-password";
import AdminLayout from "./components/admin-view/layout";
import AdminDashboard from "./pages/admin-view/dashboard";
import AdminProducts from "./pages/admin-view/products";
import AdminOrders from "./pages/admin-view/orders";
import AdminFeatures from "./pages/admin-view/features";
import AdminCategories from "./pages/admin-view/categories";
import AdminBrands from "./pages/admin-view/brands";
import AdminPaymentLogs from "./pages/admin-view/PaymentLogs";
import ShoppingLayout from "./components/shopping-view/layout";
import NotFound from "./pages/not-found";
import ShoppingHome from "./pages/shopping-view/home";
import ShoppingListing from "./pages/shopping-view/listing";
import ShoppingCheckout from "./pages/shopping-view/checkout";
import ShoppingAccount from "./pages/shopping-view/account";
import CheckAuth from "./components/common/check-auth";
import UnauthPage from "./pages/unauth-page";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { checkAuth } from "./store/auth-slice";
import { Skeleton } from "@/components/ui/skeleton";
import PaypalReturnPage from "./pages/shopping-view/paypal-return";
import PaymentSuccessPage from "./pages/shopping-view/payment-success";
import SearchProducts from "./pages/shopping-view/search";
import KhaltiReturnPage from "./pages/shopping-view/khalti-return"; // NEW: Add Khalti return page
import ProductDetailsPage from "./pages/shopping-view/product-details";
import AboutPage from "./pages/shopping-view/about";
import TermsAndConditionsPage from "./pages/shopping-view/terms-and-conditions";

function App() {
  const { user, isAuthenticated, isLoading } = useSelector(
    (state) => state.auth
  );
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  if (isLoading) return <Skeleton className="w-[800] bg-black h-[600px]" />;

  console.log(isLoading, user);

  return (
    <div className="flex flex-col overflow-hidden bg-white">
      <Routes>
        <Route
          path="/"
          element={
            <CheckAuth
              isAuthenticated={isAuthenticated}
              user={user}
            ></CheckAuth>
          }
        />
        <Route
          path="/auth"
          element={
            <CheckAuth isAuthenticated={isAuthenticated} user={user}>
              <AuthLayout />
            </CheckAuth>
          }
        >
          <Route path="login" element={<AuthLogin />} />
          <Route path="register" element={<AuthRegister />} />
          <Route path="forget-password" element={<ForgetPassword />} />
        </Route>
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/admin"
          element={
            <CheckAuth isAuthenticated={isAuthenticated} user={user}>
              <AdminLayout />
            </CheckAuth>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="brands" element={<AdminBrands />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="payments" element={<AdminPaymentLogs />} />
          <Route path="payment-logs" element={<AdminPaymentLogs />} />
          <Route path="features" element={<AdminFeatures />} />
        </Route>
        <Route
          path="/shop"
          element={
            <CheckAuth isAuthenticated={isAuthenticated} user={user}>
              <ShoppingLayout />
            </CheckAuth>
          }
        >
          <Route path="home" element={<ShoppingHome />} />
          <Route path="listing" element={<ShoppingListing />} />
          <Route path="product/:slug" element={<ProductDetailsPage />} />
          <Route path="checkout" element={<ShoppingCheckout />} />
          <Route path="account" element={<ShoppingAccount />} />
          <Route path="paypal-return" element={<PaypalReturnPage />} />
          <Route path="khalti-return" element={<KhaltiReturnPage />} /> {/* NEW: Khalti return route */}
          <Route path="payment-success" element={<PaymentSuccessPage />} />
          <Route path="search" element={<SearchProducts />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="terms-and-conditions" element={<TermsAndConditionsPage />} />
        </Route>
        <Route path="/unauth-page" element={<UnauthPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;