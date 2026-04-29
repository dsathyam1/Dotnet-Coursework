import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Package, Search, Loader2, AlertTriangle, 
  Filter, Tag, Truck, ShoppingCart 
} from 'lucide-react';
import api from '../../api/api';

const fetchParts = () => api.get('/parts').then(r => r.data);

export default function StaffPartsPage() {
  const [search, setSearch] = useState('');
  const { data: parts = [], isLoading } = useQuery({ queryKey: ['parts'], queryFn: fetchParts });

  const filtered = parts.filter(p => 
    [p.name, p.category, p.vendorName].join(' ').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Stock Inventory</h1>
          <p className="text-sm text-slate-500 mt-1">Monitor and manage vehicle parts availability.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
           <div className="relative max-w-sm w-full">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                placeholder="Search name, category, or vendor..." 
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs bg-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
              />
           </div>
           <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white border border-slate-200 px-3 py-1 rounded-lg">
                 {filtered.length} Parts Total
              </span>
           </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-300">
               <Loader2 size={32} className="animate-spin mb-4" />
               <p className="text-xs font-black uppercase tracking-widest">Syncing inventory...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-24 text-center text-slate-300">
               <Package size={48} className="mx-auto mb-4 opacity-10" />
               <p className="text-sm font-medium">No inventory records found.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                <tr>
                  <th className="px-8 py-4 text-left">Part Description</th>
                  <th className="px-8 py-4 text-left">Category</th>
                  <th className="px-8 py-4 text-left">Preferred Vendor</th>
                  <th className="px-8 py-4 text-right">Selling Price</th>
                  <th className="px-8 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-5">
                       <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${p.stockQuantity < 10 ? 'bg-red-50 border-red-100 text-red-500' : 'bg-emerald-50 border-emerald-100 text-emerald-500'}`}>
                             <Package size={20} />
                          </div>
                          <span className="font-bold text-slate-800">{p.name}</span>
                       </div>
                    </td>
                    <td className="px-8 py-5">
                       <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-widest border border-slate-200">
                          <Tag size={10} /> {p.category || 'Uncategorized'}
                       </span>
                    </td>
                    <td className="px-8 py-5">
                       <div className="flex items-center gap-2 text-slate-500 font-medium">
                          <Truck size={14} className="text-slate-300" /> {p.vendorName}
                       </div>
                    </td>
                    <td className="px-8 py-5 text-right font-black text-slate-900">
                       ${Number(p.sellingPrice).toFixed(2)}
                    </td>
                    <td className="px-8 py-5">
                       <div className="flex justify-center">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${p.stockQuantity < 10 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                            {p.stockQuantity < 10 ? <AlertTriangle size={12} /> : <ShoppingCart size={12} />}
                            {p.stockQuantity} {p.stockQuantity < 10 ? 'Low Stock' : 'In Stock'}
                          </span>
                       </div>
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
