import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Plus, X, Loader2, Truck, Pencil, Trash2 } from 'lucide-react';
import api from '../../api/api';

const fetchVendors  = () => api.get('/vendors').then(r => r.data);
const createVendor  = (dto) => api.post('/vendors', dto).then(r => r.data);
const updateVendor  = ({ id, dto }) => api.put(`/vendors/${id}`, dto).then(r => r.data);
const deleteVendor  = (id) => api.delete(`/vendors/${id}`);

function VendorModal({ vendor, onClose }) {
  const qc = useQueryClient();
  const isEdit = !!vendor;
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: vendor ?? {},
  });

  const createMut = useMutation({ mutationFn: createVendor, onSuccess: () => { qc.invalidateQueries(['vendors']); toast.success('Vendor created'); onClose(); }, onError: e => toast.error(e.response?.data?.message ?? 'Failed') });
  const updateMut = useMutation({ mutationFn: updateVendor, onSuccess: () => { qc.invalidateQueries(['vendors']); toast.success('Vendor updated'); onClose(); }, onError: e => toast.error(e.response?.data?.message ?? 'Failed') });

  const onSubmit = (data) => isEdit ? updateMut.mutate({ id: vendor.id, dto: data }) : createMut.mutate(data);
  const busy = isSubmitting || createMut.isPending || updateMut.isPending;

  const Field = ({ label, name, required, type = 'text' }) => (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}{required ? ' *' : ''}</label>
      <input type={type} {...register(name, required ? { required: `${label} is required` } : {})}
        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      {errors[name] && <p className="text-red-500 text-xs mt-0.5">{errors[name].message}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-800">{isEdit ? 'Edit Vendor' : 'Add Vendor'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <Field label="Name" name="name" required />
          <Field label="Contact Person" name="contactPerson" />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Phone" name="phone" />
            <Field label="Email" name="email" type="email" />
          </div>
          <Field label="Address" name="address" />
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={busy} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold flex items-center gap-2 disabled:opacity-60 hover:bg-blue-700">
              {busy && <Loader2 size={14} className="animate-spin" />} {isEdit ? 'Save' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function VendorsPage() {
  const [modal, setModal] = useState(null);
  const qc = useQueryClient();

  const { data: vendors = [], isLoading } = useQuery({ queryKey: ['vendors'], queryFn: fetchVendors });
  const deleteMut = useMutation({
    mutationFn: deleteVendor,
    onSuccess: () => { qc.invalidateQueries(['vendors']); toast.success('Vendor deleted'); },
    onError: () => toast.error('Failed to delete vendor'),
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Vendors</h1>
          <p className="text-sm text-slate-500 mt-0.5">{vendors.length} vendors</p>
        </div>
        <button onClick={() => setModal('create')} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors">
          <Plus size={16} /> Add Vendor
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full flex items-center justify-center py-16 text-slate-400">
            <Loader2 size={20} className="animate-spin mr-2" /> Loading…
          </div>
        ) : vendors.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-slate-400">
            <Truck size={36} className="mb-2 opacity-30" />
            <p className="text-sm">No vendors yet.</p>
          </div>
        ) : vendors.map(v => (
          <div key={v.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-2">
            <div className="flex items-start justify-between">
              <p className="font-semibold text-slate-800">{v.name}</p>
              <div className="flex gap-1">
                <button onClick={() => setModal(v)} className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors"><Pencil size={13} /></button>
                <button onClick={() => deleteMut.mutate(v.id)} className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={13} /></button>
              </div>
            </div>
            {v.contactPerson && <p className="text-xs text-slate-500">Contact: {v.contactPerson}</p>}
            {v.phone && <p className="text-xs text-slate-500">📞 {v.phone}</p>}
            {v.email && <p className="text-xs text-slate-500">✉ {v.email}</p>}
            {v.address && <p className="text-xs text-slate-400 truncate">{v.address}</p>}
          </div>
        ))}
      </div>

      {modal && <VendorModal vendor={modal === 'create' ? null : modal} onClose={() => setModal(null)} />}
    </div>
  );
}
