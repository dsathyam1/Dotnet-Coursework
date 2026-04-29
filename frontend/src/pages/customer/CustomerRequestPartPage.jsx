import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  PackageSearch, ArrowLeft, Send, 
  Loader2, CheckCircle2, Info, ShoppingBag 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../api/api';

const requestPart = (data) => api.post('/part-requests', data).then(r => r.data);

export default function CustomerRequestPartPage() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const mutation = useMutation({
    mutationFn: requestPart,
    onSuccess: () => {
      toast.success('Part request submitted!');
      navigate('/customer/dashboard');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Submission failed')
  });

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-slate-800 transition-colors font-bold text-xs uppercase tracking-widest">
          <ArrowLeft size={16} /> Back
        </button>
        <div className="flex items-center gap-2 bg-violet-50 px-4 py-1.5 rounded-full border border-violet-100">
           <PackageSearch size={16} className="text-violet-600" />
           <span className="text-xs font-bold text-violet-700 uppercase tracking-widest">Special Order</span>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-10 border border-slate-100 shadow-sm relative overflow-hidden">
         <div className="relative z-10">
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Request a Part</h1>
            <p className="text-slate-500 font-medium mt-2 leading-relaxed">
               Can&apos;t find what you&apos;re looking for? Tell us the part details and we&apos;ll try to source it for you.
            </p>
            
            <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="mt-10 space-y-6">
               <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Part Name / Description *</label>
                  <input 
                    {...register('partName', { required: 'Part name is required' })}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-violet-500 outline-none transition-all font-bold text-slate-700"
                    placeholder="e.g. Performance Air Filter for BMW X5"
                  />
                  {errors.partName && <p className="text-red-500 text-[10px] font-bold mt-2 uppercase">{errors.partName.message}</p>}
               </div>

               <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Why do you need this? (Optional)</label>
                  <textarea 
                    {...register('description')}
                    rows={4}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-violet-500 outline-none transition-all font-medium text-slate-600 resize-none"
                    placeholder="Provide details like part numbers, brand preferences, or symptoms..."
                  />
               </div>

               <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 flex gap-4">
                  <Info size={20} className="text-blue-500 shrink-0 mt-0.5" />
                  <div>
                     <p className="text-xs font-bold text-blue-900 uppercase tracking-widest">Our Process</p>
                     <p className="text-xs text-blue-700/70 mt-1 leading-relaxed font-medium">Once submitted, our procurement team will check with local and international suppliers. We will notify you via email when the part is available.</p>
                  </div>
               </div>

               <div className="pt-6">
                  <button 
                    type="submit" 
                    disabled={isSubmitting || mutation.isPending}
                    className="w-full py-5 bg-slate-900 hover:bg-slate-800 text-white rounded-3xl font-black uppercase tracking-[0.3em] text-xs shadow-2xl shadow-slate-200 flex items-center justify-center gap-4 transition-all active:scale-95 disabled:opacity-50"
                  >
                     {(isSubmitting || mutation.isPending) ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                     Submit Request
                  </button>
               </div>
            </form>
         </div>

         {/* Decorative Element */}
         <div className="absolute top-0 right-0 p-8 opacity-5">
            <ShoppingBag size={120} />
         </div>
      </div>

      <div className="flex items-center justify-center gap-2 text-slate-300 text-[10px] font-bold uppercase tracking-widest">
         <CheckCircle2 size={14} /> Average response time: 24-48 Hours
      </div>
    </div>
  );
}
