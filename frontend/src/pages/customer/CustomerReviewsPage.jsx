import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { Star, Plus, X, Loader2, MessageSquare } from 'lucide-react';
import api from '../../api/api';

const fetchMyReviews = () => api.get('/reviews/mine').then(r => r.data);
const createReview   = (dto) => api.post('/reviews', dto).then(r => r.data);

function StarRating({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} type="button" onClick={() => onChange(n)}>
          <Star size={24} className={n <= value ? 'fill-amber-400 text-amber-400' : 'text-slate-300'} />
        </button>
      ))}
    </div>
  );
}

export default function CustomerReviewsPage() {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ rating: 5, comment: '' });
  const qc = useQueryClient();

  const { data: reviews = [], isLoading } = useQuery({ queryKey: ['my-reviews'], queryFn: fetchMyReviews });
  const mut = useMutation({
    mutationFn: createReview,
    onSuccess: () => { qc.invalidateQueries(['my-reviews']); toast.success('Review submitted!'); setShowModal(false); setForm({ rating: 5, comment: '' }); },
    onError: (e) => toast.error(e.response?.data?.message ?? 'Failed to submit review'),
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Reviews</h1>
          <p className="text-sm text-slate-500 mt-0.5">Your feedback helps us improve</p>
        </div>
        <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors">
          <Plus size={16} /> Write Review
        </button>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-slate-400"><Loader2 size={20} className="animate-spin mr-2" /> Loading…</div>
        ) : reviews.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center py-16 text-slate-400">
            <MessageSquare size={36} className="mb-2 opacity-30" />
            <p className="text-sm">You haven't left a review yet. Share your experience!</p>
          </div>
        ) : reviews.map(r => (
          <div key={r.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-slate-800">{r.customerName}</p>
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(n => <Star key={n} size={12} className={n <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'} />)}
              </div>
            </div>
            {r.comment && <p className="text-sm text-slate-600">{r.comment}</p>}
            <p className="text-xs text-slate-400 mt-1">{new Date(r.createdAt).toLocaleDateString()}</p>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-base font-semibold text-slate-800">Write a Review</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100"><X size={16} /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); mut.mutate(form); }} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-2">Rating</label>
                <StarRating value={form.rating} onChange={r => setForm(f => ({ ...f, rating: r }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Comment</label>
                <textarea value={form.comment} onChange={e => setForm(f => ({ ...f, comment: e.target.value }))} rows={4}
                  placeholder="Share your experience…"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none" />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={mut.isPending} className="px-4 py-2 rounded-lg bg-amber-500 text-white text-sm font-semibold flex items-center gap-2 disabled:opacity-60 hover:bg-amber-600">
                  {mut.isPending && <Loader2 size={14} className="animate-spin" />} Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
