import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { capturePayment } from "@/store/shop/order-slice";
import { clearCart } from "@/store/shop/cart-slice";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

function PaypalReturnPage() {
  const dispatch = useDispatch();
  const location = useLocation();
  const { toast } = useToast();
  const params = new URLSearchParams(location.search);
  const paymentId = params.get("paymentId");
  const payerId = params.get("PayerID");

  useEffect(() => {
    if (paymentId && payerId) {
      const orderId = JSON.parse(sessionStorage.getItem("currentOrderId"));

      dispatch(capturePayment({ paymentId, payerId, orderId })).then((data) => {
        if (data?.payload?.success) {
          sessionStorage.removeItem("currentOrderId");
          sessionStorage.removeItem("currentPaymentId");
          dispatch(clearCart());
          toast({
            title: "Payment Successful",
            description: "Your PayPal payment has been processed successfully.",
          });
          window.location.href = "/shop/payment-success";
        } else {
          // Log failed payment attempt
          console.error("PayPal payment failed:", data?.payload);
          toast({
            title: "Payment Failed",
            description: data?.payload?.message || "Payment processing failed. Please try again.",
            variant: "destructive",
          });
        }
      });
    }
  }, [paymentId, payerId, dispatch, toast]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Processing Payment...Please wait!</CardTitle>
      </CardHeader>
    </Card>
  );
}

export default PaypalReturnPage;
