import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, FileText, Search, Eye, X, Truck, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/api';

const fetchPurchaseInvoices = () => api.get('/purchase-invoices').then(r => r.data);
const fetchById = (id) => api.get(`/purchase-invoices/${id}`).then(r => r.data);

function InvoiceDrawer({ invoiceId, onClose }) {
  const { data, isLoading } = useQuery({ queryKey: ['purchase-invoice', invoiceId], queryFn: () => fetchById(invoiceId) });
  
  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      <div className="flex-1 bg-black/30 backdrop-blur-sm" />
      <div className="w-full max-w-lg bg-white h-full overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white">
          <h2 className="text-lg font-semibold text-slate-800">Purchase Invoice #{invoiceId}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100"><X size={18} /></button>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-slate-400"><Loader2 size={22} className="animate-spin" /></div>
        ) : !data ? (
          <div className="py-20 text-center text-slate-400 text-sm">Not found.</div>
        ) : (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-xl p-4"><p className="text-xs text-slate-400 mb-1">Vendor</p><p className="font-semibold text-slate-800">{data.vendorName}</p></div>
              <div className="bg-slate-50 rounded-xl p-4"><p className="text-xs text-slate-400 mb-1">Admin</p><p className="font-semibold text-slate-800">{data.adminName}</p></div>
              <div className="bg-slate-50 rounded-xl p-4"><p className="text-xs text-slate-400 mb-1">Date</p><p className="font-semibold text-slate-800">{new Date(data.createdAt).toLocaleDateString()}</p></div>
              <div className="bg-slate-50 rounded-xl p-4"><p className="text-xs text-slate-400 mb-1">Total</p><p className="font-bold text-blue-600 text-lg">${Number(data.totalAmount).toFixed(2)}</p></div>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-3">Line Items</p>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                    <tr><th className="px-4 py-2 text-left">Part</th><th className="px-4 py-2 text-right">Qty</th><th className="px-4 py-2 text-right">Unit Cost</th><th className="px-4 py-2 text-right">Subtotal</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(data.items ?? []).map((item, i) => (
                      <tr key={i}>
                        <td className="px-4 py-2 text-slate-800">{item.partName}</td>
                        <td className="px-4 py-2 text-right text-slate-600">{item.quantity}</td>
                        <td className="px-4 py-2 text-right text-slate-600">${Number(item.unitCost).toFixed(2)}</td>
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

export default function PurchaseInvoicesPage() {
  const [search, setSearch] = useState('');
  const [drawer, setDrawer] = useState(null);

  const { data: invoices = [], isLoading } = useQuery({ queryKey: ['purchase-invoices'], queryFn: fetchPurchaseInvoices });

  const filtered = invoices.filter(inv =>
    [inv.vendorName, inv.adminName, String(inv.id)].join(' ').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Purchase Records</h1>
          <p className="text-sm text-slate-500 mt-0.5">{invoices.length} total purchase records</p>
        </div>
        <Link 
          to="/admin/purchase-invoices/new" 
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-slate-200 transition-all active:scale-95"
        >
          <Plus size={18} /> Record New Purchase
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <div className="relative max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search records…" className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-20 text-slate-400"><Loader2 size={22} className="animate-spin mr-2" />Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400"><Truck size={36} className="mb-2 opacity-30" /><p className="text-sm">No records found.</p></div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-left">#</th>
                  <th className="px-4 py-3 text-left">Vendor</th>
                  <th className="px-4 py-3 text-left">Admin</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-right">Total Cost</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-slate-500 text-xs">#{inv.id}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{inv.vendorName}</td>
                    <td className="px-4 py-3 text-slate-500">{inv.adminName}</td>
                    <td className="px-4 py-3 text-slate-500">{new Date(inv.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right font-semibold text-blue-700">${Number(inv.totalAmount).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <button onClick={() => setDrawer(inv.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"><Eye size={14} /></button>
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
