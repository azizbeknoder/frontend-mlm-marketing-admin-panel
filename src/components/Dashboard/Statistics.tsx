import { Coins, RefreshCcw, Smile } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export const Statistics: React.FC = () => {
  const [userModal, setUserModal] = useState(false);
  const [modalCoin, setCoinModal] = useState(false);
  const [user, setUser] = useState([]);
  const [coinTotal, setCoinTotal] = useState([]);
  const [modalChange, setModalChange] = useState(false);
  const [oldUser, setOldUser] = useState(null);
  const [coinValue, setCoinValue] = useState(0);
  const [loading, setLoading] = useState(false);

  const { t } = useTranslation();

  const hundleUser = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const res = {
      email: formData.get("email"),
      coin: Number(formData.get("coin")),
    };

    const token = localStorage.getItem("token");

    try {
      setLoading(true);
      const req = await fetch(
        `${import.meta.env.VITE_API_KEY}/statistika/user`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(res),
        }
      );

      if (req.ok) {
        await req.json();
        toast.success(`Muvaffaqiyatli qo'shildi ${(<Smile />)}`);
        await getUser();
      } else {
        const errorText = await req.text();
        throw new Error(`Xatolik: ${req.status} - ${errorText}`);
      }
    } catch (error) {
      toast.error("So'rovda xatolik:", error.message);
    } finally {
      setUserModal(false);
      setLoading(false);
    }
  };

  const handleTotal = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const res = {
      allCoin: Number(formData.get("allCoin")),
      userCount: Number(formData.get("userCount")),
    };

    const token = localStorage.getItem("token");

    try {
      setLoading(true);
      const req = await fetch(
        `${import.meta.env.VITE_API_KEY}/statistika/statis-web`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(res),
        }
      );

      if (req.ok) {
        await req.json();
        await total();
        toast.success(`Muvaffaqiyatli qo'shildi ${(<Smile />)}`);
      } else {
        const errorText = await req.text();
        throw new Error(`Xatolik: ${req.status} - ${errorText}`);
      }
    } catch (error) {
      toast.error("So'rovda xatolik:", error.message);
    } finally {
      setCoinModal(false);
      setLoading(false);
    }
  };

  let amountUserCoin = user.reduce((acc, item) => acc + Number(item.coin), 0);
  let amounTotalCoin = user.reduce((acc, item) => acc + Number(item.coin), 0);

  const allCoin = coinTotal.reduce(
    (acc, item) => acc + Number(item.allCoin),
    0
  );
  const userCount = coinTotal.reduce(
    (acc, item) => acc + Number(item.userCount),
    0
  );

  // Qo‘shilgan yakuniy qiymatlar
  amountUserCoin += userCount;
  amounTotalCoin += allCoin;

  const total = async () => {
    try {
      setLoading(true);
      const req = await fetch(
        `${import.meta.env.VITE_API_KEY}/statistika/statis-web`
      );
      if (req.status === 200) {
        const res = await req.json(); // <--- await kiritildi
        setCoinTotal(res);
      } else {
        const errorText = await req.text();
        throw new Error(`Xatolik: ${req.status} - ${errorText}`);
      }
    } catch (error) {
      toast.error("So'rovda xatolik:", error.message);
    } finally {
      setLoading(false); // 👈 Bu ham kerak
    }
  };

  useEffect(() => {
    total();
  }, []);

  const getUser = async () => {
    try {
      setLoading(true);
      const req = await fetch(
        `${import.meta.env.VITE_API_KEY}/statistika/user`
      );
      if (req.status === 200) {
        const res = await req.json();
        setUser(res);
      } else {
        const errorText = await req.text();
        throw new Error(`Xatolik: ${req.status} - ${errorText}`);
      }
    } catch (error) {
      toast.error("So'rovda xatolik:", error.message);
    } finally {
      setLoading(false); // 👈 Bu joy yetishmayapti
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  const deleteStatistic = async (id) => {
    const token = localStorage.getItem("token");

    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_KEY}/statistika/user/${id}`,
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
        toast.success("Statistika muvaffaqiyatli o'chirildi.");
        await getUser();
      }
    } catch (error) {
      toast.error(error.message || "Tarmoqqa ulanishda xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  };

  const updateStatistic = async ({ id, email, coin }) => {
    const token = localStorage.getItem("token");
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_KEY}/statistika/user`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ id, email, coin }),
        }
      );
      if (!response.ok) {
        toast.error("Yangilashda xatolik yuz berdi.");
      } else {
        toast.success("Statistika muvaffaqiyatli yangilandi.");
        await getUser();
      }
    } catch (error) {
      toast.error("Tarmoqqa ulanishda xatolik yuz berdi.");
    } finally {
      setModalChange(false);
      setLoading(false);
    }
  };

  const openEditModal = (user, id) => {
    const filterUser = user.filter((item: any) => item.id === id);
    filterUser.map((data: any) => {
      setOldUser(data);
    });
    setModalChange(true);
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-6">
        {/* Title & Description */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            {t("statistics")}
          </h2>
          <p className="text-gray-600 text-sm">{t("financial_overview")}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={() => {
              setUserModal(true);
              setCoinModal(false);
            }}
            className="px-6 py-2.5 text-sm font-medium bg-white border-2 border-blue-500 text-blue-600 hover:bg-blue-50 hover:shadow-md transition rounded-xl"
          >
            {t("add_user_coin")}
          </button>
          <button
            onClick={() => {
              setCoinModal(true);
              setUserModal(false);
            }}
            className="px-6 py-2.5 text-sm font-medium bg-white border-2 border-green-500 text-green-600 hover:bg-green-50 hover:shadow-md transition rounded-xl"
          >
            {t("add_total_coin")}
          </button>
        </div>
      </div>

      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Total Coin Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md hover:scale-[1.02] transition duration-300">
          <div className="flex items-center gap-2 text-gray-700 text-lg font-semibold">
            {t("total")} <Coins className="text-yellow-500 w-6 h-6" />
          </div>
          <span className="mt-2 text-3xl font-bold text-gray-900">
            {amounTotalCoin}
          </span>
        </div>

        {/* Users' Coin Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md hover:scale-[1.02] transition duration-300">
          <div className="flex items-center gap-2 text-gray-700 text-lg font-semibold">
            {t("users")} <Coins className="text-blue-500 w-6 h-6" />
          </div>
          <span className="mt-2 text-3xl font-bold text-gray-900">
            {amountUserCoin}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">{t("users_list")}</h2>
        <div className="w-full overflow-x-auto">
          {/* Desktop Table */}
          <table className="hidden md:table w-full text-sm border border-gray-200 shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-100 text-gray-700 uppercase tracking-wide text-xs">
              <tr>
                <th className="px-6 py-3 border-b text-left">{t("email")}</th>
                <th className="px-6 py-3 border-b text-left">{t("coin")}</th>
                <th className="px-6 py-3 border-b text-center">
                  {t("actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {user.map((u) => (
                <tr
                  key={u.id}
                  className="hover:bg-gray-50 transition-colors duration-200"
                >
                  <td className="px-6 py-4 border-b">{u.email}</td>
                  <td className="px-6 py-4 border-b">{u.coin}</td>
                  <td className="px-6 py-4 border-b text-center">
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => openEditModal(user, u.id)}
                        className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium px-3 py-1.5 rounded-md transition"
                      >
                        {t("edit")}
                      </button>
                      <button
                        onClick={() => deleteStatistic(u.id)}
                        className="bg-red-500 hover:bg-red-600 text-white text-xs font-medium px-3 py-1.5 rounded-md transition"
                      >
                        {t("delete")}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {user.length === 0 && (
                <tr>
                  <td colSpan="3" className="text-center py-6 text-gray-500">
                    {t("no_data")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {user.length === 0 ? (
              <div className="text-center py-6 text-gray-500 border rounded-lg shadow-sm">
                {t("no_data")}
              </div>
            ) : (
              user.map((u) => (
                <div
                  key={u.id}
                  className="border border-gray-200 shadow-sm rounded-lg p-4 bg-white"
                >
                  <div className="mb-2">
                    <p className="text-xs text-gray-500">{t("email")}</p>
                    <p className="font-medium text-sm text-gray-900">
                      {u.email}
                    </p>
                  </div>
                  <div className="mb-2">
                    <p className="text-xs text-gray-500">{t("coin")}</p>
                    <p className="font-medium text-gray-900">{u.coin}</p>
                  </div>
                  <div className="flex justify-end gap-2 mt-3">
                    <button
                      onClick={() => openEditModal(user, u.id)}
                      className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium px-3 py-1.5 rounded-md transition"
                    >
                      {t("edit")}
                    </button>
                    <button
                      onClick={() => deleteStatistic(u.id)}
                      className="bg-red-500 hover:bg-red-600 text-white text-xs font-medium px-3 py-1.5 rounded-md transition"
                    >
                      {t("delete")}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {modalChange && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 space-y-5">
            <h2 className="text-2xl font-semibold text-gray-800">
              {t("edit_statistics")}
            </h2>

            <p className="text-sm text-gray-600">
              {t("email")}:{" "}
              <span className="font-medium text-gray-900">{oldUser.email}</span>
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("coin_amount")}
              </label>
              <input
                type="number"
                defaultValue={oldUser.coin}
                placeholder={oldUser.coin}
                onChange={(e) => setCoinValue(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-400 transition"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  updateStatistic({
                    id: oldUser.id,
                    email: oldUser.email,
                    coin: Number(coinValue),
                  });
                }}
                className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md flex items-center justify-center transition"
              >
                {loading ? (
                  <RefreshCcw className="animate-spin w-5 h-5" />
                ) : (
                  t("save")
                )}
              </button>
              <button
                onClick={() => setModalChange(false)}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition"
              >
                {t("cancel")}
              </button>
            </div>
          </div>
        </div>
      )}

      {userModal && (
        <div className="w-[500px] h-auto fixed top-[30%] right-[30%] container mx-auto bg-white rounded-xl flex p-5 justify-center">
          <form
            onSubmit={hundleUser}
            className="flex flex-col w-full items-center gap-5"
          >
            <h1 className="text-2xl font-bold">{t("add_user_coin")}</h1>
            <label className="flex flex-col w-full items-start gap-3">
              {t("email")}
              <input
                type="email"
                name="email"
                className="w-full py-2 bg-transparent placeholder:text-white border rounded-lg outline-none px-2"
                placeholder={t("email_placeholder")}
              />
            </label>
            <label className="flex flex-col w-full items-start gap-3">
              {t("coin")}
              <input
                type="number"
                name="coin"
                className="w-full py-2 bg-transparent placeholder:text-white border rounded-lg outline-none px-2"
                placeholder={t("coin_placeholder")}
              />
            </label>
            <button className="mt-5 border px-10 py-2 rounded-lg">
              {loading ? <RefreshCcw className="animate-spin" /> : t("add")}
            </button>
          </form>
        </div>
      )}

      {modalCoin && (
        <div className="w-[500px] h-auto fixed top-[30%] right-[30%] container mx-auto bg-white rounded-xl flex p-5 justify-center">
          <form
            onSubmit={handleTotal}
            className="flex flex-col w-full items-center gap-5"
          >
            <h1 className="text-2xl font-bold">{t("total_coin")}</h1>
            <label className="flex flex-col w-full items-start gap-3">
              {t("all_coin")}
              <input
                type="number"
                name="allCoin"
                className="w-full py-2 bg-transparent placeholder:text-white border rounded-lg outline-none px-2"
                placeholder={t("all_coin_placeholder")}
              />
            </label>
            <label className="flex flex-col w-full items-start gap-3">
              {t("user_count")}
              <input
                type="number"
                name="userCount"
                className="w-full py-2 bg-transparent placeholder:text-white border rounded-lg outline-none px-2"
                placeholder={t("user_count_placeholder")}
              />
            </label>
            <button className="mt-5 border px-10 py-2 rounded-lg">
              {loading ? <RefreshCcw className="animate-spin" /> : t("add")}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
