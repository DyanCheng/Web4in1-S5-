import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import Chatbot from './components/Chatbot';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ToursPage from './pages/ToursPage';
import TourDetailPage from './pages/TourDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import DashboardPage from './pages/DashboardPage';
import AdminDashboard from './pages/AdminDashboard';
import HotelOwnerDashboard from './pages/HotelOwnerDashboard';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/tours" element={<ToursPage />} />
              <Route path="/tour/:id" element={<TourDetailPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/hotel-owner" element={<HotelOwnerDashboard />} />
            </Routes>

            {/* Chatbot - available on all pages */}
            <Chatbot />
          </div>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
