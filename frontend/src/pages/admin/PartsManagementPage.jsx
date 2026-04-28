import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import {
  Plus, Pencil, Trash2, X, Loader2, Package,
  AlertTriangle, Search, ChevronUp, ChevronDown,
  LayoutGrid, List
} from 'lucide-react';
import api from '../../api/api';

const fetchParts   = () => api.get('/parts').then(r => r.data);
const fetchVendors = () => api.get('/vendors').then(r => r.data);
const createPart   = (dto) => api.post('/parts', dto).then(r => r.data);
const updatePart   = ({ id, dto }) => api.put(`/parts/${id}`, dto).then(r => r.data);
const deletePart   = (id) => api.delete(`/parts/${id}`);

function PartModal({ part, vendors, onClose }) {
  const qc = useQueryClient();
  const isEdit = !!part;

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: isEdit ? {
      name: part.name, description: part.description ?? '',
      category: part.category ?? '', sellingPrice: part.sellingPrice,
      costPrice: part.costPrice, stockQuantity: part.stockQuantity,
      vendorId: part.vendorId,
    } : {
        stockQuantity: 0,
        sellingPrice: 0,
        costPrice: 0
    },
  });

  const createMut = useMutation({ mutationFn: createPart, onSuccess: () => { qc.invalidateQueries(['parts']); toast.success('Part created'); onClose(); }, onError: e => toast.error(e.response?.data?.message || 'Failed') });
  const updateMut = useMutation({ mutationFn: updatePart, onSuccess: () => { qc.invalidateQueries(['parts']); toast.success('Part updated'); onClose(); }, onError: e => toast.error(e.response?.data?.message || 'Failed') });

  const onSubmit = (data) => {
    const dto = { ...data, sellingPrice: +data.sellingPrice, costPrice: +data.costPrice, stockQuantity: +data.stockQuantity, vendorId: +data.vendorId };
    isEdit ? updateMut.mutate({ id: part.id, dto }) : createMut.mutate(dto);
  };

  const busy = isSubmitting || createMut.isPending || updateMut.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transition-all scale-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800">{isEdit ? 'Update Part Info' : 'Catalog New Part'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 grid grid-cols-2 gap-5 max-h-[85vh] overflow-y-auto">
          <div className="col-span-2">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Part Name *</label>
            <input {...register('name', { required: 'Name is required' })} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="e.g. Brake Pad Set (Front)" />
            {errors.name && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase">{errors.name.message}</p>}
          </div>

          <div className="col-span-2">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Description</label>
            <textarea {...register('description')} rows={2} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none" placeholder="Technical specifications..." />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Category</label>
            <input {...register('category')} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Brakes" />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Preferred Vendor *</label>
            <select {...register('vendorId', { required: 'Select a vendor' })} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white transition-all">
              <option value="">Choose vendor...</option>
              {vendors?.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
            {errors.vendorId && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase">{errors.vendorId.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4 col-span-2">
            <div>
               <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Unit Cost ($)</label>
               <input type="number" step="0.01" {...register('costPrice')} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
            </div>
            <div>
               <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Selling Price ($)</label>
               <input type="number" step="0.01" {...register('sellingPrice')} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
            </div>
          </div>

          <div className="col-span-2">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Initial Stock Quantity</label>
            <input type="number" {...register('stockQuantity')} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
          </div>

          <div className="col-span-2 flex justify-end gap-3 pt-4 border-t border-slate-50">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
            <button type="submit" disabled={busy} className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold flex items-center gap-2 shadow-lg shadow-blue-100 transition-all disabled:opacity-60">
              {busy && <Loader2 size={16} className="animate-spin" />} {isEdit ? 'Save Changes' : 'Catalog Part'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function PartsManagementPage() {
  const [modal, setModal]     = useState(null);
  const [search, setSearch]   = useState('');
  const [sortKey, setSortKey] = useState('name');
  const [sortAsc, setSortAsc] = useState(true);
  const [delId, setDelId]     = useState(null);
  const qc = useQueryClient();

  const { data: parts = [], isLoading, isError } = useQuery({ queryKey: ['parts'], queryFn: fetchParts });
  const { data: vendors = [] }          = useQuery({ queryKey: ['vendors'], queryFn: fetchVendors });

  const deleteMut = useMutation({
    mutationFn: deletePart,
    onSuccess: () => { qc.invalidateQueries(['parts']); toast.success('Part removed'); setDelId(null); },
    onError: (e)  => { toast.error(e.response?.data?.message ?? 'Cannot delete part with active invoices'); setDelId(null); },
  });

  const filtered = parts
    .filter(p => [p.name, p.category, p.vendorName].join(' ').toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const av = a[sortKey] ?? ''; const bv = b[sortKey] ?? '';
      return sortAsc ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });

  const lowStockCount = parts.filter(p => p.stockQuantity < 10).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Parts Inventory</h1>
          <p className="text-sm text-slate-500 mt-1">{parts.length} total SKU catalogued</p>
        </div>
        <button onClick={() => setModal('create')} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-100 transition-all active:scale-95">
          <Plus size={18} /> Add New Part
        </button>
      </div>

      {lowStockCount > 0 && (
        <div className="flex items-center gap-4 bg-red-50 border border-red-100 text-red-800 rounded-2xl px-5 py-4 text-sm shadow-sm animate-pulse">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
             <AlertTriangle size={20} className="text-red-600" />
          </div>
          <p className="font-medium">Critical Attention: <strong>{lowStockCount}</strong> items are below threshold stock (&lt; 10 units).</p>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative max-w-sm w-full">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, category, vendor..." className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
          </div>
          <div className="flex bg-slate-200 rounded-xl p-1 shadow-inner">
             <button className="p-1.5 rounded-lg bg-white shadow-sm text-blue-600"><List size={16} /></button>
             <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"><LayoutGrid size={16} /></button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400"><Loader2 size={32} className="animate-spin mb-4" /><p>Fetching catalogue...</p></div>
          ) : isError ? (
            <div className="py-24 text-center"><p className="text-red-500 font-bold text-lg">Error connecting to inventory.</p></div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400"><Package size={48} className="mb-4 opacity-20" /><p>{search ? 'No matches' : 'Catalogue is empty'}</p></div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50/50 text-[10px] uppercase font-bold tracking-widest text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-left">Part Description</th>
                  <th className="px-6 py-4 text-left">Category</th>
                  <th className="px-6 py-4 text-left">Vendor</th>
                  <th className="px-6 py-4 text-left">Pricing</th>
                  <th className="px-6 py-4 text-left">Stock</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-4">
                       <p className="font-bold text-slate-800">{p.name}</p>
                       <p className="text-xs text-slate-400 truncate max-w-[200px]">{p.description || 'No notes'}</p>
                    </td>
                    <td className="px-6 py-4">
                       <span className="text-slate-500 font-medium px-2 py-0.5 bg-slate-100 rounded-md text-[11px]">{p.category || 'Uncategorized'}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-semibold">{p.vendorName}</td>
                    <td className="px-6 py-4">
                       <div className="text-xs">
                          <p className="text-slate-400">Cost: <span className="text-slate-600">${Number(p.costPrice).toFixed(2)}</span></p>
                          <p className="text-blue-600 font-bold">Sell: ${Number(p.sellingPrice).toFixed(2)}</p>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold ${p.stockQuantity < 10 ? 'bg-red-100 text-red-700 shadow-sm shadow-red-100' : 'bg-emerald-100 text-emerald-700'}`}>
                        {p.stockQuantity < 10 && <AlertTriangle size={14} />}
                        {p.stockQuantity}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setModal(p)} className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-100 transition-all"><Pencil size={16} /></button>
                        <button onClick={() => setDelId(p.id)} className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-100 transition-all"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modal && <PartModal part={modal === 'create' ? null : modal} vendors={vendors} onClose={() => setModal(null)} />}

      {delId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center">
             <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6"><Trash2 size={32} className="text-red-600" /></div>
             <h3 className="text-xl font-bold text-slate-800 mb-2">De-catalog Part?</h3>
             <p className="text-sm text-slate-500 mb-8 leading-relaxed">This part will be removed from inventory records. You cannot delete parts with transaction history.</p>
             <div className="flex gap-3 justify-center">
                <button onClick={() => setDelId(null)} className="flex-1 px-5 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
                <button onClick={() => deleteMut.mutate(delId)} disabled={deleteMut.isPending} className="flex-1 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-100 transition-all disabled:opacity-60">
                   {deleteMut.isPending && <Loader2 size={16} className="animate-spin" />} Remove
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
