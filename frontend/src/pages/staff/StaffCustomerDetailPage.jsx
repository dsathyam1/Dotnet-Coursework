import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
  ArrowLeft, Car, FileText, Plus, Trash2, Loader2, X,
  Mail, CheckCircle, CreditCard, Clock
} from 'lucide-react';
import api from '../../api/api';

const fetchCustomer  = (id) => api.get(`/customers/${id}`).then(r => r.data);
const fetchInvoices  = (id) => api.get(`/customers/${id}/invoices`).then(r => r.data);
const addVehicle     = ({ id, dto }) => api.post(`/customers/${id}/vehicles`, dto).then(r => r.data);
const deleteVehicle  = ({ customerId, vehicleId }) => api.delete(`/customers/${customerId}/vehicles/${vehicleId}`);
const sendEmail      = (invoiceId) => api.post(`/email/send-invoice/${invoiceId}`).then(r => r.data);

/* ─── Add Vehicle Modal ─────────────────────────────────────────────── */
function AddVehicleModal({ customerId, onClose }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ make: '', model: '', year: '', licensePlate: '', mileage: '' });
  const mut = useMutation({
    mutationFn: (dto) => addVehicle({ id: customerId, dto }),
    onSuccess: () => { qc.invalidateQueries(['customer', customerId]); toast.success('Vehicle added!'); onClose(); },
    onError: (e) => toast.error(e.response?.data?.message ?? 'Failed to add vehicle'),
  });

  const submit = (e) => {
    e.preventDefault();
    if (!form.licensePlate) return toast.error('License plate is required');
    mut.mutate({
      make: form.make || null,
      model: form.model || null,
      year: form.year ? parseInt(form.year) : 0,
      licensePlate: form.licensePlate,   // ← maps to NumberPlate on backend
      mileage: form.mileage ? parseInt(form.mileage) : 0,
    });
  };

  const field = (label, key, opts = {}) => (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
      <input
        value={form[key]}
        onChange={e => setForm(f => ({ ...f, [key]: opts.upper ? e.target.value.toUpperCase() : e.target.value }))}
        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        {...opts}
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-800">Add Vehicle</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100"><X size={16} /></button>
        </div>
        <form onSubmit={submit} className="p-6 grid grid-cols-2 gap-3">
          {field('Make', 'make', { placeholder: 'Toyota' })}
          {field('Model', 'model', { placeholder: 'Hilux' })}
          {field('Year', 'year', { placeholder: '2020', type: 'number' })}
          {field('License Plate *', 'licensePlate', { placeholder: 'BA 1 PA 1234', upper: true })}
          {field('Mileage (km)', 'mileage', { placeholder: '15000', type: 'number' })}
          <div className="col-span-2 flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={mut.isPending} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold flex items-center gap-2 disabled:opacity-60 hover:bg-blue-700">
              {mut.isPending && <Loader2 size={14} className="animate-spin" />} Add Vehicle
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Invoice Row with Email Button ─────────────────────────────────── */
function InvoiceRow({ inv }) {
  const emailMut = useMutation({
    mutationFn: () => sendEmail(inv.id),
    onSuccess: () => toast.success(`Invoice email sent to customer!`),
    onError: (e) => toast.error(e.response?.data?.message ?? 'Failed to send email'),
  });

  const isPaid = inv.isPaid;
  const isCredit = inv.isCreditSale && !inv.isPaid;

  return (
    <div className="flex items-center justify-between border border-slate-100 rounded-xl px-4 py-3 hover:bg-slate-50 transition-colors">
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-slate-800">Invoice #{inv.id}</p>
          {isPaid && !isCredit && (
            <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
              <CheckCircle size={10} /> Paid
            </span>
          )}
          {isCredit && (
            <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
              <Clock size={10} /> Credit
            </span>
          )}
          {inv.discountApplied && (
            <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">10% off</span>
          )}
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          {new Date(inv.saleDate).toLocaleDateString('en-NP', { year: 'numeric', month: 'short', day: 'numeric' })}
          {' · '}
          <span className="font-semibold text-slate-700">NPR {Number(inv.totalAmount).toLocaleString()}</span>
        </p>
      </div>

      {/* Email send button */}
      <button
        onClick={() => emailMut.mutate()}
        disabled={emailMut.isPending || emailMut.isSuccess}
        title="Send invoice email to customer"
        className={`ml-3 shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
          emailMut.isSuccess
            ? 'border-green-200 bg-green-50 text-green-700 cursor-default'
            : 'border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100 disabled:opacity-50'
        }`}
      >
        {emailMut.isPending
          ? <Loader2 size={12} className="animate-spin" />
          : emailMut.isSuccess
          ? <CheckCircle size={12} />
          : <Mail size={12} />}
        {emailMut.isSuccess ? 'Sent' : 'Email'}
      </button>
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────────────────── */
export default function StaffCustomerDetailPage() {
  const { id } = useParams();
  const qc = useQueryClient();
  const [showAddVehicle, setShowAddVehicle] = useState(false);

  const { data: customer, isLoading } = useQuery({
    queryKey: ['customer', id],
    queryFn: () => fetchCustomer(id),
  });

  const { data: invoices = [], isLoading: invLoading } = useQuery({
    queryKey: ['customer-invoices', id],
    queryFn: () => fetchInvoices(id),
    enabled: !!id,
  });

  const delVehicleMut = useMutation({
    mutationFn: deleteVehicle,
    onSuccess: () => { qc.invalidateQueries(['customer', id]); toast.success('Vehicle removed'); },
    onError: () => toast.error('Failed to remove vehicle'),
  });

  if (isLoading) return (
    <div className="flex items-center justify-center py-20 text-slate-400">
      <Loader2 size={22} className="animate-spin mr-2" /> Loading…
    </div>
  );

  if (!customer) return (
    <div className="text-center py-20 text-slate-400">Customer not found.</div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/staff/customers" className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{customer.fullName}</h1>
          <p className="text-sm text-slate-500">{customer.email} {customer.phone ? `· ${customer.phone}` : ''}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Spent',     value: `NPR ${Number(customer.totalSpent ?? 0).toLocaleString()}`,    color: 'text-blue-700' },
          { label: 'Credit Balance',  value: `NPR ${Number(customer.creditBalance ?? 0).toLocaleString()}`, color: Number(customer.creditBalance) > 0 ? 'text-red-600' : 'text-green-600' },
          { label: 'Vehicles',        value: customer.vehicles?.length ?? 0,                                color: 'text-slate-700' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
            <p className="text-xs text-slate-500 mb-1">{s.label}</p>
            <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Vehicles */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Car size={17} className="text-emerald-600" />
            <h2 className="text-base font-semibold text-slate-800">Vehicles</h2>
          </div>
          <button
            onClick={() => setShowAddVehicle(true)}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            <Plus size={15} /> Add
          </button>
        </div>

        {!customer.vehicles?.length ? (
          <p className="text-sm text-slate-400 text-center py-4">No vehicles registered.</p>
        ) : (
          <div className="space-y-2">
            {customer.vehicles.map(v => (
              <div key={v.id} className="flex items-center justify-between border border-slate-100 rounded-xl px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {[v.year, v.make, v.model].filter(Boolean).join(' ') || 'Unknown Vehicle'}
                  </p>
                  <p className="text-xs text-slate-500 font-mono">{v.licensePlate ?? '—'}</p>
                  {v.mileage > 0 && <p className="text-xs text-slate-400">{v.mileage.toLocaleString()} km</p>}
                </div>
                <button
                  onClick={() => delVehicleMut.mutate({ customerId: id, vehicleId: v.id })}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invoice History */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText size={17} className="text-violet-600" />
            <h2 className="text-base font-semibold text-slate-800">Invoice History</h2>
            {invoices.length > 0 && (
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">{invoices.length}</span>
            )}
          </div>
          <Link
            to={`/staff/sales/new?customerId=${id}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-violet-600 hover:text-violet-700"
          >
            <Plus size={15} /> New Invoice
          </Link>
        </div>

        {invLoading ? (
          <div className="flex items-center justify-center py-6 text-slate-400">
            <Loader2 size={16} className="animate-spin mr-2" /> Loading invoices…
          </div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-6">
            <CreditCard size={28} className="mx-auto mb-2 text-slate-200" />
            <p className="text-sm text-slate-400">No invoices yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {invoices.map(inv => <InvoiceRow key={inv.id} inv={inv} />)}
          </div>
        )}
      </div>

      {showAddVehicle && (
        <AddVehicleModal customerId={id} onClose={() => setShowAddVehicle(false)} />
      )}
    </div>
  );
}
