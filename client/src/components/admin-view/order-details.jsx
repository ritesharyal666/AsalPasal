import { useState } from "react";
import CommonForm from "../common/form";
import { DialogContent } from "../ui/dialog";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllOrdersForAdmin,
  getOrderDetailsForAdmin,
  updateOrderStatus,
} from "@/store/admin/order-slice";
import { getOrderPaymentLogs } from "@/store/shop/order-slice";
import { useToast } from "../ui/use-toast";
import PaymentTimeline from "../common/PaymentTimeline";
import PaymentStatusBadge from "../common/PaymentStatusBadge";
import { Eye } from "lucide-react";

const initialFormData = {
  status: "",
};

function AdminOrderDetailsView({ orderDetails }) {
  const [formData, setFormData] = useState(initialFormData);
  const [showPaymentLogs, setShowPaymentLogs] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const { paymentLogs } = useSelector((state) => state.shopOrder);
  const dispatch = useDispatch();
  const { toast } = useToast();

  console.log(orderDetails, "orderDetailsorderDetails");

  function handleViewPaymentLogs() {
    if (orderDetails?._id) {
      dispatch(getOrderPaymentLogs(orderDetails._id));
      setShowPaymentLogs(!showPaymentLogs);
    }
  }

  function handleUpdateStatus(event) {
    event.preventDefault();
    const { status } = formData;

    dispatch(
      updateOrderStatus({ id: orderDetails?._id, orderStatus: status })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(getOrderDetailsForAdmin(orderDetails?._id));
        dispatch(getAllOrdersForAdmin());
        setFormData(initialFormData);
        toast({
          title: data?.payload?.message,
        });
      }
    });
  }

  return (
    <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
      <div className="grid gap-6">
        <div className="grid gap-2">
          <div className="flex mt-6 items-center justify-between">
            <p className="font-medium">Order ID</p>
            <Label>{orderDetails?._id}</Label>
          </div>
          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium">Order Date</p>
            <Label>{orderDetails?.orderDate.split("T")[0]}</Label>
          </div>
          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium">Order Price</p>
            <Label>Rs.{orderDetails?.totalAmount}</Label>
          </div>
          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium">Payment method</p>
            <Label>{orderDetails?.paymentMethod}</Label>
          </div>
          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium">Payment Status</p>
            <Label>
              <PaymentStatusBadge status={orderDetails?.paymentStatus} />
            </Label>
          </div>
          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium">Payment Logs</p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewPaymentLogs}
              className="flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              {showPaymentLogs ? "Hide" : "View"} Logs
            </Button>
          </div>
          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium">Order Status</p>
            <Label>
              <Badge
                className={`py-1 px-3 ${
                  orderDetails?.orderStatus === "confirmed"
                    ? "bg-green-500"
                    : orderDetails?.orderStatus === "rejected"
                    ? "bg-red-600"
                    : orderDetails?.orderStatus === "cancelled"
                    ? "bg-red-500"
                    : orderDetails?.orderStatus === "delivered"
                    ? "bg-blue-500"
                    : "bg-gray-500"
                }`}
              >
                {orderDetails?.orderStatus}
              </Badge>
            </Label>
          </div>
        </div>

        {/* Payment Logs Section */}
        {showPaymentLogs && (
          <div className="mt-4">
            <Separator className="mb-4" />
            <div className="grid gap-2">
              <div className="font-medium">Payment Timeline</div>
              <PaymentTimeline logs={paymentLogs} />
            </div>
          </div>
        )}

        <Separator />
        <div className="grid gap-4">
          <div className="grid gap-2">
            <div className="font-medium">Customer Information</div>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span>Name:</span>
                <span>{orderDetails?.userId?.firstName} {orderDetails?.userId?.lastName}</span>
              </div>
              <div className="flex justify-between">
                <span>Email:</span>
                <span>{orderDetails?.userId?.email}</span>
              </div>
              <div className="flex justify-between">
                <span>Phone:</span>
                <span>{orderDetails?.userId?.phone}</span>
              </div>
            </div>
          </div>
        </div>
        <Separator />
        <div className="grid gap-4">
          <div className="grid gap-2">
            <div className="font-medium">Order Details</div>
            <ul className="grid gap-3">
              {orderDetails?.cartItems && orderDetails?.cartItems.length > 0
                ? orderDetails?.cartItems.map((item, index) => (
                    <li key={index} className="flex items-center justify-between">
                      <span>Title: {item.title}</span>
                      <span>Quantity: {item.quantity}</span>
                      <span>Price: Rs.{item.price}</span>
                    </li>
                  ))
                : null}
            </ul>
          </div>
        </div>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <div className="font-medium">Shipping Info</div>
            <div className="grid gap-0.5 text-muted-foreground">
              <span>{user.userName}</span>
              <span>{orderDetails?.addressInfo?.address}</span>
              <span>{orderDetails?.addressInfo?.city}</span>
              <span>{orderDetails?.addressInfo?.pincode}</span>
              <span>{orderDetails?.addressInfo?.phone}</span>
              <span>{orderDetails?.addressInfo?.notes}</span>
            </div>
          </div>
        </div>

        <div>
          <CommonForm
            formControls={[
              {
                label: "Order Status",
                name: "status",
                componentType: "select",
                options: [
                  { id: "pending", label: "Pending" },
                  { id: "inProcess", label: "In Process" },
                  { id: "inShipping", label: "In Shipping" },
                  { id: "delivered", label: "Delivered" },
                  { id: "cancelled", label: "Cancelled" },
                  { id: "rejected", label: "Rejected" },
                ],
              },
            ]}
            formData={formData}
            setFormData={setFormData}
            buttonText={"Update Order Status"}
            onSubmit={handleUpdateStatus}
          />
        </div>
      </div>
    </DialogContent>
  );
}

export default AdminOrderDetailsView;
