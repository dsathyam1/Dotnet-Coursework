import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Users, Loader2, Car, ChevronRight, UserPlus, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/api';

const searchCustomers = (q) => api.get(`/customers/search?q=${encodeURIComponent(q)}`).then(r => r.data);

export default function StaffCustomerSearchPage() {
  const [query, setQuery] = useState('');
  
  const { data: results = [], isLoading, isFetching } = useQuery({
    queryKey: ['customers-search', query],
    queryFn: () => searchCustomers(query),
    enabled: query.length >= 2,
    placeholderData: (prev) => prev
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Customer Directory</h1>
          <p className="text-sm text-slate-500 mt-1">Search by name, phone, email, or license plate</p>
        </div>
        <Link 
          to="/staff/customers/new" 
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-100 transition-all active:scale-95"
        >
          <UserPlus size={18} /> Register Customer
        </Link>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-2xl">
        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input 
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Start typing to search..."
          className="w-full pl-12 pr-12 py-3.5 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all text-lg font-medium text-slate-700"
        />
        {(isLoading || isFetching) && query.length >= 2 && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <Loader2 size={20} className="animate-spin text-blue-500" />
          </div>
        )}
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          {query.length < 2 ? (
            <div className="py-20 text-center text-slate-400">
               <Search size={48} className="mx-auto mb-4 opacity-20" />
               <p className="font-medium">Enter at least 2 characters to search.</p>
            </div>
          ) : results.length === 0 && !isLoading ? (
            <div className="py-20 text-center text-slate-400">
               <Users size={48} className="mx-auto mb-4 opacity-20" />
               <p className="font-medium">No customers found matching &quot;{query}&quot;.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-left">Customer</th>
                  <th className="px-6 py-4 text-left">Contact Info</th>
                  <th className="px-6 py-4 text-left">Vehicles</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {results.map((c) => (
                  <tr key={c.id} className="hover:bg-blue-50/50 transition-colors group">
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm uppercase">
                             {c.fullName.charAt(0)}
                          </div>
                          <div>
                             <p className="font-bold text-slate-800">{c.fullName}</p>
                             <p className="text-[10px] font-mono text-slate-400 uppercase tracking-tighter">CID-{c.id.toString().padStart(5, '0')}</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="space-y-1">
                          <p className="text-slate-600 font-medium">{c.email}</p>
                          <div className="flex items-center gap-1.5 text-xs text-slate-400">
                             <Phone size={12} /> {c.phone || 'No phone'}
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                       {c.vehicles?.length > 0 ? (
                         <div className="flex flex-wrap gap-1.5">
                            {c.vehicles.map((v, i) => (
                              <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-bold border border-slate-200">
                                <Car size={10} /> {v.numberPlate}
                              </span>
                            ))}
                         </div>
                       ) : (
                         <span className="text-xs text-slate-300 italic">No vehicles</span>
                       )}
                    </td>
                    <td className="px-6 py-4 text-right">
                       <Link 
                        to={`/staff/customers/${c.id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg transition-all"
                       >
                         View Profile <ChevronRight size={14} />
                       </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
