import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Calendar, Clock, Car, Plus, X, 
  Loader2, CheckCircle2, AlertCircle, Trash2,
  ChevronRight, ArrowLeft
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../api/api';

const fetchAppointments = () => api.get('/appointments/my').then(r => r.data);
const fetchProfile = () => api.get('/customers/my/profile').then(r => r.data);
const bookAppointment = (data) => api.post('/appointments', data).then(r => r.data);
const cancelAppointment = (id) => api.delete(`/appointments/${id}`);

function AppointmentModal({ vehicles, onClose }) {
  const qc = useQueryClient();
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: {
      appointmentDate: new Date().toISOString().slice(0, 16),
      serviceType: 'Oil Change'
    }
  });

  const mutation = useMutation({
    mutationFn: bookAppointment,
    onSuccess: () => {
      qc.invalidateQueries(['my-appointments']);
      toast.success('Appointment booked successfully!');
      onClose();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Booking failed')
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-300">
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 bg-slate-50">
          <h2 className="text-xl font-black text-slate-800 tracking-tight">Book Service</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-200 text-slate-400 transition-colors"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="p-8 space-y-6">
          <div>
             <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Select Vehicle</label>
             <select 
               {...register('vehicleId', { required: true })}
               className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-slate-700"
             >
                <option value="">-- Select Your Vehicle --</option>
                {vehicles.map(v => (
                   <option key={v.id} value={v.id}>{v.make} {v.model} ({v.numberPlate})</option>
                ))}
                {vehicles.length === 0 && <option value="">No vehicles registered</option>}
             </select>
          </div>
          
          <div>
             <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Service Type</label>
             <input 
               {...register('serviceType', { required: true })}
               className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-slate-700"
               placeholder="e.g. Full Inspection, Brake Fix"
             />
          </div>

          <div>
             <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Preferred Date & Time</label>
             <input 
               type="datetime-local"
               {...register('appointmentDate', { required: true })}
               className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-slate-700"
             />
          </div>

          <div className="pt-4">
             <button 
               type="submit" 
               disabled={isSubmitting || mutation.isPending}
               className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-blue-200 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
             >
                {mutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Calendar size={18} />}
                Confirm Booking
             </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CustomerAppointmentsPage() {
  const [modal, setModal] = useState(false);
  const qc = useQueryClient();

  const { data: appointments = [], isLoading: aLoading } = useQuery({ 
    queryKey: ['my-appointments'], 
    queryFn: fetchAppointments 
  });
  
  const { data: profile, isLoading: pLoading } = useQuery({ 
    queryKey: ['my-profile'], 
    queryFn: fetchProfile 
  });

  const cancelMut = useMutation({
    mutationFn: cancelAppointment,
    onSuccess: () => {
      qc.invalidateQueries(['my-appointments']);
      toast.success('Appointment cancelled');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Cancellation failed')
  });

  const isLoading = aLoading || pLoading;

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
         <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Appointments</h1>
            <p className="text-slate-500 font-medium mt-1">Schedule and manage your workshop visits.</p>
         </div>
         <button 
           onClick={() => setModal(true)}
           className="inline-flex items-center gap-3 bg-slate-900 hover:bg-slate-800 text-white px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-200 transition-all active:scale-95"
         >
            <Plus size={18} /> Book Session
         </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {isLoading ? (
            <div className="col-span-full py-32 flex flex-col items-center text-slate-300">
               <Loader2 size={32} className="animate-spin mb-4" />
               <p className="text-xs font-black uppercase tracking-widest">Checking schedules...</p>
            </div>
         ) : appointments.length === 0 ? (
            <div className="col-span-full bg-white rounded-3xl border border-slate-100 p-20 text-center">
               <Calendar size={48} className="mx-auto mb-4 opacity-10" />
               <h3 className="text-lg font-bold text-slate-800">No appointments yet</h3>
               <p className="text-slate-500 mt-2">Get your vehicle checked by our professionals. Book your first session today!</p>
            </div>
         ) : (
            appointments.map((a) => (
               <div key={a.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-100 transition-all group relative overflow-hidden">
                  <div className={`absolute top-0 left-0 w-1.5 h-full ${a.status === 'Confirmed' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                  
                  <div className="flex items-start justify-between">
                     <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center shrink-0">
                           <span className="text-[10px] font-black text-blue-600 uppercase tracking-tighter">{new Date(a.appointmentDate).toLocaleString('default', { month: 'short' })}</span>
                           <span className="text-lg font-black text-slate-800 leading-none">{new Date(a.appointmentDate).getDate()}</span>
                        </div>
                        <div>
                           <h4 className="font-black text-slate-800 text-lg">{a.serviceType}</h4>
                           <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400 font-bold uppercase tracking-widest">
                              <span className="flex items-center gap-1"><Clock size={12} /> {new Date(a.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              <span className="flex items-center gap-1 text-slate-600"><Car size={12} /> {a.vehiclePlate}</span>
                           </div>
                        </div>
                     </div>
                     <div className="flex flex-col items-end gap-3">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${a.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                           {a.status === 'Confirmed' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                           {a.status}
                        </span>
                        <button 
                           onClick={() => cancelMut.mutate(a.id)}
                           disabled={cancelMut.isPending}
                           className="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                           title="Cancel Appointment"
                        >
                           <Trash2 size={16} />
                        </button>
                     </div>
                  </div>
               </div>
            ))
         )}
      </div>

      {modal && <AppointmentModal vehicles={profile?.vehicles || []} onClose={() => setModal(false)} />}
    </div>
  );
}
