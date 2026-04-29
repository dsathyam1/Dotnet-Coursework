import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  Star, MessageSquare, Send, Loader2, 
  ArrowLeft, CheckCircle2, User, Quote
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../api/api';

const fetchReviews = () => api.get('/reviews').then(r => r.data);
const submitReview = (data) => api.post('/reviews', data).then(r => r.data);

export default function CustomerReviewsPage() {
  const qc = useQueryClient();
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(null);
  
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const { data: reviews = [], isLoading } = useQuery({ 
    queryKey: ['reviews'], 
    queryFn: fetchReviews 
  });

  const mutation = useMutation({
    mutationFn: submitReview,
    onSuccess: () => {
      qc.invalidateQueries(['reviews']);
      toast.success('Thank you for your feedback!');
      reset();
      setRating(5);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Submission failed')
  });

  const onSubmit = (data) => {
    mutation.mutate({ 
      rating, 
      comment: data.comment 
    });
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 pb-20">
      
      {/* Review Form */}
      <div className="space-y-8">
         <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Share Your Experience</h1>
            <p className="text-slate-500 font-medium mt-1">Your feedback helps us improve our service for everyone.</p>
         </div>

         <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-8">
            <div>
               <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 text-center">Service Rating</label>
               <div className="flex items-center justify-center gap-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                     <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(null)}
                        onClick={() => setRating(star)}
                        className="transition-all duration-200 transform hover:scale-125"
                     >
                        <Star 
                           size={40} 
                           fill={(hoveredRating || rating) >= star ? '#F59E0B' : 'transparent'}
                           className={(hoveredRating || rating) >= star ? 'text-amber-500' : 'text-slate-200'}
                        />
                     </button>
                  ))}
               </div>
               <p className="text-center mt-3 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                  {rating === 5 ? 'Excellent!' : rating === 4 ? 'Very Good' : rating === 3 ? 'Average' : rating === 2 ? 'Below Average' : 'Poor'}
               </p>
            </div>

            <div>
               <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Detailed Feedback</label>
               <div className="relative">
                  <MessageSquare size={18} className="absolute left-4 top-4 text-slate-300" />
                  <textarea 
                     {...register('comment', { required: true })}
                     rows={5}
                     className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-3xl focus:ring-2 focus:ring-amber-500 outline-none transition-all font-medium text-slate-700 resize-none"
                     placeholder="Tell us what you liked or what we could do better..."
                  />
               </div>
            </div>

            <button 
               type="submit" 
               disabled={isSubmitting || mutation.isPending}
               className="w-full py-5 bg-slate-900 hover:bg-slate-800 text-white rounded-3xl font-black uppercase tracking-[0.3em] text-xs shadow-2xl shadow-slate-200 flex items-center justify-center gap-4 transition-all active:scale-95 disabled:opacity-50"
            >
               {(isSubmitting || mutation.isPending) ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
               Post Review
            </button>
         </form>
      </div>

      {/* Community Feed */}
      <div className="space-y-8">
         <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-800">Recent Feedbacks</h3>
            <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full">
               <CheckCircle2 size={14} className="text-emerald-500" />
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{reviews.length} Verified Reviews</span>
            </div>
         </div>

         <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
            {isLoading ? (
               <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                  <Loader2 size={32} className="animate-spin mb-4" />
                  <p className="text-xs font-black uppercase tracking-widest text-center">Loading community wall...</p>
               </div>
            ) : reviews.length === 0 ? (
               <div className="bg-slate-50 rounded-3xl p-12 text-center border border-dashed border-slate-200">
                  <Quote size={48} className="mx-auto mb-4 opacity-10" />
                  <p className="text-slate-400 italic">No reviews yet. Be the first to share!</p>
               </div>
            ) : (
               reviews.map((r, i) => (
                  <div key={i} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative group hover:shadow-xl hover:shadow-slate-100 transition-all">
                     <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                              <User size={20} />
                           </div>
                           <div>
                              <p className="text-sm font-black text-slate-800">{r.customerName || 'Verified User'}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(r.createdAt).toLocaleDateString()}</p>
                           </div>
                        </div>
                        <div className="flex gap-0.5">
                           {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} size={12} fill={r.rating >= s ? '#F59E0B' : 'transparent'} className={r.rating >= s ? 'text-amber-500' : 'text-slate-200'} />
                           ))}
                        </div>
                     </div>
                     <p className="text-slate-600 text-sm leading-relaxed italic">&ldquo;{r.comment}&rdquo;</p>
                  </div>
               ))
            )}
         </div>
      </div>
    </div>
  );
}
