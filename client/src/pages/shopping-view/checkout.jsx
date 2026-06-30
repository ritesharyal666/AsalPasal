import Address from "@/components/shopping-view/address";
import { useDispatch, useSelector } from "react-redux";
import UserCartItemsContent from "@/components/shopping-view/cart-items-content";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { createNewOrder } from "@/store/shop/order-slice";
import { fetchCartItems, clearCart } from "@/store/shop/cart-slice";
import { fetchAllFilteredProducts } from "@/store/shop/products-slice";
import { useToast } from "@/components/ui/use-toast";

function ShoppingCheckout() {
  const { cartItems } = useSelector((state) => state.shopCart);
  const { productList } = useSelector((state) => state.shopProducts);
  const { user } = useSelector((state) => state.auth);
  const { approvalURL } = useSelector((state) => state.shopOrder);
  const [currentSelectedAddress, setCurrentSelectedAddress] = useState(null);
  const [isPaymentStart, setIsPaymemntStart] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("paypal");
  const dispatch = useDispatch();
  const { toast } = useToast();

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchCartItems(user.id));
    }
  }, [dispatch, user?.id]);

  useEffect(() => {
    // Fetch products to get stock information for cart items
    if (cartItems?.items?.length > 0) {
      const productIds = cartItems.items.map(item => item.productId);
      // Fetch products with these IDs
      dispatch(fetchAllFilteredProducts({ 
        filterParams: { ids: productIds },
        sortParams: null 
      }));
    }
  }, [dispatch, cartItems?.items]);

  console.log(currentSelectedAddress, "cartItems");

  const totalCartAmount =
    cartItems && cartItems.items && cartItems.items.length > 0
      ? cartItems.items.reduce(
          (sum, currentItem) =>
            sum +
            (currentItem?.salePrice > 0
              ? currentItem?.salePrice
              : currentItem?.price) *
              currentItem?.quantity,
          0
        )
      : 0;

  function handleInitiatePayment() {
    if (cartItems.length === 0) {
      toast({
        title: "Your cart is empty. Please add items to proceed",
        variant: "destructive",
      });
      return;
    }
    
    if (currentSelectedAddress === null) {
      toast({
        title: "Please select one address to proceed.",
        variant: "destructive",
      });
      return;
    }

    const orderData = {
      userId: user?.id,
      cartId: cartItems?._id,
      cartItems: cartItems.items.map((singleCartItem) => ({
        productId: singleCartItem?.productId,
        title: singleCartItem?.title,
        image: singleCartItem?.images?.[0] || singleCartItem?.image,
        price:
          singleCartItem?.salePrice > 0
            ? singleCartItem?.salePrice
            : singleCartItem?.price,
        quantity: singleCartItem?.quantity,
      })),
      addressInfo: {
        addressId: currentSelectedAddress?._id,
        address: currentSelectedAddress?.address,
        city: currentSelectedAddress?.city,
        pincode: currentSelectedAddress?.pincode,
        phone: currentSelectedAddress?.phone,
        notes: currentSelectedAddress?.notes,
      },
      orderStatus: selectedPaymentMethod === "cod" ? "confirmed" : "pending",
      paymentMethod: selectedPaymentMethod,
      paymentStatus: "pending",
      totalAmount: totalCartAmount,
      orderDate: new Date(),
      orderUpdateDate: new Date(),
      paymentId: "",
      payerId: "",
    };

    dispatch(createNewOrder(orderData)).then((data) => {
      console.log(data, "order response");
      if (data?.payload?.success) {
        setIsPaymemntStart(true);
        // Store orderId in sessionStorage for both payment methods
        sessionStorage.setItem(
          "currentOrderId",
          JSON.stringify(data.payload.orderId)
        );
        
        // For COD, redirect to payment success page immediately
        if (selectedPaymentMethod === "cod") {
          dispatch(clearCart());
          window.location.href = "/shop/payment-success";
        }
      } else {
        setIsPaymemntStart(false);
      }
    });
  }

  if (approvalURL && selectedPaymentMethod !== "cod") {
    window.location.href = approvalURL;
  }

  return (
    <div className="flex flex-col min-h-screen text-white">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5 p-5">
        <Address
          selectedId={currentSelectedAddress}
          setCurrentSelectedAddress={setCurrentSelectedAddress}
        />
        <div className="flex flex-col gap-4">
          {cartItems && cartItems.items && cartItems.items.length > 0
            ? cartItems.items.map((item) => (
                <UserCartItemsContent 
                  key={item.productId} 
                  cartItem={item} 
                  productList={productList}
                />
              ))
            : null}
          
          <div className="mt-8 space-y-4">
            <div className="flex justify-between">
              <span className="font-bold">Total</span>
              <span className="font-bold">Rs.{totalCartAmount}</span>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="mt-4 space-y-3">
            <h3 className="font-semibold text-lg">Select Payment Method</h3>
            
            <div className="flex flex-col gap-3">
              {/* PayPal Option */}
              <div
                onClick={() => setSelectedPaymentMethod("paypal")}
                className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedPaymentMethod === "paypal"
                    ? "border-blue-400 bg-blue-900/50 text-blue-100"
                    : "border-gray-600 bg-gray-800/50 hover:border-gray-500 text-gray-200"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="paypal"
                  checked={selectedPaymentMethod === "paypal"}
                  onChange={() => setSelectedPaymentMethod("paypal")}
                  className="mr-3"
                />
                <div className="flex items-center gap-2">
                  <img 
                    src="https://www.paypalobjects.com/webstatic/en_US/i/buttons/PP_logo_h_100x26.png" 
                    alt="PayPal" 
                    className="h-6 w-auto"
                  />
                  <span className="text-sm text-gray-500">(USD)</span>
                </div>
              </div>

              {/* Khalti Option */}
              <div
                onClick={() => setSelectedPaymentMethod("khalti")}
                className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedPaymentMethod === "khalti"
                    ? "border-purple-400 bg-purple-900/50 text-purple-100"
                    : "border-gray-600 bg-gray-800/50 hover:border-gray-500 text-gray-200"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="khalti"
                  checked={selectedPaymentMethod === "khalti"}
                  onChange={() => setSelectedPaymentMethod("khalti")}
                  className="mr-3"
                />
                <div className="flex items-center gap-2">
                  <img 
                    src="https://cdn.brandfetch.io/khalti.com/idkKcPpTJV.png" 
                    alt="Khalti" 
                    className="h-8 w-auto"
                  />
                  <span className="text-sm text-gray-500">(NPR)</span>
                </div>
              </div>

              {/* Cash on Delivery Option */}
              <div
                onClick={() => setSelectedPaymentMethod("cod")}
                className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedPaymentMethod === "cod"
                    ? "border-green-400 bg-green-900/50 text-green-100"
                    : "border-gray-600 bg-gray-800/50 hover:border-gray-500 text-gray-200"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={selectedPaymentMethod === "cod"}
                  onChange={() => setSelectedPaymentMethod("cod")}
                  className="mr-3"
                />
                <div className="flex items-center gap-2">
                  <span className="font-medium">Cash on Delivery</span>
                </div>
              </div>
            </div>
          </div>

          {/* Checkout Button */}
          <div className="mt-4 w-full">
            <Button 
              onClick={handleInitiatePayment} 
              className="w-full"
              disabled={isPaymentStart}
            >
              {isPaymentStart
                ? `Processing ${selectedPaymentMethod === "paypal" ? "PayPal" : selectedPaymentMethod === "khalti" ? "Khalti" : "COD"} Payment...`
                : `Checkout with ${selectedPaymentMethod === "paypal" ? "PayPal" : selectedPaymentMethod === "khalti" ? "Khalti" : "COD"}`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShoppingCheckout;