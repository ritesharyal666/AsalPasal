import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserPaymentLogs } from "@/store/shop/payment-slice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";

function PaymentHistory() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { userPaymentLogs, isLoading } = useSelector((state) => state.shopPayment);
  const { toast } = useToast();
  const [limit, setLimit] = useState(20);

  useEffect(() => {
    if (user?.id) {
      dispatch(getUserPaymentLogs({ userId: user.id, limit }));
    }
  }, [dispatch, user?.id, limit]);

  const getStatusBadgeVariant = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "success":
        return "default";
      case "pending":
        return "secondary";
      case "failed":
      case "cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  const formatAmount = (amount, currency = "NPR") => {
    return `${currency} ${amount?.toLocaleString() || "0"}`;
  };

  const loadMore = () => {
    setLimit(prev => prev + 20);
  };

  if (isLoading && userPaymentLogs.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-400">Loading payment history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Payment History</h1>
        <p className="text-gray-400">View all your payment transactions and their status</p>
      </div>

      {userPaymentLogs.length === 0 ? (
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-gray-400 text-center">
              <p className="text-lg mb-2">No payment history found</p>
              <p className="text-sm">Your payment transactions will appear here</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {userPaymentLogs.map((payment) => (
            <Card key={payment._id} className="bg-gray-900 border-gray-700 hover:border-gray-600 transition-colors">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">
                        Order #{payment.orderId?.slice(-8)}
                      </h3>
                      <Badge variant={getStatusBadgeVariant(payment.status)}>
                        {payment.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-400">
                      <div>
                        <span className="font-medium text-gray-300">Amount:</span>
                        <p className="text-white font-semibold">
                          {formatAmount(payment.amount, payment.currency)}
                        </p>
                      </div>

                      <div>
                        <span className="font-medium text-gray-300">Method:</span>
                        <p className="text-white capitalize">{payment.paymentMethod}</p>
                      </div>

                      <div>
                        <span className="font-medium text-gray-300">Date:</span>
                        <p className="text-white">
                          {payment.createdAt ? format(new Date(payment.createdAt), "PPP") : "N/A"}
                        </p>
                      </div>
                    </div>

                    {payment.transactionId && (
                      <div className="mt-2 text-sm">
                        <span className="font-medium text-gray-300">Transaction ID:</span>
                        <p className="text-gray-400 font-mono">{payment.transactionId}</p>
                      </div>
                    )}

                    {payment.failureReason && (
                      <div className="mt-2 text-sm">
                        <span className="font-medium text-red-400">Failure Reason:</span>
                        <p className="text-red-300">{payment.failureReason}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-600 text-gray-300 hover:bg-gray-800"
                      onClick={() => {
                        // Navigate to order details
                        window.location.href = `/shop/account/order/${payment.orderId}`;
                      }}
                    >
                      View Order
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {userPaymentLogs.length >= limit && (
            <div className="text-center pt-4">
              <Button
                onClick={loadMore}
                disabled={isLoading}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                {isLoading ? "Loading..." : "Load More"}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PaymentHistory;