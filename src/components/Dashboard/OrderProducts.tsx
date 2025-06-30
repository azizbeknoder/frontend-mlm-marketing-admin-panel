import parsePhoneNumberFromString from "libphonenumber-js";
import {
  CheckCircle,
  CheckCircle2,
  Eye,
  Globe,
  Link,
  Smartphone,
  SquarePen,
  Star,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

interface Order {
  id: number;
  user_id: number;
  tariff_id: number;
  start_time: string;
  end_time: string;
  status: string;
  lastBonusDate: string;
  contactLink: string;
  contactNumber: string;
  isChecked: string; // yoki boolean bo‘lsa: boolean
}

const OrderProducts = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [viewProductModal, setViewProductModal] = useState(false);
  const [allProducts, setAllProducts] = useState(null);
  const { t } = useTranslation();
  const [filterStatus, setFilterStatus] = useState<
    "ALL" | "PENDING" | "CONFIRMED" | "REJECTED"
  >("PENDING");

  console.log(orders);

  const fetchOrders = async () => {
    const token = localStorage.getItem("token");

    try {
      setLoading(true);
      const res = await fetch(
        `${import.meta.env.VITE_API_KEY}/orders-product/select-admin`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Buyurtmalarni yuklashda xatolik yuz berdi");

      const data = await res.json();
      setOrders(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const confirmOrder = async (id: number) => {
    try {
      await fetch(`${import.meta.env.VITE_API_KEY}/orders-product/checked`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          orderId: id,
        }),
      });
      toast.success("Successfull");
      fetchOrders();
    } catch (err) {
      toast.error("Tasdiqlashda xatolik yuz berdi");
    }
  };

  const rejectOrder = async () => {
    if (!rejectingId) return;
    try {
      await fetch(`${import.meta.env.VITE_API_KEY}/orders-product/cancelled`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          orderId: rejectingId,
          comment: String(comment),
        }),
      });
      setRejectingId(null);
      setComment("");
      await fetchOrders();
    } catch (err) {
      alert("Rad etishda xatolik yuz berdi");
    }
  };

  const getAllProducts = async (id) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_KEY}/products`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!res.ok) throw new Error("Buyurtmalarni yuklashda xatolik yuz berdi");

      const data = await res.json();

      const selectedProduct = data.find((product) => product.id === id);

      if (!selectedProduct) {
        toast.warning("Mahsulot topilmadi");
      } else {
        setAllProducts(selectedProduct);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  console.log(orders);

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl mb-10 font-bold text-gray-800 flex items-center gap-2">
          📦 {t("orders")}
        </h1>
        <div className="flex justify-end mb-6">
          <select
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
          >
            <option value="ALL">{t("ALL")}</option>
            <option value="PENDING">{t("PENDING")}</option>
            <option value="SUCCESS">{t("SUCCESS")}</option>
            <option value="CANCELLED">{t("CANCELLED")}</option>
          </select>
        </div>
      </div>
      <div>
        {orders.filter((order) =>
          filterStatus === "ALL" ? true : order.isChecked === filterStatus
        ).length === 0 ? (
          <p className="text-gray-400 text-center text-3xl font-semibold py-16">
            {t("not_found")}
          </p>
        ) : (
          <div className="grid md:grid-cols-2 sm:grid-cols-1 lg:grid-cols-3 gap-4">
            {orders
              .filter((order) =>
                filterStatus === "ALL" ? true : order.isChecked === filterStatus
              )
              .map((order) => (
                <div
                  key={order.id}
                  className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-md p-4 sm:p-5 space-y-4 transition hover:shadow-lg"
                >
                  {/* Upper section */}
                  <div className="space-y-3">
                    {/* ID */}
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-medium">{t("id_label")}</span>
                      {order.id}
                    </p>
                    {order.coutnry && (
                      <p className="text-sm flex items-center gap-2 text-gray-800 dark:text-gray-400">
                        <Globe className="w-5 h-5" />
                        <span className="text-[16px] font-bold">
                          {order.coutnry} /{" "}
                          <span className="text-sm">{order.city}</span>
                        </span>
                      </p>
                    )}
                    <div className="flex flex-col items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <p className="text-[16px] font-medium">{order.user.name}</p>
                      <p className="border-b border-b-gray-950">{order.user.email}</p>
                    </div>
                    {/* Contact Link */}
                    <div className="flex sm:items-center gap-1 sm:gap-2 text-sm">
                      <span className="flex items-center gap-1 text-blue-600">
                        <Link className="w-4 h-4" />
                      </span>
                      <a
                        href={order.contactLink}
                        className="text-blue-600 underline truncate max-w-full sm:max-w-[250px]"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {order.contactLink}
                      </a>
                    </div>

                    {/* Phone Number */}
                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <Smartphone className="w-4 h-4 text-green-600 shrink-0" />
                      <span className="truncate">
                        {(() => {
                          const raw = order.contactNumber;
                          const phone = parsePhoneNumberFromString(raw, "UZ");
                          return phone && phone.isValid()
                            ? phone.formatInternational()
                            : raw;
                        })()}
                      </span>
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-2 text-sm">
                      <SquarePen className="w-4 h-4 text-yellow-500" />
                      <span className="text-yellow-600 font-medium bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-400 px-2 py-0.5 rounded-md">
                        {t(order.isChecked.toLowerCase())}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row justify-end gap-2 pt-3">
                    <button
                      onClick={() => confirmOrder(order.id)}
                      className="flex items-center justify-center gap-1 px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg shadow w-full sm:w-auto"
                    >
                      <CheckCircle className="w-4 h-4" /> {t("confirm")}
                    </button>
                    <button
                      onClick={() => setRejectingId(order.id)}
                      className="flex items-center justify-center gap-1 px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg shadow w-full sm:w-auto"
                    >
                      <X className="w-4 h-4" /> {t("reject")}
                    </button>
                    <button
                      onClick={() => {
                        getAllProducts(order.product_id);
                        setViewProductModal(!viewProductModal);
                      }}
                      className="flex items-center justify-center gap-1 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow w-full sm:w-auto"
                    >
                      <Eye className="w-4 h-4" /> {t("view")}
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}

        {rejectingId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md mx-4 space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {t("rejection_reason")}
              </h2>
              <textarea
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                rows={4}
                placeholder={t("comment_placeholder")}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <div className="flex justify-end gap-3">
                <button
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                  onClick={() => {
                    setRejectingId(null);
                    setComment("");
                  }}
                >
                  {t("cancel")}
                </button>
                <button
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                  onClick={rejectOrder}
                >
                  {t("reject")}
                </button>
              </div>
            </div>
          </div>
        )}

        {viewProductModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md sm:max-w-lg md:max-w-xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                  {t("order")}
                </h1>
                <button
                  onClick={() => setViewProductModal(false)}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label={t("close_modal")}
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                {allProducts?.photo_url?.map((item, index) => (
                  <div key={index} className="flex flex-col gap-4 mb-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <img
                        width={100}
                        height={100}
                        src={item.photo_url}
                        alt={t("product_image")}
                        className="rounded-lg object-cover w-full sm:w-28 h-28"
                      />
                      <div className="flex-1">
                        {allProducts.translations.map(
                          ({ language, name, description }) => {
                            if (language === "uz") {
                              return (
                                <div
                                  key={language}
                                  className="flex flex-col gap-2"
                                >
                                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {name}
                                  </h2>
                                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                                    {description}
                                  </p>
                                  <div className="flex items-center gap-2">
                                    <div className="flex">
                                      {[...Array(5)].map((_, i) => (
                                        <Star
                                          key={i}
                                          className={`w-4 h-4 ${
                                            i < Math.floor(allProducts.rating)
                                              ? "text-yellow-400 fill-current"
                                              : "text-gray-300 dark:text-gray-600"
                                          }`}
                                        />
                                      ))}
                                    </div>
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                      <b>
                                        {allProducts.coin}{" "}
                                        <span className="text-xs">
                                          {t("usdt")}
                                        </span>
                                      </b>
                                      <span className="text-xs ml-1">
                                        (
                                        {t("reviews", {
                                          count: allProducts.rating,
                                        })}
                                        )
                                      </span>
                                    </span>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-3 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="text-red-600 w-5 h-5" />
                        <span className="text-sm text-gray-700 dark:text-gray-200">
                          {t("items", { count: allProducts.count })}
                        </span>
                      </div>
                      {allProducts.translations.map(
                        ({ language, description, longDescription, usage }) => {
                          if (language === "uz") {
                            return (
                              <div
                                key={language}
                                className="flex flex-col gap-2 text-sm text-gray-600 dark:text-gray-300"
                              >
                                <p>{description}</p>
                                <p>{longDescription}</p>
                                <p>{usage}</p>
                              </div>
                            );
                          }
                          return null;
                        }
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderProducts;
