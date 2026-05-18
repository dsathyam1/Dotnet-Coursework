import { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Loader2, Car } from 'lucide-react';

export default function LoginPage() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const decoded = await login(form.email, form.password);
      // ClaimTypes.Role serializes to full URI in JWT; use it to route
      const roleKey = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';
      const role = decoded?.[roleKey] ?? decoded?.role;
      if (role === 'Admin')         navigate('/admin/dashboard',    { replace: true });
      else if (role === 'Staff')    navigate('/staff/dashboard',    { replace: true });
      else if (role === 'Customer') navigate('/customer/dashboard', { replace: true });
      else navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 mb-4 shadow-lg">
            <Car size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Vehicle Management</h1>
          <p className="text-slate-400 text-sm mt-1">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl p-8 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
              placeholder="admin@workshop.com"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              required
              placeholder="••••••••"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            Sign In
          </button>
          <p className="text-center text-xs text-slate-500">
            New customer?{' '}
            <Link to="/register" className="text-blue-600 font-medium hover:underline">Create account</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
