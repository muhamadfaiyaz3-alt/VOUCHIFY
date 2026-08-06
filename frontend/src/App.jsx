import { Routes, Route } from "react-router-dom";

/* Providers */
import { AuthProvider } from "./Contexts/AuthContext";
import { VoucherProvider } from "./Contexts/VoucherContext";
import { NotificationProvider } from "./Contexts/NotificationContext";
import { CartProvider } from "./Contexts/CartContext";
/* Layout */
import ErrorBoundary from "./components/ErrorBoundary";
import PublicLayout from "./components/PublicLayout";
import AdminLayout from "./components/AdminLayout";

/* Public pages */
import Home from "./Pages/Home";
import About from "./Pages/About";
import Contact from "./Pages/Contact";
import LoginPage from "./Pages/LoginPage";
import RegisterPage from "./Pages/RegisterPage";
import PrivacyPolicyPage from "./Pages/PrivacyPolicyPage";
import TermsOfServicePage from "./Pages/TermsOfServicePage";
import RewardsInfoPage from "./Pages/RewardsInfoPage";
import FAQ from "./Pages/FAQ";
import ForgotRecovery from "./Pages/ForgotRecovery";

/* Protected pages */
import Profile from "./Pages/Profile";
import ListVoucher from "./Pages/ListVoucher";
import Vouchers from "./Pages/Vouchers";
import VoucherDetail from "./Pages/VoucherDetail";
import ReferralPage from "./Pages/ReferralPage";

import StrictPaymentPage from "./Pages/StrictPaymentPage";

import CartPage from "./Pages/CartPage";

/* Admin pages */
import AdminDashboard from "./Pages/Admin/AdminDashboard";
import AdminTransactions from "./Pages/Admin/AdminTransactions";
import AdminPayouts from "./Pages/Admin/AdminPayouts";
import AdminSettings from "./Pages/Admin/AdminSettings";
import AdminVerifyPayments from "./Pages/Admin/AdminVerifyPayments";
import AdminVerifyVouchers from "./Pages/Admin/AdminVerifyVouchers";
import AdminReactivationRequests from "./Pages/Admin/AdminReactivationRequests";
import AdminAuditLogs from "./Pages/Admin/AdminAuditLogs";
import AdminUsers from "./Pages/Admin/AdminUsers";
import AdminUserVerification from "./Pages/Admin/AdminUserVerification";
import AdminTopBuyers from "./Pages/Admin/AdminTopBuyers";
import AdminBankDetails from "./Pages/Admin/AdminBankDetails";

import ProtectedRoutes from "./routes/ProtectedRoutes";
import ReactivationRequestPage from "./Pages/ReactivationRequestPage";

import { PaymentConfigProvider } from "./Contexts/PaymentConfigContext";

import { ThemeProvider } from "./Contexts/ThemeContext";

const App = () => (
  <ThemeProvider>
    <AuthProvider>
      <PaymentConfigProvider>
        <VoucherProvider>
          <CartProvider>
            <NotificationProvider>
              <Routes>
                {/* ---------- Public & User Layout ---------- */}
                <Route element={<PublicLayout />}>
                  {/* Public routes */}
                  <Route index element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/forgot-password" element={<ForgotRecovery />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                  <Route path="/terms-of-service" element={<TermsOfServicePage />} />
                  <Route path="/rewards-info" element={<RewardsInfoPage />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/appeal" element={<ReactivationRequestPage />} />

                  {/* Protected routes */}
                  <Route element={<ProtectedRoutes />}>
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/list-voucher" element={<ListVoucher />} />
                    <Route path="/vouchers" element={<Vouchers />} />
                    <Route path="/vouchers/:id" element={<VoucherDetail />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/payment/:voucherId" element={<ErrorBoundary><StrictPaymentPage /></ErrorBoundary>} />
                    <Route path="/referrals" element={<ReferralPage />} />
                  </Route>
                </Route>

                {/* ---------- Admin Layout ---------- */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="transactions" element={<AdminTransactions />} />
                  <Route path="verify-payments" element={<AdminVerifyPayments />} />
                  <Route path="verify-vouchers" element={<AdminVerifyVouchers />} />
                  <Route path="payouts" element={<AdminPayouts />} />
                  <Route path="settings" element={<AdminSettings />} />
                  <Route path="reactivations" element={<AdminReactivationRequests />} />
                  <Route path="audit-logs" element={<AdminAuditLogs />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="verify-users" element={<AdminUserVerification />} />
                  <Route path="top-buyers" element={<AdminTopBuyers />} />
                  <Route path="bank-details" element={<AdminBankDetails />} />
                </Route>
              </Routes>
            </NotificationProvider>
          </CartProvider>
        </VoucherProvider>
      </PaymentConfigProvider>
    </AuthProvider>
  </ThemeProvider>
);

export default App;
