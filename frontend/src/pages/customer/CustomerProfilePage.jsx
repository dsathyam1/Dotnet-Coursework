import { useContext, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import AuthContext from '../../context/AuthContext';
import { User, Car, Plus, Trash2, Loader2, Save, X } from 'lucide-react';
import api from '../../api/api';

const fetchProfile  = () => api.get('/auth/profile').then(r => r.data);
const updateProfile = (dto) => api.put('/auth/profile', dto).then(r => r.data);
const fetchMyVehicles = () => api.get('/customers/me/vehicles').then(r => r.data);
const addVehicle    = (dto) => api.post('/customers/me/vehicles', dto).then(r => r.data);
const deleteVehicle = (id) => api.delete(`/customers/me/vehicles/${id}`);

function AddVehicleModal({ onClose }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ make: '', model: '', year: '', licensePlate: '', mileage: '' });

  const mut = useMutation({
    mutationFn: addVehicle,
    onSuccess: () => { qc.invalidateQueries(['my-vehicles']); toast.success('Vehicle added!'); onClose(); },
    onError: (e) => toast.error(e.response?.data?.message ?? 'Failed to add vehicle'),
  });

  const submit = (e) => {
    e.preventDefault();
    if (!form.licensePlate) return toast.error('License plate is required');
    mut.mutate({
      make:         form.make        || null,
      model:        form.model       || null,
      year:         form.year        ? parseInt(form.year)    : 0,
      licensePlate: form.licensePlate,    // ← backend JsonPropertyName("licensePlate") → NumberPlate
      mileage:      form.mileage     ? parseInt(form.mileage) : 0,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-800">Register Vehicle</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100"><X size={16} /></button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-3">
          {[
            { label: 'Make',          key: 'make',         placeholder: 'Toyota',      type: 'text'   },
            { label: 'Model',         key: 'model',        placeholder: 'Hilux',       type: 'text'   },
            { label: 'Year',          key: 'year',         placeholder: '2020',        type: 'number' },
            { label: 'License Plate *', key: 'licensePlate', placeholder: 'BA 1 PA 1234', type: 'text', upper: true },
            { label: 'Mileage (km)',  key: 'mileage',      placeholder: '15000',       type: 'number' },
          ].map(({ label, key, upper, ...rest }) => (
            <div key={key}>
              <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
              <input
                value={form[key]}
                onChange={e => setForm(f => ({ ...f, [key]: upper ? e.target.value.toUpperCase() : e.target.value }))}
                className={`w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${upper ? 'font-mono uppercase' : ''}`}
                {...rest}
              />
            </div>
          ))}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={mut.isPending} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold flex items-center gap-2 disabled:opacity-60 hover:bg-blue-700">
              {mut.isPending && <Loader2 size={14} className="animate-spin" />} Add Vehicle
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CustomerProfilePage() {
  const { currentUser: authUser } = useContext(AuthContext);
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [profileForm, setProfileForm] = useState({ fullName: '', phone: '' });

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
    onSuccess: (d) => setProfileForm({ fullName: d.fullName, phone: d.phone ?? '' }),
  });

  const { data: vehicles = [], isLoading: vehiclesLoading } = useQuery({
    queryKey: ['my-vehicles'],
    queryFn: fetchMyVehicles,
  });

  const updateMut = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => { qc.invalidateQueries(['profile']); toast.success('Profile updated!'); setEditing(false); },
    onError: (e) => toast.error(e.response?.data?.message ?? 'Update failed'),
  });

  const delVehicleMut = useMutation({
    mutationFn: deleteVehicle,
    onSuccess: () => { qc.invalidateQueries(['my-vehicles']); toast.success('Vehicle removed'); },
    onError: () => toast.error('Failed to remove vehicle'),
  });

  if (profileLoading) return (
    <div className="flex items-center justify-center py-20 text-slate-400">
      <Loader2 size={22} className="animate-spin mr-2" /> Loading…
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">My Profile</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage your account details and vehicles</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User size={17} className="text-blue-600" />
            <h2 className="text-base font-semibold text-slate-800">Account Information</h2>
          </div>
          {!editing && (
            <button onClick={() => { setProfileForm({ fullName: profile?.fullName ?? '', phone: profile?.phone ?? '' }); setEditing(true); }}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
              Edit
            </button>
          )}
        </div>

        {editing ? (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Full Name</label>
              <input value={profileForm.fullName} onChange={e => setProfileForm(f => ({ ...f, fullName: e.target.value }))}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Phone</label>
              <input value={profileForm.phone} onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={() => updateMut.mutate(profileForm)} disabled={updateMut.isPending}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold disabled:opacity-60 hover:bg-blue-700 transition-colors">
                {updateMut.isPending && <Loader2 size={13} className="animate-spin" />}
                <Save size={13} /> Save
              </button>
              <button onClick={() => setEditing(false)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Full Name', value: profile?.fullName },
              { label: 'Email',     value: profile?.email },
              { label: 'Phone',     value: profile?.phone ?? '—' },
              { label: 'Role',      value: profile?.role },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-slate-500 mb-0.5">{label}</p>
                <p className="text-sm font-medium text-slate-800">{value}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Vehicles */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Car size={17} className="text-emerald-600" />
            <h2 className="text-base font-semibold text-slate-800">My Vehicles</h2>
          </div>
          <button onClick={() => setShowAddVehicle(true)}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
            <Plus size={15} /> Add Vehicle
          </button>
        </div>

        {vehiclesLoading ? (
          <div className="flex items-center justify-center py-6 text-slate-400">
            <Loader2 size={18} className="animate-spin mr-2" /> Loading…
          </div>
        ) : vehicles.length === 0 ? (
          <div className="text-center py-6">
            <Car size={28} className="mx-auto text-slate-300 mb-2" />
            <p className="text-sm text-slate-400">No vehicles registered yet.</p>
            <button onClick={() => setShowAddVehicle(true)}
              className="mt-2 text-sm text-blue-600 hover:underline font-medium">
              Register your first vehicle →
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {vehicles.map(v => (
              <div key={v.id} className="flex items-center justify-between border border-slate-100 rounded-xl px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {[v.year, v.make, v.model].filter(Boolean).join(' ') || 'Unknown Vehicle'}
                  </p>
                  {/* v.licensePlate comes from backend NumberPlate via [JsonPropertyName("licensePlate")] */}
                  <p className="text-xs font-mono text-slate-500">{v.licensePlate ?? '—'}</p>
                  {v.mileage > 0 && <p className="text-xs text-slate-400">{v.mileage.toLocaleString()} km</p>}
                </div>
                <button onClick={() => delVehicleMut.mutate(v.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddVehicle && <AddVehicleModal onClose={() => setShowAddVehicle(false)} />}
    </div>
  );
}
