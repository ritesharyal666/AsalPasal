import { Outlet } from "react-router-dom";
import ShoppingHeader from "./header";
import Footer from "../common/footer";

function ShoppingLayout() {
  return (
    <div className="flex flex-col min-h-screen w-full bg-gradient-to-br from-black via-gray-900 to-gray-800 overflow-hidden">
      {/* common header */}
      <ShoppingHeader />
      <main className="flex flex-col w-full flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default ShoppingLayout;
