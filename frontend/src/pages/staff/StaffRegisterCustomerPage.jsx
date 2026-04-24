import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { UserPlus, Car, Plus, Trash2, Loader2, ArrowLeft } from 'lucide-react';
import api from '../../api/api';

const registerCustomer = (dto) => api.post('/customers', dto).then(r => r.data);

const emptyVehicle = () => ({ make: '', model: '', year: '', licensePlate: '', mileage: '' });

export default function StaffRegisterCustomerPage() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const mut = useMutation({
    mutationFn: registerCustomer,
    onSuccess: (data) => {
      toast.success(`Customer "${data.fullName}" registered!`);
      navigate('/staff/customers');
    },
    onError: (e) => toast.error(e.response?.data?.message ?? 'Registration failed'),
  });

  const addVehicle = () => setVehicles(v => [...v, emptyVehicle()]);
  const removeVehicle = (i) => setVehicles(v => v.filter((_, idx) => idx !== i));
  const updateVehicle = (i, field, value) =>
    setVehicles(v => v.map((veh, idx) => idx === i ? { ...veh, [field]: value } : veh));

  const onSubmit = (formData) => {
    const dto = {
      fullName: formData.fullName,
      email:    formData.email,
      password: formData.password,
      phone:    formData.phone || null,
      vehicles: vehicles
        .filter(v => v.make || v.licensePlate)
        .map(v => ({
          make:         v.make        || null,
          model:        v.model       || null,
          year:         v.year        ? parseInt(v.year)    : 0,
          licensePlate: v.licensePlate || null,   // ← backend JsonPropertyName("licensePlate") on NumberPlate
          mileage:      v.mileage     ? parseInt(v.mileage) : 0,
        })),
    };
    mut.mutate(dto);
  };

  const busy = isSubmitting || mut.isPending;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/staff/customers" className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Register New Customer</h1>
          <p className="text-sm text-slate-500 mt-0.5">Create a customer account and optionally register their vehicle(s)</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* ── Personal Info ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <UserPlus size={18} className="text-blue-600" />
            <h2 className="text-base font-semibold text-slate-800">Personal Information</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Full Name *</label>
              <input
                {...register('fullName', { required: 'Full name is required' })}
                placeholder="Ram Bahadur"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Phone</label>
              <input
                {...register('phone')}
                placeholder="98XXXXXXXX"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Email *</label>
              <input
                type="email"
                {...register('email', { required: 'Email is required' })}
                placeholder="ram@example.com"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Password *</label>
              <input
                type="password"
                {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
                placeholder="Min 6 characters"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>
          </div>
        </div>

        {/* ── Vehicles ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Car size={18} className="text-emerald-600" />
              <h2 className="text-base font-semibold text-slate-800">Vehicles</h2>
              <span className="text-xs text-slate-400">(optional)</span>
            </div>
            <button
              type="button"
              onClick={addVehicle}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              <Plus size={15} /> Add Vehicle
            </button>
          </div>

          {vehicles.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-4">
              No vehicles added yet. Click "Add Vehicle" to register one.
            </p>
          )}

          {vehicles.map((veh, i) => (
            <div key={i} className="border border-slate-200 rounded-xl p-4 space-y-3 relative">
              <button
                type="button"
                onClick={() => removeVehicle(i)}
                className="absolute top-3 right-3 p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
              >
                <Trash2 size={14} />
              </button>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Vehicle {i + 1}</p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Make</label>
                  <input
                    value={veh.make}
                    onChange={e => updateVehicle(i, 'make', e.target.value)}
                    placeholder="Toyota"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Model</label>
                  <input
                    value={veh.model}
                    onChange={e => updateVehicle(i, 'model', e.target.value)}
                    placeholder="Hilux"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Year</label>
                  <input
                    type="number"
                    value={veh.year}
                    onChange={e => updateVehicle(i, 'year', e.target.value)}
                    placeholder="2020"
                    min="1900" max="2099"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">License Plate</label>
                  <input
                    value={veh.licensePlate}
                    onChange={e => updateVehicle(i, 'licensePlate', e.target.value.toUpperCase())}
                    placeholder="BA 1 PA 1234"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Mileage (km)</label>
                  <input
                    type="number"
                    value={veh.mileage}
                    onChange={e => updateVehicle(i, 'mileage', e.target.value)}
                    placeholder="15000"
                    min="0"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Actions ── */}
        <div className="flex justify-end gap-3">
          <Link
            to="/staff/customers"
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={busy}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold flex items-center gap-2 transition-colors"
          >
            {busy && <Loader2 size={15} className="animate-spin" />}
            Register Customer
          </button>
        </div>
      </form>
    </div>
  );
}
