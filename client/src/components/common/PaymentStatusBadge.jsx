import { Badge } from "../ui/badge";

function PaymentStatusBadge({ status }) {
  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'success':
      case 'successful':
        return {
          label: 'Completed',
          className: 'bg-green-600/20 text-green-400 border-green-600/50 hover:bg-green-600/30'
        };
      case 'pending':
      case 'processing':
        return {
          label: 'Pending',
          className: 'bg-yellow-600/20 text-yellow-400 border-yellow-600/50 hover:bg-yellow-600/30'
        };
      case 'failed':
      case 'error':
      case 'cancelled':
        return {
          label: 'Failed',
          className: 'bg-red-600/20 text-red-400 border-red-600/50 hover:bg-red-600/30'
        };
      case 'refunded':
        return {
          label: 'Refunded',
          className: 'bg-blue-600/20 text-blue-400 border-blue-600/50 hover:bg-blue-600/30'
        };
      default:
        return {
          label: status || 'Unknown',
          className: 'bg-gray-600/20 text-gray-400 border-gray-600/50 hover:bg-gray-600/30'
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge
      variant="outline"
      className={`font-medium transition-all duration-200 ${config.className}`}
    >
      {config.label}
    </Badge>
  );
}

export default PaymentStatusBadge;