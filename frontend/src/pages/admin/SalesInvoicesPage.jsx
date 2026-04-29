import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, FileText, Search, Eye, X } from 'lucide-react';
import api from '../../api/api';

const fetchInvoices = () => api.get('/sales-invoices').then(r => r.data);
const fetchById     = (id) => api.get(`/sales-invoices/${id}`).then(r => r.data);

function StatusBadge({ paid }) {
  return paid
    ? <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">Paid</span>
    : <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">Pending</span>;
}

function InvoiceDrawer({ invoiceId, onClose }) {
  const { data, isLoading } = useQuery({ queryKey: ['sales-invoice', invoiceId], queryFn: () => fetchById(invoiceId) });
  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      <div className="flex-1 bg-black/30 backdrop-blur-sm" />
      <div className="w-full max-w-lg bg-white h-full overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white">
          <h2 className="text-lg font-semibold text-slate-800">Invoice #{invoiceId}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100"><X size={18} /></button>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-slate-400"><Loader2 size={22} className="animate-spin" /></div>
        ) : !data ? (
          <div className="py-20 text-center text-slate-400 text-sm">Not found.</div>
        ) : (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-xl p-4"><p className="text-xs text-slate-400 mb-1">Customer</p><p className="font-semibold text-slate-800">{data.customerName}</p></div>
              <div className="bg-slate-50 rounded-xl p-4"><p className="text-xs text-slate-400 mb-1">Staff</p><p className="font-semibold text-slate-800">{data.staffName}</p></div>
              <div className="bg-slate-50 rounded-xl p-4"><p className="text-xs text-slate-400 mb-1">Date</p><p className="font-semibold text-slate-800">{new Date(data.createdAt).toLocaleDateString()}</p></div>
              <div className="bg-slate-50 rounded-xl p-4"><p className="text-xs text-slate-400 mb-1">Total</p><p className="font-bold text-emerald-600 text-lg">${Number(data.totalAmount).toFixed(2)}</p></div>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-3">Line Items</p>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                    <tr><th className="px-4 py-2 text-left">Part</th><th className="px-4 py-2 text-right">Qty</th><th className="px-4 py-2 text-right">Unit Price</th><th className="px-4 py-2 text-right">Subtotal</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(data.items ?? []).map((item, i) => (
                      <tr key={i}>
                        <td className="px-4 py-2 text-slate-800">{item.partName}</td>
                        <td className="px-4 py-2 text-right text-slate-600">{item.quantity}</td>
                        <td className="px-4 py-2 text-right text-slate-600">${Number(item.unitPrice).toFixed(2)}</td>
                        <td className="px-4 py-2 text-right font-semibold text-slate-800">${Number(item.subtotal).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SalesInvoicesPage() {
  const [search, setSearch]   = useState('');
  const [drawer, setDrawer]   = useState(null);

  const { data: invoices = [], isLoading } = useQuery({ queryKey: ['sales-invoices'], queryFn: fetchInvoices });

  const filtered = invoices.filter(inv =>
    [inv.customerName, inv.staffName, String(inv.id)].join(' ').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Sales Invoices</h1>
          <p className="text-sm text-slate-500 mt-0.5">{invoices.length} total invoices</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <div className="relative max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search invoices…" className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-20 text-slate-400"><Loader2 size={22} className="animate-spin mr-2" />Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400"><FileText size={36} className="mb-2 opacity-30" /><p className="text-sm">No invoices found.</p></div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-left">#</th>
                  <th className="px-4 py-3 text-left">Customer</th>
                  <th className="px-4 py-3 text-left">Staff</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-slate-500 text-xs">#{inv.id}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{inv.customerName}</td>
                    <td className="px-4 py-3 text-slate-500">{inv.staffName}</td>
                    <td className="px-4 py-3 text-slate-500">{new Date(inv.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-800">${Number(inv.totalAmount).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <button onClick={() => setDrawer(inv.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition-colors"><Eye size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {drawer && <InvoiceDrawer invoiceId={drawer} onClose={() => setDrawer(null)} />}
    </div>
  );
}
