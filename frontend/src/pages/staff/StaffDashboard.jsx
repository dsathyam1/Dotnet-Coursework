import { useQuery } from '@tanstack/react-query';
import { 
  Users, FileText, TrendingUp, Clock, 
  ChevronRight, Calendar, Loader2 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';

const fetchDailyReport = () => api.get('/reports/financial?period=daily').then(r => r.data);
const fetchCustomers = () => api.get('/customers').then(r => r.data);

export default function StaffDashboard() {
  const { currentUser } = useAuth();
  
  const { data: report, isLoading: rLoading } = useQuery({ 
    queryKey: ['report-daily'], 
    queryFn: fetchDailyReport 
  });
  
  const { data: customers = [], isLoading: cLoading } = useQuery({ 
    queryKey: ['customers-all'], 
    queryFn: fetchCustomers 
  });

  const displayName = currentUser?.name || 'Staff Member';

  const stats = [
    { 
      label: "Invoices Today", 
      value: report?.transactionCount ?? 0, 
      icon: FileText, 
      color: "bg-blue-500",
      loading: rLoading
    },
    { 
      label: "Revenue Today", 
      value: report ? `$${Number(report.totalRevenue).toFixed(2)}` : '$0.00', 
      icon: TrendingUp, 
      color: "bg-emerald-500",
      loading: rLoading
    },
    { 
      label: "Total Customers", 
      value: customers.length, 
      icon: Users, 
      color: "bg-violet-500",
      loading: cLoading
    },
    { 
      label: "Appointments", 
      value: "Check", 
      icon: Calendar, 
      color: "bg-amber-500",
      to: "/staff/dashboard" // Placeholder
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Welcome back, {displayName.split(' ')[0]}!</h1>
        <p className="text-slate-500 font-medium mt-1">Here&apos;s what&apos;s happening in the workshop today.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
            <div className={`${stat.color} w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
              <stat.icon size={24} />
            </div>
            <div>
              {stat.loading ? (
                <Loader2 size={24} className="animate-spin text-slate-300" />
              ) : (
                <p className="text-3xl font-black text-slate-900">{stat.value}</p>
              )}
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-2xl shadow-blue-900/20 flex flex-col justify-between">
           <div>
              <h3 className="text-xl font-bold mb-2">Service Terminal</h3>
              <p className="text-slate-400 text-sm mb-8 leading-relaxed">Quickly register new customers or generate sales invoices for parts and services.</p>
           </div>
           <div className="grid grid-cols-2 gap-4">
              <Link to="/staff/customers/new" className="bg-white/10 hover:bg-white/20 p-4 rounded-2xl flex flex-col items-center gap-2 transition-all border border-white/10">
                 <Users size={20} />
                 <span className="text-xs font-bold uppercase tracking-wider">New Customer</span>
              </Link>
              <Link to="/staff/sales/new" className="bg-blue-600 hover:bg-blue-500 p-4 rounded-2xl flex flex-col items-center gap-2 transition-all border border-blue-400 shadow-lg shadow-blue-600/20">
                 <FileText size={20} />
                 <span className="text-xs font-bold uppercase tracking-wider">New Invoice</span>
              </Link>
           </div>
        </div>

        {/* Recent Activity Stub */}
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
           <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-800">Operational Log</h3>
              <Clock size={18} className="text-slate-300" />
           </div>
           <div className="space-y-6">
              {[
                { time: '10:45 AM', action: 'New Invoice #1024', sub: 'Customer: John Doe', type: 'sale' },
                { time: '09:30 AM', action: 'Customer Registered', sub: 'Alice Cooper (SUV #BA-123)', type: 'customer' },
                { time: '08:15 AM', action: 'Stock Alert', sub: 'Brake Pads below 10 units', type: 'alert' },
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                   <div className="text-[10px] font-bold text-slate-400 uppercase w-16 pt-1 shrink-0">{item.time}</div>
                   <div className="flex-1">
                      <p className="text-sm font-bold text-slate-800">{item.action}</p>
                      <p className="text-xs text-slate-500">{item.sub}</p>
                   </div>
                   <ChevronRight size={14} className="text-slate-200 mt-1" />
                </div>
              ))}
           </div>
           <button className="w-full mt-8 py-3 rounded-2xl border border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-widest hover:bg-slate-50 transition-colors">View Full Activity</button>
        </div>
      </div>
    </div>
  );
}
