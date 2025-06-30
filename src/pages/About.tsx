import { t } from "i18next";
import { BadgeDollarSign, Edit2, Gift, TrendingUp, Users } from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export default function AboutPage() {
  const { i18n } = useTranslation();
  const [informations, setInformations] = useState(null);
  const [editingBlock, setEditingBlock] = useState(null);

  const getAboutInformations = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_KEY}/about`);
      const data = await res.json();
      setInformations(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getAboutInformations();
  }, []);

  const updateEditingValue = (index, field, value) => {
    const updated = [...editingBlock.translations];
    updated[index] = { ...updated[index], [field]: value };
    setEditingBlock({ ...editingBlock, translations: updated });
  };

  const saveChanges = async () => {
    const token = localStorage.getItem("token");

    // id va aboutId ni olib tashlash
    const cleanedTranslations = editingBlock.translations.map(
      ({ id, aboutId, ...rest }) => rest
    );
    const payload = { translations: cleanedTranslations };

    try {
      await fetch(`${import.meta.env.VITE_API_KEY}/about`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      setEditingBlock(null);
      getAboutInformations();
    } catch (err) {
      console.error("Xatolik:", err);
    }
  };

  const renderEditButton = () => (
    <Edit2
      onClick={() => {
        const translations = informations?.aboutTranslation.filter((info) =>
          ["uz", "ru", "en", "tg", "zh", "kk", "ky"].includes(info.language)
        );
        setEditingBlock({ translations });
      }}
      className="absolute bottom-5 right-10 cursor-pointer"
    />
  );

  return (
    <div className="bg-white dark:bg-black text-gray-900 dark:text-white">
      {/* HERO */}
      <section className="text-center relative py-20 px-6 bg-gray-50 dark:bg-gray-900">
        {informations?.aboutTranslation.map((info) => {
          if (info.language === i18n.language) {
            return (
              <Fragment key={info.id}>
                <h1 className="text-4xl md:text-5xl font-bold mb-4 text-indigo-600">
                  {info.heroTitle}
                </h1>
                <p className="max-w-3xl mx-auto text-gray-600 dark:text-gray-400 text-lg">
                  {info.heroDescription}
                </p>
              </Fragment>
            );
          }
        })}
        {renderEditButton("hero")}
      </section>

      {/* О КОМПАНИИ */}
      <section className="py-16 relative px-6 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          {informations?.aboutTranslation.map((info) => {
            if (info.language === i18n.language) {
              return (
                <Fragment key={info.id}>
                  <div className="space-y-4">
                    <h2 className="text-3xl font-semibold">
                      {info.aboutCompanyTitle}
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300">
                      {info.aboutCompanyDescription}
                    </p>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6 text-center">
                    <TrendingUp className="w-10 h-10 mx-auto text-indigo-500 mb-4" />
                    <p className="text-lg font-semibold">
                      {info.aboutCompanyExpence}
                    </p>
                  </div>
                </Fragment>
              );
            }
          })}
        </div>
        {renderEditButton("aboutCompany")}
      </section>

      {/* НАША СИСТЕМА */}
      <section className="py-16 relative px-6 bg-gray-50 dark:bg-gray-950">
        {informations?.aboutTranslation.map((info) => {
          if (info.language === i18n.language) {
            return (
              <div className="max-w-6xl mx-auto" key={info.id}>
                <h2 className="text-3xl font-semibold text-center mb-10">
                  {info.howWorkSystem}
                </h2>
                <div className="grid md:grid-cols-3 gap-6 text-center">
                  <FeatureBox
                    icon={
                      <BadgeDollarSign className="w-8 h-8 mx-auto text-indigo-500" />
                    }
                    title={info.withPlansTitle}
                    text={info.withPlansDescription}
                  />
                  <FeatureBox
                    icon={<Users className="w-8 h-8 mx-auto text-indigo-500" />}
                    title={info.referalTitle}
                    text={info.referalDescription}
                  />
                  <FeatureBox
                    icon={<Gift className="w-8 h-8 mx-auto text-indigo-500" />}
                    title={info.levelTitle}
                    text={info.levelDescription}
                  />
                </div>
              </div>
            );
          }
        })}
        {renderEditButton("howWorkSystem")}
      </section>

      {/* ВАЛЮТА */}
      <section className="py-16 relative px-6 max-w-5xl mx-auto text-center">
        {informations?.aboutTranslation.map((info) => {
          if (info.language === i18n.language) {
            return (
              <Fragment key={info.id}>
                <h2 className="text-3xl font-semibold mb-6">
                  {info.USDTTitle}
                </h2>
                <p className="text-gray-700 dark:text-gray-400 mb-4">
                  {info.USDTDescription}
                </p>
              </Fragment>
            );
          }
        })}
        {renderEditButton("usdt")}
      </section>

      {/* Modal */}
      {editingBlock && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-900 w-full max-w-[90%] p-6 rounded-xl overflow-y-auto max-h-[90vh] relative">
            <h2 className="text-xl font-semibold mb-4 text-center capitalize">
              {t("change")}
            </h2>

            {editingBlock.translations.map((info, idx) => (
              <div key={idx} className="mb-6 border-b pb-4">
                <p className="text-sm text-gray-500 mb-2">
                  Til: {info.language}
                </p>

                <input
                  className="w-full dark:bg-transparent dark:border-gray-600 p-2 rounded border mb-2"
                  value={info.heroTitle || ""}
                  onChange={(e) =>
                    updateEditingValue(idx, "heroTitle", e.target.value)
                  }
                />
                <textarea
                  className="w-full dark:bg-transparent dark:border-gray-600 p-2 rounded border"
                  rows={3}
                  value={info.heroDescription || ""}
                  onChange={(e) =>
                    updateEditingValue(idx, "heroDescription", e.target.value)
                  }
                />

                <input
                  className="w-full dark:bg-transparent dark:border-gray-600 p-2 rounded border mb-2"
                  value={info.aboutCompanyTitle || ""}
                  onChange={(e) =>
                    updateEditingValue(idx, "aboutCompanyTitle", e.target.value)
                  }
                />
                <textarea
                  className="w-full dark:bg-transparent dark:border-gray-600 p-2 rounded border"
                  rows={3}
                  value={info.aboutCompanyDescription || ""}
                  onChange={(e) =>
                    updateEditingValue(
                      idx,
                      "aboutCompanyDescription",
                      e.target.value
                    )
                  }
                />

                <input
                  className="w-full p-2 dark:bg-transparent dark:border-gray-600 rounded border mb-2"
                  value={info.aboutCompanyExpence || ""}
                  onChange={(e) =>
                    updateEditingValue(
                      idx,
                      "aboutCompanyExpence",
                      e.target.value
                    )
                  }
                />

                <input
                  className="w-full p-2 dark:bg-transparent dark:border-gray-600 rounded border mb-2"
                  value={info.howWorkSystem || ""}
                  onChange={(e) =>
                    updateEditingValue(idx, "howWorkSystem", e.target.value)
                  }
                />

                <input
                  className="w-full p-2 dark:bg-transparent dark:border-gray-600 rounded border mb-2"
                  value={info.withPlansTitle || ""}
                  onChange={(e) =>
                    updateEditingValue(idx, "withPlansTitle", e.target.value)
                  }
                />
                <textarea
                  className="w-full p-2 dark:bg-transparent dark:border-gray-600 rounded border"
                  rows={2}
                  value={info.withPlansDescription || ""}
                  onChange={(e) =>
                    updateEditingValue(
                      idx,
                      "withPlansDescription",
                      e.target.value
                    )
                  }
                />

                <input
                  className="w-full p-2 dark:bg-transparent dark:border-gray-600 rounded border mb-2"
                  value={info.referalTitle || ""}
                  onChange={(e) =>
                    updateEditingValue(idx, "referalTitle", e.target.value)
                  }
                />
                <textarea
                  className="w-full p-2 dark:bg-transparent dark:border-gray-600 rounded border"
                  rows={2}
                  value={info.referalDescription || ""}
                  onChange={(e) =>
                    updateEditingValue(
                      idx,
                      "referalDescription",
                      e.target.value
                    )
                  }
                />

                <input
                  className="w-full p-2 dark:bg-transparent dark:border-gray-600 rounded border mb-2"
                  value={info.levelTitle || ""}
                  onChange={(e) =>
                    updateEditingValue(idx, "levelTitle", e.target.value)
                  }
                />
                <textarea
                  className="w-full p-2 dark:bg-transparent dark:border-gray-600 rounded border"
                  rows={2}
                  value={info.levelDescription || ""}
                  onChange={(e) =>
                    updateEditingValue(idx, "levelDescription", e.target.value)
                  }
                />

                <input
                  className="w-full p-2 dark:bg-transparent dark:border-gray-600 rounded border mb-2"
                  value={info.USDTTitle || ""}
                  onChange={(e) =>
                    updateEditingValue(idx, "USDTTitle", e.target.value)
                  }
                />
                <textarea
                  className="w-full p-2 dark:bg-transparent dark:border-gray-600 rounded border"
                  rows={3}
                  value={info.USDTDescription || ""}
                  onChange={(e) =>
                    updateEditingValue(idx, "USDTDescription", e.target.value)
                  }
                />
              </div>
            ))}

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setEditingBlock(null)}
                className="bg-white dark:text-gray-800 border-gray-700 border px-4 py-2 rounded"
              >
                {t("canceled")}
              </button>
              <button
                onClick={saveChanges}
                className="bg-indigo-600 text-white px-4 py-2 rounded"
              >
                {t("checked")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FeatureBox({ icon, title, text }) {
  return (
    <div>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all">
        <div className="mb-4">{icon}</div>
        <h3 className="font-semibold text-xl mb-2">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm">{text}</p>
      </div>
    </div>
  );
}
