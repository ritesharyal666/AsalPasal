import ProductImageUpload from "@/components/admin-view/image-upload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { addFeatureImage, getFeatureImages } from "@/store/common-slice";
import { getFailedPayments } from "@/store/shop/order-slice";
import { getAllPaymentsForAdmin, getFailedPaymentsForAdmin } from "@/store/admin/order-slice";
import { getImageUrl } from "@/utils/imageHelper";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useToast } from "@/components/ui/use-toast";
import { Trash2, Users, ShoppingCart, DollarSign, TrendingUp, Calendar, BarChart3, XCircle, AlertTriangle, CreditCard, CheckCircle, Clock } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  // FIXED: State initialized as arrays to support multiple images and prevent .length crashes
  const [imageFiles, setImageFiles] = useState([]);
  const [uploadedImageUrls, setUploadedImageUrls] = useState([]);
  const [imageLoadingState, setImageLoadingState] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [paymentData, setPaymentData] = useState({
    totalPayments: 0,
    successfulPayments: 0,
    failedPayments: 0,
    pendingPayments: 0
  });
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { featureImageList } = useSelector((state) => state.commonFeature);
  const { failedPayments } = useSelector((state) => state.shopOrder);
  const { paymentList } = useSelector((state) => state.adminOrder);
  const { toast } = useToast();

  async function handleUploadFeatureImage() {
    // Check if any images have been uploaded to the server/state yet
    if (uploadedImageUrls.length === 0) {
      toast({
        title: "Error",
        description: "Please upload at least one image first",
        variant: "destructive",
      });
      return;
    }

    if (imageLoadingState) {
      toast({
        title: "Please wait",
        description: "Images are still uploading...",
        variant: "destructive",
      });
      return;
    }

    try {
      // Loop through all uploaded URLs and add them as feature images
      const uploadPromises = uploadedImageUrls.map((url) => 
        dispatch(addFeatureImage(url))
      );

      const results = await Promise.all(uploadPromises);
      
      // Check if all dispatches were successful
      const allSuccess = results.every(result => result?.payload?.success);

      if (allSuccess) {
        dispatch(getFeatureImages());
        setImageFiles([]); // Reset local files
        setUploadedImageUrls([]); // Reset URLs
        toast({
          title: "Success",
          description: "All feature images added successfully",
        });
      } else {
        toast({
          title: "Partial Success",
          description: "Some images failed to save. Please check the list.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred during upload",
        variant: "destructive",
      });
    }
  }

  // Delete feature image
  async function handleDeleteFeatureImage(imageId) {
    if (!confirm("Are you sure you want to delete this image?")) return;

    try {
      const response = await axios.delete(
        `http://localhost:5000/api/common/feature/delete/${imageId}`
      );

      if (response.data.success) {
        dispatch(getFeatureImages());
        toast({
          title: "Success",
          description: "Image deleted successfully",
        });
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Error",
        description: "Failed to delete image",
        variant: "destructive",
      });
    }
  }

  useEffect(() => {
    dispatch(getFeatureImages());
    fetchDashboardData();
    // Fetch payment data from admin store
    console.log('Dashboard: Fetching payments...');
    dispatch(getAllPaymentsForAdmin({ page: 1, limit: 100 }))
      .then((result) => {
        console.log('Dashboard: Payment fetch result:', result);
      })
      .catch((error) => {
        console.error('Dashboard: Payment fetch error:', error);
      });
    dispatch(getFailedPaymentsForAdmin())
      .then((result) => {
        console.log('Dashboard: Failed payments result:', result);
      })
      .catch((error) => {
        console.error('Dashboard: Failed payments error:', error);
      });
    fetchPaymentAnalytics();
  }, [dispatch]);

  // Update payment analytics whenever paymentList changes
  // Removed - now fetching directly from API

  const fetchDashboardData = async () => {
    try {
      setDashboardLoading(true);
      const response = await axios.get('http://localhost:5000/api/admin/dashboard/get');
      if (response.data.success) {
        setDashboardData(response.data.data);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch dashboard data",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Dashboard fetch error:", error);
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data",
        variant: "destructive",
      });
    } finally {
      setDashboardLoading(false);
    }
  };

  const fetchPaymentAnalytics = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/dashboard/payments/analytics');
      if (response.data.success) {
        setPaymentData(response.data.data);
      } else {
        console.error('Failed to fetch payment analytics:', response.data.message);
        // Fallback to calculation from paymentList
        if (!Array.isArray(paymentList)) {
          setPaymentData({
            totalPayments: 0,
            successfulPayments: 0,
            failedPayments: 0,
            pendingPayments: 0
          });
          return;
        }

        const total = paymentList.length;
        const successful = paymentList.filter(p => p.status?.toLowerCase() === 'completed' || p.status?.toLowerCase() === 'success').length;
        const failed = paymentList.filter(p => p.status?.toLowerCase() === 'failed').length;
        const pending = paymentList.filter(p => p.status?.toLowerCase() === 'pending').length;

        setPaymentData({
          totalPayments: total,
          successfulPayments: successful,
          failedPayments: failed,
          pendingPayments: pending
        });
      }
    } catch (error) {
      console.error("Payment analytics fetch error:", error);
      // Fallback to calculation from paymentList
      if (!Array.isArray(paymentList)) {
        setPaymentData({
          totalPayments: 0,
          successfulPayments: 0,
          failedPayments: 0,
          pendingPayments: 0
        });
        return;
      }

      const total = paymentList.length;
      const successful = paymentList.filter(p => p.status?.toLowerCase() === 'completed' || p.status?.toLowerCase() === 'success').length;
      const failed = paymentList.filter(p => p.status?.toLowerCase() === 'failed').length;
      const pending = paymentList.filter(p => p.status?.toLowerCase() === 'pending').length;

      setPaymentData({
        totalPayments: total,
        successfulPayments: successful,
        failedPayments: failed,
        pendingPayments: pending
      });
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
      
      {/* Dashboard Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardLoading ? "..." : dashboardData?.totalCustomers || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardLoading ? "..." : dashboardData?.totalOrders || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Rs.{dashboardLoading ? "..." : (dashboardData?.totalEarnings || 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Rs.{dashboardLoading ? "..." : (dashboardData?.totalProfit || 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Orders</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardLoading ? "..." : dashboardData?.monthlyOrders || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Earnings</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Rs.{dashboardLoading ? "..." : (dashboardData?.monthlyEarnings || 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Rs.{dashboardLoading ? "..." : (dashboardData?.monthlyProfit || 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelled Orders</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {dashboardLoading ? "..." : dashboardData?.cancelledOrders || 0}
            </div>
            <p className="text-xs text-muted-foreground">Orders cancelled by customers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected Orders</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {dashboardLoading ? "..." : dashboardData?.rejectedOrders || 0}
            </div>
            <p className="text-xs text-muted-foreground">Orders rejected by admin</p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/admin/payment-logs')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardLoading ? "..." : paymentData?.totalPayments || 0}
            </div>
            <p className="text-xs text-muted-foreground">All payment transactions</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/admin/payment-logs')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful Payments</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {dashboardLoading ? "..." : paymentData?.successfulPayments || 0}
            </div>
            <p className="text-xs text-muted-foreground">Completed successfully</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/admin/payment-logs')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Payments</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {dashboardLoading ? "..." : paymentData?.failedPayments || failedPayments.length}
            </div>
            <p className="text-xs text-muted-foreground">Payment failures</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/admin/payment-logs')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {dashboardLoading ? "..." : paymentData?.pendingPayments || 0}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting completion</p>
          </CardContent>
        </Card>
      </div>

      {/* Failed Payment Alerts */}
      {failedPayments.length > 0 && (
        <Card className="mt-6 border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Payment Failures Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700 mb-4">
              There are {failedPayments.length} failed payment(s) that need attention.
            </p>
            <Button
              variant="outline"
              onClick={() => navigate('/admin/payment-logs')}
              className="border-red-300 text-red-700 hover:bg-red-100"
            >
              View Failed Payments
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Feature Images Section */}
      <div className="border-t pt-8">
        <h2 className="text-2xl font-bold mb-4">Feature Images</h2>
        
        {/* FIXED PROPS: 
            1. Passed plural names (imageFiles, uploadedImageUrls)
            2. Passed isEditMode={false} to stop the 'undefined' log/crash
        */}
        <ProductImageUpload
          imageFiles={imageFiles}
          setImageFiles={setImageFiles}
          uploadedImageUrls={uploadedImageUrls}
          setUploadedImageUrls={setUploadedImageUrls}
          setImageLoadingState={setImageLoadingState}
          imageLoadingState={imageLoadingState}
          isEditMode={false} 
          isCustomStyling={true}
        />

        <Button
          onClick={handleUploadFeatureImage}
          className="mt-5 w-full py-6 text-lg"
          disabled={imageLoadingState || uploadedImageUrls.length === 0}
        >
          {imageLoadingState ? "Processing..." : `Upload ${uploadedImageUrls.length} Image(s)`}
        </Button>

        {/* Display existing Feature Images */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
          {featureImageList && featureImageList.length > 0 ? (
            featureImageList.map((featureImgItem) => (
              <div 
                key={featureImgItem._id} 
                className="relative group border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <img
                  src={getImageUrl(featureImgItem.image)}
                  alt="Feature"
                  className="w-full h-[250px] object-cover"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/400x300?text=Image+Not+Found";
                    e.target.classList.add("opacity-50");
                  }}
                />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDeleteFeatureImage(featureImgItem._id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <p className="col-span-full text-center text-muted-foreground py-10 border-2 border-dashed rounded-lg">
              No feature images found. Upload some above to get started.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;