import React, { useEffect, useState, useCallback } from "react";
import {
  Search,
  Filter,
  Check,
  X,
  Clock,
  Eye,
  User,
  CreditCard,
  Hash,
  CheckCircle,
  Calendar,
  MessageSquare,
  Globe,
  Calculator,
} from "lucide-react";
import { WithdrawalRequest } from "../../types";
import { useNavigate } from "react-router-dom";
import { toast as sonnerToast } from "sonner";
import { useTranslation } from "react-i18next";
import logo from "/logo.ico";
import i18n from "../../i18n/index";

const sanitizeText = (text: string) => {
  return text
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/'/g, "&#39;");
};

interface Currency {
  currency: string;
  count: number;
}

export const WithdrawalRequests: React.FC = () => {
  const { t } = useTranslation();
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedRequest, setSelectedRequest] =
    useState<WithdrawalRequest | null>(null);
  const [rejectModal, setRejectModal] = useState<{
    open: boolean;
    id: number | null;
  }>({ open: false, id: null });
  const [rejectReason, setRejectReason] = useState("");
  const [viewModal, setViewModal] = useState<{
    open: boolean;
    data: WithdrawalRequest | null;
  }>({ open: false, data: null });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<{
    [id: string]: string | undefined;
  }>({});

  const [curr, setCurr] = useState<Currency[]>([]);
  const navigate = useNavigate();

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_KEY}/take-off`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      if (data.error === "To'ken es kirgan yoki vaqti o'tgan") {
        navigate("/login");
        return;
      }

      if (!Array.isArray(data)) {
        console.error("Expected array but received:", data);
        setWithdrawals([]);
        return;
      }

      setWithdrawals(data);
    } catch (error) {
      console.error("Error fetching payments:", error);
      sonnerToast.error(t("errorFetchingPayments"));
    } finally {
      setLoading(false);
    }
  }, [navigate, t]);

  const getCurrencyData = useCallback(async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_KEY}/coin`);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      if (!Array.isArray(data)) {
        console.error("Expected currency array but received:", data);
        setCurr([]);
        return;
      }
      setCurr(data);
    } catch (error) {
      console.error("Error fetching currency data:", error);
      sonnerToast.error(t("errorFetchingCurrency"));
    }
  }, [t]);

  useEffect(() => {
    fetchPayments();
    getCurrencyData();
  }, [fetchPayments, getCurrencyData]);

  const formatCardNumber = (cardNumber: string | undefined | null): string => {
    if (!cardNumber) return "N/A";
    return sanitizeText(cardNumber.replace(/\s+/g, ""));
  };

  const filteredWithdrawals = withdrawals.filter((withdrawal) => {
    const statusMatch =
      filterStatus === "all" ||
      withdrawal.status?.toLowerCase() === filterStatus.toLowerCase();
    const search = searchTerm.replace(/\s+/g, "").toLowerCase();
    const card = (withdrawal.cardNumber || "")
      .replace(/\s+/g, "")
      .toLowerCase();
    const theSearchMatch = !search || card.includes(search);
    return statusMatch && theSearchMatch;
  });

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "SUCCESS":
        return "bg-green-100 text-green-800 border border-green-200";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border border-red-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case "SUCCESS":
        return <Check className="size-4" />;
      case "PENDING":
        return <Clock className="size-4" />;
      case "CANCELLED":
        return <X className="size-4" />;
      default:
        return null;
    }
  };

  const statusTranslationMap: Record<string, string> = {
    PENDING: "pending",
    SUCCESS: "success",
    CANCELLED: "cancelled",
  };

  const getStatusTranslation = (status: string) =>
    t(statusTranslationMap[status.toUpperCase()] || "unknown");

  const updateWithdrawalStatus = async (
    id: string,
    newStatus: "SUCCESS" | "CANCELLED" | "PENDING"
  ) => {
    setActionLoading((prev) => ({ ...prev, [String(id)]: newStatus }));
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_API_KEY}/take-off/update-status`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({ id: Number(id), status: newStatus }),
        }
      );
      if (res.ok) {
        await fetchPayments();
        sonnerToast.success(t("statusUpdated"));
      } else {
        sonnerToast.error(t("errorUpdatingStatus"));
      }
    } catch (error) {
      sonnerToast.error(t("errorUpdatingStatus"));
      console.error(error);
    } finally {
      setActionLoading((prev) => ({ ...prev, [String(id)]: undefined }));
    }
  };

  const handleReject = (id: number) => {
    setRejectModal({ open: true, id });
    setRejectReason("");
  };

  const submitReject = async () => {
    if (!rejectModal.id || !rejectReason.trim()) return;
    const sanitizedReason = sanitizeText(rejectReason);
    setActionLoading((prev) => ({
      ...prev,
      [String(rejectModal.id)]: "reject",
    }));
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_API_KEY}/take-off/rejected`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({
            id: rejectModal.id,
            commend: sanitizedReason,
          }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        await fetchPayments();
        sonnerToast.success(data.message || t("requestRejected"));
      } else {
        sonnerToast.error(data.message || t("errorRejecting"));
      }
    } catch (error) {
      sonnerToast.error(t("errorRejecting"));
      console.error(error);
    } finally {
      setActionLoading((prev) => ({
        ...prev,
        [String(rejectModal.id!)]: undefined,
      }));
      setRejectModal({ open: false, id: null });
      setRejectReason("");
    }
  };

  const handleApprove = async (id: string): Promise<void> => {
    setActionLoading((prev) => ({ ...prev, [id]: "approve" }));
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_API_KEY}/take-off/checked`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({ id: Number(id) }),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to approve");
      }

      await res.json();
      sonnerToast.success(t("Payment approved"));
      await fetchPayments();
    } catch (error) {
      sonnerToast.error(t("Error approving"));
      console.error(error);
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: undefined }));
    }
  };

  const pendingCount = filteredWithdrawals.filter(
    (w) => w.status.toUpperCase() === "PENDING"
  ).length;
  const cancelledCount = filteredWithdrawals.filter(
    (w) => w.status.toUpperCase() === "CANCELLED"
  ).length;
  const paidCount = filteredWithdrawals.filter(
    (w) => w.status.toUpperCase() === "SUCCESS"
  ).length;
  const unpaidCount = filteredWithdrawals.length;

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: {
        bg: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: Clock,
        text: t("pending"),
      },
      success: {
        bg: "bg-green-100 text-green-800 border-green-200",
        icon: CheckCircle,
        text: t("success"),
      },
      cancelled: {
        bg: "bg-red-100 text-red-800 border-red-200",
        icon: X,
        text: t("cancelled"),
      },
    };
    const key = status.toLowerCase();
    const config = statusConfig[key as keyof typeof statusConfig];
    if (!config) return null;
    const Icon = config.icon;
    return (
      <span
        className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full border ${config.bg}`}
      >
        <Icon className="w-4 h-4 mr-1" />
        {config.text}
      </span>
    );
  };

  const closeModal = () => {
    setViewModal({ open: false, data: null });
    setSelectedRequest(null);
  };

  const openModal = (request: WithdrawalRequest) => {
    setViewModal({ open: true, data: request });
    setSelectedRequest(request);
  };

  const calculateTotalPrice = (withdrawal: WithdrawalRequest) => {
    if (!curr.length || !withdrawal.currency || !withdrawal.how_much) {
      return t("unknown");
    }
    const matched = curr.find((item) => item.currency === withdrawal.currency);
    if (!matched) {
      return t("unknown");
    }

    const oneCoin = Number(matched.count);

    const amount = Number(withdrawal.how_much);

    if (isNaN(oneCoin) || isNaN(amount)) {
      return t("unknown");
    }
    const total = amount * oneCoin;
    return `${total.toFixed(2)} ${withdrawal.currency}`;
  };

  const renderTableContent = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan={8} className="text-center py-4">
            <span className="animate-pulse bg-gray-200 rounded w-32 h-6 inline-block"></span>
          </td>
        </tr>
      );
    }
    if (filteredWithdrawals.length === 0) {
      return (
        <tr>
          <td colSpan={8} className="text-center py-6 text-gray-500">
            {t("noDataFound")}
          </td>
        </tr>
      );
    }
    return filteredWithdrawals.map((withdrawal) => (
      <tr key={withdrawal.id} className="hover:bg-gray-50 transition-colors">
        <td className="px-6 py-4 whitespace-nowrap font-mono">
          {withdrawal.id}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-500">{withdrawal.userId}</div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap font-mono">
          {formatCardNumber(withdrawal.cardNumber)}
        </td>
        <td className="px-6 py-4 whitespace-nowrap font-bold flex items-center gap-2">
          {withdrawal.how_much}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">{withdrawal.currency}</td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span
            className={`inline-flex items-center px-2 py-1 text-xs font-semibold ${getStatusColor(
              withdrawal.status
            )}`}
          >
            {getStatusIcon(withdrawal.status)}
            <span className="ml-1">
              {getStatusTranslation(withdrawal.status)}
            </span>
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {new Date(withdrawal.requestDate).toLocaleDateString()}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex space-x-2">
            <button
              onClick={() => openModal(withdrawal)}
              disabled={!!actionLoading[String(withdrawal.id)]}
              className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition-colors"
              aria-label={t("view")}
            >
              {actionLoading[String(withdrawal.id)] === "view" ? (
                <span className="w-4 h-4 animate-spin border-2 border-blue-400 border-t-transparent rounded-full inline-block" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
            {["PAID", "SUCCESS", "CANCELLED"].includes(
              withdrawal.status.toUpperCase()
            ) === false && (
              <button
                onClick={() => handleReject(withdrawal.id)}
                disabled={actionLoading[String(withdrawal.id)] === "reject"}
                className="text-red-600 hover:text-red-700 p-1 hover:bg-yellow-50 rounded transition-colors"
                aria-label={t("reject")}
              >
                {actionLoading[String(withdrawal.id)] === "reject" ? (
                  <span className="w-4 h-4 animate-spin border-2 border-red-400 border-t-transparent rounded-full inline-block" />
                ) : (
                  <X className="w-4 h-4" />
                )}
              </button>
            )}
            {withdrawal.status === "PENDING" && (
              <button
                onClick={() => handleApprove(String(withdrawal.id))}
                disabled={actionLoading[String(withdrawal.id)] === "approve"}
                className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded transition-colors"
                aria-label={t("approve")}
              >
                {actionLoading[String(withdrawal.id)] === "approve" ? (
                  <span className="w-4 h-4 animate-spin border-2 border-green-400 border-t-transparent rounded-full inline-block" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
        </td>
      </tr>
    ));
  };

  const renderMobileContent = () => {
    if (loading) {
      return (
        <div className="text-center py-4">
          <span className="animate-pulse bg-gray-200 rounded w-32 h-6 inline-block"></span>
        </div>
      );
    }
    if (filteredWithdrawals.length === 0) {
      return (
        <div className="text-center py-4 text-gray-500">{t("noDataFound")}</div>
      );
    }
    return filteredWithdrawals.map((withdrawal) => (
      <div key={withdrawal.id} className="rounded-lg p-4 mb-4 bg-white">
        <div className="text-sm text-gray-500 mb-1">{t("requestId")}</div>
        <div className="font-mono text-sm font-medium text-gray-900 mb-2">
          {withdrawal.id}
        </div>
        <div className="text-sm text-gray-500 mb-1">{t("user")}</div>
        <div className="text-gray-900 text-sm mb-2">
          ID: {withdrawal.userId}
        </div>
        <div className="text-sm text-gray-500 mb-1">{t("cardDetails")}</div>
        <div className="text-gray-900 font-mono mb-2">
          {formatCardNumber(withdrawal.cardNumber)}
        </div>
        <div className="text-sm text-gray-500 mb-1">{t("amount")}</div>
        <div className="text-gray-900 font-bold mb-2">
          {withdrawal.how_much}
        </div>
        <div className="text-sm text-gray-500 mb-1">{t("currency")}</div>
        <div className="text-gray-900 mb-2">{withdrawal.currency}</div>
        <div className="text-sm text-gray-500 mb-1">{t("status")}</div>
        <div
          className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
            withdrawal.status
          )} mb-2`}
        >
          {getStatusIcon(withdrawal.status)}
          <span className="ml-1">
            {getStatusTranslation(withdrawal.status)}
          </span>
        </div>
        <div className="text-sm text-gray-500 mb-1">{t("requestDate")}</div>
        <div className="text-sm text-gray-900 mb-3">
          {new Date(withdrawal.requestDate).toLocaleDateString()}
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => openModal(withdrawal)}
            disabled={!!actionLoading[String(withdrawal.id)]}
            className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition-colors"
            aria-label={t("view")}
          >
            {actionLoading[String(withdrawal.id)] === "view" ? (
              <span className="w-4 h-4 animate-spin border-2 border-blue-400 border-t-transparent rounded-full inline-block" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
          {["PAID", "SUCCESS", "CANCELLED"].includes(
            withdrawal.status.toUpperCase()
          ) === false && (
            <button
              onClick={() => handleReject(withdrawal.id)}
              disabled={actionLoading[String(withdrawal.id)] === "reject"}
              className="text-red-600 hover:text-red-700 p-1 hover:bg-yellow-50 rounded transition-colors"
              aria-label={t("reject")}
            >
              {actionLoading[String(withdrawal.id)] === "reject" ? (
                <span className="w-4 h-4 animate-spin border-2 border-red-400 border-t-transparent rounded-full inline-block" />
              ) : (
                <X className="w-4 h-4" />
              )}
            </button>
          )}
          {withdrawal.status === "PENDING" && (
            <button
              onClick={() => handleApprove(String(withdrawal.id))}
              disabled={actionLoading[String(withdrawal.id)] === "approve"}
              className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded transition-colors"
              aria-label={t("approve")}
            >
              {actionLoading[String(withdrawal.id)] === "approve" ? (
                <span className="w-4 h-4 animate-spin border-2 border-green-400 border-t-transparent rounded-full inline-block" />
              ) : (
                <Check className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
      </div>
    ));
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Reject Modal */}
      {rejectModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                {t("rejectRequest")}
              </h3>
              <button
                onClick={() => setRejectModal({ open: false, id: null })}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                aria-label={t("close")}
              >
                <X size={20} />
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("reasonForRejection")}
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder={t("reasonPlaceholder")}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setRejectModal({ open: false, id: null })}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                {t("cancel")}
              </button>
              <button
                onClick={submitReject}
                disabled={
                  !rejectReason.trim() ||
                  actionLoading[String(rejectModal.id)] === "reject"
                }
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-300"
              >
                {actionLoading[String(rejectModal.id)] === "reject" ? (
                  <span className="w-4 h-4 animate-spin border-2 border-white border-t-transparent rounded-full inline-block" />
                ) : (
                  t("reject")
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewModal.open && viewModal.data && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <CreditCard className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {t("requestDetails")}
                    </h3>
                    <p className="text-blue-100 text-sm">{viewModal.data.id}</p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg"
                  aria-label={t("close")}
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                    <User className="text-gray-600 mt-1" size={18} />
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        {t("fullName")}
                      </p>
                      <p className="font-semibold text-gray-900">
                        {viewModal.data.fullName || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                    <CreditCard className="text-gray-600 mt-1" size={18} />
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        {t("cardNumber")}
                      </p>
                      <p className="font-mono text-gray-900">
                        {formatCardNumber(viewModal.data.cardNumber)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                    <Globe className="text-gray-600 mt-1" size={18} />
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        {t("currency")}
                      </p>
                      <p className="font-mono text-gray-900">
                        {viewModal.data.currency}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                    <img width={20} height={20} src={logo} alt="logo" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        {t("amountLabel")}
                      </p>
                      <p className="font-bold text-xl text-green-600">
                        {viewModal.data.how_much}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-start gap-3 p-4 py-5 bg-gray-50 rounded-xl">
                    <p className="text-gray-500 flex gap-2 font-bold">
                      <Calculator className="text-sm" />
                      {t("total_price")}:
                    </p>
                    <span>{calculateTotalPrice(viewModal.data)}</span>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                    <Hash className="text-gray-600 mt-1" size={18} />
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        {t("userId")}
                      </p>
                      <p className="font-mono text-gray-900">
                        {viewModal.data.userId}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                    <CheckCircle className="text-gray-600 mt-1" size={18} />
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        {t("statusLabel")}
                      </p>
                      <div className="mt-1">
                        {getStatusBadge(viewModal.data.status)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                    <Calendar className="text-gray-600 mt-1" size={18} />
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        {t("requestTime")}
                      </p>
                      <p className="text-gray-900">
                        {new Date(viewModal.data.requestDate).toLocaleString(
                          i18n.language,
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </div>
                  </div>
                  {viewModal.data.status === "PENDING" && (
                    <div className="flex gap-3 order-1 sm:order-none">
                      <button
                        onClick={() => {
                          handleApprove(String(viewModal.data!.id));
                          closeModal();
                        }}
                        disabled={
                          actionLoading[String(viewModal.data.id)] === "approve"
                        }
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-green-300"
                      >
                        {actionLoading[String(viewModal.data.id)] ===
                        "approve" ? (
                          <span className="w-4 h-4 animate-spin border-2 border-white border-t-transparent rounded-full inline-block" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                        {t("approve")}
                      </button>
                      <button
                        onClick={() => {
                          handleReject(viewModal.data!.id);
                          closeModal();
                        }}
                        disabled={
                          actionLoading[String(viewModal.data.id)] === "reject"
                        }
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:bg-red-300"
                      >
                        {actionLoading[String(viewModal.data.id)] ===
                        "reject" ? (
                          <span className="w-4 h-4 animate-spin border-2 border-white border-t-transparent rounded-full inline-block" />
                        ) : (
                          <X className="w-4 h-4" />
                        )}
                        {t("reject")}
                      </button>
                    </div>
                  )}

                  {viewModal.data.checkedDate && (
                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                      <Clock className="text-gray-600 mt-1" size={18} />
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          {t("checkedTime")}
                        </p>
                        <p className="text-gray-900">
                          {new Date(viewModal.data.checkedDate).toLocaleString(
                            i18n.language,
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>
                    </div>
                  )}
                  {viewModal.data.commend && (
                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                      <MessageSquare className="text-gray-600 mt-1" size={18} />
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          {t("comment")}
                        </p>
                        <p className="text-gray-900 mt-1">
                          {sanitizeText(viewModal.data.commend)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action buttons section */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                {/* Status message for non-pending requests */}
                {viewModal.data.status !== "PENDING" && (
                  <div className="order-1 sm:order-none">
                    <span className="text-sm border px-10 py-2 bg-gray-800 rounded-md cursor-pointer text-gray-50">
                      {viewModal.data.status === "SUCCESS" &&
                        t("Already Approved")}
                      {viewModal.data.status === "CANCELLED" &&
                        t("Already Rejected")}
                    </span>
                  </div>
                )}

                {/* Close button */}
                <button
                  onClick={closeModal}
                  className="order-2 sm:order-none px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {t("close")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {t("withdrawalRequestsTitle")}
        </h2>
        <p className="text-gray-600">{t("withdrawalRequestsDesc")}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-yellow-900">
                {t("pendingAmount")}
              </p>
              <p className="text-2xl font-bold text-yellow-600">
                {loading ? (
                  <span className="animate-pulse bg-yellow-200 rounded w-10 h-6 inline-block"></span>
                ) : (
                  pendingCount
                )}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center">
            <Check className="w-8 h-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-green-900">
                {t("totalPaid")}
              </p>
              <p className="text-2xl font-bold text-green-600">
                {loading ? (
                  <span className="animate-pulse bg-green-200 rounded w-10 h-6 inline-block"></span>
                ) : (
                  paidCount
                )}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <div className="flex items-center">
            <X className="w-8 h-8 text-red-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-red-900">
                {t("cancelled")}
              </p>
              <p className="text-2xl font-bold text-red-600">
                {loading ? (
                  <span className="animate-pulse bg-red-200 rounded w-10 h-6 inline-block"></span>
                ) : (
                  cancelledCount
                )}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center">
            <Globe className="w-8 h-8 text-gray-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{t("total")}</p>
              <p className="text-2xl font-bold text-gray-600">
                {loading ? (
                  <span className="animate-pulse bg-gray-200 rounded w-10 h-6 inline-block"></span>
                ) : (
                  unpaidCount
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={t("searchByPhoneOrCard")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="all">{t("allStatus")}</option>
              <option value="SUCCESS">{t("success")}</option>
              <option value="PENDING">{t("pending")}</option>
              <option value="CANCELLED">{t("cancelled")}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table and Mobile View */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="hidden md:table w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("requestId")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("user")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("cardDetails")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("amount")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("currency")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("status")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("requestDate")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("actions")}
                </th>
              </tr>
            </thead>
            <tbody>{renderTableContent()}</tbody>
          </table>
          <div className="md:hidden flex flex-col gap-4 p-4">
            {renderMobileContent()}
          </div>
        </div>
      </div>
    </div>
  );
};
