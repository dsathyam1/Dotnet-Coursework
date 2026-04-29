import { useQuery } from '@tanstack/react-query';
import { 
  Car, Calendar, CreditCard, Clock, 
  ChevronRight, AlertTriangle, CheckCircle2, User
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';

const fetchMyProfile = () => api.get('/customers/my/profile').then(r => r.data);
const fetchMyAppointments = () => api.get('/appointments/my').then(r => r.data);

export default function CustomerDashboard() {
  const { currentUser } = useAuth();
  
  const { data: profile, isLoading: pLoading } = useQuery({ 
    queryKey: ['my-profile'], 
    queryFn: fetchMyProfile 
  });
  
  const { data: appointments = [], isLoading: aLoading } = useQuery({ 
    queryKey: ['my-appointments'], 
    queryFn: fetchMyAppointments 
  });

  const displayName = currentUser?.name || 'Valued Customer';
  const upcoming = appointments.filter(a => new Date(a.appointmentDate) >= new Date()).slice(0, 3);

  return (
    <div className="space-y-8">
      <div className="bg-slate-900 rounded-3xl p-10 text-white relative overflow-hidden shadow-2xl shadow-blue-900/20">
         <div className="relative z-10">
            <h1 className="text-3xl font-black tracking-tight">Good day, {displayName.split(' ')[0]}!</h1>
            <p className="text-slate-400 mt-2 font-medium">Welcome back to your vehicle management hub.</p>
            
            {profile?.creditBalance > 0 && (
               <div className="mt-8 inline-flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl px-5 py-3 text-amber-400">
                  <AlertTriangle size={20} />
                  <div>
                     <p className="text-xs font-black uppercase tracking-widest leading-none">Credit Balance Alert</p>
                     <p className="text-sm font-bold mt-0.5">You have an outstanding balance of ${Number(profile.creditBalance).toFixed(2)}</p>
                  </div>
               </div>
            )}
         </div>
         <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full -mr-20 -mt-20 blur-3xl opacity-20"></div>
         <div className="absolute bottom-0 right-0 p-8 opacity-10">
            <Car size={160} className="rotate-12" />
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Profile Summary */}
         <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
               <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest mb-6 flex items-center gap-2">
                  <User size={18} className="text-blue-500" /> Account Status
               </h3>
               <div className="space-y-6">
                  <div className="flex items-center justify-between">
                     <p className="text-sm font-bold text-slate-500">Membership</p>
                     <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Active</span>
                  </div>
                  <div className="flex items-center justify-between">
                     <p className="text-sm font-bold text-slate-500">Vehicles</p>
                     <p className="text-sm font-black text-slate-800">{profile?.vehicles?.length || 0} Registered</p>
                  </div>
                  <div className="pt-6 border-t border-slate-50">
                     <Link to="/customer/profile" className="flex items-center justify-between text-blue-600 group">
                        <span className="text-xs font-black uppercase tracking-widest">Manage Profile</span>
                        <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                     </Link>
                  </div>
               </div>
            </div>

            <div className="bg-gradient-to-br from-violet-600 to-blue-700 rounded-3xl p-8 text-white shadow-xl shadow-blue-200">
               <div className="flex items-center justify-between mb-8">
                  <CreditCard size={24} className="text-white/40" />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Balance</p>
               </div>
               <p className="text-3xl font-black">${Number(profile?.creditBalance || 0).toFixed(2)}</p>
               <p className="text-xs font-medium text-white/60 mt-1">Pending payments</p>
               <button className="w-full mt-8 py-3 bg-white/10 hover:bg-white/20 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border border-white/20 transition-all">Make Payment</button>
            </div>
         </div>

         {/* Upcoming Appointments */}
         <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm h-full flex flex-col">
               <div className="flex items-center justify-between mb-8">
                  <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest flex items-center gap-2">
                     <Calendar size={18} className="text-blue-500" /> Upcoming Service
                  </h3>
                  <Link to="/customer/appointments" className="text-xs font-black text-blue-600 uppercase tracking-widest hover:underline">Book New</Link>
               </div>
               
               <div className="flex-1 space-y-4">
                  {upcoming.map((a, i) => (
                     <div key={i} className="flex items-center gap-6 p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-slate-100 transition-all group">
                        <div className="w-14 h-14 bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center shrink-0">
                           <span className="text-[10px] font-black text-blue-600 uppercase tracking-tighter">{new Date(a.appointmentDate).toLocaleString('default', { month: 'short' })}</span>
                           <span className="text-xl font-black text-slate-800 leading-none">{new Date(a.appointmentDate).getDate()}</span>
                        </div>
                        <div className="flex-1">
                           <p className="text-sm font-black text-slate-800">{a.serviceType}</p>
                           <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400 font-bold uppercase tracking-widest">
                              <span className="flex items-center gap-1"><Clock size={12} /> {new Date(a.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              <span className="flex items-center gap-1"><Car size={12} /> {a.vehiclePlate}</span>
                           </div>
                        </div>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${a.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                           {a.status === 'Confirmed' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                           {a.status}
                        </span>
                     </div>
                  ))}
                  
                  {upcoming.length === 0 && (
                     <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                        <Calendar size={48} className="mb-4 opacity-10" />
                        <p className="text-sm font-medium">No upcoming appointments.</p>
                     </div>
                  )}
               </div>

               <div className="mt-8 pt-8 border-t border-slate-50">
                  <div className="bg-blue-50 rounded-2xl p-6 flex items-center justify-between border border-blue-100">
                     <div>
                        <p className="text-sm font-black text-blue-900">Need a spare part?</p>
                        <p className="text-xs text-blue-700/60 font-medium">Browse our inventory or request a special order.</p>
                     </div>
                     <Link to="/customer/parts" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-200 transition-all">Browse</Link>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
