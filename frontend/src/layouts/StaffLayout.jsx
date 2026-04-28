import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  FileText,
  ClipboardList,
  Bell,
  LogOut,
  ChevronRight,
  Wrench,
  Users,
  BarChart2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { to: '/staff/dashboard', label: 'Dashboard',       icon: LayoutDashboard },
  { to: '/staff/customers', label: 'Customers',       icon: Users },
  { to: '/staff/sales/new', label: 'New Sale',        icon: ShoppingCart },
  { to: '/staff/parts',     label: 'Inventory',       icon: Package },
  { to: '/staff/reports',    label: 'Reports',         icon: BarChart2 },
  { to: '/staff/tasks',     label: 'My Tasks',        icon: ClipboardList },
];

function SidebarLink({ to, label, Icon }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
          isActive
            ? 'bg-emerald-600 text-white shadow-md'
            : 'text-slate-300 hover:bg-slate-700 hover:text-white'
        }`
      }
    >
      <Icon size={18} />
      <span>{label}</span>
    </NavLink>
  );
}

export default function StaffLayout() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const displayName =
    currentUser?.name ??
    currentUser?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ??
    'Staff';

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      {/* ── Sidebar ── */}
      <aside className="flex flex-col w-64 bg-slate-800 shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-2 px-5 py-5 border-b border-slate-700">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
            <Wrench size={16} className="text-white" />
          </div>
          <span className="text-white font-bold text-sm leading-tight">
            VMS&nbsp;<span className="text-emerald-400">Staff</span>
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <SidebarLink key={to} to={to} label={label} Icon={Icon} />
          ))}
        </nav>

        {/* User strip */}
        <div className="px-4 py-4 border-t border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold uppercase">
              {displayName.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate">{displayName}</p>
              <p className="text-slate-400 text-xs">Staff Member</p>
            </div>
            <button onClick={handleLogout} className="text-slate-400 hover:text-red-400 transition-colors" title="Logout">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top Navbar */}
        <header className="flex items-center justify-between bg-white border-b border-slate-200 px-6 py-3 shadow-sm shrink-0">
          <div className="flex items-center gap-1 text-sm text-slate-400">
            <span>Staff</span>
            <ChevronRight size={14} />
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors">
              <Bell size={18} />
            </button>
            <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold uppercase">
                {displayName.charAt(0)}
              </div>
              <span className="text-sm font-medium text-slate-700">{displayName}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
