import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MenuPage from './pages/MenuPage';
import CartPage from './pages/CartPage';
import OrderStatusPage from './pages/OrderStatusPage';
import AdminDashboard from './pages/AdminDashboard';
import KitchenDisplay from './pages/KitchenDisplay';
// import { Toaster } from 'react-hot-toast';
// Actually let's keep it simple.

import Signup from './pages/Signup';
import UserLogin from './pages/UserLogin';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';

import { ThemeProvider } from './context/ThemeContext';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <CartProvider>
            <div className="min-h-screen bg-gray-50 text-gray-900">
              <Routes>
                {/* User Routes */}
                <Route path="/" element={<MenuPage />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/user-login" element={<UserLogin />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/order/:id" element={<OrderStatusPage />} />

                {/* Admin Routes (Protected) */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/admin" element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/kitchen" element={
                  <ProtectedRoute>
                    <KitchenDisplay />
                  </ProtectedRoute>
                } />
              </Routes>
            </div>
          </CartProvider>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
