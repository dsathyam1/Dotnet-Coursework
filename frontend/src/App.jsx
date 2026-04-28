import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Auth
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Public pages
import LoginPage    from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Layouts
import AdminLayout    from './layouts/AdminLayout';
import StaffLayout    from './layouts/StaffLayout';
import CustomerLayout from './layouts/CustomerLayout';

// Admin pages
import AdminDashboard           from './pages/admin/AdminDashboard';
import PartsManagementPage      from './pages/admin/PartsManagementPage';
import CustomersPage            from './pages/admin/CustomersPage';
import StaffManagementPage      from './pages/admin/StaffManagementPage';
import SalesInvoicesPage        from './pages/admin/SalesInvoicesPage';
import PurchaseInvoicesPage     from './pages/admin/PurchaseInvoicesPage';
import CreatePurchaseInvoicePage from './pages/admin/CreatePurchaseInvoicePage';
import VendorsPage              from './pages/admin/VendorsPage';
import ReportsPage              from './pages/admin/ReportsPage';
import NotificationsPage        from './pages/admin/NotificationsPage';

// Staff pages
import StaffDashboard            from './pages/staff/StaffDashboard';
import StaffCustomerSearchPage   from './pages/staff/StaffCustomerSearchPage';
import StaffCustomerDetailPage   from './pages/staff/StaffCustomerDetailPage';
import StaffRegisterCustomerPage from './pages/staff/StaffRegisterCustomerPage';
import StaffCreateSalesInvoicePage from './pages/staff/StaffCreateSalesInvoicePage';
import StaffReportsPage          from './pages/staff/StaffReportsPage';
import StaffPartsPage            from './pages/staff/StaffPartsPage';

// Customer pages
import CustomerDashboard       from './pages/customer/CustomerDashboard';
import CustomerProfilePage     from './pages/customer/CustomerProfilePage';
import CustomerHistoryPage     from './pages/customer/CustomerHistoryPage';
import CustomerAppointmentsPage from './pages/customer/CustomerAppointmentsPage';
import CustomerRequestPartPage  from './pages/customer/CustomerRequestPartPage';
import CustomerReviewsPage      from './pages/customer/CustomerReviewsPage';
import CustomerPartsPage       from './pages/customer/CustomerPartsPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: { fontSize: '14px', borderRadius: '10px' },
          }}
        />

        <Routes>
          {/* ── Public ── */}
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* ── Admin (protected) ── */}
          <Route element={<ProtectedRoute allowedRole="Admin" />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/parts"     element={<PartsManagementPage />} />
              <Route path="/admin/customers" element={<CustomersPage />} />
              <Route path="/admin/staff"     element={<StaffManagementPage />} />
              <Route path="/admin/vendors"   element={<VendorsPage />} />
              <Route path="/admin/orders"    element={<PlaceholderPage title="Admin Orders" />} />
              <Route path="/admin/invoices"  element={<SalesInvoicesPage />} />
              <Route path="/admin/purchase-invoices"     element={<PurchaseInvoicesPage />} />
              <Route path="/admin/purchase-invoices/new" element={<CreatePurchaseInvoicePage />} />
              <Route path="/admin/reports"       element={<ReportsPage />} />
              <Route path="/admin/notifications" element={<NotificationsPage />} />
            </Route>
          </Route>

          {/* ── Staff (protected) ── */}
          <Route element={<ProtectedRoute allowedRole="Staff" />}>
            <Route element={<StaffLayout />}>
              <Route path="/staff/dashboard" element={<StaffDashboard />} />
              <Route path="/staff/customers" element={<StaffCustomerSearchPage />} />
              <Route path="/staff/customers/new" element={<StaffRegisterCustomerPage />} />
              <Route path="/staff/customers/:id" element={<StaffCustomerDetailPage />} />
              <Route path="/staff/sales/new" element={<StaffCreateSalesInvoicePage />} />
              <Route path="/staff/parts"     element={<StaffPartsPage />} />
              <Route path="/staff/reports"   element={<StaffReportsPage />} />
              <Route path="/staff/tasks"     element={<PlaceholderPage title="Staff Tasks" />} />
            </Route>
          </Route>

          {/* ── Customer (protected) ── */}
          <Route element={<ProtectedRoute allowedRole="Customer" />}>
            <Route element={<CustomerLayout />}>
              <Route path="/customer/dashboard"    element={<CustomerDashboard />} />
              <Route path="/customer/profile"      element={<CustomerProfilePage />} />
              <Route path="/customer/history"      element={<CustomerHistoryPage />} />
              <Route path="/customer/appointments" element={<CustomerAppointmentsPage />} />
              <Route path="/customer/request-part" element={<CustomerRequestPartPage />} />
              <Route path="/customer/reviews"      element={<CustomerReviewsPage />} />
              <Route path="/customer/parts"        element={<CustomerPartsPage />} />
            </Route>
          </Route>

          {/* ── Fallback ── */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

/** Temporary inline placeholder — replace each with a real page component */
function PlaceholderPage({ title }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <p className="text-3xl font-bold text-slate-300 mb-2">{title}</p>
      <p className="text-sm text-slate-400">This page is under construction.</p>
    </div>
  );
}
