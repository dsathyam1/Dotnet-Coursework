import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCircle, Loader2, AlertTriangle, Inbox } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../api/api';

const fetchNotifications = () => api.get('/notifications').then(r => r.data);
const markAsRead = (id) => api.put(`/notifications/${id}/read`).then(r => r.data);

export default function NotificationsPage() {
  const qc = useQueryClient();
  const { data: notifications = [], isLoading, isError } = useQuery({ 
    queryKey: ['notifications-all'], 
    queryFn: fetchNotifications 
  });

  const markReadMut = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      qc.invalidateQueries(['notifications-all']);
      qc.invalidateQueries(['notifications-unread']);
      toast.success('Notification marked as read');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update notification');
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Notifications</h1>
          <p className="text-sm text-slate-500 mt-1">Keep track of system alerts and inventory warnings</p>
        </div>
        <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 shadow-sm">
          {notifications.length} Unread
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
          <Loader2 size={32} className="animate-spin mb-4" />
          <p>Fetching notifications...</p>
        </div>
      ) : isError ? (
        <div className="bg-red-50 border border-red-100 rounded-xl p-8 text-center">
          <p className="text-red-600 font-medium">Failed to load notifications. Please try again later.</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-16 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Inbox size={32} className="text-slate-300" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800">All clear!</h3>
          <p className="text-sm text-slate-500 mt-1">You have no unread notifications at the moment.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {notifications.map((n) => (
            <div key={n.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-start gap-4 transition-all hover:border-blue-300 hover:shadow-md">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} className="text-amber-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-semibold text-slate-800">{n.message}</p>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded">Low Stock</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
              <button 
                onClick={() => markReadMut.mutate(n.id)}
                disabled={markReadMut.isPending}
                className="p-2 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                title="Mark as read"
              >
                {markReadMut.isPending ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={20} />}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
