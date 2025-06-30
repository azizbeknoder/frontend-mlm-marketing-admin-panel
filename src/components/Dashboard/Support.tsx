import { Edit, Headset, LinkIcon, Trash, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export default function Support() {
  const [CreditCard, setCreditCard] = useState([]);
  const [openModal, setOpenModal] = useState(false);

  const { t } = useTranslation();

  const [editCard, setEditCard] = useState<null | {
    id: Number;
    name: string;
    link: string;
  }>(null);

  const update = async (obj: any) => {
    const token = localStorage.getItem("token");

    try {
      const req = await fetch(`${import.meta.env.VITE_API_KEY}/suport`, {
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

  const getCurrencies = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_KEY}/suport`);

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
      name: formdata.get("name"),
      link: formdata.get("link"),
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_API_KEY}/suport`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`, // agar token kerak bo‘lsa
        },
        body: JSON.stringify(obj),
      });

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
      const req = await fetch(`${import.meta.env.VITE_API_KEY}/suport/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

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
    getCurrencies();
  }, []);

  return (
    <div className="p-10">
      <h1 className="flex items-center gap-3">
        <Headset className="bg-blue-600 w-16 h-16 rounded-md text-white p-3" />
        <span className="text-3xl font-bold">{t("support_center")}</span>
      </h1>

      <div>
        {CreditCard.length === 0 && (
          <div className="flex flex-col text-center gap-5 items-center justify-center w-full h-full pt-48 relative">
            <div className="relative w-64 h-64 flex items-center justify-center">
              {/* Center Icon */}
              <Headset className="absolute z-5 w-20 h-20 p-4 bg-slate-300 text-gray-100 rounded-full" />

              {/* Rotating Circular Text */}
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
                      {t("no_support_saved")} • {t("no_support_saved")} •{" "}
                      {t("no_support_saved")} •
                    </textPath>
                  </text>
                </svg>
              </div>
            </div>

            <p>{t("add_first_social_media")}</p>
          </div>
        )}
        <button
          onClick={() => {
            setOpenModal(true);
          }}
          className="bg-blue-600/50 mx-auto flex mt-4 hover:bg-blue-600 duration-500 text-white px-20 py-3 rounded-md font-semibold"
        >
          {t("add_social_media")}
        </button>
      </div>

      <div className="mt-10 w-full grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {CreditCard?.map(({ id, name, link }) => (
          <div
            key={id}
            className="w-full bg-white flex flex-col gap-3 rounded-md p-4 sm:p-5 shadow-sm"
          >
            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
              <span className="font-medium text-sm sm:text-base break-words">
                {name}
              </span>

              <div className="flex items-center gap-3 self-end sm:self-auto">
                <Edit
                  onClick={() =>
                    setEditCard({
                      id,
                      link,
                      name,
                    })
                  }
                  className="w-4 h-4 cursor-pointer text-gray-700"
                />
                <Trash
                  onClick={() => {
                    deleteCard(id);
                  }}
                  className="w-4 h-4 cursor-pointer text-red-500"
                />
              </div>
            </div>

            {/* Link Block */}
            <div className="bg-gray-100 text-blue-500 px-3 py-2 rounded-md text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 break-words">
              <div className="flex items-center gap-2 text-blue-600">
                <LinkIcon className="w-4 h-4" />
                <span className="text-xs sm:text-sm">Link:</span>
              </div>
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={link}
                className="text-blue-600 underline break-all"
              >
                {link}
              </a>
            </div>
          </div>
        ))}
      </div>

      {openModal && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/60 px-4">
          <div className="w-full max-w-md sm:max-w-lg md:max-w-xl bg-white rounded-md p-6 relative">
            <div className="flex items-center justify-between border-b mb-4 pb-3">
              <h1 className="text-lg sm:text-xl font-bold">
                {t("social_media_links")}
              </h1>
              <X
                className="cursor-pointer text-gray-700 hover:text-red-500"
                onClick={() => {
                  setOpenModal(false);
                }}
              />
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <label className="flex flex-col gap-2">
                <span className="text-sm sm:text-base font-medium">
                  {t("social_media_name")}
                </span>
                <input
                  className="border rounded-md px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="name"
                  type="text"
                  placeholder={t("name_placeholder")}
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm sm:text-base font-medium">
                  {t("social_media_link")}
                </span>
                <input
                  className="border rounded-md px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="link"
                  type="text"
                  placeholder={t("link_placeholder")}
                />
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
              {t("edit_social_media")}
            </h2>
            <form
              className="flex flex-col gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                update(editCard);
                setEditCard(null);
              }}
            >
              {/* Name Field */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">
                  {t("social_media_name")}
                </label>
                <input
                  type="text"
                  value={editCard.name}
                  onChange={(e) =>
                    setEditCard({ ...editCard, name: e.target.value })
                  }
                  className="w-full border px-3 py-2 rounded-md text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Link Field */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">
                  {t("social_media_link")}
                </label>
                <input
                  type="text"
                  value={editCard.link}
                  onChange={(e) =>
                    setEditCard({ ...editCard, link: e.target.value })
                  }
                  className="w-full border px-3 py-2 rounded-md text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
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
