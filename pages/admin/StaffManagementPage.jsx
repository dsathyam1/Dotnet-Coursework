import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Plus, X, Loader2, Wrench, Search, Pencil, UserX, UserCheck, Briefcase, Users, AlertTriangle } from 'lucide-react';
import api from '../../api/api';

const fetchStaff   = () => api.get('/admin/staff').then(r => r.data);
const createStaff  = (dto) => api.post('/admin/staff', dto).then(r => r.data);
const updateStaff  = ({ id, dto }) => api.put(`/admin/staff/${id}`, dto).then(r => r.data);
const deactivate   = (id) => api.delete(`/admin/staff/${id}`);

function StaffModal({ staff, onClose }) {
  const qc = useQueryClient();
  const isEdit = !!staff;
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: isEdit ? { 
      fullName: staff.fullName, 
      email: staff.email, 
      phoneNumber: staff.phone ?? '',
      department: staff.department ?? ''
    } : {
      department: 'Sales'
    },
  });

  const createMut = useMutation({ 
    mutationFn: createStaff, 
    onSuccess: () => { 
      qc.invalidateQueries(['staff']); 
      toast.success('Staff member created'); 
      onClose(); 
    }, 
    onError: e => toast.error(e.response?.data?.message ?? 'Failed to create staff') 
  });

  const updateMut = useMutation({ 
    mutationFn: updateStaff, 
    onSuccess: () => { 
      qc.invalidateQueries(['staff']); 
      toast.success('Staff updated'); 
      onClose(); 
    }, 
    onError: e => toast.error(e.response?.data?.message ?? 'Failed to update staff') 
  });

  const onSubmit = (data) => {
    const payload = {
      fullName: data.fullName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      department: data.department,
      password: data.password // Only for new staff
    };
    isEdit ? updateMut.mutate({ id: staff.id, dto: payload }) : createMut.mutate(payload);
  };

  const busy = isSubmitting || createMut.isPending || updateMut.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800">{isEdit ? 'Edit Staff Details' : 'Add New Staff'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Full Name *</label>
            <input {...register('fullName', { required: 'Full name is required' })} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="e.g. John Smith" />
            {errors.fullName && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase">{errors.fullName.message}</p>}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Email *</label>
              <input type="email" {...register('email', { required: 'Email is required' })} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="john@vms.com" />
              {errors.email && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Phone</label>
              <input type="tel" {...register('phoneNumber')} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="+1..." />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Department</label>
            <select {...register('department')} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-all">
              <option value="Sales">Sales</option>
              <option value="Inventory">Inventory</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Admin">Admin Support</option>
            </select>
          </div>

          {!isEdit && (
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Temporary Password *</label>
              <input type="password" {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="••••••••" />
              {errors.password && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase">{errors.password.message}</p>}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
            <button type="submit" disabled={busy} className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold flex items-center gap-2 shadow-lg shadow-blue-100 disabled:opacity-60 transition-all">
              {busy && <Loader2 size={16} className="animate-spin" />} {isEdit ? 'Save Changes' : 'Create Staff'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function StaffManagementPage() {
  const [modal, setModal]   = useState(null);
  const [deactId, setDeactId] = useState(null);
  const [search, setSearch] = useState('');
  const qc = useQueryClient();

  const { data: staff = [], isLoading, isError } = useQuery({ queryKey: ['staff'], queryFn: fetchStaff });
  
  const deactMut = useMutation({
    mutationFn: deactivate,
    onSuccess: () => { 
      qc.invalidateQueries(['staff']); 
      toast.success('Staff status updated'); 
      setDeactId(null); 
    },
    onError: e => { 
      toast.error(e.response?.data?.message ?? 'Failed to update status'); 
      setDeactId(null); 
    },
  });

  const filtered = staff.filter(s => 
    [s.fullName, s.email, s.department].join(' ').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Staff Management</h1>
          <p className="text-sm text-slate-500 mt-1">Manage employee accounts and system access</p>
        </div>
        <button onClick={() => setModal('create')} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-100 transition-all active:scale-95">
          <Plus size={18} /> Add New Staff
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative max-w-sm w-full">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              placeholder="Search by name, email or dept..." 
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white" 
            />
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
            <Users size={14} /> {filtered.length} Total
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400">
              <Loader2 size={32} className="animate-spin mb-4" />
              <p className="text-sm font-medium">Loading staff records...</p>
            </div>
          ) : isError ? (
             <div className="py-24 text-center">
                <p className="text-red-500 font-bold">Error loading staff list.</p>
             </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400">
              <Wrench size={48} className="mb-4 opacity-20" />
              <p className="text-sm font-medium">{search ? 'No staff matching your search' : 'No staff members found'}</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50/50 text-[10px] uppercase font-bold tracking-widest text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-left">Employee</th>
                  <th className="px-6 py-4 text-left">Contact</th>
                  <th className="px-6 py-4 text-left">Department</th>
                  <th className="px-6 py-4 text-left">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(s => (
                  <tr key={s.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold uppercase shrink-0 shadow-sm border border-blue-50 group-hover:scale-110 transition-transform">
                          {s.fullName?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{s.fullName}</p>
                          <p className="text-[10px] text-slate-400 font-mono tracking-tighter uppercase">{s.employeeCode || 'STF-00'+s.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-600 font-medium">{s.email}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{s.phone || 'No phone'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-600 font-semibold">
                        <Briefcase size={14} className="text-slate-300" />
                        {s.department || 'General'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${s.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {s.isActive ? <UserCheck size={12} /> : <UserX size={12} />}
                        {s.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => setModal(s)} 
                          className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-100 transition-all"
                          title="Edit Details"
                        >
                          <Pencil size={16} />
                        </button>
                        <button 
                          onClick={() => setDeactId(s.id)} 
                          className={`p-2 rounded-lg transition-all ${s.isActive ? 'text-slate-400 hover:text-red-600 hover:bg-red-100' : 'text-emerald-400 hover:text-emerald-600 hover:bg-emerald-100'}`}
                          title={s.isActive ? 'Deactivate' : 'Reactivate'}
                        >
                          {s.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modal && <StaffModal staff={modal === 'create' ? null : modal} onClose={() => setModal(null)} />}

      {deactId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={32} className="text-amber-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Change Account Status?</h3>
            <p className="text-sm text-slate-500 mb-8 leading-relaxed">
              This will toggle the staff member&apos;s ability to log in and perform actions in the system.
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setDeactId(null)} className="flex-1 px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
              <button 
                onClick={() => deactMut.mutate(deactId)} 
                disabled={deactMut.isPending} 
                className="flex-1 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-amber-100 disabled:opacity-60 transition-all"
              >
                {deactMut.isPending && <Loader2 size={16} className="animate-spin" />} Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
