import { Download, Edit, Languages, PlusCircle, Trash, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export default function TariffManagement() {
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
    term: "",
    referral_bonus: "",
    coin: "",
    dailyProfit: "",
    photo_url: "",
    rating: "",
    review: "",
  });

  const [selectedPlan, setSelectedPlan] = useState(null);

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

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
  };

  const handleCommonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const parsed = [
      "term",
      "referral_bonus",
      "coin",
      "dailyProfit",
      "rating",
      "review",
    ].includes(name)
      ? value === ""
        ? ""
        : Number(value)
      : value;
    setCommonFields((prev) => ({ ...prev, [name]: parsed }));
  };

  const handleTranslationChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    console.log(name, value);

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
      // setCommonFields((prev) => ({ ...prev, photo_url: photo_url }));
    }
  };

  const getPlan = async () => {
    await fetch(` ${import.meta.env.VITE_API_KEY}/tariff`)
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        setTariffs(res);
      })
      .catch(({ message }) => {
        toast.error(message);
      });
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

        const data = await uploadRes.json();
        uploadedPhotoUrl = data?.url;
      }

      const payload = {
        term: Number(commonFields.term),
        referral_bonus: Number(commonFields.referral_bonus),
        coin: Number(commonFields.coin),
        dailyProfit: Number(commonFields.dailyProfit),
        photo_url: uploadedPhotoUrl,
        rating:
          commonFields.rating !== "" && !isNaN(Number(commonFields.rating))
            ? Number(commonFields.rating)
            : 1,
        review:
          commonFields.review !== "" && !isNaN(Number(commonFields.review))
            ? Number(commonFields.review)
            : 1,
        translations: Object.entries(translations).map(([lang, data]) => ({
          language: lang,
          ...data,
        })),
      };

      const method = selectedPlan ? "PUT" : "POST";
      const url = selectedPlan
        ? `${import.meta.env.VITE_API_KEY}/tariff/update/${selectedPlan.id}`
        : `${import.meta.env.VITE_API_KEY}/tariff/add`;

      await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      toast.success(`Tariff ${selectedPlan ? "updated" : "added"}`);
      getPlan();
      setOpeFormModal(false);
      setSelectedPlan(null);
      setSelectedFile(null);
    } catch (err) {
      toast.error("Save error");
    }
  };

  const deleteItem = async (id) => {
    const token = localStorage.getItem("token");
    await fetch(`${import.meta.env.VITE_API_KEY}/tariff/${id}`, {
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
      })
      .catch((err) => {
        toast.error(err.message);
      })
      .finally(() => {
        getPlan();
      });
  };

  useEffect(() => {
    getPlan();
  }, []);

  const update = (plan) => {
    setCommonFields({
      term: plan.term || "",
      referral_bonus: plan.referral_bonus || "",
      coin: plan.coin || "",
      dailyProfit: plan.dailyProfit || "",
      photo_url: plan.photo_url || "",
      rating: plan.rating !== undefined ? String(plan.rating) : "",
      review: plan.review !== undefined ? String(plan.review) : "",
    });

    const newTranslations = {};
    plan.translations.forEach((item) => {
      newTranslations[item.language] = {
        name: item.name || "",
        description: item.description || "",
        longDescription: item.longDescription || "",
        features: item.features || "",
        usage: item.usage || "",
      };
    });
    setTranslations(newTranslations);
    setLanguage(plan.translations[0]?.language || "uz");
    setSelectedPlan(plan);
  };

  return (
    <div className="flex flex-col gap-5 p-4 sm:p-6 md:p-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">
          {t("tariff_management")}
        </h1>
        <button
          onClick={() => setOpeFormModal(true)}
          className="flex items-center gap-2 border px-4 py-2 rounded-md"
        >
          {t("add_new_tariff")} <PlusCircle className="w-5 h-5" />
        </button>
      </div>

      {tariffs.length === 0 && (
        <div className="w-full h-[300px] flex items-center justify-center">
          <h1 className="text-4xl text-gray-400 font-bold">
            {t("no_tariffs")}
          </h1>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {tariffs.map((plan) => {
          const {
            coin,
            dailyProfit,
            id: planId,
            referral_bonus,
            translations,
            photo_url,
          } = plan;

          return (
            <div
              key={planId}
              className="relative rounded-2xl shadow-md border border-gray-200 p-6 bg-white hover:shadow-lg transition-transform hover:scale-105 duration-300"
            >
              <img
                className="w-full h-40 object-cover rounded-md"
                src={photo_url}
                alt="tariff image"
              />
              {translations.map(({ name, language, id, features }) => {
                if (language === "uz") {
                  return (
                    <div
                      key={id}
                      className="flex flex-col items-center gap-6 h-full"
                    >
                      <h1 className="text-3xl font-bold text-gray-800 text-center">
                        {name}
                      </h1>

                      <p className="text-center text-gray-600 text-lg leading-tight max-w-[200px]">
                        {features}
                      </p>

                      <ul className="w-full space-y-2">
                        <li className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-green-600 rounded-full" />
                          <p className="text-base text-gray-700 font-medium">
                            {t("daily_profit_label")}{" "}
                            <span className="font-bold">
                              {dailyProfit}{" "}
                              <span className="text-xs">{t("usdt")}</span>
                            </span>
                          </p>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-blue-600 rounded-full" />
                          <p className="text-base text-gray-700 font-medium">
                            {t("referral_bonus_label")}{" "}
                            <span className="font-bold">
                              {referral_bonus}{" "}
                              <span className="text-xs">{t("usdt")}</span>
                            </span>
                          </p>
                        </li>
                      </ul>

                      <div className="flex items-center gap-2 text-2xl font-bold text-gray-900">
                        <img
                          className="w-8 h-8"
                          src="https://cdn4.iconfinder.com/data/icons/essential-app-2/16/cash-money-coin-value-512.png"
                          alt="coin icon"
                        />
                        {coin}
                      </div>
                    </div>
                  );
                }
              })}

              {/* Edit/Delete actions */}
              <div className="absolute top-3 right-3 flex gap-2">
                <button
                  onClick={() => {
                    update(plan);
                    setOpeFormModal(true);
                  }}
                  className="p-2 rounded-full bg-yellow-100 hover:bg-yellow-200 text-yellow-600 transition"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => deleteItem(planId)}
                  className="p-2 rounded-full bg-red-100 hover:bg-red-200 text-red-600 transition"
                >
                  <Trash className="w-5 h-5" />
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
              {t("term")}
              <input
                onChange={handleCommonChange}
                name="term"
                type="float"
                placeholder="0"
                value={commonFields.term}
                className="border p-2 rounded-md"
              />
            </label>
            <label className="flex flex-col gap-2">
              {t("referral_bonus")}
              <input
                onChange={handleCommonChange}
                name="referral_bonus"
                type="float"
                placeholder="0"
                value={commonFields.referral_bonus}
                className="border p-2 rounded-md"
              />
            </label>
            <label className="flex flex-col gap-2">
              {t("rating")}
              <input
                onChange={handleCommonChange}
                name="rating"
                type="number"
                min="1"
                max="5"
                step="0.1"
                placeholder="1"
                value={commonFields.rating}
                className="border p-2 rounded-md"
              />
            </label>
            <label className="flex flex-col gap-2">
              {t("review")}
              <input
                onChange={handleCommonChange}
                name="review"
                type="number"
                placeholder="0"
                value={commonFields.review}
                className="border p-2 rounded-md"
              />
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
              {t("tariff_name")}
              <input
                onChange={handleTranslationChange}
                name="name"
                placeholder={t("tariff_name_placeholder")}
                value={translations[language]?.name || ""}
                className="border p-2 rounded-md"
              />
            </label>
            <label className="flex flex-col gap-2">
              {t("description")}
              <input
                onChange={handleTranslationChange}
                name="description"
                placeholder={t("description_placeholder")}
                value={translations[language]?.description || ""}
                className="border p-2 rounded-md"
              />
            </label>
            <label className="flex flex-col gap-2 col-span-full">
              {t("long_description")}
              <textarea
                onChange={handleTranslationChange}
                name="longDescription"
                placeholder={t("long_description_placeholder")}
                value={translations[language]?.longDescription || ""}
                className="border p-2 rounded-md min-h-[100px]"
              />
            </label>
            <label className="flex flex-col gap-2">
              {t("features")}
              <input
                onChange={handleTranslationChange}
                name="features"
                placeholder={t("features_placeholder")}
                value={translations[language]?.features || ""}
                className="border p-2 rounded-md"
              />
            </label>
            <label className="flex flex-col gap-2">
              {t("usage")}
              <input
                onChange={handleTranslationChange}
                name="usage"
                placeholder={t("usage_placeholder")}
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
                {t("photo_formats")}
              </span>
            </label>
            <label className="flex flex-col gap-2">
              {t("daily_profit")}
              <input
                onChange={handleCommonChange}
                name="dailyProfit"
                type="float"
                placeholder="0"
                value={commonFields.dailyProfit}
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
