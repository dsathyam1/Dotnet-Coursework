import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Search, UserPlus, Loader2, ChevronRight, Car, Users } from 'lucide-react';
import api from '../../api/api';

const searchCustomers = (q) => api.get(`/customers/search?q=${encodeURIComponent(q)}`).then(r => r.data);
const fetchCustomers  = () => api.get('/customers').then(r => r.data);

export default function StaffCustomerSearchPage() {
  const [query, setQuery] = useState('');

  const { data: all = [], isLoading: allLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: fetchCustomers,
  });

  const { data: results = [], isLoading: searching } = useQuery({
    queryKey: ['customer-search', query],
    queryFn: () => searchCustomers(query),
    enabled: query.length >= 2,
  });

  const showSearch = query.length >= 2;
  const list = showSearch ? results : all;
  const loading = showSearch ? searching : allLoading;

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Customers</h1>
          <p className="text-sm text-slate-500 mt-0.5">Search or browse all customers</p>
        </div>
        <Link
          to="/staff/customers/new"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
        >
          <UserPlus size={16} /> Register Customer
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by name, phone, ID, plate, or email…"
          className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
        />
      </div>

      {/* Results */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <Loader2 size={20} className="animate-spin mr-2" /> Loading…
          </div>
        ) : list.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <Users size={36} className="mb-2 opacity-30" />
            <p className="text-sm">{query.length >= 2 ? 'No customers match.' : 'No customers registered yet.'}</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {list.map(c => (
              <li key={c.id}>
                <Link
                  to={`/staff/customers/${c.id}`}
                  className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold uppercase shrink-0">
                      {c.fullName?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{c.fullName}</p>
                      <p className="text-xs text-slate-500">{c.email} {c.phone ? `· ${c.phone}` : ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-slate-400">
                    {c.vehicleCount > 0 && (
                      <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                        <Car size={12} /> {c.vehicleCount}
                      </span>
                    )}
                    <ChevronRight size={16} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
