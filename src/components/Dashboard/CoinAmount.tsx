import React, { useState, useEffect } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { p } from "framer-motion/client";

export default function CoinAmount() {
  const [currency, setCurrency] = useState<string | number>("");
  const [type, setType] = useState<string | number>("");
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [coinData, setCoinData] = useState<any>(null);
  const [coinLoading, setCoinLoading] = useState<boolean>(true);
  const [coinError, setCoinError] = useState<string | null>(null);

  const [selectedCoin, setSelectedCoin] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editCount, setEditCount] = useState<number>(0);
  const [editId, setEditId] = useState<string | number | null>(null);
  const [value, setvalue] = useState("");

  // Language state
  const [lang, setLang] = useState<"en" | "uz" | "zh">("en");
  const { t } = useTranslation();

  const openEditModal = (idOrCoin: any, coinArg?: any) => {
    if (coinArg) {
      setSelectedCoin(coinArg);
      setEditCount(coinArg.count);
      setEditId(idOrCoin);
      setEditCurrency(coinArg.currency);
    } else {
      setSelectedCoin(idOrCoin);
      setEditCount(idOrCoin.count);
      setEditId(idOrCoin.id ?? idOrCoin.currency);
      setEditCurrency(idOrCoin.currency);
    }
    setShowModal(true);
  };

  // Minimum send

  const [isOpen, setIsOpen] = useState(false);

  const setMinimum = async (obj: any) => {
    const result = {
      minVale: Number(obj),
    };

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_KEY}/min-take-off`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(result),
      });

      if (!res.ok) {
        throw new Error("So‘rov muvaffaqiyatsiz bo‘ldi");
      }

      const data = await res.json();
      console.log("Javob:", data);
    } catch (error) {
      console.error("Xatolik:", error.message);
    }
  };

  // Add editCurrency state
  const [editCurrency, setEditCurrency] = useState<string>("");

  const closeModal = () => {
    setShowModal(false);
    setSelectedCoin(null);
  };

  // Komponent mount bo'lganda coin ma'lumotlarini olish
  const fetchCoins = async () => {
    setCoinLoading(true);
    setCoinError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_KEY}/coin`, {
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      setCoinData(data);
    } catch (err) {
      setCoinError(t("errorFetch"));
    } finally {
      setCoinLoading(false);
    }
  };

  useEffect(() => {
    fetchCoins();
  }, [lang]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_KEY}/coin`, {
        method: "POST",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          currency: currency,
          count: count,
          type: type,
        }),
      });
      if (!res.ok) throw new Error("Server error");
      setSuccess(t("successAdd"));
      await fetchCoins(); // Refresh coin data after successful add
    } catch (err) {
      setError(t("errorAdd"));
    } finally {
      setLoading(false);
    }
  };

  // Delete handler
  const handleDelete = async (idOrKey: string | number) => {
    setCoinLoading(true);
    setCoinError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_API_KEY}/coin/${idOrKey}`,
        {
          method: "DELETE",
          headers: {
            accept: "*/*",
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );
      if (!res.ok) throw new Error("Server error");
      toast.success(t("successDelete"));
      await fetchCoins();
    } catch (err) {
      setCoinError(t("errorDelete"));
    } finally {
      setCoinLoading(false);
    }
  };

  // Update handle
  const handleUpdate = async () => {
    if (!selectedCoin || editId == null) return;
    setCoinLoading(true);
    setCoinError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_API_KEY}/coin/${editId}`,
        {
          method: "PUT",
          headers: {
            accept: "*/*",
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            currency: editCurrency,
            count: editCount,
          }),
        }
      );
      if (!res.ok) throw new Error("Server error");
      toast.success(t.successUpdate);
      await fetchCoins();
      closeModal();
    } catch (err) {
      setCoinError(t.errorUpdate);
    } finally {
      setCoinLoading(false);
    }
  };

  const [minTakeOff, setMinTakeOff] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${import.meta.env.VITE_API_KEY}/min-take-off`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.ok) {
          const data = await res.json();
          console.log("minTakeOff response:", data); // 👈 bu joyni tekshiring
          setMinTakeOff(data);
        } else {
          console.error("Xatolik:", res.status);
        }
      } catch (err) {
        console.error("So‘rovda xatolik:", err);
      }
    };

    fetchData();
  }, []);

  return (
    <section className="max-w-full m-8 mt-8 flex flex-col gap-5">
      {/* Language Switcher */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 min-h-[400px]">
        {/* FORM QISMI */}
        <div className="bg-white rounded-lg shadow flex flex-col h-full">
          <form onSubmit={handleSubmit} className="space-y-4 p-6 flex-1">
            <label className="block text-gray-700 font-medium">
              {t("currency")}
              <input
                type="text"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                required
                placeholder={t("currency_placeholder")}
                className="mt-2 block w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>

            <label className="block text-gray-700 font-medium">
              {t("count")}
              <input
                type="float"
                placeholder={t("count_placeholder")}
                onChange={(e) => setCount(Number(e.target.value))}
                required
                className="mt-2 block w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>

            <label className="text-gray-700 font-medium flex flex-col gap-2">
              {t("type")}
              <select
                onChange={(e) => {
                  setType(e.target.value);
                }}
                name="type"
                className="block w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="CRYPTO">{t("crypto")}</option>
                <option value="MONEY">{t("money")}</option>
              </select>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 font-bold rounded-md border-2 bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center"
            >
              {t("SUBMIT")}
            </button>

            <div className="bg-blue-50 border border-blue-300 text-blue-800 text-sm rounded p-3">
              {minTakeOff ? (
                <p>
                  {t("minimum_withdraw")}:{" "}
                  <strong>{minTakeOff.minValue}</strong>
                </p>
              ) : (
                <p>{t("loading")}...</p>
              )}
            </div>
          </form>

          {success && (
            <div className="mt-2 text-green-600 text-center font-semibold">
              {success}
            </div>
          )}
          {error && (
            <div className="mt-2 text-red-600 text-center font-semibold">
              {error}
            </div>
          )}
        </div>

        {/* BALANCE QISMI */}
        <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-lg flex flex-col h-full">
          <div className="p-6 overflow-auto flex-1">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {t("balances")}
            </h2>

            {coinError && (
              <div className="text-red-500 bg-red-50 p-3 rounded-lg text-center mb-3">
                {coinError}
              </div>
            )}

            {coinData &&
            (Array.isArray(coinData)
              ? coinData.length > 0
              : Object.keys(coinData).length > 0) ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(Array.isArray(coinData)
                  ? coinData
                  : Object.entries(coinData)
                ).map((item: any, idx: any) => {
                  const id = Array.isArray(coinData) ? item.id : item[0];
                  const count = Array.isArray(coinData) ? item.count : item[1];
                  const currency = Array.isArray(coinData)
                    ? item.currency
                    : item[0];

                  return (
                    <div
                      key={id}
                      className="border border-gray-100 rounded-md p-4 shadow-sm hover:shadow-lg transition-all"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xl font-semibold text-gray-800">
                            {count}
                          </p>
                          <h3 className="text-sm text-gray-500 uppercase">
                            {currency}
                          </h3>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              openEditModal(id, { currency, count })
                            }
                            className="p-2 rounded-full hover:bg-gray-100 transition flex items-center justify-center"
                            disabled={coinLoading}
                          >
                            {coinLoading && editId === id ? (
                              <span className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></span>
                            ) : (
                              <Pencil size={18} className="text-blue-500" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(id)}
                            className="p-2 rounded-full hover:bg-gray-100 transition flex items-center justify-center"
                            disabled={coinLoading}
                          >
                            {coinLoading && editId === id ? (
                              <span className="animate-spin h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full"></span>
                            ) : (
                              <Trash2 size={18} className="text-red-500" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-gray-500 text-center py-4">
                {t("noData")}
              </div>
            )}
          </div>

          {/* Bottom Button */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-full border-2 rounded-md px-10 py-3 text-xl font-semibold"
            >
              {t("minimum_withdraw")}
            </button>
          </div>
        </div>

        {/* MODAL */}
        {showModal && selectedCoin && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gradient-to-br from-white to-gray-50 w-full max-w-md rounded-2xl p-8 shadow-2xl border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                <span className="text-blue-600">{selectedCoin.currency}</span>
              </h2>
              <input
                type="text"
                value={editCurrency}
                onChange={(e) => setEditCurrency(e.target.value)}
                placeholder={t("currencyPlaceholder")}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <input
                type="number"
                value={editCount}
                onChange={(e) => setEditCount(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-6 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <div className="flex justify-end gap-4">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
                  disabled={coinLoading}
                >
                  {t("cancel")}
                </button>
                <button
                  onClick={handleUpdate}
                  className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition flex items-center justify-center disabled:opacity-60"
                  disabled={coinLoading}
                >
                  {coinLoading ? (
                    <>
                      <span className="animate-spin mr-2 h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                      {t("saving")}
                    </>
                  ) : (
                    t("save")
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {isOpen && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-white shadow-lg border border-gray-300 rounded-md p-4 animate-fade-in-down w-[90%] max-w-md">
          <div className="flex items-center gap-4">
            <input
              className="flex-1 border px-3 py-2 rounded outline-none"
              type="number"
              name="minValue"
              placeholder={t("min_count")}
              onChange={(e) => {
                setvalue(e.target.value);
              }}
            />
            <button
              onClick={() => {
                setMinimum(value);
                setIsOpen(false);
              }}
              className="w-20 h-10 px-5 border-2 rounded font-medium text-white bg-blue-600 hover:bg-blue-700 transition"
            >
              {t("send")}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
