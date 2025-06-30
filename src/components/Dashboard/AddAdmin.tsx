import { t } from "i18next";
import { Trash, X } from "lucide-react";
import { useEffect, useState } from "react";
import { MdAdminPanelSettings } from "react-icons/md";
import { toast } from "sonner";

export default function AddAdmin() {
  const [getAdmins, setAdmins] = useState([]);
  const [openModal, setOpenModal] = useState(false);

  const getAdmin = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_KEY}/admin`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch currency data");
      }

      const data = await response.json();
      console.log(data);

      setAdmins(data);
    } catch (error: any) {
      console.error("Error fetching currency:", error.message);
      return null;
    }
  };

  const deleteCard = async (id: any) => {
    const token = localStorage.getItem("token");

    try {
      const req = await fetch(`${import.meta.env.VITE_API_KEY}/users/${id}`, {
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
      getAdmin();
    } catch (error: any) {
      toast.error("Error deleting card:", error.message);
    }
  };

  useEffect(() => {
    getAdmin();
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const formdata = new FormData(e.target);
    const obj = {
      name: formdata.get("name"),
      email: formdata.get("email"),
      password: formdata.get("password"),
      role: formdata.get("role"),
    };

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_KEY}/admin/add`,
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
      getAdmin();
    } catch (err: any) {
      toast.error("Error:", err.message);
    }
  };

  return (
    <div className="p-10">
      <h1 className="flex items-center gap-3">
        <MdAdminPanelSettings className="bg-blue-600 w-16 h-16 rounded-md text-white p-3" />
        <span className="text-3xl font-bold">{t("Admins management")}</span>
      </h1>

      <div>
        {getAdmins.length === 0 && (
          <div className="flex flex-col text-center gap-5 items-center justify-center w-full h-full pt-48 relative">
            <div className="relative w-64 h-64 flex items-center justify-center">
              <MdAdminPanelSettings className="absolute z-5 w-20 h-20 p-4 bg-slate-300 text-gray-100 rounded-full" />
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
                      {t("no_admin_saved")} • {t("no_admin_saved")} •{" "}
                      {t("no_admin_saved")} •
                    </textPath>
                  </text>
                </svg>
              </div>
            </div>
          </div>
        )}
        <button
          onClick={() => {
            setOpenModal(true);
          }}
          className="bg-blue-600/50 mx-auto flex mt-4 hover:bg-blue-600 duration-500 text-white px-20 py-3 rounded-md font-semibold"
        >
          {t("Create new admin")}
        </button>
      </div>

      <div className="mt-10 w-full grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {getAdmins
          ?.filter(({ role }) => role === "ADMIN") // Faqat adminlarni ajratib olish
          .map(({ id, name, createdAt, email }) => (
            <div
              key={id}
              className="w-full max-w-md sm:max-w-lg md:max-w-xl bg-white flex flex-col gap-3 rounded-md p-4 sm:p-5 shadow-sm"
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  {name}
                  <span className="text-sm sm:text-base text-gray-700">
                    {(() => {
                      const d = new Date(createdAt);
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
                <span className="text-sm">{email}</span>

                <div className="flex items-center gap-3 self-end sm:self-auto">
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
                {t("Creacte new Admin")}
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
                <span className="text-sm sm:text-base">{t("Name")}</span>
                <input
                  className="border rounded-md px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="name"
                  type="text"
                  placeholder={t("Name...")}
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm sm:text-base">{t("Email")}</span>
                <input
                  className="border rounded-md px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="email"
                  type="text"
                  placeholder={t("Email...")}
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm sm:text-base">{t("Password")}</span>
                <input
                  className="border rounded-md px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="password"
                  type="password"
                  placeholder={t("Password...")}
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm sm:text-base">{t("Role")}</span>
                <input
                  className="border rounded-md px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="role"
                  type="text"
                  value={"ADMIN"}
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
    </div>
  );
}
