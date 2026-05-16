import { useQuery } from '@tanstack/react-query';
import { Loader2, LayoutDashboard, Car, DollarSign, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/api';

const fetchProfile  = () => api.get('/auth/profile').then(r => r.data);
const fetchMyVehicles = () => api.get('/customers/me/vehicles').then(r => r.data);
const fetchHistory  = () => api.get('/customers/me/invoices').then(r => r.data);

export default function CustomerDashboard() {
  const { data: profile } = useQuery({ queryKey: ['profile'], queryFn: fetchProfile });
  const { data: vehicles = [] } = useQuery({ queryKey: ['my-vehicles'], queryFn: fetchMyVehicles });
  const { data: invoices = [] } = useQuery({ queryKey: ['my-invoices'], queryFn: fetchHistory });

  const totalSpent = invoices.reduce((s, i) => s + Number(i.totalAmount ?? 0), 0);
  const unpaid     = invoices.filter(i => !i.isPaid).length;

  const cards = [
    { label: 'My Vehicles',    value: vehicles.length, icon: Car,            color: 'bg-blue-500',    to: '/customer/profile' },
    { label: 'Total Invoices', value: invoices.length, icon: DollarSign,     color: 'bg-violet-500',  to: '/customer/history' },
    { label: 'Total Spent',    value: `NPR ${totalSpent.toLocaleString()}`, icon: DollarSign, color: 'bg-emerald-500', to: '/customer/history' },
    { label: 'Unpaid',         value: unpaid,           icon: Calendar,       color: 'bg-rose-500',    to: '/customer/history' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Welcome, {profile?.fullName?.split(' ')[0] ?? 'Customer'} 👋</h1>
        <p className="text-sm text-slate-500 mt-0.5">Here's a summary of your account</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(c => (
          <Link key={c.label} to={c.to} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{c.label}</p>
              <div className={`w-8 h-8 rounded-lg ${c.color} flex items-center justify-center`}>
                <c.icon size={16} className="text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-800">{c.value}</p>
          </Link>
        ))}
      </div>

      {vehicles.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Car size={17} className="text-blue-600" /> My Vehicles
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {vehicles.map(v => (
              <div key={v.id} className="border border-slate-100 rounded-xl px-4 py-3">
                <p className="text-sm font-semibold text-slate-800">
                  {[v.year, v.make, v.model].filter(Boolean).join(' ') || 'Vehicle'}
                </p>
                <p className="text-xs font-mono text-slate-500">{v.licensePlate ?? '—'}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
