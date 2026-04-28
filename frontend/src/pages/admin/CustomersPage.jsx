import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Plus, X, Loader2, Users, Search, Eye, Pencil, Car, FileText } from 'lucide-react';
import api from '../../api/api';

const fetchCustomers = () => api.get('/customers').then(r => r.data);
const createCustomer = (dto) => api.post('/customers', dto).then(r => r.data);
const updateCustomer = ({ id, dto }) => api.put(`/customers/${id}`, dto).then(r => r.data);
const fetchVehicles  = (id) => api.get(`/customers/${id}/vehicles`).then(r => r.data);
const fetchInvoices  = (id) => api.get(`/customers/${id}/invoices`).then(r => r.data);

// ── Create / Edit Modal ───────────────────────────────────────────────────────
function CustomerModal({ customer, onClose }) {
  const qc = useQueryClient();
  const isEdit = !!customer;
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: isEdit ? { fullName: customer.fullName, email: customer.email, phoneNumber: customer.phoneNumber ?? '' } : {},
  });

  const createMut = useMutation({ mutationFn: createCustomer, onSuccess: () => { qc.invalidateQueries(['customers']); toast.success('Customer created'); onClose(); }, onError: e => toast.error(e.response?.data?.message ?? 'Failed') });
  const updateMut = useMutation({ mutationFn: updateCustomer, onSuccess: () => { qc.invalidateQueries(['customers']); toast.success('Customer updated'); onClose(); }, onError: e => toast.error(e.response?.data?.message ?? 'Failed') });

  const onSubmit = (data) => isEdit ? updateMut.mutate({ id: customer.id, dto: data }) : createMut.mutate({ ...data, password: data.password });
  const busy = isSubmitting || createMut.isPending || updateMut.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">{isEdit ? 'Edit Customer' : 'Add Customer'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Full Name *</label>
            <input {...register('fullName', { required: 'Required' })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Email *</label>
            <input type="email" {...register('email', { required: 'Required' })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Phone</label>
            <input type="tel" {...register('phoneNumber')} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          {!isEdit && (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Password *</label>
              <input type="password" {...register('password', { required: 'Required', minLength: { value: 6, message: 'Min 6 chars' } })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={busy} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium flex items-center gap-2 disabled:opacity-60">
              {busy && <Loader2 size={14} className="animate-spin" />} {isEdit ? 'Save Changes' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Detail Drawer ─────────────────────────────────────────────────────────────
function CustomerDrawer({ customer, onClose }) {
  const { data: vehicles = [], isLoading: vLoading } = useQuery({ queryKey: ['customer-vehicles', customer.id], queryFn: () => fetchVehicles(customer.id) });
  const { data: invoices = [], isLoading: iLoading } = useQuery({ queryKey: ['customer-invoices', customer.id], queryFn: () => fetchInvoices(customer.id) });

  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      <div className="flex-1 bg-black/30 backdrop-blur-sm" />
      <div className="w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
          <h2 className="text-lg font-semibold text-slate-800">Customer Details</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-6">
          {/* Profile */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xl font-bold uppercase">
              {customer.fullName?.charAt(0)}
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-800">{customer.fullName}</p>
              <p className="text-sm text-slate-500">{customer.email}</p>
              <p className="text-sm text-slate-500">{customer.phoneNumber ?? 'No phone'}</p>
            </div>
          </div>

          {/* Credit */}
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Credit Balance</p>
            <p className="text-2xl font-bold text-slate-800">${Number(customer.creditBalance ?? 0).toFixed(2)}</p>
          </div>

          {/* Vehicles */}
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2"><Car size={15} /> Vehicles</p>
            {vLoading ? <Loader2 size={16} className="animate-spin text-slate-400" /> : vehicles.length === 0 ? (
              <p className="text-sm text-slate-400">No vehicles registered.</p>
            ) : (
              <div className="space-y-2">
                {vehicles.map(v => (
                  <div key={v.id} className="flex items-center justify-between bg-white border border-slate-200 rounded-lg px-3 py-2">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{v.year} {v.make} {v.model}</p>
                      <p className="text-xs text-slate-500">{v.licensePlate}</p>
                    </div>
                    <span className="text-xs text-slate-400">{v.vin}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Invoices */}
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2"><FileText size={15} /> Invoices</p>
            {iLoading ? <Loader2 size={16} className="animate-spin text-slate-400" /> : invoices.length === 0 ? (
              <p className="text-sm text-slate-400">No invoices found.</p>
            ) : (
              <div className="space-y-2">
                {invoices.map(inv => (
                  <div key={inv.id} className="flex items-center justify-between bg-white border border-slate-200 rounded-lg px-3 py-2">
                    <div>
                      <p className="text-sm font-medium text-slate-800">Invoice #{inv.id}</p>
                      <p className="text-xs text-slate-500">{new Date(inv.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className="text-sm font-semibold text-slate-700">${Number(inv.totalAmount).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function CustomersPage() {
  const [modal, setModal]   = useState(null);
  const [drawer, setDrawer] = useState(null);
  const [search, setSearch] = useState('');

  const { data: customers = [], isLoading } = useQuery({ queryKey: ['customers'], queryFn: fetchCustomers });

  const filtered = customers.filter(c =>
    [c.fullName, c.email, c.phoneNumber].join(' ').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Customers</h1>
          <p className="text-sm text-slate-500 mt-0.5">{customers.length} registered customers</p>
        </div>
        <button onClick={() => setModal('create')} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition">
          <Plus size={16} /> Add Customer
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <div className="relative max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customers…" className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-20 text-slate-400"><Loader2 size={22} className="animate-spin mr-2" /> Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Users size={36} className="mb-2 opacity-30" />
              <p className="text-sm">{search ? 'No customers match.' : 'No customers yet.'}</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Phone</th>
                  <th className="px-4 py-3 text-left">Credit Balance</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold uppercase shrink-0">
                          {c.fullName?.charAt(0)}
                        </div>
                        <span className="font-medium text-slate-800">{c.fullName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{c.email}</td>
                    <td className="px-4 py-3 text-slate-500">{c.phoneNumber ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`font-semibold ${Number(c.creditBalance) > 0 ? 'text-red-600' : 'text-slate-700'}`}>
                        ${Number(c.creditBalance ?? 0).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setDrawer(c)} className="p-1.5 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition-colors" title="View"><Eye size={14} /></button>
                        <button onClick={() => setModal(c)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Edit"><Pencil size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modal && <CustomerModal customer={modal === 'create' ? null : modal} onClose={() => setModal(null)} />}
      {drawer && <CustomerDrawer customer={drawer} onClose={() => setDrawer(null)} />}
    </div>
  );
}
