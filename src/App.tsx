import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { Sidebar } from "./components/Layout/Sidebar";
import { UserManagement } from "./components/Dashboard/UserManagement";
import { PaymentHistory } from "./components/Dashboard/PaymentHistory";
import { WithdrawalRequests } from "./components/Dashboard/WithdrawalRequests";
import { AutomaticPayments } from "./components/Dashboard/AutomaticPayments";
import { Statistics } from "./components/Dashboard/Statistics";
import { NotificationSystem } from "./components/Dashboard/NotificationSystem";
import AddProduct from "./components/Dashboard/Addproducts";
import CoinAmount from "./components/Dashboard/CoinAmount";
import LoginPage from "./pages/LoginPage";
import UserDetail from "./components/Dashboard/UserDetail";
import GetCoin from "./components/Dashboard/GetCoin";
import TariffManagement from "./components/Dashboard/TariffManagement";
import Referalevel from "./components/Dashboard/Referalevel";
import { Toaster } from "sonner";
import OrderProducts from "./components/Dashboard/OrderProducts";
import BonusHistory from "./components/Dashboard/BonusHistory";
import CardManager from "./components/Dashboard/CardManager";
import Support from "./components/Dashboard/Support";
import AddAdmin from "./components/Dashboard/AddAdmin";
import AboutPage from "./pages/About";

export function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <Routes>
            <Route
              path="/users"
              element={
                <UserManagement onUserClick={(id) => navigate(`/user/${id}`)} />
              }
            />
            <Route path="/user/:userId" element={<UserDetail />} />
            <Route path="/addproducts" element={<AddProduct />} />
            <Route path="/payments" element={<PaymentHistory />} />
            <Route path="/withdrawals" element={<WithdrawalRequests />} />
            <Route path="/tariffs" element={<TariffManagement />} />
            <Route path="/autopay" element={<AutomaticPayments />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route path="/notifications" element={<NotificationSystem />} />
            <Route path="/coinAmount" element={<CoinAmount />} />
            <Route path="/getCoin" element={<GetCoin />} />
            <Route path="/referalLevel" element={<Referalevel />} />
            <Route path="/orderProduct" element={<OrderProducts />} />
            <Route path="/bonusHistory" element={<BonusHistory />} />
            <Route path="/cardManagers" element={<CardManager />} />
            <Route path="/supportCenter" element={<Support />} />
            <Route path="/addAdmin" element={<AddAdmin />} />
            <Route path="/about" element={<AboutPage />} />
            <Route
              path="/"
              element={
                <UserManagement onUserClick={(id) => navigate(`/user/${id}`)} />
              }
            />
          </Routes>
        </div>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}
