import {
  AlertCircle,
  CheckCircle,
  Clock,
  Copy,
  CreditCard,
  Filter,
  Loader,
  Search,
  Send,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { io } from "socket.io-client";
import { useTranslation } from "react-i18next";

interface Payment {
  paymentId: string;
  userId: string;
  userName: string;
  message: string;
  date: string;
  howMuch: number;
  currency: string;
  status: "PENDING" | "SENDING" | "COMPLETED" | "CANCELLED" | "FAILED";
}

const GetCoin: React.FC = () => {
  const [data, setData] = useState<Payment[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalPayment, setModalPayment] = useState<Payment | null>(null);
  const [room, setRoom] = useState("");
  const [paymentId, setPaymentId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState(false);
  const [selectCard, setSelectCard] = useState([]);
  const { t } = useTranslation();
  const [messageReceived, setMessageReceived] = useState(false);
  const [remainingTimes, setRemainingTimes] = useState<{
    [key: string]: number;
  }>({});

  useEffect(() => {
    const times: { [key: string]: number } = {};

    data.forEach((payment) => {
      times[payment.paymentId] = payment.sekundnamerDate;
    });

    setRemainingTimes(times);
  }, [data]);

  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingTimes((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((key) => {
          if (updated[key] > 0) {
            updated[key] -= 1;
          }
        });
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `${mins}:${secs}`;
  };
  // for taymer

  const getStatusIcon = (status: Payment["status"]) => {
    switch (status) {
      case "PENDING":
        return <Clock className="w-4 h-4" />;
      case "SENDING":
        return <Loader className="w-4 h-4 animate-spin" />;
      case "COMPLETED":
        return <CheckCircle className="w-4 h-4" />;
      case "FAILED":
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: Payment["status"]) => {
    switch (status) {
      case "PENDING":
        return "bg-orange-500 text-white dark:bg-orange-500 dark:text-white";
      case "SENDING":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "COMPLETED":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400";
      case "FAILED":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
    }
  };

  const filteredData = data.filter((payment) => {
    const matchesSearch =
      payment.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.paymentId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" || payment.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const socketRef: any = useRef();
  useEffect(() => {
    const token = localStorage.getItem("token");

    const socket = io(`${import.meta.env.VITE_API_KEY}/`, {
      auth: { token },
    });

    socketRef.current = socket;

    socket.on("newPayment", (payment) => {
      setData((prev) => [payment, ...prev]);
      setMessageReceived(true);

      if (Notification.permission === "granted") {
        new Notification(payment.paymentId, {
          body: payment.message,
        });
      }
    });

    socket.on("noPayments", () => {
      toast.info("Hozircha yangi to'lovlar mavjud emas.");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validatsiya
    if (!room || !paymentId || !cardNumber) {
      toast.error("Barcha maydonlarni to'ldiring!");
      return;
    }

    // Ma'lumotni serverga yuborish
    socketRef.current?.emit("adminResponse", {
      roomName: room,
      paymentId,
      cardNumber,
    });

    // Modalni yopish va inputlarni tozalash
    setShowModal(false);
    setRoom("");
    setPaymentId("");
    setCardNumber("");
  };

  const openModal = (payment: Payment) => {
    setModalPayment(payment);
    setRoom(`room-${payment.userId}`);
    setPaymentId(payment.paymentId);
    setCardNumber("");
    setShowModal(true);
  };

  const getCards = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_KEY}/cardnumber`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch currency data");
      }

      const data = await response.json();

      setSelectCard(data);
    } catch (error: any) {
      toast.error("Error fetching currency:", error.message);
    }
  };

  useEffect(() => {
    getCards();
  }, []);

  // calculation
  const [curr, setCurr] = useState();

  async function getCurrencyData() {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_KEY}/coin`);
      const data = await response.json();

      setCurr(data);
      // console.log("Barcha ma'lumotlar:", data);

      // return data;
    } catch (error) {
      console.error("Xatolik:", error);
    }
  }
  useEffect(() => {
    getCurrencyData();
  }, []);

  const totalSums: any = data
    ?.map((payment: any) => {
      const matchedCurrency = curr?.find(
        (item: any) => item.currency === payment.currency
      );

      if (matchedCurrency) {
        const oneCoinPrice = matchedCurrency.count;
        const totalAmount = payment.howMuch * oneCoinPrice;

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

  function formatDateTime(date) {
    const d = new Date(date);

    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const seconds = String(d.getSeconds()).padStart(2, "0");

    return `${month}/${day} ${hours}:${minutes}:${seconds}`;
  }

  return (
    <div className="min-h-screen transition-colors duration-300">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-100/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-500 rounded-xl">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-black">
                  {t("payments_management")}
                </h1>
                <p className="text-gray-800 dark:text-gray-600">
                  {t("manage_track_payments")}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-xl px-4 py-2">
                <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">
                  {t("total_payments", { count: data.length })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={t("search_placeholder")}
              value={searchTerm}
              onChange={(e: any) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-100 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              onChange={(e: any) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-3 bg-white dark:bg-gray-100 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none min-w-[200px]"
            >
              <option value="ALL">{t("all_statuses")}</option>
              <option value="PENDING">{t("pending")}</option>
              <option value="SENDING">{t("sending")}</option>
              <option value="COMPLETED">{t("completed")}</option>
              <option value="FAILED">{t("failed")}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payment Cards */}
      <div className="max-w-7xl mx-auto px-6 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredData.length > 0 ? (
            filteredData.map((payment: any) => (
              <div
                key={payment.paymentId}
                className="group bg-white/80 dark:bg-slate-300- backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6 transition-all duration-300 hover:scale-[1.02] hover:bg-white dark:hover:bg-gray-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-100 dark:bg-slide-400 rounded-lg">
                      <CreditCard className="w-5 h-5 text-gray-700 dark:text-gray-700" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-700">
                        {payment.message}
                      </h3>
                      <p className="text-sm text-gray-700 dark:text-gray-700">
                        {new Date(payment.date).toLocaleDateString("uz-UZ")}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      payment.status
                    )}`}
                  >
                    {getStatusIcon(payment.status)}
                    <span>{t(payment.status.toLowerCase())}</span>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-700">
                      {t("payment_id_label")}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-mono text-gray-900 dark:text-gray-700">
                        #{payment.paymentId}
                      </span>
                      <button
                        onClick={() => copyToClipboard(payment.paymentId)}
                        className="p-2 hover:bg-gray-400 dark:hover:bg-gray-400 rounded transition-colors"
                      >
                        <Copy className="w-3 h-3 text-gray-700" />
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700 dark:text-gray-700">
                      {t("user_label")}
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-700">
                      {payment.userId}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700 dark:text-gray-700">
                      {t("client_label")}
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-700">
                      {payment.userName}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-700">
                      {t("amount_label")}
                    </span>
                    <span className="text-lg font-bold text-gray-900 dark:text-gray-700">
                      {payment.howMuch} USDT
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-700">
                      {t("total_price")}
                    </span>
                    <span>
                      {(() => {
                        const matched = curr?.find(
                          (item) => item.currency === payment.currency
                        );
                        if (matched) {
                          const oneCoin = +matched.count;
                          const total = +payment.howMuch * oneCoin;
                          return `${total} ${payment.currency}`;
                        }
                        return t("unknown");
                      })()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 dark:text-gray-700">
                      {t("ReceivedTime")}
                    </p>
                    <p>{formatDateTime(payment?.date)}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <p>{t("RemainingTime")}</p>

                    <p className="text-red-500 font-bold text-lg">
                      {formatTime(remainingTimes[payment.paymentId] || 0)}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    openModal(payment);
                  }}
                  disabled={payment.status === "COMPLETED"}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-slate-800 px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2 disabled:cursor-not-allowed transform active:scale-95"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {payment.status === "COMPLETED"
                      ? t("completed")
                      : t("send_card")}
                  </span>
                </button>
              </div>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-16">
              <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
                <CreditCard className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-700 mb-2">
                {t("no_payments_found")}
              </h3>
              <p className="text-gray-600 dark:text-gray-700 text-center">
                {t("change_search_criteria")}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && modalPayment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {t("payment_details")}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {modalPayment.message} - {modalPayment.howMuch}{" "}
                      {modalPayment.currency}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>

            <form onSubmit={handleDeposit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  {t("room_id_label")}
                </label>
                <input
                  type="text"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  placeholder={t("room_placeholder")}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
                  required
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("payment_id")}
                </label>
                <input
                  type="text"
                  value={paymentId}
                  onChange={(e) => setPaymentId(e.target.value)}
                  placeholder={t("payment_id")}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
                  required
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("card_number_label")}
                </label>

                {/* Select kartalar */}
                <select
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full mb-2 px-4 py-3 text-gray-800 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option>{t("select_card")}</option>
                  {selectCard?.map((item, i) => {
                    if (item.currency == filteredData[0].currency) {
                      return (
                        <option key={i} value={item.seriaNumber}>
                          {item.seriaNumber}
                        </option>
                      );
                    }
                  })}
                </select>

                {/* Input maydon */}
                <div className="relative">
                  <input
                    placeholder={t("card_placeholder")}
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full px-4 py-3 pr-12 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  ></button>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {t("cancel")}
                </button>
                <button
                  onClick={() => {
                    window.location.reload();
                  }}
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      <span>{t("sending")}</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>{t("send_payment")}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GetCoin;
