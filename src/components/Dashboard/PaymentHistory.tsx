import { span } from "framer-motion/client";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

function getStatusColor(status: string) {
  switch (status) {
    case "PENDING":
      return "text-yellow-500";
    case "SENDING":
      return "text-blue-500";
    case "CANCELLED":
      return "text-red-500";
    case "SCRINSHOTUPLOAD":
      return "text-purple-500";
    default:
      return "text-green-500";
  }
}

export function PaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [screen, setScreen] = useState();
  const [statusFilter, setStatusFilter] = useState("SCRINSHOTUPLOAD");
  const [searchQuery, setSearchQuery] = useState("");
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const [uniqueStatuses, setUniqueStatuses] = useState<string[]>([]);
  const [coin, setCoin] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${import.meta.env.VITE_API_KEY}/payments`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        const data = await res.json();
        if (data.error === "To'ken es kirgan yoki vaqti o'tgan") {
          navigate("/login");
          return;
        }

        setPayments(Array.isArray(data) ? data : []);

        const statuses = Array.from(
          new Set(data.map((item: any) => item.status))
        );
        // Prioritize SCRINSHOTUPLOAD to be first
        statuses.sort((a, b) =>
          a === "SCRINSHOTUPLOAD" ? -1 : b === "SCRINSHOTUPLOAD" ? 1 : 0
        );
        setUniqueStatuses(statuses);
      } catch (error) {
        console.error("Error fetching payments:", error);
      }
    };

    fetchPayments();
  }, [navigate]);

  // useEffect(() => {
  //   const fetchPayments = async () => {
  //     try {
  //       const token = localStorage.getItem("token");
  //       const res = await fetch(
  //         `${import.meta.env.VITE_API_KEY}/payments/status/SCRINSHOTUPLOAD`,
  //         {
  //           headers: {
  //             Authorization: token ? `Bearer ${token}` : "",
  //           },
  //         }
  //       );

  //       const data = await res.json();
  //       setScreen(data);
  //       console.log(data);
  //     } catch (error) {
  //       console.error("Error fetching payments:", error);
  //     }
  //   };

  //   fetchPayments();
  // }, [navigate]);

  const handleConfirmPayment = async () => {
    if (!coin || isNaN(Number(coin)) || Number(coin) <= 0) {
      setError("Please enter a valid coin amount.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_API_KEY}/payments/checked`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({
            id: selectedPaymentId,
            coin: parseFloat(coin),
          }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        setPayments((prev: any) =>
          prev.map((payment) =>
            payment.id === selectedPaymentId
              ? { ...payment, status: "SUCCESS" }
              : payment
          )
        );
        setIsConfirmModalOpen(false);
        setCoin("");
      } else {
        setError(data.error || "Failed to confirm payment.");
      }
    } catch (error: any) {
      setError("Error confirming payment: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectPayment = async () => {
    if (!reason.trim()) {
      setError("Please provide a reason for rejection.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_API_KEY}/payments/rejected`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({ id: selectedPaymentId, reason }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        setPayments((prev: any) =>
          prev.map((payment) =>
            payment.id === selectedPaymentId
              ? { ...payment, status: "CANCELLED" }
              : payment
          )
        );
        setIsRejectModalOpen(false);
        setReason("");
      } else {
        setError(data.error || "Failed to reject payment.");
      }
    } catch (error: any) {
      setError("Error rejecting payment: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments
    .filter((payment: any) => {
      if (statusFilter === "ALL") return true;
      return payment.status === statusFilter;
    })
    .filter((payment: any) => {
      const user = payment.user || {};
      const searchLower = searchQuery.toLowerCase();
      return (
        user.name?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower)
      );
    });

  const [curr, setCurr] = useState();

  async function getCurrencyData() {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_KEY}/coin`);
      const data = await response.json();
      setCurr(data);
    } catch (error) {
      toast.error("Xatolik:", error);
    }
  }

  useEffect(() => {
    getCurrencyData();
  }, []);

  const totalSums = filteredPayments
    ?.map((payment: any) => {
      const matchedCurrency = curr?.find(
        (item) => item.currency === payment.currency
      );

      if (matchedCurrency) {
        const oneCoinPrice = matchedCurrency.count;
        const totalAmount = payment.coin * oneCoinPrice;

        return {
          currency: payment.currency,
          coin: payment.coin,
          oneCoinPrice,
          totalAmount,
        };
      }

      return null;
    })
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-100 p-4 sm:p-6 transition-colors duration-200">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-900">
            {t("payment_history")}
          </h1>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <input
              type="text"
              placeholder={t("Search by email and name")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="p-2 border border-gray-300 rounded-lg bg-white dark:bg-slate-200 dark:border-gray-600 dark:text-black text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 w-full sm:w-64"
            />
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <label
                htmlFor="statusFilter"
                className="text-sm font-bold text-gray-700 dark:text-gray-900 whitespace-nowrap"
              >
                {t("filter_by_status")}
              </label>
              <select
                className="px-5 py-2 rounded-md border outline-none capitalize"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">{t("All")}</option>
                {uniqueStatuses.map((status, index) => (
                  <option key={`${status}-${index}`} value={status}>
                    {t(status.toLowerCase())}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredPayments.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12 sm:py-16 text-gray-500 dark:text-gray-400">
            <svg
              className="w-12 h-12 sm:w-16 sm:h-16 mb-4"
              fill="none"
              stroke="componentDidMountcurrentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 14l6-6m-6 6l6-6m-3 9a9 9 0 110-18 9 9 0 010 18z"
              />
            </svg>
            <p className="text-base sm:text-lg font-medium">
              {t("no_payment_history")}
            </p>
            <p className="text-sm">{t("adjust_filter")}</p>
          </div>
        ) : (
          filteredPayments.map((payment) => {
            const user = payment.user || {};
            return (
              <div
                key={payment.id}
                className="bg-white dark:bg-slate-100 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-300 shadow-sm transition-colors duration-200"
              >
                <div className="mb-4">
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-900 truncate">
                    {user.name || t("unknown_user")}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-600 truncate">
                    {user.email || t("no_email")}
                  </p>
                </div>

                <div className="text-xs sm:text-sm space-y-2">
                  <p className="flex justify-between">
                    <span className="font-medium text-gray-600 dark:text-gray-700">
                      {t("status_label")}
                    </span>
                    <span
                      className={`font-bold ${getStatusColor(payment.status)}`}
                    >
                      {t(payment.status.toLowerCase())}
                    </span>
                  </p>
                  <p className="flex justify-between">
                    <span className="font-medium text-gray-600 dark:text-gray-700">
                      {t("payment_id_label")}
                    </span>
                    <span className="text-gray-900 dark:text-gray-700">
                      #{payment.id}
                    </span>
                  </p>
                  <p className="flex justify-between">
                    <span className="font-medium text-gray-600 dark:text-gray-700">
                      {t("sending_time_label")}
                    </span>
                    <span className="text-gray-900 dark:text-gray-700 text-right">
                      {payment.to_send_date
                        ? new Date(payment.to_send_date).toLocaleString([], {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </span>
                  </p>
                  <p className="flex justify-between">
                    <span className="font-medium text-gray-600 dark:text-gray-700">
                      {t("card_number_label")}
                    </span>
                    <span className="text-gray-900 dark:text-gray-700">
                      {payment.card}
                    </span>
                  </p>

                  <div>
                    <div className="flex items-center justify-between">
                      {payment.photo_url === null ? (
                        <div className="flex items-center justify-between w-full">
                          <span className="text-xl font-bold">
                            {payment.fullName}
                          </span>
                          <strong className="text-gray-700 flex items-center gap-1">
                            {payment.coin}
                            <img
                              src="/logo.ico"
                              className="w-3 h-3 sm:w-4 sm:h-4"
                              alt="coin icon"
                            />
                          </strong>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between w-full">
                          <a
                            href={payment.photo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:underline text-xs sm:text-sm font-medium"
                          >
                            {t("view_screenshot")}
                          </a>
                          <span className="flex items-center gap-1">
                            <strong className="text-gray-700">
                              {payment.coin}
                            </strong>
                            <img
                              src="/logo.ico"
                              className="w-3 h-3 sm:w-4 sm:h-4"
                              alt="coin icon"
                            />
                          </span>
                        </div>
                      )}
                      {/* */}
                    </div>

                    <div className="flex items-center justify-between py-1 sm:py-2 text-gray-700">
                      <p>{t("currency")}</p>
                      <span>{payment.currency}</span>
                    </div>

                    <div className="flex items-center justify-between py-1 sm:py-2 text-gray-700">
                      <p>{t("total_price")}</p>
                      <span>
                        {(() => {
                          const matched = curr?.find(
                            (item) => item.currency === payment.currency
                          );
                          if (matched) {
                            const oneCoin = +matched.count;
                            const total = +payment.coin * oneCoin;
                            return `${total.toFixed(2)} ${payment.currency}`;
                          }
                          return t("unknown");
                        })()}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4">
                    <button
                      onClick={() => {
                        setSelectedPaymentId(payment.id);
                        setIsConfirmModalOpen(true);
                      }}
                      className="flex-1 bg-gray-600 text-white py-2 px-3 sm:px-4 rounded-lg hover:bg-gray-700 transition-colors duration-200 disabled:opacity-50 text-xs sm:text-sm"
                    >
                      {t("confirm")}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedPaymentId(payment.id);
                        setIsRejectModalOpen(true);
                      }}
                      className="flex-1 bg-slate-200 text-black py-2 px-3 sm:px-4 rounded-lg hover:bg-gray-300 transition-colors duration-200 disabled:opacity-50 text-xs sm:text-sm"
                    >
                      {t("reject")}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Confirm Modal */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-md">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t("confirm_payment")}
            </h2>
            {error && (
              <p className="text-red-500 text-xs sm:text-sm mb-4">{error}</p>
            )}
            <div className="mb-4">
              <label
                htmlFor="coin"
                className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {t("usdt_amount")}
              </label>
              <input
                id="coin"
                type="number"
                value={coin}
                onChange={(e) => setCoin(e.target.value)}
                className="mt-1 p-2 w-full border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                placeholder={t("coin_placeholder")}
                min="0"
                step="0.01"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={handleConfirmPayment}
                disabled={loading}
                className="flex-1 bg-green-600 text-white py-2 px-3 sm:px-4 rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 text-xs sm:text-sm"
              >
                {loading ? t("processing") : t("confirm")}
              </button>
              <button
                onClick={() => {
                  setIsConfirmModalOpen(false);
                  setCoin("");
                  setError(null);
                }}
                className="flex-1 bg-gray-300 text-gray-900 py-2 px-3 sm:px-4 rounded-lg hover:bg-gray-400 transition-colors duration-200 text-xs sm:text-sm"
              >
                {t("cancel")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-md">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t("reject_payment")}
            </h2>
            {error && (
              <p className="text-red-500 text-xs sm:text-sm mb-4">{error}</p>
            )}
            <div className="mb-4">
              <label
                htmlFor="reason"
                className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {t("rejection_reason")}
              </label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-1 p-2 w-full border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                placeholder={t("reason_placeholder")}
                rows={4}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={handleRejectPayment}
                disabled={loading}
                className="flex-1 bg-red-600 text-white py-2 px-3 sm:px-4 rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 text-xs sm:text-sm"
              >
                {loading ? t("processing") : t("reject")}
              </button>
              <button
                onClick={() => {
                  setIsRejectModalOpen(false);
                  setReason("");
                  setError(null);
                }}
                className="flex-1 bg-gray-300 text-gray-900 py-2 px-3 sm:px-4 rounded-lg hover:bg-gray-400 transition-colors duration-200 text-xs sm:text-sm"
              >
                {t("cancel")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
