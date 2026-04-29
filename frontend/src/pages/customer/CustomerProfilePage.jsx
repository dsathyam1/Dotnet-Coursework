import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  User, Mail, Phone, Car, Save, 
  Plus, Trash2, Loader2, Info, ArrowLeft,
  Settings, Shield
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../api/api';

const fetchProfile = () => api.get('/customers/my/profile').then(r => r.data);
const updateProfile = (data) => api.put('/auth/me', data).then(r => r.data);
const addVehicle = (data) => api.post('/customers/my/vehicles', data).then(r => r.data);

export default function CustomerProfilePage() {
  const qc = useQueryClient();
  
  const { data: profile = {}, isLoading } = useQuery({ 
    queryKey: ['my-profile'], 
    queryFn: fetchProfile 
  });

  const { register, handleSubmit, reset, formState: { isSubmitting: pSubmitting } } = useForm();
  const { register: regV, handleSubmit: handleV, reset: resetV, formState: { isSubmitting: vSubmitting } } = useForm();

  const updateMut = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      qc.invalidateQueries(['my-profile']);
      toast.success('Profile updated successfully');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Update failed')
  });

  const addVMut = useMutation({
    mutationFn: addVehicle,
    onSuccess: () => {
      qc.invalidateQueries(['my-profile']);
      toast.success('Vehicle registered');
      resetV();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to add vehicle')
  });

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center py-32 text-slate-300">
      <Loader2 size={32} className="animate-spin mb-4" />
      <p className="text-xs font-black uppercase tracking-[0.2em]">Syncing profile...</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div>
         <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <Settings size={32} className="text-blue-500" /> Account Settings
         </h1>
         <p className="text-slate-500 font-medium mt-1">Manage your personal information and vehicle fleet.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* Personal Info Form */}
         <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
            <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3">
               <Shield size={24} className="text-slate-300" /> Personal Details
            </h3>
            <form onSubmit={handleSubmit((data) => updateMut.mutate(data))} className="space-y-6">
               <div className="space-y-4">
                  <div>
                     <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Full Name</label>
                     <div className="relative">
                        <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                        <input 
                           defaultValue={profile.fullName}
                           {...register('fullName', { required: true })}
                           className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-slate-700"
                        />
                     </div>
                  </div>
                  <div>
                     <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Email Address</label>
                     <div className="relative">
                        <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                        <input 
                           defaultValue={profile.email}
                           disabled
                           className="w-full pl-11 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-2xl font-bold text-slate-400 cursor-not-allowed"
                        />
                     </div>
                     <p className="text-[10px] text-slate-400 mt-2 italic flex items-center gap-1"><Info size={10} /> Email cannot be changed.</p>
                  </div>
                  <div>
                     <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Phone Number</label>
                     <div className="relative">
                        <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                        <input 
                           defaultValue={profile.phone}
                           {...register('phone')}
                           className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-slate-700"
                        />
                     </div>
                  </div>
               </div>
               <button 
                  type="submit" 
                  disabled={pSubmitting || updateMut.isPending}
                  className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-slate-200 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
               >
                  {updateMut.isPending ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  Update Profile
               </button>
            </form>
         </div>

         {/* Vehicle Management */}
         <div className="space-y-6">
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
               <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3">
                  <Car size={24} className="text-slate-300" /> My Garage
               </h3>
               
               <div className="space-y-4">
                  {profile.vehicles?.map((v, i) => (
                     <div key={i} className="flex items-center justify-between p-5 rounded-2xl bg-slate-50 border border-slate-100 group transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-100">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-slate-300 border border-slate-100 shadow-sm">
                              <Car size={24} />
                           </div>
                           <div>
                              <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{v.make} {v.model}</p>
                              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-0.5">{v.licensePlate}</p>
                           </div>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-1 rounded-lg border border-slate-100">{v.year}</span>
                     </div>
                  ))}
                  
                  {profile.vehicles?.length === 0 && (
                     <div className="text-center py-10 text-slate-300 border-2 border-dashed border-slate-100 rounded-2xl">
                        <p className="text-sm italic">No vehicles registered yet.</p>
                     </div>
                  )}
               </div>

               {/* Add Vehicle Form */}
               <div className="mt-10 pt-10 border-t border-slate-50">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Register New Vehicle</h4>
                  <form onSubmit={handleV((data) => addVMut.mutate(data))} className="grid grid-cols-2 gap-4">
                     <div className="col-span-1">
                        <input {...regV('make', { required: true })} placeholder="Make (e.g. BMW)" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                     </div>
                     <div className="col-span-1">
                        <input {...regV('model', { required: true })} placeholder="Model (e.g. X5)" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                     </div>
                     <div className="col-span-1">
                        <input type="number" {...regV('year', { required: true })} placeholder="Year (2024)" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                     </div>
                     <div className="col-span-1">
                        <input {...regV('licensePlate', { required: true })} placeholder="License Plate" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black uppercase outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                     </div>
                     <button 
                        type="submit" 
                        disabled={vSubmitting || addVMut.isPending}
                        className="col-span-2 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                     >
                        {addVMut.isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                        Add to Garage
                     </button>
                  </form>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
