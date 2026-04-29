import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Users, BarChart2, CreditCard, Loader2, 
  Search, ExternalLink, Mail, Phone, Calendar
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/api';

const fetchTopSpenders  = () => api.get('/reports/customers/top-spenders').then(r => r.data);
const fetchRegulars     = () => api.get('/reports/customers/regulars').then(r => r.data);
const fetchPendingCredits = () => api.get('/reports/customers/pending-credits').then(r => r.data);

const TABS = [
  { id: 'top-spenders', label: 'Top Spenders', icon: BarChart2, color: 'text-violet-600', bg: 'bg-violet-50' },
  { id: 'regulars',     label: 'Regulars',     icon: Users,      color: 'text-blue-600',   bg: 'bg-blue-50' },
  { id: 'pending',      label: 'Pending Credit', icon: CreditCard, color: 'text-red-600',    bg: 'bg-red-50' },
];

export default function StaffReportsPage() {
  const [activeTab, setActiveTab] = useState('top-spenders');
  const [search, setSearch] = useState('');

  const { data: topSpenders = [], isLoading: tsLoading } = useQuery({ queryKey: ['reports-top-spenders'], queryFn: fetchTopSpenders });
  const { data: regulars    = [], isLoading: rLoading  } = useQuery({ queryKey: ['reports-regulars'],     queryFn: fetchRegulars });
  const { data: pending     = [], isLoading: pLoading  } = useQuery({ queryKey: ['reports-pending'],      queryFn: fetchPendingCredits });

  const getData = () => {
    switch(activeTab) {
      case 'top-spenders': return topSpenders;
      case 'regulars':     return regulars;
      case 'pending':      return pending;
      default: return [];
    }
  };

  const isLoading = tsLoading || rLoading || pLoading;
  const filtered = getData().filter(c => c.fullName.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Staff Intelligence</h1>
          <p className="text-sm text-slate-500 mt-1">Customer-centric insights for service planning</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-2xl w-fit">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <tab.icon size={16} className={activeTab === tab.id ? tab.color : 'text-slate-400'} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
           <div className="relative max-w-sm w-full">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                placeholder="Filter results..." 
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs bg-white outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
           </div>
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{filtered.length} entries</p>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400">
               <Loader2 size={32} className="animate-spin mb-4" />
               <p className="font-medium text-xs uppercase tracking-widest">Aggregating records...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-24 text-center text-slate-300">
               <Users size={48} className="mx-auto mb-4 opacity-20" />
               <p className="text-sm font-medium">No customers found in this category.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                <tr>
                  <th className="px-8 py-4 text-left">Customer</th>
                  <th className="px-8 py-4 text-left">Contact</th>
                  {activeTab === 'top-spenders' && <th className="px-8 py-4 text-right">Total Revenue</th>}
                  {activeTab === 'regulars' && <th className="px-8 py-4 text-center">Visit Count</th>}
                  {activeTab === 'pending' && (
                    <>
                      <th className="px-8 py-4 text-right">Owed Amount</th>
                      <th className="px-8 py-4 text-center">Days Overdue</th>
                    </>
                  )}
                  <th className="px-8 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((c) => (
                  <tr key={c.customerId} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5">
                       <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black uppercase ${TABS.find(t => t.id === activeTab).bg} ${TABS.find(t => t.id === activeTab).color}`}>
                             {c.fullName.charAt(0)}
                          </div>
                          <span className="font-bold text-slate-800">{c.fullName}</span>
                       </div>
                    </td>
                    <td className="px-8 py-5">
                       <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                             <Mail size={12} className="text-slate-300" /> {c.email}
                          </div>
                          {c.phone && (
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                               <Phone size={12} className="text-slate-300" /> {c.phone}
                            </div>
                          )}
                       </div>
                    </td>
                    
                    {activeTab === 'top-spenders' && (
                      <td className="px-8 py-5 text-right font-black text-violet-600">
                         ${Number(c.totalSpent).toFixed(2)}
                      </td>
                    )}
                    
                    {activeTab === 'regulars' && (
                      <td className="px-8 py-5 text-center">
                         <span className="inline-flex px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-widest">
                            {c.purchaseCount || c.visitCount || 0} Trips
                         </span>
                      </td>
                    )}

                    {activeTab === 'pending' && (
                      <>
                        <td className="px-8 py-5 text-right font-black text-red-600">
                           ${Number(c.creditBalance).toFixed(2)}
                        </td>
                        <td className="px-8 py-5 text-center">
                           <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-slate-400">
                              <Calendar size={12} /> {c.daysOverdue || 0}d
                           </div>
                        </td>
                      </>
                    )}

                    <td className="px-8 py-5 text-right">
                       <Link 
                        to={`/staff/customers/${c.customerId}`}
                        className="p-2 rounded-lg text-slate-300 hover:text-blue-600 hover:bg-blue-50 transition-all inline-flex"
                       >
                         <ExternalLink size={16} />
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
