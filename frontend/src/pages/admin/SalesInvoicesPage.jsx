import { useQuery } from '@tanstack/react-query';
import { Loader2, FileText, CheckCircle, Clock } from 'lucide-react';
import api from '../../api/api';

const fetchInvoices = () => api.get('/sales-invoices').then(r => r.data);

export default function SalesInvoicesPage() {
  const { data: invoices = [], isLoading } = useQuery({ queryKey: ['sales-invoices'], queryFn: fetchInvoices });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Sales Invoices</h1>
        <p className="text-sm text-slate-500 mt-0.5">{invoices.length} total invoices</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <Loader2 size={20} className="animate-spin mr-2" /> Loading…
          </div>
        ) : invoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <FileText size={36} className="mb-2 opacity-30" />
            <p className="text-sm">No invoices yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-left">#</th>
                  <th className="px-4 py-3 text-left">Customer</th>
                  <th className="px-4 py-3 text-left">Staff</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-slate-400 font-mono text-xs">#{inv.id}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{inv.customerName}</td>
                    <td className="px-4 py-3 text-slate-500">{inv.staffName}</td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-700">
                      NPR {Number(inv.totalAmount).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {new Date(inv.saleDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      {inv.isPaid ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                          <CheckCircle size={10} /> Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                          <Clock size={10} /> {inv.isCreditSale ? 'Credit' : 'Unpaid'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
