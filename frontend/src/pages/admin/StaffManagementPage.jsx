import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Users, UserCheck, UserX, Plus, X, Edit2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../api/api';

const fetchStaff   = () => api.get('/staff').then(r => r.data);
const setActive    = ({ id, isActive }) =>
  api.patch(`/staff/${id}/active`, { isActive }).then(r => r.data);
const createStaff  = (dto) => api.post('/staff', dto).then(r => r.data);
const updateStaff  = ({ id, ...dto }) => api.put(`/staff/${id}`, dto).then(r => r.data);

export default function StaffManagementPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    fullName: '', email: '', password: '', phone: '', department: '', employeeCode: ''
  });

  const { data: staff = [], isLoading } = useQuery({
    queryKey: ['staff'],
    queryFn: fetchStaff,
  });

  const toggleMut = useMutation({
    mutationFn: setActive,
    onSuccess: (updated) => {
      qc.setQueryData(['staff'], (old = []) =>
        old.map(s => s.id === updated.id ? updated : s)
      );
      toast.success(
        updated.isActive
          ? `${updated.fullName} has been reactivated.`
          : `${updated.fullName} has been deactivated.`
      );
    },
    onError: () => toast.error('Failed to update staff status.'),
  });

  const createMut = useMutation({
    mutationFn: createStaff,
    onSuccess: () => {
      qc.invalidateQueries(['staff']);
      toast.success('Staff member added successfully!');
      closeModal();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to add staff member.'),
  });

  const updateMut = useMutation({
    mutationFn: updateStaff,
    onSuccess: (updated) => {
      qc.setQueryData(['staff'], (old = []) =>
        old.map(s => s.id === updated.id ? updated : s)
      );
      toast.success('Staff member updated successfully!');
      closeModal();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to update staff member.'),
  });

  const openAddModal = () => {
    setEditingId(null);
    setForm({ fullName: '', email: '', password: '', phone: '', department: '', employeeCode: '' });
    setShowModal(true);
  };

  const openEditModal = (s) => {
    setEditingId(s.id);
    setForm({
      fullName: s.fullName || '',
      email: s.email || '',
      password: '', // Leave password empty for edit mode (we aren't updating it in the DTO anyway, but we keep the field hidden)
      phone: s.phone || '',
      department: s.department || '',
      employeeCode: s.employeeCode || ''
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (editingId) {
      updateMut.mutate({ id: editingId, ...form });
    } else {
      createMut.mutate(form);
    }
  };

  const activeCount   = staff.filter(s => s.isActive).length;
  const inactiveCount = staff.length - activeCount;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Staff Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {activeCount} active
            {inactiveCount > 0 && (
              <span className="ml-1 text-red-500">· {inactiveCount} inactive</span>
            )}
          </p>
        </div>
        <button 
          onClick={openAddModal}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
        >
          <Plus size={16} /> Add Staff
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <Loader2 size={20} className="animate-spin mr-2" /> Loading…
          </div>
        ) : staff.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <Users size={36} className="mb-2 opacity-30" />
            <p className="text-sm">No staff members found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Department (Role)</th>
                  <th className="px-4 py-3 text-left">Employee Code</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {staff.map(s => {
                  const isToggling = toggleMut.isPending &&
                    toggleMut.variables?.id === s.id;

                  return (
                    <tr
                      key={s.id}
                      className={`transition-colors ${
                        s.isActive
                          ? 'hover:bg-slate-50'
                          : 'bg-slate-50/60 opacity-75 hover:opacity-100'
                      }`}
                    >
                      {/* Name */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold uppercase shrink-0 ${
                            s.isActive
                              ? 'bg-violet-100 text-violet-600'
                              : 'bg-slate-200 text-slate-500'
                          }`}>
                            {s.fullName?.charAt(0)}
                          </div>
                          <span className={`font-medium ${s.isActive ? 'text-slate-800' : 'text-slate-400 line-through'}`}>
                            {s.fullName}
                          </span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-4 py-3 text-slate-500">{s.email}</td>

                      {/* Department */}
                      <td className="px-4 py-3 text-slate-500">{s.department ?? '—'}</td>

                      {/* Employee Code */}
                      <td className="px-4 py-3 font-mono text-xs text-slate-500">
                        {s.employeeCode ?? '—'}
                      </td>

                      {/* Status badge */}
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                          s.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-600'
                        }`}>
                          {s.isActive
                            ? <><UserCheck size={10} /> Active</>
                            : <><UserX size={10} /> Inactive</>
                          }
                        </span>
                      </td>

                      {/* Action button */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(s)}
                            className="inline-flex items-center justify-center p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => toggleMut.mutate({ id: s.id, isActive: !s.isActive })}
                            disabled={isToggling}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 ${
                              s.isActive
                                ? 'border border-red-200 text-red-600 hover:bg-red-50'
                                : 'border border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                            }`}
                          >
                            {isToggling
                              ? <Loader2 size={12} className="animate-spin" />
                              : s.isActive
                              ? <UserX size={12} />
                              : <UserCheck size={12} />
                            }
                            {s.isActive ? 'Deactivate' : 'Reactivate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">
                {editingId ? 'Edit Staff Details' : 'Add New Staff'}
              </h2>
              <button onClick={closeModal} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-600 mb-1">Full Name *</label>
                  <input required value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                {!editingId && (
                  <>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-slate-600 mb-1">Email *</label>
                      <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-slate-600 mb-1">Password * (Min 6 chars)</label>
                      <input required type="password" minLength={6} value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </>
                )}
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-medium text-slate-600 mb-1">Phone</label>
                  <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-medium text-slate-600 mb-1">Employee Code</label>
                  <input value={form.employeeCode} onChange={e => setForm({...form, employeeCode: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-600 mb-1">Department (Role)</label>
                  <input value={form.department} onChange={e => setForm({...form, department: e.target.value})} placeholder="e.g. Manager, Mechanics, Sales" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                <button type="button" onClick={closeModal} className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={createMut.isPending || updateMut.isPending} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60">
                  {(createMut.isPending || updateMut.isPending) && <Loader2 size={16} className="animate-spin" />}
                  {editingId ? 'Save Changes' : 'Save Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
