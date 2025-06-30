import React, { useState, useEffect } from "react";
import {
  Search,
  Eye,
  Ban,
  CheckCircle,
  Users,
  Trash2,
  PlusCircle,
  Plus,
  MinusCircle,
  Minus,
  RefreshCcw,
  X,
} from "lucide-react";
import { User } from "../../types";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export const UserManagement: React.FC<User> = ({}) => {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPlan, setFilterPlan] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isModal, setIsModal] = useState(false);
  const [decModal, setDecMOdal] = useState(false);
  const [isloading, setIsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [blockModal, setBlocModal] = useState(false);
  const [saveBlockUser, setSaveBlockUser] = useState(null);
  const [viewProductModal, setViewProductModal] = useState(false);
  const [allProducts, setAllProducts] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_KEY}/users`, {
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user: any) => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id.toString().includes(searchTerm);
    const matchesPlan =
      filterPlan === "all" || user.subscriptionPlan === filterPlan;
    let matchesStatus = true;
    if (filterStatus === "Active") matchesStatus = user.isActive === true;
    else if (filterStatus === "Inactive")
      matchesStatus = user.isActive === false;
    else if (filterStatus === "Suspended")
      matchesStatus = user.status === "Suspended";
    return matchesSearch && matchesPlan && matchesStatus;
  });

  const [userId, setUserid] = useState(null);

  const addCoin = async (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const obj = {
      count: Number(formData.get("count")),
      userId: Number(userId),
    };
    const token = localStorage.getItem("token");
    try {
      setIsLoading(true);
      const req = await fetch(
        `${import.meta.env.VITE_API_KEY}/balance/increment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(obj),
        }
      );
      if (req.ok) {
        toast.success("Muvaffaqiyatli coin qo'shildi");
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === userId ? { ...user, coin: user.coin + obj.count } : user
          )
        );
      } else {
        const data = await req.json();
        toast.error(data.message || "Coin qo'shishda xatolik yuz berdi");
      }
    } catch (error: any) {
      toast.error("Tarmoqda xatolik: " + error.message);
    } finally {
      setIsModal(false);
      setIsLoading(false);
    }
  };

  const deleteCoin = async (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const obj = {
      count: Number(formData.get("count")),
      userId: Number(userId),
    };
    const token = localStorage.getItem("token");
    try {
      setIsLoading(true);
      const req = await fetch(
        `${import.meta.env.VITE_API_KEY}/balance/decrement`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(obj),
        }
      );
      if (req.ok) {
        toast.success("Muvaffaqiyatli coin ayirildi");
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === userId ? { ...user, coin: user.coin - obj.count } : user
          )
        );
      } else {
        const data = await req.json();
        toast.error(data.message || "Coin ayirishda xatolik yuz berdi");
      }
    } catch (error: any) {
      toast.error("Tarmoqda xatolik: " + error.message);
    } finally {
      setDecMOdal(false);
      setIsLoading(false);
      fetchUsers();
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "Basic":
        return "bg-blue-100 text-blue-800";
      case "Premium":
        return "bg-purple-100 text-purple-800";
      case "Enterprise":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const deleteUser = async (id: any) => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_KEY}/users/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Foydalanuvchini o‘chirishda xatolik yuz berdi");
      }
      toast.success("Foydalanuvchi muvaffaqiyatli o‘chirildi");
      await fetchUsers();
    } catch (error: any) {
      toast.error(error.message || "Noma’lum xatolik");
    }
  };

  const handleAction = async (user: any) => {
    const token = localStorage.getItem("token");
    const endpoint = user.isActive
      ? `${import.meta.env.VITE_API_KEY}/users/block/${user.id}`
      : `${import.meta.env.VITE_API_KEY}/users/deblock/${user.id}`;

    try {
      const res = await fetch(endpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("So‘rov bajarilmadi");
      }

      setUsers((prev: any) =>
        prev.map((u: any) =>
          u.id === user.id ? { ...u, isActive: !u.isActive } : u
        )
      );

      toast.success(
        user.isActive
          ? "Foydalanuvchi bloklandi"
          : "Foydalanuvchi aktivlashtirildi"
      );
    } catch (err: any) {
      toast.error("Xatolik yuz berdi: " + err.message);
    }
  };

  const getAllProducts = async (id: any) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_KEY}/users`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!res.ok) throw new Error("Buyurtmalarni yuklashda xatolik yuz berdi");

      const data = await res.json();

      const selectedProduct = data.find((product: any) => product.id === id);

      if (!selectedProduct) {
        toast.warning("Mahsulot topilmadi");
      } else {
        setAllProducts(selectedProduct);
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {t("userManagementTitle")}
        </h2>
        <p className="text-gray-600">{t("userManagementDesc")}</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={t("searchByEmailOrID")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="all">{t("allStatus")}</option>
              <option value="Active">{t("active")}</option>
              <option value="Inactive">{t("inactive")}</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 mb-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-900">
                {t("totalUsers")}
              </p>
              <p className="text-2xl font-bold text-blue-600">{users.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-green-900">
                {t("activeUsers")}
              </p>
              <p className="text-2xl font-bold text-green-600">
                {users.filter((u: any) => u.isActive).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                <img src="/logo.ico" className="w-5 h-5" />
              </span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-purple-900">
                {t("totalBalance")}
              </p>
              <p className="text-2xl font-bold flex items-center gap-2 text-purple-600">
                {users
                  .reduce((sum: any, user: any) => sum + user.coin, 0)
                  .toFixed(2)}
                <img src="/logo.ico" className="w-4 h-4" />
              </p>
            </div>
          </div>
        </div>
        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                <Ban className="w-4" />
              </span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-900">
                {t("InActiveUsers")}
              </p>
              <p className="text-2xl font-bold text-red-600">
                {users.filter((u: any) => !u.isActive).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="overflow-x-auto rounded-lg shadow border border-gray-200">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                      {t("user")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                      {t("Role")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                      {t("balance")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                      {t("status")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                      {t("registered")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                      {t("actions")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 8 }).map((_, index) => (
                    <tr key={index} className="animate-pulse border-t">
                      <td className="px-4 py-4">
                        <div className="h-4 bg-gray-300 rounded w-48 mb-2"></div>
                        <div className="h-3 bg-gray-300 rounded w-24"></div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="h-5 bg-gray-300 rounded w-16"></div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="h-4 bg-gray-300 rounded w-12"></div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="h-4 bg-gray-300 rounded w-16"></div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="h-4 bg-gray-300 rounded w-20"></div>
                      </td>
                      <td className="px-4 py-4 flex space-x-3">
                        <div className="h-5 w-5 bg-gray-300 rounded-full"></div>
                        <div className="h-5 w-5 bg-gray-300 rounded-full"></div>
                        <div className="h-5 w-5 bg-gray-300 rounded-full"></div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    {t("user")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    {t("Role")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    {t("balance")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    {t("status")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    {t("registered")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    {t("actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers
                  .filter((user: any) => user.role === "USER")
                  .map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50 transition-colors text-sm"
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div>
                          <div className="font-medium text-gray-900">
                            {user.email}
                          </div>
                          <div className="text-gray-500 text-xs">
                            ID: {user.id}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPlanColor(
                            user.id
                          )}`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex gap-1 items-center font-medium text-gray-900">
                          <img
                            src="/logo.ico"
                            className="text-yellow-400 w-4 h-4"
                          />
                          <span>{user.coin}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {user.isActive ? t("active") : t("inactive")}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-500 text-xs">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setDecMOdal(true);
                              setUserid(user.id);
                            }}
                            className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded"
                          >
                            <MinusCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setIsModal(true);
                              setUserid(user.id);
                            }}
                            className="text-yellow-500 hover:text-yellow-700 p-1 hover:bg-yellow-50 rounded"
                          >
                            <PlusCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              getAllProducts(user.id);
                              setViewProductModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setShowDeleteModal(true);
                              setSelectedUserId(user.id);
                            }}
                            className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded"
                            title={t("delete")}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setBlocModal(true);
                              setSaveBlockUser(user);
                            }}
                            className="p-1 rounded transition-colors hover:bg-gray-100"
                          >
                            {user.isActive ? (
                              <Ban className="w-4 h-4 text-red-600 hover:text-red-800 duration-300" />
                            ) : (
                              <CheckCircle className="w-4 h-4 text-green-600 hover:text-green-800 duration-300" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {isModal && (
        <div className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white w-[500px] h-auto p-5 rounded-xl absolute top-[33%] left-[40%] border">
          <div>
            <form onSubmit={addCoin} className="flex flex-col gap-3">
              <label className="font-bold w-full flex items-center justify-between">
                <span>{t("addCoinLabel")}</span>{" "}
                <span>
                  <X
                    className="cursor-pointer"
                    onClick={() => setIsModal(false)}
                  />
                </span>
              </label>
              <div className="flex items-center justify-between w-full gap-2">
                <input
                  type="number"
                  className="border w-full dark:text-gray-900 p-2 rounded-md"
                  name="count"
                  placeholder={t("coinPlaceholder")}
                />
                <button className="border cursor-pointer p-2 flex items-center justify-center rounded-md hover:bg-green-300 duration-500">
                  {isloading ? (
                    <RefreshCcw className="animate-spin" />
                  ) : (
                    <Plus className="text-green-600 hover:text-white dark:text-green-600" />
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {decModal && (
        <div className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white w-[500px] h-auto p-5 rounded-xl absolute top-[33%] left-[40%] border">
          <div>
            <form onSubmit={deleteCoin} className="flex flex-col gap-3">
              <label className="font-bold w-full flex items-center justify-between">
                <span>{t("subtractCoinLabel")}</span>
                <span>
                  <X
                    className="cursor-pointer"
                    onClick={() => setDecMOdal(false)}
                  />
                </span>
              </label>
              <div className="flex items-center justify-between w-full gap-2">
                <input
                  type="number"
                  step={0.01}
                  className="border w-full p-2 dark:text-black text-black rounded-md"
                  name="count"
                  placeholder={t("coinPlaceholder")}
                />
                <button className="border cursor-pointer p-2 flex items-center justify-center rounded-md hover:bg-red-300 duration-500">
                  {isloading ? (
                    <RefreshCcw className="animate-spin" />
                  ) : (
                    <Minus className="text-red-600 hover:text-white dark:text-red-600" />
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-md w-[300px] text-center">
            <p className="mb-4 font-medium">{t("deleteConfirmation")}</p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
              >
                {t("no")}
              </button>
              <button
                onClick={() => {
                  deleteUser(selectedUserId);
                  setShowDeleteModal(false);
                }}
                className="bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded"
              >
                {t("yes")}
              </button>
            </div>
          </div>
        </div>
      )}

      {blockModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-md w-[300px] text-center">
            <p className="mb-4 font-medium">{t("blockConfirmation")}</p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setBlocModal(false)}
                className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
              >
                {t("no")}
              </button>
              <button
                onClick={() => {
                  handleAction(saveBlockUser);
                  setBlocModal(false);
                }}
                className="bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded"
              >
                {t("yes")}
              </button>
            </div>
          </div>
        </div>
      )}

      {viewProductModal && allProducts && (
        <div className="absolute top-5 rounded-md border-2 shadow-sm w-[700px] h-[450px] dark:bg-gray-900 bg-white z-50 px-2">
          <button
            onClick={() => setViewProductModal(false)}
            className="absolute top-6 right-6 text-gray-600 hover:text-black"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-6 flex flex-col gap-3">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {allProducts.name}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {t("emailLabel")} {allProducts.email}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {t("roleLabel")} {allProducts.role}
            </div>
            <div className="flex gap-4 text-sm text-gray-700 dark:text-gray-300">
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">
                {t("coinLabel")} {allProducts.coin}
              </span>
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                {t("referralCoinLabel")} {allProducts.referalCoin}
              </span>
            </div>
            <div className="text-xs text-gray-400">
              {t("registeredLabel")}{" "}
              {new Date(allProducts.createdAt).toLocaleDateString()}
            </div>
          </div>
          <div className="mt-6 p-4 rounded-2xl max-w-2xl space-y-3">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              {t("additionalInfo")}
            </h2>

            <div className="grid grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
              <div>
                {t("googleIdLabel")} {allProducts.googleId}
              </div>
              <div>
                {t("userStatus")}
                <span
                  className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    allProducts.isActive
                      ? "bg-green-200 text-green-800"
                      : "bg-red-200 text-red-800"
                  }`}
                >
                  {allProducts.isActive
                    ? t("userStatusActive")
                    : t("userStatusBlocked")}
                </span>
              </div>
              <div>
                {t("numberOfOrders")} {allProducts.orders.length}
              </div>
              <div>
                {t("numberOfPayments")} {allProducts.payments.length}
              </div>
              <div>
                {t("numberOfTariffs")} {allProducts.userTariff.length}
              </div>
              <div>
                {t("lastUpdated")}{" "}
                {new Date(allProducts.updateAt).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
