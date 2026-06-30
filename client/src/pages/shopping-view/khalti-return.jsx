import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { captureKhaltiPayment } from "@/store/shop/order-slice";
import { clearCart } from "@/store/shop/cart-slice";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

function KhaltiReturnPage() {
  const dispatch = useDispatch();
  const location = useLocation();
  const { toast } = useToast();
  const params = new URLSearchParams(location.search);
  const pidx = params.get("pidx");
  const status = params.get("status");
  const transactionId = params.get("transaction_id");

  useEffect(() => {
    if (pidx && status === "Completed") {
      const orderId = JSON.parse(sessionStorage.getItem("currentOrderId"));

      dispatch(captureKhaltiPayment({ pidx, orderId, paymentId: transactionId })).then((data) => {
        if (data?.payload?.success) {
          sessionStorage.removeItem("currentOrderId");
          sessionStorage.removeItem("currentPaymentId");
          dispatch(clearCart());
          toast({
            title: "Payment Successful",
            description: "Your Khalti payment has been processed successfully.",
          });
          window.location.href = "/shop/payment-success";
        } else {
          // Log failed payment attempt
          console.error("Khalti payment failed:", data?.payload);
          toast({
            title: "Payment Failed",
            description: data?.payload?.message || "Payment processing failed. Please try again.",
            variant: "destructive",
          });
        }
      });
    } else if (status === "User canceled") {
      // Handle canceled payment
      sessionStorage.removeItem("currentOrderId");
      toast({
        title: "Payment Canceled",
        description: "You have canceled the payment process.",
        variant: "destructive",
      });
      window.location.href = "/shop/checkout?error=payment_canceled";
    }
  }, [pidx, status, transactionId, dispatch, toast]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {status === "Completed"
            ? "Processing Khalti Payment...Please wait!"
            : status === "User canceled"
            ? "Payment Canceled"
            : "Processing Payment..."}
        </CardTitle>
      </CardHeader>
    </Card>
  );
}

export default KhaltiReturnPage;