import { useQuery } from '@tanstack/react-query';
import { 
  FileText, Calendar, DollarSign, Package, 
  ChevronDown, ChevronUp, Loader2, Search,
  Clock, AlertCircle
} from 'lucide-react';
import { useState } from 'react';
import api from '../../api/api';

const fetchMyInvoices = () => api.get('/customers/my/invoices').then(r => r.data);

function InvoiceRow({ invoice }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`bg-white rounded-3xl border transition-all duration-300 ${expanded ? 'border-blue-200 shadow-xl shadow-blue-50' : 'border-slate-100 shadow-sm hover:border-slate-200'}`}>
       <div 
         className="p-6 cursor-pointer flex items-center justify-between"
         onClick={() => setExpanded(!expanded)}
       >
          <div className="flex items-center gap-6">
             <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${invoice.isPaid ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                <FileText size={24} />
             </div>
             <div>
                <div className="flex items-center gap-3">
                   <p className="font-black text-slate-800 text-lg">#INV-{invoice.id.toString().padStart(6, '0')}</p>
                   <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${invoice.isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {invoice.isPaid ? 'Paid' : 'Credit'}
                   </span>
                </div>
                <div className="flex items-center gap-4 mt-1 text-xs font-bold text-slate-400 uppercase tracking-widest">
                   <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(invoice.createdAt).toLocaleDateString()}</span>
                   <span className="flex items-center gap-1"><Clock size={12} /> {new Date(invoice.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
             </div>
          </div>
          
          <div className="flex items-center gap-8">
             <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Amount</p>
                <p className="text-2xl font-black text-slate-900">${Number(invoice.totalAmount).toFixed(2)}</p>
             </div>
             <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${expanded ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:text-slate-600'}`}>
                {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
             </div>
          </div>
       </div>

       {expanded && (
          <div className="px-8 pb-8 animate-in slide-in-from-top-2 duration-300">
             <div className="pt-6 border-t border-slate-50">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Service Details & Parts</h4>
                <div className="space-y-4">
                   {(invoice.items || []).map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-300 border border-slate-100">
                               <Package size={18} />
                            </div>
                            <div>
                               <p className="text-sm font-black text-slate-800">{item.partName}</p>
                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Qty: {item.quantity} &times; ${Number(item.unitPrice).toFixed(2)}</p>
                            </div>
                         </div>
                         <p className="font-black text-slate-700">${Number(item.subtotal).toFixed(2)}</p>
                      </div>
                   ))}
                   
                   <div className="flex justify-between items-center px-4 pt-4">
                      <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
                         <AlertCircle size={14} /> Service performed by {invoice.staffName}
                      </div>
                      <div className="text-right">
                         <div className="flex items-center justify-end gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">
                            <DollarSign size={12} /> Subtotal
                         </div>
                         <p className="font-black text-slate-900">${Number(invoice.totalAmount).toFixed(2)}</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>
       )}
    </div>
  );
}

export default function CustomerHistoryPage() {
  const [search, setSearch] = useState('');
  
  const { data: invoices = [], isLoading } = useQuery({ 
    queryKey: ['my-invoices'], 
    queryFn: fetchMyInvoices 
  });

  const filtered = invoices.filter(inv => 
    inv.id.toString().includes(search) || 
    inv.items?.some(i => i.partName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
         <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Service History</h1>
            <p className="text-slate-500 font-medium mt-1">Keep track of all work performed and parts replaced.</p>
         </div>
         <div className="relative w-full sm:w-80">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
               type="text"
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               placeholder="Search invoices or parts..."
               className="w-full pl-11 pr-4 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-sm"
            />
         </div>
      </div>

      <div className="space-y-4">
         {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 text-slate-300">
               <Loader2 size={32} className="animate-spin mb-4" />
               <p className="text-xs font-black uppercase tracking-[0.2em]">Retrieving history...</p>
            </div>
         ) : filtered.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-100 p-20 text-center">
               <FileText size={48} className="mx-auto mb-4 opacity-10" />
               <h3 className="text-lg font-bold text-slate-800">No records found</h3>
               <p className="text-slate-500 mt-2">Try adjusting your search or check back after your next service.</p>
            </div>
         ) : (
            filtered.map((inv) => <InvoiceRow key={inv.id} invoice={inv} />)
         )}
      </div>
    </div>
  );
}
