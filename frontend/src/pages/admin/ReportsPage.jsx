import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, BarChart2, TrendingUp, Users, CreditCard, Package, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import api from '../../api/api';

const fetchFinancial    = (period) => api.get(`/reports/financial?period=${period}`).then(r => r.data);
const fetchTopSpenders  = () => api.get('/reports/customers/top-spenders').then(r => r.data);
const fetchRegulars     = () => api.get('/reports/customers/regulars').then(r => r.data);
const fetchPendingCredits = () => api.get('/reports/customers/pending-credits').then(r => r.data);

const PERIODS = ['daily', 'monthly', 'yearly'];

export default function ReportsPage() {
  const [period, setPeriod] = useState('monthly');

  const { data: financial, isLoading: fLoading, isError: fError } = useQuery({ 
    queryKey: ['report-financial', period], 
    queryFn: () => fetchFinancial(period) 
  });
  
  const { data: topSpenders = [], isLoading: tsLoading } = useQuery({ queryKey: ['top-spenders'], queryFn: fetchTopSpenders });
  const { data: regulars    = [], isLoading: rLoading  } = useQuery({ queryKey: ['regulars'],     queryFn: fetchRegulars });
  const { data: pending     = [], isLoading: pLoading  } = useQuery({ queryKey: ['pending-credits'], queryFn: fetchPendingCredits });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-800">Business Intelligence</h1>
           <p className="text-sm text-slate-500 mt-1">Comprehensive financial and customer performance metrics</p>
        </div>
        <div className="flex gap-1 bg-slate-200 p-1 rounded-xl shadow-inner w-fit">
           {PERIODS.map(p => (
             <button 
               key={p} 
               onClick={() => setPeriod(p)} 
               className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${period === p ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
               {p}
             </button>
           ))}
        </div>
      </div>

      {/* ── Financial Metrics ── */}
      {fLoading ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-20 flex flex-col items-center justify-center text-slate-400">
           <Loader2 size={32} className="animate-spin mb-4" />
           <p className="font-medium">Compiling financial data...</p>
        </div>
      ) : fError ? (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center">
           <p className="text-red-600 font-bold">Error loading financial report. Please try again.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           <div className="lg:col-span-2 space-y-6">
              {/* Main Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                 <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Revenue</p>
                    <div className="flex items-center gap-2">
                       <p className="text-2xl font-black text-slate-800">${Number(financial.totalRevenue).toLocaleString()}</p>
                       <ArrowUpRight size={16} className="text-emerald-500" />
                    </div>
                 </div>
                 <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Cost</p>
                    <div className="flex items-center gap-2">
                       <p className="text-2xl font-black text-slate-800">${Number(financial.totalCost).toLocaleString()}</p>
                       <ArrowDownRight size={16} className="text-red-400" />
                    </div>
                 </div>
                 <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm bg-gradient-to-br from-blue-600 to-indigo-700">
                    <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-1">Net Profit</p>
                    <p className="text-2xl font-black text-white">${Number(financial.profit).toLocaleString()}</p>
                 </div>
              </div>

              {/* Top Selling Parts Table */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                 <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                       <Package size={18} className="text-blue-500" /> Top Selling Parts
                    </h3>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">By Qty Sold</span>
                 </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                       <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                          <tr>
                             <th className="px-6 py-3 text-left">Part Name</th>
                             <th className="px-6 py-3 text-center">Qty Sold</th>
                             <th className="px-6 py-3 text-right">Revenue</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-50">
                          {financial.topSellingParts?.map((p, i) => (
                             <tr key={p.partId} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4">
                                   <div className="flex items-center gap-3">
                                      <span className="w-6 h-6 rounded-lg bg-slate-100 text-[10px] font-bold text-slate-400 flex items-center justify-center">{i+1}</span>
                                      <span className="font-bold text-slate-700">{p.partName}</span>
                                   </div>
                                </td>
                                <td className="px-6 py-4 text-center font-semibold text-slate-600">{p.totalQuantitySold}</td>
                                <td className="px-6 py-4 text-right font-black text-emerald-600">${Number(p.totalRevenue).toFixed(2)}</td>
                             </tr>
                          ))}
                          {(!financial.topSellingParts || financial.topSellingParts.length === 0) && (
                             <tr><td colSpan="3" className="py-10 text-center text-slate-400 italic">No sales recorded for this period.</td></tr>
                          )}
                       </tbody>
                    </table>
                 </div>
              </div>
           </div>

           {/* Side Column: Quick Stats */}
           <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                 <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Users size={18} className="text-violet-500" /> Top Customers
                 </h3>
                 <div className="space-y-4">
                    {tsLoading ? <Loader2 size={16} className="animate-spin mx-auto text-slate-300" /> : 
                      topSpenders.slice(0, 5).map(c => (
                        <div key={c.customerId} className="flex items-center justify-between group">
                           <div>
                              <p className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">{c.fullName}</p>
                              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">{c.email}</p>
                           </div>
                           <p className="text-sm font-black text-slate-800">${Number(c.totalSpent).toLocaleString()}</p>
                        </div>
                      ))
                    }
                 </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 border-l-4 border-l-red-500">
                 <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <CreditCard size={18} className="text-red-500" /> Pending Credits
                 </h3>
                 <div className="space-y-4">
                    {pLoading ? <Loader2 size={16} className="animate-spin mx-auto text-slate-300" /> : 
                      pending.slice(0, 3).map(c => (
                        <div key={c.customerId} className="flex items-center justify-between">
                           <p className="text-sm font-bold text-slate-700">{c.fullName}</p>
                           <p className="text-sm font-black text-red-600">${Number(c.creditBalance).toLocaleString()}</p>
                        </div>
                      ))
                    }
                    {pending.length === 0 && <p className="text-xs text-slate-400 italic">No outstanding credits.</p>}
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
