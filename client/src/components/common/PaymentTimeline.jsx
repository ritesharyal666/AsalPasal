import { CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react";

function PaymentTimeline({ logs }) {
  if (!logs || logs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No payment logs available</p>
      </div>
    );
  }

  // Sort logs by timestamp (newest first for timeline)
  const sortedLogs = [...logs].sort((a, b) =>
    new Date(b.timestamp || b.createdAt) - new Date(a.timestamp || a.createdAt)
  );

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'success':
      case 'successful':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'failed':
      case 'error':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'pending':
      case 'processing':
        return <Clock className="w-5 h-5 text-yellow-400" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'success':
      case 'successful':
        return 'border-green-500 bg-green-500/10';
      case 'failed':
      case 'error':
        return 'border-red-500 bg-red-500/10';
      case 'pending':
      case 'processing':
        return 'border-yellow-500 bg-yellow-500/10';
      default:
        return 'border-gray-500 bg-gray-500/10';
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">Payment Timeline</h3>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-700"></div>

        <div className="space-y-6">
          {sortedLogs.map((log, index) => (
            <div key={log._id || index} className="relative flex items-start gap-4">
              {/* Status icon */}
              <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 ${getStatusColor(log.status)}`}>
                {getStatusIcon(log.status)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pb-6">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-white">{log.action || log.event || 'Payment Event'}</h4>
                  <span className="text-sm text-gray-400">
                    {formatTimestamp(log.timestamp || log.createdAt)}
                  </span>
                </div>

                <p className="text-sm text-gray-300 mb-2">{log.message || log.description}</p>

                {log.metadata && Object.keys(log.metadata).length > 0 && (
                  <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                    <div className="grid grid-cols-1 gap-1 text-xs">
                      {Object.entries(log.metadata).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                          <span className="text-white font-mono">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {log.error && (
                  <div className="mt-2 p-2 bg-red-900/20 border border-red-700/50 rounded text-sm text-red-400">
                    {log.error}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PaymentTimeline;