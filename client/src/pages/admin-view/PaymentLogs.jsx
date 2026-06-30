import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllPaymentsForAdmin, getPaymentLogsForAdmin } from "@/store/admin/order-slice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { Search, Download } from "lucide-react";

function AdminPaymentLogs() {
  const dispatch = useDispatch();
  const { paymentList, paymentLogs, isLoading } = useSelector((state) => state.adminOrder);
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(50);

  useEffect(() => {
    // Fetch payments based on filters
    const params = {
      page: currentPage,
      limit: pageSize,
      status: statusFilter !== "all" ? statusFilter : undefined,
      paymentMethod: methodFilter !== "all" ? methodFilter : undefined
    };
    // Remove undefined values
    Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);
    dispatch(getAllPaymentsForAdmin(params));
  }, [dispatch, statusFilter, methodFilter, currentPage, pageSize]);

  useEffect(() => {
    if (selectedPaymentId) {
      console.log('Fetching logs for payment ID:', selectedPaymentId);
      dispatch(getPaymentLogsForAdmin(selectedPaymentId))
        .then((result) => {
          console.log('Payment logs fetch result:', result);
        })
        .catch((error) => {
          console.error('Payment logs fetch error:', error);
        });
    }
  }, [dispatch, selectedPaymentId]);

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

  const filteredPayments = Array.isArray(paymentList) ? paymentList.filter(payment => {
    const matchesSearch = !searchTerm ||
      payment.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.userId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.user?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  }) : [];

  const exportToCSV = () => {
    const headers = ["Order ID", "Customer Name", "Customer Email", "Amount", "Currency", "Method", "Status", "Transaction ID", "Created At"];
    const csvData = filteredPayments.map(payment => [
      payment.orderId,
      payment.user ? `${payment.user.firstName} ${payment.user.lastName}` : payment.userId,
      payment.user?.email || "N/A",
      payment.amount,
      payment.currency,
      payment.paymentMethod,
      payment.status,
      payment.transactionId || "",
      payment.createdAt ? format(new Date(payment.createdAt), "yyyy-MM-dd HH:mm:ss") : ""
    ]);

    const csvContent = [headers, ...csvData].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payment-logs-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <h1 className="text-3xl font-bold tracking-tight">Payment Logs</h1>
      <p className="text-muted-foreground">Monitor and manage all payment transactions</p>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search by Order ID, Transaction ID, Customer Name, or Email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
                <SelectItem value="khalti">Khalti</SelectItem>
                <SelectItem value="cod">Cash on Delivery</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={exportToCSV}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payment Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Payment Logs ({filteredPayments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No payment logs found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment._id}>
                      <TableCell className="font-mono">
                        {payment.orderId?.slice(-8)}
                      </TableCell>
                      <TableCell>
                        {payment.user ? `${payment.user.firstName} ${payment.user.lastName}` : payment.userId?.slice(-8)}
                      </TableCell>
                      <TableCell>
                        {formatAmount(payment.amount, payment.currency)}
                      </TableCell>
                      <TableCell className="capitalize">
                        {payment.paymentMethod}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(payment.status)}>
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {payment.transactionId || "N/A"}
                      </TableCell>
                      <TableCell>
                        {payment.createdAt ? format(new Date(payment.createdAt), "MMM dd, HH:mm") : "N/A"}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedPaymentId(payment._id)}
                        >
                          View Logs
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Log Details Modal */}
      {selectedPaymentId && (
        <Card className="mt-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Payment Log Details</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedPaymentId(null)}
            >
              ✕
            </Button>
          </CardHeader>
          <CardContent>
            {console.log('Rendering payment logs:', paymentLogs)}
            {paymentLogs.length > 0 ? (
              <div className="space-y-4">
                {paymentLogs.map((log, index) => {
                  console.log('Rendering log item:', log);
                  return (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant={getStatusBadgeVariant(log.status)}>
                          {log.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {log.timestamp ? format(new Date(log.timestamp), "PPP p") : 
                           log.createdAt ? format(new Date(log.createdAt), "PPP p") : "N/A"}
                        </span>
                      </div>
                      <p>{log.message || log.action || `Payment ${log.status}`}</p>
                      {log.metadata && (
                        <pre className="text-xs text-muted-foreground mt-2 bg-muted p-2 rounded overflow-x-auto">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      )}
                      {!log.message && !log.metadata && (
                        <pre className="text-xs text-muted-foreground mt-2 bg-muted p-2 rounded overflow-x-auto">
                          {JSON.stringify(log, null, 2)}
                        </pre>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No detailed logs available for this payment.</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Payment ID: {selectedPaymentId}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default AdminPaymentLogs;