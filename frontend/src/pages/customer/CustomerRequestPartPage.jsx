import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Package, Plus, X, Loader2, Clock, CheckCircle } from 'lucide-react';
import api from '../../api/api';

const fetchRequests  = () => api.get('/part-requests/mine').then(r => r.data);
const createRequest  = (dto) => api.post('/part-requests', dto).then(r => r.data);

const STATUS_COLORS = {
  Pending:   'bg-amber-100 text-amber-700',
  Approved:  'bg-blue-100 text-blue-700',
  Rejected:  'bg-red-100 text-red-600',
  Fulfilled: 'bg-green-100 text-green-700',
};

export default function CustomerRequestPartPage() {
  const [searchParams] = useSearchParams();
  const initialPartName = searchParams.get('name') || '';
  
  const [showModal, setShowModal] = useState(!!initialPartName);
  const [form, setForm] = useState({ partName: initialPartName, description: '' });
  const qc = useQueryClient();

  const { data: requests = [], isLoading } = useQuery({ queryKey: ['my-requests'], queryFn: fetchRequests });
  const mut = useMutation({
    mutationFn: createRequest,
    onSuccess: () => { qc.invalidateQueries(['my-requests']); toast.success('Request submitted!'); setShowModal(false); setForm({ partName: '', description: '' }); },
    onError: (e) => toast.error(e.response?.data?.message ?? 'Failed to submit request'),
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Part Requests</h1>
          <p className="text-sm text-slate-500 mt-0.5">Request parts that aren't in our inventory</p>
        </div>
        <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors">
          <Plus size={16} /> New Request
        </button>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-slate-400"><Loader2 size={20} className="animate-spin mr-2" /> Loading…</div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center py-16 text-slate-400">
            <Package size={36} className="mb-2 opacity-30" />
            <p className="text-sm">No part requests yet.</p>
          </div>
        ) : requests.map(r => (
          <div key={r.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4 flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-800">{r.partName ?? 'Unnamed Part'}</p>
              {r.description && <p className="text-xs text-slate-500 mt-0.5">{r.description}</p>}
              <p className="text-xs text-slate-400 mt-1">{new Date(r.requestedAt).toLocaleDateString()}</p>
            </div>
            <span className={`inline-flex text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[r.status] ?? 'bg-slate-100 text-slate-600'}`}>
              {r.status}
            </span>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-base font-semibold text-slate-800">Request a Part</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100"><X size={16} /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); mut.mutate(form); }} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Part Name</label>
                <input value={form.partName} onChange={e => setForm(f => ({ ...f, partName: e.target.value }))} placeholder="e.g. Brake pads for Hilux"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3}
                  placeholder="Any additional details about the part…"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={mut.isPending} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold flex items-center gap-2 disabled:opacity-60 hover:bg-blue-700">
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
