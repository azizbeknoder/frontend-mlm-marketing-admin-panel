import {
  BadgeCheck,
  CalendarCheck,
  Clock,
  Globe,
  Link,
  PhoneCall,
} from "lucide-react";
import moment from "moment";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export default function BonusHistory() {
  const [openBonusModal, setOpenBonusModal] = useState(false);
  const [openReferralModal, setOpenReferralModal] = useState(false);
  const [openProductsModal, setOpenProductsModal] = useState(false);
  const [openTariffsModal, setOpenTariffsModal] = useState(false);

  const [historyUser, setHistoryUser] = useState([]);
  const [historyReferal, setHistoryReferal] = useState([]);
  const [historyProducts, setHistoryProducts] = useState([]);
  const [historyPlans, setHistoryPlans] = useState([]);
  const { t } = useTranslation();

  const getBonusUser = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_KEY}/bonus-history`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json", // ixtiyoriy, lekin tavsiya qilinadi
          },
        }
      );

      if (!response.ok) {
        throw new Error("Serverdan xatolik: " + response.status);
      }

      const data = await response.json();
      setHistoryUser(data);
    } catch (error) {
      toast.error("Bonus history olishda xatolik:", error);
      return null;
    }
  };

  const getReferal = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_KEY}/bonus-history/referal/admin`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json", // ixtiyoriy, lekin tavsiya qilinadi
          },
        }
      );

      if (!response.ok) {
        throw new Error("Serverdan xatolik: " + response.status);
      }

      const data = await response.json();
      setHistoryReferal(data);
    } catch (error) {
      toast.error("Bonus history olishda xatolik:", error);
      return null;
    }
  };

  const getProduct = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_KEY}/product-history`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json", // ixtiyoriy, lekin tavsiya qilinadi
          },
        }
      );

      if (!response.ok) {
        throw new Error("Serverdan xatolik: " + response.status);
      }

      const data = await response.json();
      setHistoryProducts(data);
    } catch (error) {
      toast.error("Bonus history olishda xatolik:", error);
      return null;
    }
  };
  const getPlans = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_KEY}/tariff-history`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json", // ixtiyoriy, lekin tavsiya qilinadi
          },
        }
      );

      if (!response.ok) {
        throw new Error("Serverdan xatolik: " + response.status);
      }

      const data = await response.json();
      setHistoryPlans(data);
    } catch (error) {
      toast.error("Bonus history olishda xatolik:", error);
      return null;
    }
  };

  useEffect(() => {
    getBonusUser();
    getReferal();
    getProduct();
    getPlans();
  }, []);

  const handleToggleBonus = () => {
    setOpenBonusModal(!openBonusModal);
    setOpenReferralModal(false);
    setOpenProductsModal(false);
    setOpenTariffsModal(false);
  };

  const handleToggleReferral = () => {
    setOpenReferralModal(!openReferralModal);
    setOpenBonusModal(false);
    setOpenProductsModal(false);
    setOpenTariffsModal(false);
  };

  const handleToggleProducts = () => {
    setOpenProductsModal(!openProductsModal);
    setOpenBonusModal(false);
    setOpenReferralModal(false);
    setOpenTariffsModal(false);
  };

  const handleToggleTariffs = () => {
    setOpenTariffsModal(!openTariffsModal);
    setOpenBonusModal(false);
    setOpenReferralModal(false);
    setOpenProductsModal(false);
  };

  return (
    <section className="w-full p-4">
      <div className="grid sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Bonuslar */}
        <div className="relative transition-all duration-500">
          <button
            onClick={handleToggleBonus}
            className="dark:text-black border text-black dark:border-gray-600 rounded-md py-2 px-10 text-lg sm:text-2xl font-normal w-full"
          >
            {t("bonuses_history")}
          </button>

          {openBonusModal && (
            <div
              className={`mt-2 w-full z-10 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md shadow-lg p-4 
                transition-all duration-500 ease-out
                ${
                  openBonusModal
                    ? "opacity-100 translate-y-0 scale-100"
                    : "opacity-0 -translate-y-2 scale-95 pointer-events-none"
                }
                md:absolute md:left-0 md:top-full
              `}
            >
              <div className="text-sm flex flex-col gap-4 overflow-auto max-h-80 text-gray-700 h-auto py-1 dark:text-white">
                {historyUser.length === 0 ? (
                  <div className="text-center">
                    <p>{t("not_found")}</p>
                  </div>
                ) : (
                  historyUser.map(({ id, user, date, coin }) => (
                    <div key={id} className="flex items-center justify-between">
                      <div className="flex items-center gap-5">
                        <p className="text-lg font-semibold flex items-center gap-3 text-gray-800 dark:text-white">
                          {user.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {moment(date).format("YYYY-MM-DD HH:mm")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-green-600">
                          {coin} {t("coin")}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Referal bonus */}
        <div
          className={`relative transition-all duration-500 ${
            openBonusModal ? "mt-3 md:mt-0" : "mt-0"
          }`}
        >
          <button
            onClick={handleToggleReferral}
            className="border dark:border-gray-600 text-black dark:text-black rounded-md py-2 px-6 sm:px-10 text-lg sm:text-2xl font-normal w-full"
          >
            {t("referrals_history")}
          </button>

          {openReferralModal && (
            <div
              className={`mt-2 w-full z-10 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md shadow-lg p-4 
                transition-all duration-500 ease-out
                ${
                  openReferralModal
                    ? "opacity-100 translate-y-0 scale-100"
                    : "opacity-0 -translate-y-2 scale-95 pointer-events-none"
                }
                md:absolute md:left-0 md:top-full
              `}
            >
              <div className="text-sm text-gray-700 dark:text-white flex flex-col gap-4 overflow-auto max-h-[350px] sm:max-h-[450px] lg:max-h-[500px] py-1">
                {historyReferal.length === 0 ? (
                  <div className="text-center text-gray-500 dark:text-gray-400">
                    <p>{t("not_found")}</p>
                  </div>
                ) : (
                  historyReferal.map(({ id, coin, date, user }) => (
                    <div
                      key={id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-3 border-b border-gray-100 dark:border-gray-700"
                    >
                      {/* Left: User info */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="min-w-[180px]">
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {user.name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {user.email}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            {new Date(date).toLocaleString("uz-UZ")}
                          </p>
                        </div>
                      </div>

                      {/* Right: Role and coin */}
                      <div className="text-right">
                        <span className="inline-block lowercase px-2 py-1 text-[10px] rounded-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-white">
                          {user.role.toLowerCase()}
                        </span>
                        <div className="text-xl font-bold text-green-600 dark:text-green-400 mt-1">
                          {coin.toLocaleString()} {t("coin")}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sotib olingan productlar */}
        <div className="relative transition-all duration-500">
          <button
            onClick={handleToggleProducts}
            className="border dark:border-gray-600 dark:text-black text-black rounded-md py-2 px-6 sm:px-10 text-lg sm:text-2xl font-normal w-full"
          >
            {t("products_history")}
          </button>

          {openProductsModal && (
            <div
              className={`mt-2 w-full z-10 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md shadow-lg p-4 
                transition-all duration-500 ease-out
                ${
                  openProductsModal
                    ? "opacity-100 translate-y-0 scale-100"
                    : "opacity-0 -translate-y-2 scale-95 pointer-events-none"
                }
                md:absolute md:left-0 md:top-full
              `}
            >
              <div className="text-sm flex flex-col gap-5 text-gray-800 dark:text-gray-100 max-h-[500px] overflow-auto">
                {historyProducts.length === 0 ? (
                  <div className="text-center text-gray-500 dark:text-gray-400">
                    <p>{t("not_found")}</p>
                  </div>
                ) : (
                  historyProducts.map((order) => (
                    <div
                      key={order.id}
                      className="border dark:border-gray-700 rounded-xl p-5 bg-white dark:bg-gray-900 shadow-sm space-y-4 w-full max-w-3xl mx-auto"
                    >
                      {/* User Info + Status */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div>
                          <h2 className="font-semibold text-lg text-gray-900 dark:text-white">
                            {order.user.name}
                          </h2>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {order.user.email}
                          </p>
                        </div>
                        <span
                          className={`text-[10px] px-2 py-1 rounded-full font-medium ${
                            order.isChecked === "pending"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-800/10 dark:text-yellow-300"
                              : "bg-green-100 text-green-800 dark:bg-green-800/10 dark:text-green-300"
                          }`}
                        >
                          {t(order.isChecked)}
                        </span>
                      </div>

                      {/* Product Info Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
                        <div className="flex items-center gap-1">
                          <p className="text-gray-500 dark:text-gray-400">
                            {t("id")}:
                          </p>
                          <p>{order.main_products.id}</p>
                        </div>
                        <div>
                          <p className="text-sm flex items-center gap-2 text-gray-800 dark:text-gray-400">
                            <Globe className="w-4 h-4" />
                            <span className="text-[16px] font-bold">
                              <span className="text-[15px]"> {order.coutnry}</span> /
                              <span className="text-xs">{order.city}</span>
                            </span>
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <p>⭐ {order.main_products.rating}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <p className="text-gray-500 dark:text-gray-400">
                            {t("count")}:
                          </p>
                          <p>{order.main_products.count}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <p className="text-gray-500 dark:text-gray-400">
                            {t("reviews")}:
                          </p>
                          <p>{order.main_products.rewiev}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <p className="text-gray-500 dark:text-gray-400">
                            {t("coin")}:
                          </p>
                          <p>{order.main_products.coin} 🪙</p>
                        </div>
                      </div>

                      {/* Contact Info */}
                      <div className="flex flex-col gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <div className="flex items-center gap-2">
                          <PhoneCall
                            size={16}
                            className="text-gray-500 dark:text-gray-400"
                          />
                          <span>{order.contactNumber}</span>
                        </div>
                        <div className="flex items-center gap-2 break-all">
                          <Link
                            size={16}
                            className="text-gray-500 dark:text-gray-400"
                          />
                          <a
                            href={order.contactLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {order.contactLink}
                          </a>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <Clock size={14} />
                          <span>
                            {new Date(order.orderedAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sotib olingan tariflar */}
        <div className="relative transition-all duration-500">
          <button
            onClick={handleToggleTariffs}
            className="border dark:border-gray-600 dark:text-black text-black rounded-md py-2 px-6 sm:px-10 text-lg sm:text-2xl font-normal w-full"
          >
            {t("tariffs_history")}
          </button>

          {openTariffsModal && (
            <div
              className={`mt-2 w-full z-10 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md shadow-lg p-4 
                transition-all duration-500 ease-out
                ${
                  openTariffsModal
                    ? "opacity-100 translate-y-0 scale-100"
                    : "opacity-0 -translate-y-2 scale-95 pointer-events-none"
                }
                md:absolute md:left-0 md:top-full
              `}
            >
              <div className="text-sm text-gray-800 dark:text-gray-100 flex flex-col gap-5 max-h-[500px] overflow-auto">
                {historyPlans.length === 0 ? (
                  <div className="text-center text-gray-500 dark:text-gray-400">
                    <p>{t("not_found")}</p>
                  </div>
                ) : (
                  historyPlans.map((plan) => (
                    <div
                      key={plan.id}
                      className="p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md dark:shadow dark:bg-gray-900 bg-white transition rounded-xl w-full max-w-3xl mx-auto"
                    >
                      {/* Tariff Header */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-3">
                        <img
                          src={plan.tariff.photo_url}
                          alt="Tarif rasmi"
                          className="w-16 h-16 object-cover rounded-md border dark:border-gray-600"
                        />
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            Tarif #{plan.tariff.id}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {plan.user.name}
                          </p>
                        </div>
                      </div>

                      {/* Tarif tafsilotlari */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 text-sm text-gray-800 dark:text-gray-200">
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">
                            {t("term")}
                          </p>
                          <p>{plan.tariff.term} kun</p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">
                            {t("daily_profit")}
                          </p>
                          <p>+{plan.tariff.dailyProfit} 🪙</p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">
                            {t("referral_bonus")}
                          </p>
                          <p>{plan.tariff.referral_bonus}%</p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">
                            {t("price")}
                          </p>
                          <p>{plan.tariff.coin} 🪙</p>
                        </div>
                      </div>

                      {/* Sana va holat */}
                      <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1 mb-3">
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          <span>
                            {t("start_date")}:{" "}
                            {new Date(plan.start_time).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CalendarCheck size={14} />
                          <span>
                            {t("end_date")}:{" "}
                            {new Date(plan.end_time).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <BadgeCheck size={14} />
                          <span>
                            {t("last_bonus_date")}:{" "}
                            {new Date(plan.lastBonusDate).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Status */}
                      <div>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            plan.status
                              ? "bg-green-100 text-green-700 dark:bg-green-800/20 dark:text-green-300"
                              : "bg-red-100 text-red-700 dark:bg-red-800/20 dark:text-red-300"
                          }`}
                        >
                          {t(plan.status ? "active" : "completed")}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
