import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { Calendar, Plus, Loader2, X, Clock } from 'lucide-react';
import api from '../../api/api';

const fetchAppointments = () => api.get('/appointments/mine').then(r => r.data);
const fetchMyVehicles   = () => api.get('/customers/me/vehicles').then(r => r.data);
const createAppointment = (dto) => api.post('/appointments', dto).then(r => r.data);

const STATUS_COLORS = {
  Pending:   'bg-amber-100 text-amber-700',
  Confirmed: 'bg-blue-100 text-blue-700',
  Completed: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-600',
};

export default function CustomerAppointmentsPage() {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ vehicleId: '', appointmentDate: '', serviceType: '', notes: '' });
  const qc = useQueryClient();

  const { data: appointments = [], isLoading } = useQuery({ queryKey: ['my-appointments'], queryFn: fetchAppointments });
  const { data: vehicles = [] } = useQuery({ queryKey: ['my-vehicles'], queryFn: fetchMyVehicles });

  const mut = useMutation({
    mutationFn: createAppointment,
    onSuccess: () => { qc.invalidateQueries(['my-appointments']); toast.success('Appointment booked!'); setShowModal(false); },
    onError: (e) => toast.error(e.response?.data?.message ?? 'Failed to book appointment'),
  });

  const submit = (e) => {
    e.preventDefault();
    if (!form.vehicleId) return toast.error('Select a vehicle');
    if (!form.appointmentDate) return toast.error('Select a date');
    mut.mutate({ vehicleId: Number(form.vehicleId), appointmentDate: form.appointmentDate, serviceType: form.serviceType || null, notes: form.notes || null });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Appointments</h1>
          <p className="text-sm text-slate-500 mt-0.5">{appointments.length} appointments</p>
        </div>
        <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors">
          <Plus size={16} /> Book Appointment
        </button>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <Loader2 size={20} className="animate-spin mr-2" /> Loading…
          </div>
        ) : appointments.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center py-16 text-slate-400">
            <Calendar size={36} className="mb-2 opacity-30" />
            <p className="text-sm">No appointments yet.</p>
          </div>
        ) : appointments.map(a => (
          <div key={a.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-800">{a.serviceType ?? 'General Service'}</p>
                <p className="text-xs text-slate-500 mt-0.5">{a.vehicleInfo}</p>
                {a.numberPlate && <p className="text-xs font-mono text-slate-400">{a.numberPlate}</p>}
                {a.notes && <p className="text-xs text-slate-400 mt-1 italic">{a.notes}</p>}
              </div>
              <div className="text-right space-y-1">
                <p className="text-xs text-slate-500">{new Date(a.appointmentDate).toLocaleDateString('en-NP', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                <span className={`inline-flex text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[a.status] ?? 'bg-slate-100 text-slate-600'}`}>
                  {a.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-base font-semibold text-slate-800">Book Appointment</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100"><X size={16} /></button>
            </div>
            <form onSubmit={submit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Vehicle *</label>
                <select value={form.vehicleId} onChange={e => setForm(f => ({ ...f, vehicleId: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select vehicle…</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>{[v.year, v.make, v.model].filter(Boolean).join(' ')} — {v.licensePlate ?? 'No plate'}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Date & Time *</label>
                <input type="datetime-local" value={form.appointmentDate} onChange={e => setForm(f => ({ ...f, appointmentDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Service Type</label>
                <input value={form.serviceType} onChange={e => setForm(f => ({ ...f, serviceType: e.target.value }))} placeholder="Oil change, tyre rotation…"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Notes</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} placeholder="Any additional details…"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={mut.isPending} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold flex items-center gap-2 disabled:opacity-60 hover:bg-blue-700">
                  {mut.isPending && <Loader2 size={14} className="animate-spin" />} Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
