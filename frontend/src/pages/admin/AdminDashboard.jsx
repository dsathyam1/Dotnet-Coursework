import { useQuery } from '@tanstack/react-query';
import { 
  BarChart2, Users, Package, AlertTriangle, 
  TrendingUp, Loader2, Bell
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/api';

const fetchFinancial = () => api.get('/reports/financial?period=monthly').then(r => r.data);
const fetchNotifications = () => api.get('/notifications').then(r => r.data);
const fetchParts = () => api.get('/parts').then(r => r.data);
const fetchStaff = () => api.get('/admin/staff').then(r => r.data);

export default function AdminDashboard() {
  const { data: financial, isLoading: fLoading } = useQuery({ queryKey: ['report-financial-monthly'], queryFn: fetchFinancial });
  const { data: notifications = [], isLoading: nLoading } = useQuery({ queryKey: ['notifications-unread'], queryFn: fetchNotifications });
  const { data: parts = [], isLoading: pLoading } = useQuery({ queryKey: ['parts-count'], queryFn: fetchParts });
  const { data: staff = [], isLoading: sLoading } = useQuery({ queryKey: ['staff-count'], queryFn: fetchStaff });

  const stats = [
    { 
      label: 'Total Revenue (Monthly)', 
      value: financial ? `$${Number(financial.totalRevenue).toFixed(2)}` : '$0.00', 
      icon: TrendingUp, 
      color: 'bg-emerald-500',
      loading: fLoading
    },
    { 
      label: 'Total Parts', 
      value: parts.length, 
      icon: Package, 
      color: 'bg-blue-500',
      loading: pLoading
    },
    { 
      label: 'Total Staff', 
      value: staff.length, 
      icon: Users, 
      color: 'bg-violet-500',
      loading: sLoading
    },
    { 
      label: 'Low Stock Alerts', 
      value: notifications.length, 
      icon: AlertTriangle, 
      color: 'bg-amber-500',
      loading: nLoading,
      alert: notifications.length > 0
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Admin Overview</h1>
        <Link to="/admin/notifications" className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors">
          <Bell size={20} />
          {notifications.length > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          )}
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, loading, alert }) => (
          <div key={label} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex items-center gap-4 transition-transform hover:scale-[1.02]">
            <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center shrink-0 shadow-lg shadow-${color.split('-')[1]}-200`}>
              <Icon size={24} className="text-white" />
            </div>
            <div className="flex-1">
              {loading ? (
                <Loader2 size={16} className="animate-spin text-slate-400" />
              ) : (
                <p className={`text-2xl font-bold ${alert ? 'text-amber-600' : 'text-slate-800'}`}>{value}</p>
              )}
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions or Recent Activity stubs can go here */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-sm font-semibold text-slate-700 mb-4 uppercase tracking-wider">Top Selling Parts (Monthly)</h3>
          {fLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-slate-400" /></div>
          ) : financial?.topSellingParts?.length > 0 ? (
            <div className="space-y-3">
              {financial.topSellingParts.map((p, i) => (
                <div key={p.partId} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                   <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-400">#{i+1}</span>
                      <p className="text-sm font-medium text-slate-800">{p.partName}</p>
                   </div>
                   <div className="text-right">
                      <p className="text-sm font-bold text-slate-700">{p.totalQuantitySold} sold</p>
                      <p className="text-xs text-slate-500">${Number(p.totalRevenue).toFixed(2)}</p>
                   </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-10">No sales data for this month.</p>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-sm font-semibold text-slate-700 mb-4 uppercase tracking-wider">Recent Notifications</h3>
          {nLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-slate-400" /></div>
          ) : notifications.length > 0 ? (
            <div className="space-y-3">
              {notifications.slice(0, 5).map(n => (
                <div key={n.id} className="p-3 rounded-lg bg-amber-50 border border-amber-100 flex gap-3">
                  <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-900">{n.message}</p>
                    <p className="text-xs text-amber-700 mt-0.5">{new Date(n.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))}
              <Link to="/admin/notifications" className="block text-center text-xs font-semibold text-blue-600 hover:text-blue-700 pt-2 uppercase tracking-wide">View All Notifications</Link>
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-10">No new notifications.</p>
          )}
        </div>
      </div>
    </div>
  );
}
