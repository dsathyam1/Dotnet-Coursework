import { useQuery } from '@tanstack/react-query';
import { Loader2, FileText, CheckCircle, Clock, Tag } from 'lucide-react';
import api from '../../api/api';

const fetchHistory = () => api.get('/customers/me/invoices').then(r => r.data);

export default function CustomerHistoryPage() {
  const { data: invoices = [], isLoading } = useQuery({ queryKey: ['my-invoices'], queryFn: fetchHistory });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Purchase History</h1>
        <p className="text-sm text-slate-500 mt-0.5">{invoices.length} invoices</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <Loader2 size={20} className="animate-spin mr-2" /> Loading…
          </div>
        ) : invoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <FileText size={36} className="mb-2 opacity-30" />
            <p className="text-sm">No purchase history yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {invoices.map(inv => (
              <div key={inv.id} className="px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div>
                  <p className="text-sm font-semibold text-slate-800">Invoice #{inv.id}</p>
                  <p className="text-xs text-slate-400">{new Date(inv.saleDate).toLocaleDateString('en-NP', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                  {inv.discountApplied && (
                    <span className="inline-flex items-center gap-1 text-xs text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full font-medium mt-1">
                      <Tag size={9} /> 10% loyalty discount — saved NPR {Number(inv.discountAmount).toLocaleString()}
                    </span>
                  )}
                  {inv.items?.length > 0 && (
                    <p className="text-xs text-slate-500 mt-0.5">{inv.items.map(i => i.partName).join(', ')}</p>
                  )}
                </div>
                <div className="text-right space-y-1">
                  <p className="text-sm font-bold text-slate-800">NPR {Number(inv.totalAmount).toLocaleString()}</p>
                  {inv.isPaid ? (
                    <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                      <CheckCircle size={9} /> Paid
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                      <Clock size={9} /> {inv.isCreditSale ? 'Credit' : 'Pending'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
