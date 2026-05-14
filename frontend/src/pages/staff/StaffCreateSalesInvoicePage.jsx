import { useState, useContext, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import AuthContext from '../../context/AuthContext';
import { ArrowLeft, Plus, Minus, Loader2, Search, FileText, CheckCircle, Mail, RotateCcw } from 'lucide-react';
import api from '../../api/api';

const fetchCustomers = () => api.get('/customers').then(r => r.data);
const fetchParts     = () => api.get('/parts').then(r => r.data);
const createInvoice  = (dto) => api.post('/sales-invoices', dto).then(r => r.data);

export default function StaffCreateSalesInvoicePage() {
  const { currentUser: user } = useContext(AuthContext);
  const qc = useQueryClient();
  const [searchParams] = useSearchParams();
  const preselectedId = searchParams.get('customerId');

  const [customerId, setCustomerId]   = useState(preselectedId ?? '');
  const [customerSearch, setCustomerSearch] = useState('');
  const [items, setItems]             = useState([]);
  const [isCreditSale, setIsCredit]   = useState(false);
  const [discountApplied, setDiscount] = useState(false);
  const [partSearch, setPartSearch]   = useState('');
  const [createdInvoice, setCreatedInvoice] = useState(null);

  const { data: customers = [] } = useQuery({ queryKey: ['customers'], queryFn: fetchCustomers });
  const { data: parts = [] }     = useQuery({ queryKey: ['parts'],     queryFn: fetchParts });

  const mut = useMutation({
    mutationFn: createInvoice,
    onSuccess: (data) => {
      toast.success(`Invoice #${data.id} created!`);
      qc.invalidateQueries(['sales-invoices']);
      setCreatedInvoice(data);
    },
    onError: (e) => toast.error(e.response?.data?.message ?? 'Failed to create invoice'),
  });

  const emailMut = useMutation({
    mutationFn: (id) => api.post(`/email/send-invoice/${id}`).then(r => r.data),
    onSuccess: () => toast.success('Invoice email sent successfully!'),
    onError: () => toast.error('Failed to send email'),
  });

  const resetForm = () => {
    setCreatedInvoice(null);
    setItems([]);
    setCustomerId('');
    setIsCredit(false);
    setDiscount(false);
  };

  const filteredCustomers = customers.filter(c =>
    !customerSearch || [c.fullName, c.email].join(' ').toLowerCase().includes(customerSearch.toLowerCase())
  );
  const filteredParts = parts.filter(p =>
    !partSearch || p.name.toLowerCase().includes(partSearch.toLowerCase())
  );

  const selectedCustomer = customers.find(c => c.id === Number(customerId));

  const addItem = (part) => {
    setItems(prev => {
      const exists = prev.find(i => i.partId === part.id);
      if (exists) return prev.map(i => i.partId === part.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { partId: part.id, name: part.name, price: part.sellingPrice, quantity: 1, stock: part.stockQuantity }];
    });
  };

  const changeQty = (partId, delta) =>
    setItems(prev => prev.map(i => i.partId === partId
      ? { ...i, quantity: Math.max(1, i.quantity + delta) }
      : i
    ).filter(i => i.quantity > 0));

  const removeItem = (partId) => setItems(prev => prev.filter(i => i.partId !== partId));

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  
  useEffect(() => {
    if (subtotal >= 5000) setDiscount(true);
    else setDiscount(false);
  }, [subtotal]);

  const discount = discountApplied ? subtotal * 0.1 : 0;
  const total    = subtotal - discount;

  const submit = () => {
    if (!customerId) return toast.error('Select a customer');
    if (!items.length) return toast.error('Add at least one part');
    mut.mutate({
      customerId: Number(customerId),
      isCreditSale,
      discountApplied,
      items: items.map(i => ({ partId: i.partId, quantity: i.quantity })),
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/staff/customers" className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Create Sales Invoice</h1>
          <p className="text-sm text-slate-500 mt-0.5">Select a customer and add parts</p>
        </div>
      </div>

      {createdInvoice ? (
        <div className="bg-white rounded-2xl border border-green-100 shadow-sm p-8 text-center max-w-lg mx-auto mt-10">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Invoice Created!</h2>
          <p className="text-slate-500 mb-6">Invoice #{createdInvoice.id} has been saved successfully.</p>
          
          <div className="space-y-3">
            <button
              onClick={() => emailMut.mutate(createdInvoice.id)}
              disabled={emailMut.isPending || emailMut.isSuccess}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-medium transition-colors"
            >
              {emailMut.isPending ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
              {emailMut.isSuccess ? 'Email Sent' : 'Send Invoice Email'}
            </button>
            
            <button
              onClick={resetForm}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium transition-colors"
            >
              <RotateCcw size={16} />
              Create Another Invoice
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Customer + Parts */}
        <div className="lg:col-span-2 space-y-5">

          {/* Customer Selection */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
            <h2 className="text-sm font-semibold text-slate-700">Customer</h2>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={customerSearch}
                onChange={e => setCustomerSearch(e.target.value)}
                placeholder="Search customers…"
                className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {filteredCustomers.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => { setCustomerId(String(c.id)); setCustomerSearch(''); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    customerId === String(c.id)
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="font-medium">{c.fullName}</span>
                  <span className={`ml-2 text-xs ${customerId === String(c.id) ? 'text-blue-100' : 'text-slate-400'}`}>{c.email}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Parts Selector */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
            <h2 className="text-sm font-semibold text-slate-700">Add Parts</h2>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={partSearch}
                onChange={e => setPartSearch(e.target.value)}
                placeholder="Search parts…"
                className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="max-h-56 overflow-y-auto space-y-1">
              {filteredParts.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => addItem(p)}
                  disabled={p.stockQuantity === 0}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <div className="text-left">
                    <p className="font-medium text-slate-800">{p.name}</p>
                    <p className="text-xs text-slate-400">{p.category ?? 'General'} · Stock: {p.stockQuantity}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-semibold text-slate-700">NPR {Number(p.sellingPrice).toLocaleString()}</span>
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                      <Plus size={12} />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="space-y-5">
          {/* Selected Items */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-violet-600" />
              <h2 className="text-sm font-semibold text-slate-700">Order Summary</h2>
            </div>

            {items.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No items added yet</p>
            ) : (
              <div className="space-y-2">
                {items.map(item => (
                  <div key={item.partId} className="flex items-center gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-800 truncate">{item.name}</p>
                      <p className="text-xs text-slate-500">NPR {Number(item.price).toLocaleString()} × {item.quantity}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => changeQty(item.partId, -1)} className="w-5 h-5 rounded border border-slate-200 flex items-center justify-center hover:bg-slate-50">
                        <Minus size={10} />
                      </button>
                      <span className="text-xs w-5 text-center font-semibold">{item.quantity}</span>
                      <button onClick={() => changeQty(item.partId, 1)} disabled={item.quantity >= item.stock} className="w-5 h-5 rounded border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-40">
                        <Plus size={10} />
                      </button>
                      <button onClick={() => removeItem(item.partId)} className="w-5 h-5 rounded border border-red-100 flex items-center justify-center hover:bg-red-50 text-red-500 ml-1">
                        <Minus size={10} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Totals */}
            <div className="border-t border-slate-100 pt-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>NPR {subtotal.toLocaleString()}</span>
              </div>
              {discountApplied && (
                <div className="flex justify-between text-green-600">
                  <span>Discount (10%)</span>
                  <span>−NPR {discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-slate-800 text-sm pt-1">
                <span>Total</span>
                <span>NPR {total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
            <h2 className="text-sm font-semibold text-slate-700">Options</h2>
            {[
              { label: 'Apply 10% Loyalty Discount (Auto > Rs.5000)', checked: discountApplied, onChange: setDiscount, id: 'discount', disabled: subtotal >= 5000 },
              { label: 'Credit Sale (Pay Later)', checked: isCreditSale, onChange: setIsCredit, id: 'credit' },
            ].map(opt => (
              <label key={opt.id} className={`flex items-center gap-3 ${opt.disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                <input
                  type="checkbox"
                  id={opt.id}
                  checked={opt.checked}
                  onChange={e => !opt.disabled && opt.onChange(e.target.checked)}
                  disabled={opt.disabled}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600"
                />
                <span className="text-sm text-slate-700">{opt.label}</span>
              </label>
            ))}
          </div>

          {/* Customer summary */}
          {selectedCustomer && (
            <div className="bg-slate-50 rounded-xl border border-slate-200 px-4 py-3 text-xs text-slate-600 space-y-1">
              <p className="font-semibold text-slate-800">{selectedCustomer.fullName}</p>
              <p>Credit Balance: <span className={Number(selectedCustomer.creditBalance) > 0 ? 'text-red-600 font-semibold' : ''}>
                NPR {Number(selectedCustomer.creditBalance ?? 0).toLocaleString()}
              </span></p>
            </div>
          )}

          <button
            onClick={submit}
            disabled={mut.isPending || !customerId || !items.length}
            className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            {mut.isPending && <Loader2 size={15} className="animate-spin" />}
            Create Invoice
          </button>
        </div>
      </div>
      )}
    </div>
  );
}
