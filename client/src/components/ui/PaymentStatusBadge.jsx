import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react";

function PaymentStatusBadge({ status, showIcon = true }) {
  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "success":
        return {
          variant: "default",
          icon: CheckCircle,
          text: "Completed",
          className: "bg-green-900 text-green-100 border-green-700"
        };
      case "pending":
        return {
          variant: "secondary",
          icon: Clock,
          text: "Pending",
          className: "bg-yellow-900 text-yellow-100 border-yellow-700"
        };
      case "failed":
        return {
          variant: "destructive",
          icon: XCircle,
          text: "Failed",
          className: "bg-red-900 text-red-100 border-red-700"
        };
      case "cancelled":
        return {
          variant: "outline",
          icon: AlertCircle,
          text: "Cancelled",
          className: "border-gray-600 text-gray-300"
        };
      case "processing":
        return {
          variant: "secondary",
          icon: Clock,
          text: "Processing",
          className: "bg-blue-900 text-blue-100 border-blue-700"
        };
      default:
        return {
          variant: "outline",
          icon: AlertCircle,
          text: status || "Unknown",
          className: "border-gray-600 text-gray-300"
        };
    }
  };

  const config = getStatusConfig(status);
  const IconComponent = config.icon;

  return (
    <Badge variant={config.variant} className={config.className}>
      {showIcon && <IconComponent className="w-3 h-3 mr-1" />}
      {config.text}
    </Badge>
  );
}

export default PaymentStatusBadge;