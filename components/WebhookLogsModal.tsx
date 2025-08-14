"use client";

import { useState, useEffect } from "react";
import { getWebhookLogs } from "@/lib/api/createWeebhook";
import { toast } from "sonner";

type TriggerRun = {
  id: string;
  createdAt: string;
  triggerId: string;
  metadata: any;
};

type WebhookLogsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  triggerId: string;
  webhookTitle: string;
};

const WebhookLogsModal = ({ isOpen, onClose, triggerId, webhookTitle }: WebhookLogsModalProps) => {
  const [logs, setLogs] = useState<TriggerRun[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && triggerId) {
      fetchLogs();
    }
  }, [isOpen, triggerId]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getWebhookLogs(triggerId, 50);
      //@ts-ignore
      setLogs(result);
    } catch (err) {
      setError("Failed to fetch webhook logs");
      toast.error("Failed to fetch webhook logs");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatMetadata = (metadata: any) => {
    try {
      return JSON.stringify(metadata, null, 2);
    } catch {
      return String(metadata);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50 backdrop-blur-sm p-3 sm:p-4">
      <div className="bg-gradient-to-br from-[#2c2c2e] to-[#1e1e20] rounded-xl sm:rounded-2xl w-full max-w-4xl shadow-2xl border border-[#3a3a3c]/50 animate-in fade-in zoom-in duration-300 max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#00c584]/10 to-transparent p-4 sm:p-6 border-b border-[#3a3a3c]/30 flex-shrink-0">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg sm:text-2xl font-bold text-white">Webhook Logs</h3>
              <p className="text-gray-400 text-xs sm:text-sm mt-0.5 sm:mt-1">{webhookTitle}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchLogs}
                disabled={loading}
                className="h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center rounded-lg sm:rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200 group disabled:opacity-50"
              >
                <svg 
                  className={`w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform ${loading ? 'animate-spin' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <button
                onClick={onClose}
                className="h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center rounded-lg sm:rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200 group"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3 text-gray-400">
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-sm">Loading logs...</span>
              </div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <p className="text-red-400 text-lg font-medium mb-2">Error loading logs</p>
              <p className="text-gray-500 text-sm">{error}</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-400 text-lg font-medium mb-2">No logs found</p>
              <p className="text-gray-500 text-sm">This webhook hasn't been triggered yet.</p>
            </div>
          ) : (
            <div className="p-4 sm:p-6 space-y-3">
              {logs.map((log, index) => (
                <div key={log.id} className="bg-[#1a1a1c] border border-[#2f2f31] rounded-lg p-4 hover:border-[#3a3a3c] transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium text-white">Run #{logs.length - index}</span>
                    </div>
                    <span className="text-xs text-gray-400">{formatDate(log.createdAt)}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16l5-3 5 3V4H7z" />
                      </svg>
                      <span>ID: {log.id}</span>
                    </div>
                    
                    <div>
                      <label className="text-xs font-medium text-gray-300 block mb-1">Metadata:</label>
                      <div className="bg-[#0f0f10] border border-[#2a2a2c] rounded p-3 overflow-x-auto">
                        <pre className="text-xs text-gray-300 whitespace-pre-wrap">
                          {formatMetadata(log.metadata)}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-[#1a1a1c] to-[#1c1c1e] border-t border-[#3a3a3c]/30 flex-shrink-0">
          <div className="flex justify-between items-center text-xs text-gray-400">
            <span>Showing {logs.length} most recent logs</span>
            <span>Auto-refresh available</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebhookLogsModal;
