import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  X, Plus, Trash2, Loader2, Save, 
  ShoppingCart, ArrowLeft, Package, User, Building2
} from 'lucide-react';
import api from '../../api/api';

const fetchVendors = () => api.get('/vendors').then(r => r.data);
const fetchParts   = () => api.get('/parts').then(r => r.data);
const createInvoice = (dto) => api.post('/purchase-invoices', dto).then(r => r.data);

export default function CreatePurchaseInvoicePage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  
  const { data: vendors = [], isLoading: vLoading } = useQuery({ queryKey: ['vendors'], queryFn: fetchVendors });
  const { data: parts = [], isLoading: pLoading } = useQuery({ queryKey: ['parts'], queryFn: fetchParts });

  const { register, control, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      vendorId: '',
      items: [{ partId: '', quantity: 1, unitCost: 0 }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items"
  });

  const createMut = useMutation({
    mutationFn: createInvoice,
    onSuccess: () => {
      qc.invalidateQueries(['purchase-invoices']);
      qc.invalidateQueries(['parts']);
      toast.success('Purchase invoice recorded and stock updated');
      navigate('/admin/purchase-invoices');
    },
    onError: (e) => {
      toast.error(e.response?.data?.message || 'Failed to create invoice');
    }
  });

  const onSubmit = (data) => {
    if (data.items.length === 0) {
      toast.error('Add at least one item');
      return;
    }
    const payload = {
      vendorId: parseInt(data.vendorId),
      items: data.items.map(item => ({
        partId: parseInt(item.partId),
        quantity: parseInt(item.quantity),
        unitCostPrice: parseFloat(item.unitCost)
      }))
    };
    createMut.mutate(payload);
  };

  const watchItems = watch("items");
  const grandTotal = watchItems.reduce((acc, curr) => acc + (curr.quantity * curr.unitCost || 0), 0);

  const isLoading = vLoading || pLoading;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-semibold text-sm">
          <ArrowLeft size={18} /> Back to Records
        </button>
        <div className="flex items-center gap-2 bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100">
           <ShoppingCart size={16} className="text-blue-600" />
           <span className="text-xs font-bold text-blue-700 uppercase tracking-widest">New Purchase</span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-20">
        {/* Vendor Selection Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
             <Building2 size={20} className="text-slate-400" /> Supplier Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select Vendor *</label>
              <select 
                {...register('vendorId', { required: 'Please select a vendor' })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white transition-all appearance-none"
              >
                <option value="">-- Select Vendor --</option>
                {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
              {errors.vendorId && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase">{errors.vendorId.message}</p>}
            </div>
            <div className="bg-slate-50 rounded-xl p-4 flex items-center gap-4 border border-slate-100">
               <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                  <User size={18} />
               </div>
               <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Authorizing Admin</p>
                  <p className="text-sm font-semibold text-slate-700">Current Session Admin</p>
               </div>
            </div>
          </div>
        </div>

        {/* Line Items Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
           <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                 <Package size={20} className="text-slate-400" /> Purchased Items
              </h2>
              <button 
                type="button" 
                onClick={() => append({ partId: '', quantity: 1, unitCost: 0 })}
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-bold text-xs uppercase tracking-widest px-3 py-1.5 rounded-lg border border-blue-100 hover:bg-blue-50 transition-all"
              >
                <Plus size={14} /> Add Line
              </button>
           </div>

           <div className="space-y-4">
              <div className="hidden md:grid grid-cols-12 gap-4 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                 <div className="col-span-5">Part / Item</div>
                 <div className="col-span-2">Quantity</div>
                 <div className="col-span-2">Unit Cost ($)</div>
                 <div className="col-span-2 text-right">Subtotal</div>
                 <div className="col-span-1"></div>
              </div>

              {fields.map((item, index) => (
                <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-slate-50/50 p-4 rounded-2xl border border-slate-100 group transition-all hover:bg-white hover:shadow-md hover:border-blue-100">
                  <div className="col-span-1 md:col-span-5">
                    <label className="md:hidden block text-[10px] font-bold text-slate-400 uppercase mb-1">Part</label>
                    <select 
                      {...register(`items.${index}.partId`, { required: 'Required' })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    >
                      <option value="">Select Part...</option>
                      {parts.map(p => <option key={p.id} value={p.id}>{p.name} (Stock: {p.stockQuantity})</option>)}
                    </select>
                  </div>
                  <div className="col-span-1 md:col-span-2">
                    <label className="md:hidden block text-[10px] font-bold text-slate-400 uppercase mb-1">Qty</label>
                    <input 
                      type="number" 
                      min="1"
                      {...register(`items.${index}.quantity`, { required: true, min: 1 })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                    />
                  </div>
                  <div className="col-span-1 md:col-span-2">
                    <label className="md:hidden block text-[10px] font-bold text-slate-400 uppercase mb-1">Cost</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      min="0"
                      {...register(`items.${index}.unitCost`, { required: true })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                    />
                  </div>
                  <div className="col-span-1 md:col-span-2 text-right">
                    <label className="md:hidden block text-[10px] font-bold text-slate-400 uppercase mb-1">Total</label>
                    <p className="text-sm font-bold text-slate-700">
                      ${(watch(`items.${index}.quantity`) * watch(`items.${index}.unitCost`) || 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="col-span-1 md:col-span-1 flex justify-end">
                    <button 
                      type="button" 
                      onClick={() => remove(index)}
                      className="p-2 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}

              {fields.length === 0 && (
                 <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-2xl">
                    <p className="text-sm text-slate-400 italic">No items added yet. Click &quot;Add Line&quot; to begin.</p>
                 </div>
              )}
           </div>

           <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col items-end">
              <div className="space-y-1 text-right">
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Grand Total Cost</p>
                 <p className="text-4xl font-black text-slate-900">${grandTotal.toFixed(2)}</p>
              </div>
           </div>
        </div>

        {/* Footer Actions */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-lg border-t border-slate-100 shadow-[0_-10px_20px_rgba(0,0,0,0.02)] flex justify-center z-40">
           <div className="max-w-4xl w-full flex justify-end gap-4">
              <button 
                type="button" 
                onClick={() => navigate(-1)}
                className="px-8 py-3 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-all"
              >
                Discard
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting || createMut.isPending}
                className="px-10 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold flex items-center gap-3 shadow-xl shadow-slate-200 transition-all active:scale-95 disabled:opacity-60"
              >
                {(isSubmitting || createMut.isPending) ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                Record Purchase
              </button>
           </div>
        </div>
      </form>
    </div>
  );
}
