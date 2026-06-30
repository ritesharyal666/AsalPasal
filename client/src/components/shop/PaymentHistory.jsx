import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { getUserPaymentLogs } from "@/store/shop/order-slice";
import PaymentStatusBadge from "../common/PaymentStatusBadge";
import { Calendar, CreditCard, DollarSign, Eye } from "lucide-react";

function PaymentHistory() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { userPaymentLogs, isLoading } = useSelector((state) => state.shopOrder);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    if (user?.id) {
      dispatch(getUserPaymentLogs({ userId: user.id, limit }));
    }
  }, [dispatch, user?.id, limit]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return `Rs. ${parseFloat(amount).toFixed(2)}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 text-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Payment History</h1>
        <p className="text-gray-400">Track all your payment transactions and their status</p>
      </div>

      <div className="space-y-6">
        {userPaymentLogs && userPaymentLogs.length > 0 ? (
          <>
            {userPaymentLogs.map((payment, index) => (
              <Card key={payment._id || index} className="bg-gray-800/50 border-gray-700">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-600/20 rounded-lg">
                        <CreditCard className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <CardTitle className="text-lg text-white">
                          Payment #{payment.paymentId}
                        </CardTitle>
                        <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(payment.createdAt)}
                        </div>
                      </div>
                    </div>
                    <PaymentStatusBadge status={payment.status} />
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-gray-400">Amount:</span>
                      <span className="font-semibold text-white">{formatCurrency(payment.amount)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-blue-400" />
                      <span className="text-sm text-gray-400">Method:</span>
                      <Badge variant="outline" className="border-gray-600 text-gray-300">
                        {payment.paymentMethod?.toUpperCase() || 'N/A'}
                      </Badge>
                    </div>

                    {payment.orderId && (
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-purple-400" />
                        <span className="text-sm text-gray-400">Order:</span>
                        <span className="font-semibold text-white">#{payment.orderId}</span>
                      </div>
                    )}
                  </div>

                  {payment.errorMessage && (
                    <div className="mt-4 p-3 bg-red-900/20 border border-red-700/50 rounded-lg">
                      <p className="text-sm text-red-400">
                        <strong>Error:</strong> {payment.errorMessage}
                      </p>
                    </div>
                  )}

                  {payment.metadata && Object.keys(payment.metadata).length > 0 && (
                    <div className="mt-4">
                      <Separator className="bg-gray-700" />
                      <div className="mt-3">
                        <h4 className="text-sm font-medium text-gray-300 mb-2">Additional Details</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {Object.entries(payment.metadata).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                              <span className="text-white">{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {userPaymentLogs.length >= limit && (
              <div className="text-center pt-4">
                <Button
                  onClick={() => setLimit(prev => prev + 10)}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Load More Payments
                </Button>
              </div>
            )}
          </>
        ) : (
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CreditCard className="w-16 h-16 text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Payment History</h3>
              <p className="text-gray-400 text-center">
                You haven't made any payments yet. Your payment history will appear here once you complete transactions.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default PaymentHistory;