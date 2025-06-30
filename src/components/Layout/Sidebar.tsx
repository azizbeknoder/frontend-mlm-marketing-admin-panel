import React from "react";
import {
  Users,
  CreditCard,
  ArrowDownToLine,
  Package,
  BarChart3,
  Bell,
  Menu,
  X,
  Plus,
  Coins,
  HandCoins,
  Trophy,
  ListOrdered,
  LogOut,
  DatabaseBackup,
  CreditCardIcon,
  Settings,
} from "lucide-react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MdOutlineAdminPanelSettings } from "react-icons/md";
import { AiOutlineUnderline } from "react-icons/ai";

interface SidebarProps {
  activeSection: string;
  isOpen: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  isOpen,
  onToggle,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const menuItems = [
    { id: "users", label: t("userManagement"), icon: Users },
    { id: "addproducts", label: t("Addproducts"), icon: Plus },
    { id: "payments", label: t("paymentHistory"), icon: CreditCard },
    { id: "getCoin", label: t("getCoin"), icon: HandCoins },
    {
      id: "withdrawals",
      label: t("withdrawalRequests"),
      icon: ArrowDownToLine,
    },
    { id: "tariffs", label: t("tariffManagement"), icon: Package },
    { id: "statistics", label: t("statistics"), icon: BarChart3 },
    { id: "notifications", label: t("notifications"), icon: Bell },
    { id: "coinAmount", label: t("coinAmount"), icon: Coins },
    { id: "referalLevel", label: t("referalLevel"), icon: Trophy },
    { id: "orderProduct", label: t("orderProduct"), icon: ListOrdered },
    { id: "bonusHistory", label: t("bonusHistory"), icon: DatabaseBackup },
    { id: "cardManagers", label: t("cardManagers"), icon: CreditCardIcon },
    { id: "supportCenter", label: t("supportCenter"), icon: Settings },
    { id: "addAdmin", label: t("addAdmin"), icon: MdOutlineAdminPanelSettings },
    { id: "about", label: t("about"), icon: AiOutlineUnderline },
  ];

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
    window.location.reload();
  }

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={onToggle}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 lg:z-10
    w-64 bg-white border-r border-gray-200 shadow-lg
    transform transition-transform duration-300 ease-in-out
    ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
  `}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-4 flex flex-col gap-3 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">
              {t("adminPanel")}
            </h1>
            <div>
              <LanguageSwitcher />
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    navigate(`/${item.id}`); // Use navigate for routing
                    if (window.innerWidth < 1024) onToggle();
                  }}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                    activeSection === item.id
                      ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  <span className="font-medium capitalize">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-gray-200">
            <button
              className="flex items-center justify-center gap-2 py-2 rounded-lg bg-blue-500/50 border border-blue-500 w-full"
              onClick={handleLogout}
            >
              <LogOut className="w-5" />
              {t("logout")}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
