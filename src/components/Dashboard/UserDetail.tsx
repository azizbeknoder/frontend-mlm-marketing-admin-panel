import React, { useEffect, useState } from "react";
import {
  User as UserIcon,
  Mail,
  Calendar,
  Coins,
  Shield,
  Users,
  ShoppingBag,
  CreditCard,
  Package,
  Crown,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  GlobeIcon,
} from "lucide-react";
import { User } from "../types";

type UserDetailsProps = {
  userId: string;
};

const UserDetail: React.FC<UserDetailsProps> = ({ userId }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${import.meta.env.VITE_API_KEY}/users/${userId}`,
          {
            headers: {
              accept: "*/*",
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch user");
        const data = await res.json();
        // API returns array, so take first element if array
        setUser(Array.isArray(data) ? data[0] : data);
      } catch (e) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [userId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const StatCard = ({
    icon: Icon,
    label,
    value,
    color = "text-gray-600",
    bgColor = "bg-gray-50",
  }: {
    icon: any;
    label: string;
    value: string | number;
    color?: string;
    bgColor?: string;
  }) => (
    <div className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-all duration-200 hover:border-gray-200">
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-lg ${bgColor}`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <p className="text-lg font-semibold text-gray-900 truncate">
            {value}
          </p>
        </div>
      </div>
    </div>
  );

  const InfoRow = ({
    label,
    value,
    isPassword = false,
  }: {
    label: string;
    value: string | number | null;
    isPassword?: boolean;
  }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
      <span className="text-gray-500 font-medium text-sm">{label}</span>
      <div className="flex items-center space-x-2">
        {isPassword ? (
          <>
            <span className="text-gray-900 font-mono text-sm">
              {showPassword ? value : "••••••••••••••••"}
            </span>
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4 text-gray-400" />
              ) : (
                <Eye className="w-4 h-4 text-gray-400" />
              )}
            </button>
          </>
        ) : (
          <span className="text-gray-900 font-medium text-sm text-right">
            {value || "-"}
          </span>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">
            Loading user information...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            User Not Found
          </h2>
          <p className="text-gray-600">
            The requested user could not be found or you don't have permission
            to view it.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 mb-6 border border-gray-100 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                <UserIcon className="w-8 h-8 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl font-bold text-gray-900 capitalize truncate">
                  {user.name}
                </h1>
                <div className="flex items-center space-x-2 mt-1">
                  <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-600 truncate">{user.email}</span>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-sm text-gray-500">ID: {user.id}</span>
                  <span className="text-gray-300">•</span>
                  <div className="flex items-center space-x-1">
                    <Shield className="w-4 h-4 text-purple-500" />
                    <span className="text-sm font-medium text-purple-600 uppercase">
                      {user.role}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center sm:justify-end">
              {user.isActive ? (
                <div className="flex items-center space-x-2 bg-green-50 px-4 py-2 rounded-full">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-green-700 text-sm font-medium">
                    Active
                  </span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 bg-red-50 px-4 py-2 rounded-full">
                  <XCircle className="w-4 h-4 text-red-500" />
                  <span className="text-red-700 text-sm font-medium">
                    Inactive
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={Coins}
            label="Coin Balance"
            value={formatCurrency(user.coin)}
            color="text-yellow-600"
            bgColor="bg-yellow-50"
          />
          <StatCard
            icon={CreditCard}
            label="Payments"
            value={user.payments?.length || 0}
            color="text-green-600"
            bgColor="bg-green-50"
          />
          <StatCard
            icon={ShoppingBag}
            label="Orders"
            value={user.orders?.length || 0}
            color="text-blue-600"
            bgColor="bg-blue-50"
          />
          <StatCard
            icon={Users}
            label="Referrals"
            value={user.referrals?.length || 0}
            color="text-purple-600"
            bgColor="bg-purple-50"
          />
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <StatCard
            icon={Package}
            label="Products Ordered"
            value={user.ordersProduct?.length || 0}
            color="text-indigo-600"
            bgColor="bg-indigo-50"
          />
          <StatCard
            icon={Crown}
            label="Tariff Plans"
            value={user.userTariff?.length || 0}
            color="text-orange-600"
            bgColor="bg-orange-50"
          />
          <StatCard
            icon={GlobeIcon}
            label="Google Account"
            value={user.googleId ? "Connected" : "Not Connected"}
            color={user.googleId ? "text-green-600" : "text-gray-400"}
            bgColor={user.googleId ? "bg-green-50" : "bg-gray-50"}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Account Details */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <UserIcon className="w-5 h-5 text-gray-600" />
              <span>Account Details</span>
            </h3>

            <div className="space-y-0">
              <InfoRow label="User ID" value={user.id} />
              <InfoRow label="Full Name" value={user.name} />
              <InfoRow label="Email Address" value={user.email} />
              <InfoRow label="Role" value={user.role.toUpperCase()} />
              <InfoRow label="Google ID" value={user.googleId} />
              <InfoRow
                label="Password Hash"
                value={user.password}
                isPassword={true}
              />
            </div>
          </div>

          {/* Timeline Section */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-gray-600" />
              <span>Account Timeline</span>
            </h3>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 font-medium">Account Created</p>
                  <p className="text-gray-500 text-sm">
                    {formatDate(user.createdAt)}
                  </p>
                </div>
              </div>

              {user.updateAt && (
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 font-medium">Last Updated</p>
                    <p className="text-gray-500 text-sm">
                      {formatDate(user.updateAt)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetail;
