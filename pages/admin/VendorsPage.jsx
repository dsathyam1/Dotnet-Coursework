import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Plus, X, Loader2, Truck, Search, Pencil, Trash2, Mail, Phone, MapPin } from 'lucide-react';
import api from '../../api/api';

const fetchVendors = () => api.get('/vendors').then(r => r.data);
const createVendor = (dto) => api.post('/vendors', dto).then(r => r.data);
const updateVendor = ({ id, dto }) => api.put(`/vendors/${id}`, dto).then(r => r.data);
const deleteVendor = (id) => api.delete(`/vendors/${id}`);

function VendorModal({ vendor, onClose }) {
  const qc = useQueryClient();
  const isEdit = !!vendor;
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: isEdit ? { 
      name: vendor.name, 
      contactPerson: vendor.contactPerson ?? '', 
      email: vendor.email ?? '', 
      phone: vendor.phone ?? '', 
      address: vendor.address ?? '' 
    } : {},
  });

  const createMut = useMutation({ 
    mutationFn: createVendor, 
    onSuccess: () => { qc.invalidateQueries(['vendors']); toast.success('Vendor added'); onClose(); }, 
    onError: e => toast.error(e.response?.data?.message ?? 'Failed') 
  });

  const updateMut = useMutation({ 
    mutationFn: updateVendor, 
    onSuccess: () => { qc.invalidateQueries(['vendors']); toast.success('Vendor updated'); onClose(); }, 
    onError: e => toast.error(e.response?.data?.message ?? 'Failed') 
  });

  const onSubmit = (data) => isEdit ? updateMut.mutate({ id: vendor.id, dto: data }) : createMut.mutate(data);
  const busy = isSubmitting || createMut.isPending || updateMut.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">{isEdit ? 'Edit Vendor' : 'Add New Vendor'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Company Name *</label>
            <input {...register('name', { required: 'Required' })} className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="e.g. Acme Auto Parts" />
            {errors.name && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Contact Person</label>
            <input {...register('contactPerson')} className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
              <input type="email" {...register('email')} className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone</label>
              <input {...register('phone')} className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Address</label>
            <textarea {...register('address')} rows={2} className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-5 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
            <button type="submit" disabled={busy} className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold flex items-center gap-2 shadow-lg shadow-blue-100 disabled:opacity-60 transition-all">
              {busy && <Loader2 size={16} className="animate-spin" />} {isEdit ? 'Save' : 'Add Vendor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function VendorsPage() {
  const [modal, setModal] = useState(null);
  const [delId, setDelId] = useState(null);
  const [search, setSearch] = useState('');
  const qc = useQueryClient();

  const { data: vendors = [], isLoading, isError } = useQuery({ queryKey: ['vendors'], queryFn: fetchVendors });
  
  const deleteMut = useMutation({
    mutationFn: deleteVendor,
    onSuccess: () => { qc.invalidateQueries(['vendors']); toast.success('Vendor deleted'); setDelId(null); },
    onError: e => { toast.error(e.response?.data?.message ?? 'Conflict: Vendor linked to parts'); setDelId(null); }
  });

  const filtered = vendors.filter(v => [v.name, v.contactPerson].join(' ').toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Vendors</h1>
          <p className="text-sm text-slate-500 mt-1">Manage parts suppliers and business partners</p>
        </div>
        <button onClick={() => setModal('create')} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-100 transition-all active:scale-95">
          <Plus size={18} /> Add New Vendor
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-4">
          <div className="relative max-w-sm w-full">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search vendors..." className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400"><Loader2 size={32} className="animate-spin mb-4" /><p>Loading vendors...</p></div>
          ) : isError ? (
            <div className="py-24 text-center"><p className="text-red-500 font-bold">Error loading vendor list.</p></div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400"><Truck size={48} className="mb-4 opacity-20" /><p>{search ? 'No matches' : 'No vendors yet'}</p></div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50/50 text-[10px] uppercase font-bold tracking-widest text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-left">Company</th>
                  <th className="px-6 py-4 text-left">Contact info</th>
                  <th className="px-6 py-4 text-left">Address</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(v => (
                  <tr key={v.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 font-bold text-slate-800">{v.name}</td>
                    <td className="px-6 py-4 space-y-1 text-slate-500 font-medium">
                      <div className="flex items-center gap-2"><Mail size={12} className="text-slate-300" /> {v.email || '—'}</div>
                      <div className="flex items-center gap-2"><Phone size={12} className="text-slate-300" /> {v.phone || '—'}</div>
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate text-slate-500">
                       <div className="flex items-center gap-2"><MapPin size={12} className="text-slate-300 shrink-0" /> {v.address || '—'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setModal(v)} className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-100 transition-all"><Pencil size={16} /></button>
                        <button onClick={() => setDelId(v.id)} className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-100 transition-all"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modal && <VendorModal vendor={modal === 'create' ? null : modal} onClose={() => setModal(null)} />}

      {delId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center">
             <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6"><Trash2 size={32} className="text-red-600" /></div>
             <h3 className="text-xl font-bold text-slate-800 mb-2">Delete Vendor?</h3>
             <p className="text-sm text-slate-500 mb-8 leading-relaxed">This record will be permanently removed. You cannot delete a vendor linked to parts.</p>
             <div className="flex gap-3 justify-center">
                <button onClick={() => setDelId(null)} className="flex-1 px-5 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
                <button onClick={() => deleteMut.mutate(delId)} disabled={deleteMut.isPending} className="flex-1 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-100 transition-all disabled:opacity-60">
                   {deleteMut.isPending && <Loader2 size={16} className="animate-spin" />} Delete
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
