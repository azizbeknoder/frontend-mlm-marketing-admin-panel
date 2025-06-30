import { CheckCircle, Edit2, Trash, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export default function Referalevel() {
  const [openModal, setOpenModal] = useState(false);
  const [prizes, setPrizes] = useState([]);
  const [modalChange, setModalChange] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState({
    level: "",
    prize: "",
    count: "",
    maxCount: "",
    prizeName: "",
  });

  const { t } = useTranslation();

  const hundleReferal = async (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const obj = {
      level: Number(formData.get("level")),
      prize: formData.get("prize"),
      count: Number(formData.get("count")),
      maxCount: Number(formData.get("maxCount")),
      prizeName: formData.get("prizeName"),
    };

    const token = localStorage.getItem("token");

    try {
      const req = await fetch(`${import.meta.env.VITE_API_KEY}/referal-level`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(obj),
      });

      if (req.ok) {
        await req.json();
        toast.success(`Muvaffaqiyatli qo'shildi!`);
        setOpenModal(false);
        await getPrize();
      } else {
        const errorText = await req.text();
        throw new Error(`Xatolik: ${req.status} - ${errorText}`);
      }
    } catch (error) {
      toast.error("So'rovda xatolik:", error.message);
    }
  };

  const getPrize = async () => {
    try {
      const req = await fetch(`${import.meta.env.VITE_API_KEY}/referal-level`);

      if (req.ok) {
        const res = await req.json();
        setPrizes(res);

        setOpenModal(false);
      } else {
        const errorText = await req.text();
        throw new Error(`Xatolik: ${req.status} - ${errorText}`);
      }
    } catch (error) {
      toast.error("So'rovda xatolik:", error.message);
    }
  };

  const deleteStatistic = async (id: any) => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_KEY}/referal-level/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        await response.json();
        toast.error("O'chirishda xatolik yuz berdi.");
      } else {
        toast.success("Muvaffaqiyatli o'chirildi.");
        await getPrize();
      }
    } catch (error) {
      toast.error(error.message || "Tarmoqqa ulanishda xatolik yuz berdi.");
    }
  };

  const getLevel = async (levelData: any) => {
    setSelectedLevel(levelData);
    setModalChange(true);
  };

  const update = async (obj: any) => {
    const result = {
      id: Number(obj.id),
      level: Number(obj.level),
      prize: obj.prize,
      count: Number(obj.count),
      maxCount: Number(obj.maxCount),
      prizeName: obj.prizeName,
    };
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_KEY}/referal-level`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(result),
      });
      if (!res.ok) {
        throw new Error("Yangilashda xatolik yuz berdi");
      }
      const data = await res.json();
      console.log(data);
      setModalChange(false);
      await getPrize();
    } catch (error) {
      console.error("Xatolik:", error);
    }
  };

  useEffect(() => {
    getPrize();
  }, []);

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        {/* Title and description */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
            {t("referral_level")}
          </h2>
          <p className="text-sm text-gray-600">{t("financial_overview")}</p>
        </div>

        {/* Add button */}
        <div className="flex justify-end md:justify-start">
          <button
            onClick={() => setOpenModal(true)}
            className="px-6 py-2 sm:px-10 sm:py-3 text-sm sm:text-base cursor-pointer border-2 hover:shadow-md duration-300 rounded-lg"
          >
            {t("add_prize")}
          </button>
        </div>
      </div>

      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">{t("general_list")}</h2>

        <div className="w-full">
          <div className="hidden md:block">
            {/* Desktop Table */}
            <table className="w-full text-sm text-left border border-gray-200 shadow-md rounded-lg overflow-hidden">
              <thead className="bg-gray-100 text-gray-700 uppercase tracking-wide text-xs">
                <tr>
                  <th className="px-6 py-3 border-b">{t("level")}</th>
                  <th className="px-6 py-3 border-b">{t("level_name")}</th>
                  <th className="px-6 py-3 border-b">{t("prize_name")}</th>
                  <th className="px-6 py-3 border-b">{t("min_usdt")}</th>
                  <th className="px-6 py-3 border-b">{t("max_usdt")}</th>
                  <th className="px-6 py-3 border-b text-center">
                    {t("action")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {[...prizes]
                  .sort((a, b) => a.level - b.level)
                  .map(
                    ({ level, prize: pz, prizeName, count, id, maxCount }) => (
                      <tr
                        key={id}
                        className="hover:bg-gray-50 transition-colors duration-200"
                      >
                        <td className="px-6 py-4 border-b">{level}</td>
                        <td className="px-6 py-4 border-b">{pz}</td>
                        <td className="px-6 py-4 border-b">{prizeName}</td>
                        <td className="px-6 py-4 border-b">{count}</td>
                        <td className="px-6 py-4 border-b">{maxCount}</td>
                        <td className="px-6 py-4 border-b">
                          <div className="flex items-center justify-center gap-4">
                            <Edit2
                              onClick={() => {
                                setModalChange(true);
                                getLevel({
                                  level,
                                  prize: pz,
                                  count,
                                  id,
                                  maxCount,
                                  prizeName,
                                });
                              }}
                              className="text-yellow-500 hover:text-yellow-600 w-5 h-5 cursor-pointer transition"
                            />
                            <Trash
                              onClick={() => deleteStatistic(id)}
                              className="text-red-500 hover:text-red-600 w-5 h-5 cursor-pointer transition"
                            />
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                {prizes.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-gray-500">
                      {t("no_data")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile view */}
          <div className="md:hidden space-y-4">
            {prizes.length > 0 ? (
              prizes.map(
                ({ level, prize: pz, prizeName, count, id, maxCount }) => (
                  <div
                    key={id}
                    className="bg-white rounded-lg shadow border p-4 space-y-2"
                  >
                    <div>
                      <p className="text-xs text-gray-500">{t("level")}</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {level}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">{t("level_name")}</p>
                      <p className="text-sm text-gray-700">{pz}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">{t("level_name")}</p>
                      <p className="text-sm text-gray-700">{prizeName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">{t("min_usdt")}</p>
                      <p className="text-sm text-gray-700">{count}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">{t("max_usdt")}</p>
                      <p className="text-sm text-gray-700">{maxCount}</p>
                    </div>
                    <div className="flex justify-end gap-4 mt-2">
                      <Edit2
                        onClick={() => {
                          setModalChange(true);
                          getLevel({
                            level,
                            prize: pz,
                            prizeName,
                            count,
                            id,
                            maxCount,
                          });
                        }}
                        className="text-yellow-500 hover:text-yellow-600 w-5 h-5 cursor-pointer transition"
                      />
                      <Trash
                        onClick={() => deleteStatistic(id)}
                        className="text-red-500 hover:text-red-600 w-5 h-5 cursor-pointer transition"
                      />
                    </div>
                  </div>
                )
              )
            ) : (
              <p className="text-center text-gray-500 py-6">{t("no_data")}</p>
            )}
          </div>
        </div>
      </div>

      {openModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white w-full max-w-md mx-4 rounded-2xl p-6 shadow-lg space-y-6">
            <h2 className="text-2xl font-semibold text-center text-gray-800">
              {t("referral_level")}
            </h2>

            <form onSubmit={hundleReferal} className="space-y-4">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">
                  {t("level")}
                </label>
                <input
                  className="border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                  defaultValue="1"
                  placeholder={t("level")}
                  type="number"
                  name="level"
                  required
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">
                  {t("level_name")}
                </label>
                <input
                  className="border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                  type="text"
                  placeholder={t("level_name")}
                  name="prize"
                  required
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">
                  {t("prize_name")}
                </label>
                <input
                  className="border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                  type="text"
                  placeholder={t("prize_name")}
                  name="prizeName"
                  required
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">
                  {t("min_count")}
                </label>
                <input
                  className="border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="0"
                  type="number"
                  name="count"
                  required
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">
                  {t("max_count")}
                </label>
                <input
                  className="border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="0"
                  type="number"
                  name="maxCount"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="w-full py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition"
                >
                  {t("save")}
                </button>
                <button
                  type="button"
                  onClick={() => setOpenModal(false)}
                  className="w-full py-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 font-semibold transition"
                >
                  {t("cancel")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalChange && (
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white w-full max-w-md mx-4 rounded-2xl p-6 shadow-2xl space-y-5">
            <h2 className="text-2xl font-bold text-gray-800 text-center">
              {t("edit_referral_level")}
            </h2>

            <form className="space-y-4">
              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">
                  {t("level")}
                </label>
                <input
                  type="number"
                  placeholder={t("level")}
                  value={selectedLevel.level}
                  onChange={(e) =>
                    setSelectedLevel({
                      ...selectedLevel,
                      level: e.target.value,
                    })
                  }
                  className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">
                  {t("level_name")}
                </label>
                <input
                  type="text"
                  placeholder={t("level_name")}
                  value={selectedLevel.prize}
                  onChange={(e) =>
                    setSelectedLevel({
                      ...selectedLevel,
                      prize: e.target.value,
                    })
                  }
                  className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">
                  {t("prize_name")}
                </label>
                <input
                  type="text"
                  placeholder={t("prize_name")}
                  value={selectedLevel.prizeName}
                  onChange={(e) =>
                    setSelectedLevel({
                      ...selectedLevel,
                      prizeName: e.target.value,
                    })
                  }
                  className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">
                  {t("min_count")}
                </label>
                <input
                  type="number"
                  placeholder={t("min_count")}
                  value={selectedLevel.count}
                  onChange={(e) =>
                    setSelectedLevel({
                      ...selectedLevel,
                      count: e.target.value,
                    })
                  }
                  className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">
                  {t("max_count")}
                </label>
                <input
                  type="number"
                  placeholder={t("max_count")}
                  value={selectedLevel.maxCount}
                  onChange={(e) =>
                    setSelectedLevel({
                      ...selectedLevel,
                      maxCount: e.target.value,
                    })
                  }
                  className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    update(selectedLevel);
                    setModalChange(false);
                  }}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium transition"
                >
                  <CheckCircle className="w-5 h-5" />
                  {t("save")}
                </button>
                <button
                  type="button"
                  onClick={() => setModalChange(false)}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 font-medium transition"
                >
                  <X className="w-5 h-5" />
                  {t("cancel")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
