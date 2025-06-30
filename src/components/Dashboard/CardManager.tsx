import {
  CreditCardIcon,
  Edit,
  Eye,
  EyeOff,
  LucideCreditCard,
  Trash,
  WalletCards,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export default function CardManager() {
  const [CreditCard, setCreditCard] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const { t } = useTranslation();
  const [currencies, setCurrencies] = useState([]);
  const [visibleCards, setVisibleCards] = useState<{ [key: string]: boolean }>(
    {}
  );

  const [editCard, setEditCard] = useState<null | {
    id: Number;
    seriaNumber: string;
    currency: string;
    type: string;
  }>(null);

  const toggleCardVisibility = (id: string) => {
    setVisibleCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const update = async (obj: any) => {
    const token = localStorage.getItem("token");

    try {
      const req = await fetch(`${import.meta.env.VITE_API_KEY}/cardnumber`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Agar token kerak bo‘lsa
        },
        body: JSON.stringify(obj),
      });

      if (!req.ok) {
        throw new Error("Update failed");
      }
      await req.json();
      toast.success("Update successfull");
      await getCurrencies();
    } catch (error: any) {
      toast.error("Error updating card:", error.message);
    }
  };

  const getCurrency = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_KEY}/coin`);

      if (!response.ok) {
        throw new Error("Failed to fetch currency data");
      }

      const data = await response.json();
      const currencyArray = data.map((e: any) => e.currency);

      setCurrencies(currencyArray);
    } catch (error: any) {
      toast.error("Error fetching currency:", error.message);
    }
  };

  const getCurrencies = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_KEY}/cardnumber`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch currency data");
      }

      const data = await response.json();
      setCreditCard(data);
    } catch (error: any) {
      console.error("Error fetching currency:", error.message);
      return null;
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const formdata = new FormData(e.target);
    const obj = {
      seriaNumber: formdata.get("seriaNumber"),
      currency: formdata.get("currency"),
      type: formdata.get("type"),
    };

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_KEY}/cardnumber`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`, // agar token kerak bo‘lsa
          },
          body: JSON.stringify(obj),
        }
      );

      if (!response.ok) throw new Error("Something went wrong");
      await response.json();
      toast.success("Successfull");
      setOpenModal(false);
    } catch (err: any) {
      toast.error("Error:", err.message);
    }
  };

  const deleteCard = async (id: any) => {
    const token = localStorage.getItem("token");

    try {
      const req = await fetch(
        `${import.meta.env.VITE_API_KEY}/cardnumber/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!req.ok) {
        throw new Error("Delete failed");
      }

      await req.json();
      toast.success("Card deleted");
      getCurrencies();
    } catch (error: any) {
      toast.error("Error deleting card:", error.message);
    }
  };
  useEffect(() => {
    getCurrency();
    getCurrencies();
  }, []);

  return (
    <div className="p-10">
      <h1 className="flex items-center gap-3">
        <LucideCreditCard className="bg-blue-600 w-16 h-16 rounded-md text-white p-3" />
        <span className="text-3xl font-bold">{t("card_manager")}</span>
      </h1>

      <div>
        {CreditCard.length === 0 && (
          <div className="flex flex-col text-center gap-5 items-center justify-center w-full h-full pt-48 relative">
            <div className="relative w-64 h-64 flex items-center justify-center">
              <CreditCardIcon className="absolute z-5 w-20 h-20 p-4 bg-slate-300 text-gray-100 rounded-full" />
              <div className="absolute w-full h-full animate-spin-slow">
                <svg viewBox="0 0 300 300" className="w-full h-full">
                  <defs>
                    <path
                      id="circlePath"
                      d="M150,150 m-100,0 a100,100 0 1,1 200,0 a100,100 0 1,1 -200,0"
                    />
                  </defs>
                  <text fill="#1f2937" fontSize="18" fontWeight="bold">
                    <textPath href="#circlePath" startOffset="0">
                      {t("no_cards_saved")} • {t("no_cards_saved")} •{" "}
                      {t("no_cards_saved")} •
                    </textPath>
                  </text>
                </svg>
              </div>
            </div>

            <p>{t("add_first_card_prompt")}</p>
          </div>
        )}
        <button
          onClick={() => {
            setOpenModal(true);
          }}
          className="bg-blue-600/50 mx-auto flex mt-4 hover:bg-blue-600 duration-500 text-white px-20 py-3 rounded-md font-semibold"
        >
          {t("add_first_card")}
        </button>
      </div>

      <div className="mt-10 w-full grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {CreditCard?.map(({ id, seriaNumber, currency, type, date }) => (
          <div
            key={id}
            className="w-full max-w-md sm:max-w-lg md:max-w-xl bg-white flex flex-col gap-3 rounded-md p-4 sm:p-5 shadow-sm"
          >
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <WalletCards />
                <span className="text-sm sm:text-base text-gray-700">
                  {(() => {
                    const d = new Date(date);
                    const day = String(d.getDate()).padStart(2, "0");
                    const month = String(d.getMonth() + 1).padStart(2, "0");
                    const year = d.getFullYear();
                    const hours = String(d.getHours()).padStart(2, "0");
                    const minutes = String(d.getMinutes()).padStart(2, "0");

                    return `${day}/${month}/${year}, ${hours}:${minutes}`;
                  })()}
                </span>
              </div>
            </div>

            <div className="bg-gray-100 px-3 py-2 rounded-md text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-gray-700">
              <span className="text-sm">{currency}</span>

              <span className="flex items-center gap-2 text-sm break-all">
                {seriaNumber &&
                  (visibleCards[id]
                    ? seriaNumber
                    : `${seriaNumber.slice(0, 4)} •••• •••• ${seriaNumber.slice(
                        -4
                      )}`)}
              </span>

              <div className="flex items-center gap-3 self-end sm:self-auto">
                <button onClick={() => toggleCardVisibility(id)} type="button">
                  {visibleCards[id] ? (
                    <EyeOff className="w-4 h-4 cursor-pointer" />
                  ) : (
                    <Eye className="w-4 h-4 cursor-pointer" />
                  )}
                </button>
                <Edit
                  onClick={() =>
                    setEditCard({
                      id,
                      seriaNumber,
                      currency,
                      type,
                    })
                  }
                  className="w-4 h-4 cursor-pointer"
                />
                <Trash
                  onClick={() => {
                    deleteCard(id);
                  }}
                  className="w-4 h-4 cursor-pointer"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      {openModal && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/60 px-4">
          <div className="w-full max-w-md sm:max-w-lg bg-white rounded-md p-6 relative">
            <div className="flex items-center justify-between border-b pb-4 mb-4">
              <h1 className="text-lg sm:text-xl font-bold">
                {t("add_new_card")}
              </h1>
              <X
                className="cursor-pointer text-gray-600 hover:text-red-500"
                onClick={() => {
                  setOpenModal(false);
                }}
              />
            </div>

            <form
              onSubmit={handleSubmit}
              className="w-full flex flex-col gap-4"
            >
              <label className="flex flex-col gap-2">
                <span className="text-sm sm:text-base">
                  {t("credit_card_number")}
                </span>
                <input
                  className="border rounded-md px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="seriaNumber"
                  type="text"
                  placeholder={t("credit_card_number")}
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm sm:text-base">{t("currency")}</span>
                <select
                  name="currency"
                  className="border rounded-md px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {currencies?.map((el, i) => (
                    <option key={i} value={el}>
                      {el}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm sm:text-base">{t("type")}</span>
                <select
                  name="type"
                  className="border rounded-md px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="CRYPTO">{t("crypto")}</option>
                  <option value="MONEY">{t("money")}</option>
                </select>
              </label>

              <div className="flex flex-col sm:flex-row gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setOpenModal(false)}
                  className="w-full border text-gray-700 hover:bg-gray-100 duration-300 rounded-md py-2 font-semibold"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  className="w-full border bg-blue-600 text-white hover:bg-blue-700 duration-300 rounded-md py-2 font-semibold"
                >
                  {t("submit")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-lg sm:text-xl font-bold mb-4">
              {t("edit_card")}
            </h2>
            <form
              className="flex flex-col gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                update(editCard);
                setEditCard(null);
              }}
            >
              {/* Card number */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">
                  {t("card_number")}
                </label>
                <input
                  type="text"
                  value={editCard.seriaNumber}
                  onChange={(e) =>
                    setEditCard({ ...editCard, seriaNumber: e.target.value })
                  }
                  className="w-full border rounded-md px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Currency */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">{t("currency")}</label>
                <select
                  value={editCard.currency}
                  onChange={(e) =>
                    setEditCard({ ...editCard, currency: e.target.value })
                  }
                  className="w-full border rounded-md px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {currencies?.map((el, i) => (
                    <option key={i} value={el}>
                      {el}
                    </option>
                  ))}
                </select>
              </div>

              {/* Type */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">{t("type")}</label>
                <select
                  value={editCard.type}
                  onChange={(e) =>
                    setEditCard({ ...editCard, type: e.target.value })
                  }
                  className="w-full border rounded-md px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="CRYPTO">{t("crypto")}</option>
                  <option value="MONEY">{t("money")}</option>
                </select>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setEditCard(null)}
                  className="w-full sm:w-auto px-4 py-2 rounded-md border bg-gray-100 hover:bg-gray-200 text-gray-800 transition"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-4 py-2 rounded-md border bg-blue-600 text-white hover:bg-blue-700 transition"
                >
                  {t("submit")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
