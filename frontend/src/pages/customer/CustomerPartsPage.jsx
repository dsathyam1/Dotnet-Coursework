import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Search, Loader2, Package, ShoppingBag, 
  ChevronRight, ArrowRight, Tag, Info 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/api';

const fetchParts = () => api.get('/parts').then(r => r.data);

export default function CustomerPartsPage() {
  const [search, setSearch] = useState('');
  const { data: parts = [], isLoading } = useQuery({ queryKey: ['parts'], queryFn: fetchParts });

  const filtered = parts.filter(p => 
    [p.name, p.category].join(' ').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Parts Catalog</h1>
          <p className="text-slate-500 font-medium mt-1">Genuine components for your vehicle&apos;s performance.</p>
        </div>
        <div className="relative w-full sm:w-80">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Search parts or categories..." 
            className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-violet-500 outline-none transition-all font-medium text-sm"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 text-slate-300">
          <Loader2 size={32} className="animate-spin mb-4" />
          <p className="text-xs font-black uppercase tracking-[0.2em]">Loading catalogue...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filtered.map(p => (
            <div key={p.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200 transition-all p-6 flex flex-col group">
              <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-sm">
                  <Package size={28} />
                </div>
                <div className="flex flex-col items-end gap-2">
                   <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-emerald-100">
                     In Stock
                   </span>
                   <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-tighter"><Tag size={10} /> {p.category}</p>
                </div>
              </div>

              <h3 className="font-black text-slate-800 text-lg mb-2 group-hover:text-violet-600 transition-colors">{p.name}</h3>
              <p className="text-xs text-slate-500 mb-6 leading-relaxed font-medium line-clamp-2">{p.description || 'Premium grade components tested for high durability and performance in extreme conditions.'}</p>
              
              <div className="mt-auto pt-6 border-t border-slate-50 flex items-end justify-between">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Price</p>
                  <p className="text-3xl font-black text-slate-900 tracking-tight">${Number(p.sellingPrice).toFixed(2)}</p>
                </div>
                <button className="bg-slate-900 hover:bg-violet-600 text-white w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-lg active:scale-90">
                  <ShoppingBag size={20} />
                </button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-full py-24 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
              <Package size={48} className="mx-auto mb-4 opacity-10" />
              <h3 className="text-lg font-bold text-slate-800">No parts found</h3>
              <p className="text-slate-500 mt-2">We couldn&apos;t find anything matching &quot;{search}&quot;.</p>
              <Link to="/customer/request-part" className="mt-6 inline-flex items-center gap-2 text-violet-600 font-bold hover:underline">
                 Submit a Special Order Request <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Request Help */}
      {!isLoading && (
         <div className="mt-12 bg-violet-600 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl shadow-violet-200">
            <div className="flex items-center gap-6">
               <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
                  <Info size={32} />
               </div>
               <div>
                  <h3 className="text-xl font-bold">Can&apos;t find a specific part?</h3>
                  <p className="text-violet-100 text-sm opacity-80">Our procurement team can source rare parts from our international network.</p>
               </div>
            </div>
            <Link to="/customer/request-part" className="bg-white text-violet-600 px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl transition-all hover:scale-105 active:scale-95 whitespace-nowrap">
               Request Now
            </Link>
         </div>
      )}
    </div>
  );
}
