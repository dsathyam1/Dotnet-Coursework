import { useState, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  Plus, Trash2, Search, Loader2, Save, 
  ArrowLeft, Package, User, CreditCard, Gift, 
  ChevronRight, AlertTriangle, Info, FileText
} from 'lucide-react';
import api from '../../api/api';

const fetchCustomers = () => api.get('/customers').then(r => r.data);
const fetchParts     = () => api.get('/parts').then(r => r.data);
const createInvoice  = (dto) => api.post('/sales-invoices', dto).then(r => r.data);

export default function StaffCreateSalesInvoicePage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [customerSearch, setCustomerSearch] = useState('');
  
  const { data: customers = [], isLoading: cLoading } = useQuery({ queryKey: ['customers-list'], queryFn: fetchCustomers });
  const { data: parts = [], isLoading: pLoading } = useQuery({ queryKey: ['parts-list'], queryFn: fetchParts });

  const { register, control, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      customerId: '',
      isPaid: true, // Default to cash sale
      items: [{ partId: '', quantity: 1 }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items"
  });

  const selectedCustomerId = watch('customerId');
  const watchItems = watch("items");
  const isPaid = watch('isPaid');

  // Filtering customers
  const filteredCustomers = useMemo(() => 
    customers.filter(c => c.fullName.toLowerCase().includes(customerSearch.toLowerCase())),
    [customers, customerSearch]
  );

  const selectedCustomer = useMemo(() => 
    customers.find(c => c.id === parseInt(selectedCustomerId)),
    [customers, selectedCustomerId]
  );

  // Subtotal Calculation
  const subtotal = useMemo(() => {
    return watchItems.reduce((acc, curr) => {
      const part = parts.find(p => p.id === parseInt(curr.partId));
      if (!part) return acc;
      return acc + (part.sellingPrice * curr.quantity);
    }, 0);
  }, [watchItems, parts]);

  const discount = subtotal > 5000 ? subtotal * 0.1 : 0;
  const total = subtotal - discount;

  const mutation = useMutation({
    mutationFn: createInvoice,
    onSuccess: (data) => {
      qc.invalidateQueries(['sales-invoices']);
      qc.invalidateQueries(['customer-invoices']);
      qc.invalidateQueries(['parts-list']);
      toast.success('Invoice created successfully!');
      navigate(`/staff/customers/${selectedCustomerId}`);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to create invoice');
    }
  });

  const onSubmit = (data) => {
    if (!data.customerId) {
       toast.error("Please select a customer");
       return;
    }
    if (data.items.length === 0 || data.items.some(i => !i.partId)) {
       toast.error("Please add parts to the invoice");
       return;
    }
    const payload = {
      customerId: parseInt(data.customerId),
      isPaid: data.isPaid,
      items: data.items.map(i => ({
        partId: parseInt(i.partId),
        quantity: parseInt(i.quantity)
      }))
    };
    mutation.mutate(payload);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-slate-800 transition-colors font-bold text-xs uppercase tracking-widest">
          <ArrowLeft size={16} /> Cancel
        </button>
        <div className="flex items-center gap-2 bg-blue-600 px-4 py-1.5 rounded-full border border-blue-400 shadow-lg shadow-blue-200">
           <FileText className="text-white w-4 h-4" />
           <span className="text-xs font-black text-white uppercase tracking-[0.2em]">Sales Terminal</span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Customer & Settings */}
        <div className="lg:col-span-1 space-y-6">
           {/* Customer Selection */}
           <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
              <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
                 <User size={18} className="text-blue-500" /> Customer
              </h3>
              
              <div className="space-y-4">
                 <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input 
                      type="text" 
                      placeholder="Search customers..." 
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                    />
                 </div>
                 
                 <div className="max-h-48 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                    {filteredCustomers.slice(0, 10).map(c => (
                       <button 
                         key={c.id} 
                         type="button"
                         onClick={() => {
                            setValue('customerId', c.id.toString());
                            setCustomerSearch(c.fullName);
                         }}
                         className={`w-full text-left p-3 rounded-xl transition-all border ${selectedCustomerId === c.id.toString() ? 'bg-blue-600 border-blue-400 shadow-lg shadow-blue-100' : 'bg-white border-slate-100 hover:border-blue-200 hover:bg-blue-50'}`}
                       >
                          <p className={`text-sm font-bold ${selectedCustomerId === c.id.toString() ? 'text-white' : 'text-slate-800'}`}>{c.fullName}</p>
                          <p className={`text-[10px] uppercase font-bold tracking-tighter ${selectedCustomerId === c.id.toString() ? 'text-blue-100' : 'text-slate-400'}`}>CID-{c.id.toString().padStart(5, '0')}</p>
                       </button>
                    ))}
                    {filteredCustomers.length === 0 && <p className="text-center py-4 text-xs text-slate-400 italic">No customers found.</p>}
                 </div>
              </div>

              {selectedCustomer && (
                 <div className="mt-6 pt-6 border-t border-slate-50 flex items-center gap-4 bg-blue-50/50 p-4 rounded-2xl">
                    <div className="w-10 h-10 rounded-full bg-white border border-blue-100 flex items-center justify-center font-bold text-blue-600">
                       {selectedCustomer.fullName.charAt(0)}
                    </div>
                    <div>
                       <p className="text-xs font-black text-slate-800">{selectedCustomer.fullName}</p>
                       <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Balance: ${Number(selectedCustomer.creditBalance).toFixed(2)}</p>
                    </div>
                 </div>
              )}
           </div>

           {/* Payment Method */}
           <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
              <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
                 <CreditCard size={18} className="text-blue-500" /> Payment
              </h3>
              <div className="flex bg-slate-100 p-1 rounded-2xl">
                 <button 
                   type="button"
                   onClick={() => setValue('isPaid', true)}
                   className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${isPaid ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                 >
                    Cash/Card
                 </button>
                 <button 
                   type="button"
                   onClick={() => setValue('isPaid', false)}
                   className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${!isPaid ? 'bg-amber-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}
                 >
                    Credit
                 </button>
              </div>
              {!isPaid && (
                 <div className="mt-4 flex gap-3 bg-amber-50 p-4 rounded-2xl border border-amber-100">
                    <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-amber-800 font-medium leading-relaxed">Credit sales will increase the customer&apos;s outstanding balance. Ensure they have sufficient credit limits.</p>
                 </div>
              )}
           </div>
        </div>

        {/* Right Column: Line Items */}
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                    <Package size={24} className="text-slate-300" /> Line Items
                 </h3>
                 <button 
                   type="button" 
                   onClick={() => append({ partId: '', quantity: 1 })}
                   className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                 >
                    <Plus size={14} /> Add Part
                 </button>
              </div>

              <div className="space-y-4">
                 {fields.map((item, index) => (
                    <div key={item.id} className="grid grid-cols-12 gap-4 items-center bg-slate-50/50 p-4 rounded-2xl border border-slate-100 transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-100 group">
                       <div className="col-span-7">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 px-1">Select Part</label>
                          <select 
                            {...register(`items.${index}.partId`, { required: true })}
                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                          >
                             <option value="">-- Choose Part --</option>
                             {parts.map(p => (
                                <option key={p.id} value={p.id}>{p.name} (${p.sellingPrice})</option>
                             ))}
                          </select>
                       </div>
                       <div className="col-span-2">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 px-1">Qty</label>
                          <input 
                            type="number"
                            min="1"
                            {...register(`items.${index}.quantity`, { required: true, min: 1 })}
                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-black outline-none focus:ring-2 focus:ring-blue-500 transition-all text-center"
                          />
                       </div>
                       <div className="col-span-2 text-right">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Subtotal</label>
                          <p className="text-sm font-black text-slate-800 py-2.5">
                             ${(parts.find(p => p.id === parseInt(watch(`items.${index}.partId`)))?.sellingPrice * watch(`items.${index}.quantity`) || 0).toFixed(2)}
                          </p>
                       </div>
                       <div className="col-span-1 flex justify-end">
                          <button 
                            type="button" 
                            onClick={() => remove(index)}
                            className="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                          >
                             <Trash2 size={18} />
                          </button>
                       </div>
                    </div>
                 ))}
              </div>

              {/* Summary */}
              <div className="mt-12 pt-8 border-t border-slate-100 space-y-4">
                 {discount > 0 && (
                    <div className="flex items-center gap-3 bg-emerald-50 text-emerald-700 px-6 py-4 rounded-2xl border border-emerald-100 animate-in zoom-in duration-300 shadow-sm">
                       <Gift className="shrink-0" />
                       <div className="flex-1">
                          <p className="text-sm font-black uppercase tracking-widest">10% Loyalty Discount Applied!</p>
                          <p className="text-[10px] font-bold text-emerald-600 mt-0.5 uppercase tracking-tighter">Your subtotal exceeded $5,000</p>
                       </div>
                       <p className="text-lg font-black">-${discount.toFixed(2)}</p>
                    </div>
                 )}
                 
                 <div className="flex flex-col items-end gap-1 px-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Final Amount Due</p>
                    <p className="text-5xl font-black text-slate-900 tracking-tight">${total.toFixed(2)}</p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-2">
                       <Info size={12} /> Includes VAT and standard service fees
                    </p>
                 </div>
              </div>
           </div>

           <div className="flex justify-end gap-4">
              <button 
                type="submit" 
                disabled={isSubmitting || mutation.isPending}
                className="w-full py-5 bg-slate-900 hover:bg-slate-800 text-white rounded-3xl font-black uppercase tracking-[0.3em] text-xs shadow-2xl shadow-slate-200 flex items-center justify-center gap-4 transition-all active:scale-95 disabled:opacity-50"
              >
                 {(isSubmitting || mutation.isPending) ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                 Finalize Invoice
              </button>
           </div>
        </div>
      </form>
    </div>
  );
}
