import { Download, Languages, PlusCircle, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export default function Addproducts() {
  const [tariffs, setTariffs] = useState([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [openFormModal, setOpeFormModal] = useState(false);
  const [language, setLanguage] = useState("uz");
  const { t } = useTranslation();

  const LANGUAGES = [
    { label: "Uzbek", value: "uz" },
    { label: "English", value: "en" },
    { label: "Russian", value: "ru" },
    { label: "Chinese", value: "zh" },
    { label: "Tajik", value: "tg" },
    { label: "Kyrgyz", value: "ky" },
    { label: "Kazakh", value: "kk" },
  ];

  const [commonFields, setCommonFields] = useState({
    rating: "",
    rewiev: "",
    count: "",
    coin: "",
    photo_url: [
      {
        photo_url: "",
      },
    ],
  });

  const [translations, setTranslations] = useState(() =>
    LANGUAGES.reduce((acc, lang) => {
      acc[lang.value] = {
        name: "",
        description: "",
        longDescription: "",
        features: "",
        usage: "",
      };
      return acc;
    }, {} as Record<string, any>)
  );

  const [mode, setMode] = useState<"add" | "edit">("add");

  const [editingId, setEditingId] = useState<string | null>(null);

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
  };

  const handleCommonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCommonFields((prev) => ({ ...prev, [name]: value }));
  };

  const handleTranslationChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setTranslations((prev) => ({
      ...prev,
      [language]: {
        ...prev[language],
        [name]: value,
      },
    }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const photo_url = URL.createObjectURL(file);
      setCommonFields((prev) => ({ ...prev, photo_url: [{ photo_url }] }));
    }
  };

  const fetchTariffs = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("No authentication token found.");
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_KEY}/products`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error(await response.text());
      const data = await response.json();
      setTariffs(data);
    } catch (err) {
      toast.error("GET /tariff error");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("No authentication token found.");
      return;
    }

    try {
      let uploadedPhotoUrl = commonFields.photo_url;

      // Faqat yangi rasm tanlangan bo‘lsa yuklanadi
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);

        const uploadRes = await fetch(
          `${import.meta.env.VITE_API_KEY}/upload/single`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );

        const res = await uploadRes.json();
        uploadedPhotoUrl = res.url;
      }

      const payload = {
        rating: Number(commonFields.rating),
        rewiev: Number(commonFields.rewiev),
        count: Number(commonFields.count),
        coin: Number(commonFields.coin),
        photo_url: [
          {
            photo_url: uploadedPhotoUrl,
          },
        ],
        translations: Object.entries(translations).map(([lang, data]) => ({
          language: lang,
          ...data,
        })),
      };

      const url =
        mode === "edit"
          ? `${import.meta.env.VITE_API_KEY}/products/${editingId}`
          : `${import.meta.env.VITE_API_KEY}/products`;

      const method = mode === "edit" ? "PATCH" : "POST";

      await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      toast.success(mode === "edit" ? "Product updated" : "Product added");
      fetchTariffs();

      // Forma tozalansin
      setCommonFields({
        rating: 0,
        rewiev: 0,
        count: 0,
        coin: 0,
        photo_url: "",
      });
      setTranslations({});
      setEditingId(null);
      setMode("add");
      setSelectedFile(null);
      setOpeFormModal(false);
    } catch (err) {
      toast.error("Save error");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTariffs();
  }, []);

  const deleteItem = async (id) => {
    const token = localStorage.getItem("token");
    await fetch(`${import.meta.env.VITE_API_KEY}/products/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        return res.text();
      })
      .then(() => {
        toast.success("Successfully deleted");
        fetchTariffs();
      })
      .catch((err) => {
        toast.error(err.message);
      })
      .finally(() => {
        fetchTariffs();
      });
  };

  const update = async (product) => {
    setMode("edit");
    setEditingId(product.id); // <— kerakli id

    setCommonFields({
      rating: product.rating || 0,
      rewiev: product.rewiev || 0,
      count: product.count || 0,
      coin: product.coin || 0,
      photo_url: product.photo_url?.[0]?.photo_url || "", // mavjud rasmni saqlab qo'yish
    });

    const newTranslations = {};
    product.translations.forEach((item) => {
      newTranslations[item.language] = {
        name: item.name || "",
        description: item.description || "",
        longDescription: item.longDescription || "",
        features: item.features || "",
        usage: item.usage || "",
      };
    });
    setTranslations(newTranslations);
    setLanguage(product.translations[0]?.language || "uz");
  };

  return (
    <div className="flex flex-col gap-5 p-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">{t("add_products")}</h1>
        <button
          onClick={() => setOpeFormModal(true)}
          className="flex items-center gap-2 border px-4 py-2 rounded-md"
        >
          {t("add_new_product")} <PlusCircle className="w-5 h-5" />
        </button>
      </div>

      {tariffs.length === 0 && (
        <div className="w-full h-[300px] flex items-center justify-center">
          <h1 className="text-4xl text-gray-400 font-bold">
            {t("no_products")}
          </h1>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4">
        {tariffs.map((product) => {
          const {
            coin,
            id: productsId,
            photo_url,
            rating,
            rewiev,
            translations,
          } = product;

          return (
            <div
              key={productsId}
              className="bg-white border rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col"
            >
              {photo_url.map(({ photo_url, id }) => (
                <img
                  key={id}
                  src={photo_url}
                  alt=""
                  className="w-full h-56 object-cover"
                />
              ))}

              <div className="p-4 flex flex-col justify-between flex-grow">
                {translations.map(({ description, language, id }) => {
                  if (language === "uz") {
                    return (
                      <div key={id}>
                        <p className="text-gray-700 mb-4 text-sm">
                          {description}
                        </p>
                        <div className="flex items-center justify-between text-gray-600 text-sm">
                          <div className="flex items-center gap-2">
                            <img
                              className="w-4 h-4"
                              src="https://cdn1.iconfinder.com/data/icons/christmas-flat-4/58/019_-_Star-512.png"
                              alt="star"
                            />
                            {rating}
                            <span className="ml-1 text-xs">
                              ({rewiev} {t("review")})
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <mark className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md font-semibold">
                              {coin} <span className="text-[8px]">USDT</span>
                            </mark>
                          </div>
                        </div>
                      </div>
                    );
                  }
                })}
              </div>

              <div className="flex justify-between p-4 border-t mt-auto">
                <button
                  onClick={() => {
                    update(product);
                    setOpeFormModal(true);
                  }}
                  className="flex-1 mr-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition rounded-md py-2"
                >
                  {t("edit")}
                </button>
                <button
                  onClick={() => deleteItem(productsId)}
                  className="flex-1 ml-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition rounded-md py-2"
                >
                  {t("delete")}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {openFormModal && (
        <div className="fixed inset-0 bg-white p-4 sm:p-6 md:p-10 overflow-auto z-50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5">
            <div className="flex gap-2 flex-wrap">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.value}
                  onClick={() => handleLanguageChange(lang.value)}
                  className={`px-3 py-1 rounded-full border text-sm ${
                    language === lang.value ? "bg-black text-white" : "bg-white"
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
            <X
              onClick={() => setOpeFormModal(false)}
              className="absolute right-4 top-4 p-2 rounded-full cursor-pointer w-10 h-10"
            />
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            <label className="flex flex-col gap-2">
              {t("rating")}
              <input
                onChange={handleCommonChange}
                name="rating"
                type="float"
                placeholder="0"
                value={commonFields.rating}
                className="border p-2 rounded-md"
              />
            </label>
            <label className="flex flex-col gap-2">
              {t("review")}
              <input
                onChange={handleCommonChange}
                name="rewiev"
                type="float"
                placeholder="0"
                value={commonFields.rewiev}
                className="border p-2 rounded-md"
              />
            </label>
            <label className="flex flex-col gap-2">
              {t("count")}
              <input
                onChange={handleCommonChange}
                name="count"
                type="float"
                placeholder="0"
                value={commonFields.count}
                className="border p-2 rounded-md"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="flex items-center gap-1">
                {t("language")} <Languages className="w-4 h-4" />
              </span>
              <input
                name="language"
                value={language}
                readOnly
                className="border p-2 rounded-md lowercase"
              />
            </label>
            <label className="flex flex-col gap-2">
              {t("product_name")}
              <input
                onChange={handleTranslationChange}
                name="name"
                placeholder={t("product_name")}
                value={translations[language]?.name || ""}
                className="border p-2 rounded-md"
              />
            </label>
            <label className="flex flex-col gap-2">
              {t("description")}
              <input
                onChange={handleTranslationChange}
                name="description"
                placeholder={t("description")}
                value={translations[language]?.description || ""}
                className="border p-2 rounded-md"
              />
            </label>
            <label className="flex flex-col gap-2 col-span-full">
              {t("long_description")}
              <textarea
                onChange={handleTranslationChange}
                name="longDescription"
                placeholder={t("long_description")}
                value={translations[language]?.["longDescription"] || ""}
                className="border p-2 rounded-md min-h-[100px]"
              />
            </label>
            <label className="flex flex-col gap-2">
              {t("features")}
              <input
                onChange={handleTranslationChange}
                name="features"
                placeholder={t("features")}
                value={translations[language]?.features || ""}
                className="border p-2 rounded-md"
              />
            </label>
            <label className="flex flex-col gap-2">
              {t("usage")}
              <input
                onChange={handleTranslationChange}
                name="usage"
                placeholder={t("usage")}
                value={translations[language]?.usage || ""}
                className="border p-2 rounded-md"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="flex gap-2 items-center">
                {t("photo")} <Download className="w-4 h-4 cursor-pointer" />
              </span>
              <input
                type="file"
                accept="image/png, image/jpeg"
                name="file"
                onChange={handlePhotoUpload}
                className="border p-2 rounded-md"
              />
              <span className="text-[10px] ml-3 mt-[-6px]">
                {t("file_formats")}
              </span>
            </label>
            <label className="flex flex-col gap-2">
              {t("coin")}
              <input
                onChange={handleCommonChange}
                name="coin"
                type="float"
                placeholder="0"
                value={commonFields.coin}
                className="border p-2 rounded-md"
              />
            </label>
            <div className="flex col-span-full justify-between gap-4 mt-4">
              <button
                type="button"
                onClick={() => setOpeFormModal(false)}
                className="border px-6 py-2 rounded-md w-full sm:w-auto"
              >
                {t("cancel")}
              </button>
              <button
                type="submit"
                className="border px-6 py-2 rounded-md bg-black text-white w-full sm:w-auto"
              >
                {t("add")}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
