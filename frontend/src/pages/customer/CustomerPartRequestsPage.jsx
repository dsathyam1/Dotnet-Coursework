import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, PackageSearch, Clock, CheckCircle, XCircle } from 'lucide-react';
import api from '../../api/api';
import { toast } from 'react-hot-toast';

const fetchMyRequests = () => api.get('/part-requests/mine').then(r => r.data);

export default function CustomerPartRequestsPage() {
  const qc = useQueryClient();
  const { data: requests = [], isLoading } = useQuery({ 
    queryKey: ['part-requests', 'mine'], 
    queryFn: fetchMyRequests 
  });

  const cancelMut = useMutation({
    mutationFn: (id) => api.patch(`/part-requests/${id}/status`, { status: 'Cancelled' }),
    onSuccess: () => {
      toast.success('Request cancelled successfully.');
      qc.invalidateQueries(['part-requests', 'mine']);
    },
    onError: () => toast.error('Failed to cancel request.')
  });

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Clock size={12} /> Pending</span>;
      case 'approved':
      case 'fulfilled':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle size={12} /> Approved</span>;
      case 'rejected':
      case 'cancelled':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle size={12} /> {status}</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">{status}</span>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">My Part Requests</h1>
        <p className="text-sm text-slate-500 mt-1">Track the status of parts you've requested</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-400">
            <Loader2 size={24} className="animate-spin mb-2" />
            <p className="text-sm">Loading your requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <PackageSearch size={48} className="mb-4 opacity-20" />
            <p className="text-base font-medium text-slate-600">You haven't requested any parts yet</p>
            <p className="text-sm mt-1">Submit a new request from the 'Request Part' page.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4 font-medium">Part Name & Description</th>
                  <th className="px-6 py-4 font-medium">Date Requested</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.map(req => (
                  <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 align-top">
                      <p className="text-sm font-semibold text-slate-800">{req.partName || 'Unknown Part'}</p>
                      {req.description && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{req.description}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 align-top whitespace-nowrap">
                      <p className="text-sm text-slate-600">
                        {new Date(req.requestedAt).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'short', day: 'numeric'
                        })}
                      </p>
                    </td>
                    <td className="px-6 py-4 align-top whitespace-nowrap">
                      {getStatusBadge(req.status)}
                    </td>
                    <td className="px-6 py-4 align-top text-right whitespace-nowrap">
                      {req.status?.toLowerCase() === 'pending' && (
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to cancel this request?')) {
                              cancelMut.mutate(req.id);
                            }
                          }}
                          disabled={cancelMut.isPending}
                          className="text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-50 transition-colors"
                        >
                          Cancel Request
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
