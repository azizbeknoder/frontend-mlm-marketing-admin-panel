import { useState } from "react";
import {
  Send,
  Users,
  User,
  Mail,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

type NotificationMode = "single" | "all";

interface FormData {
  email: string;
  title: string;
  description: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
}

export function NotificationSystem() {
  const [mode, setMode] = useState<NotificationMode>("single");
  const [formData, setFormData] = useState<FormData>({
    email: "",
    title: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const navigate = useNavigate();

  const { t } = useTranslation();

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (mode === "single" && !formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (
      mode === "single" &&
      formData.email &&
      !isValidEmail(formData.email)
    ) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const sendNotification = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setResponse(null);

    try {
      const url =
        mode === "single"
          ? `${import.meta.env.VITE_API_KEY}/notification`
          : `${import.meta.env.VITE_API_KEY}/notification/all`;

      const payload =
        mode === "single"
          ? {
              email: formData.email,
              title: formData.title,
              description: formData.description,
            }
          : {
              title: formData.title,
              description: formData.description,
            };

      const token = localStorage.getItem("token");

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 401) {
        // Redirect to login page if unauthorized
        navigate("/login");
        return;
      }

      if (response.ok) {
        setResponse({
          success: true,
          message:
            mode === "single"
              ? "Notification sent successfully to user!"
              : "Notification sent successfully to all users!",
        });
        // Reset form on success
        setFormData({ email: "", title: "", description: "" });
      } else {
        throw new Error("Failed to send notification");
      }
    } catch (error) {
      setResponse({
        success: false,
        message: "Failed to send notification. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-4">
            <MessageSquare className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t("notification_center")}
          </h1>
          <p className="text-gray-600">{t("send_notifications")}</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Mode Toggle */}
          <div className="p-6 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-center">
              <div className="bg-white rounded-xl p-1 shadow-sm border border-gray-200">
                <button
                  onClick={() => setMode("single")}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    mode === "single"
                      ? "bg-blue-500 text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <User className="w-4 h-4 mr-2" />
                  {t("single_user")}
                </button>
                <button
                  onClick={() => setMode("all")}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    mode === "all"
                      ? "bg-blue-500 text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <Users className="w-4 h-4 mr-2" />
                  {t("all_users")}
                </button>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="p-6">
            <div className="space-y-6">
              {/* Email Field (only for single user mode) */}
              {mode === "single" && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t("recipient_email")}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      className={`block w-full pl-10 pr-3 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        errors.email
                          ? "border-red-300 bg-red-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      placeholder={t("email_placeholder")}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.email}
                    </p>
                  )}
                </div>
              )}

              {/* Title Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t("notification_title")}
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className={`block w-full px-4 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    errors.title
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  placeholder={t("title_placeholder")}
                />
                {errors.title && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.title}
                  </p>
                )}
              </div>

              {/* Description Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t("description")}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  rows={4}
                  className={`block w-full px-4 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none ${
                    errors.description
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  placeholder={t("description_placeholder")}
                />
                {errors.description && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.description}
                  </p>
                )}
              </div>

              {/* Response Message */}
              {response && (
                <div
                  className={`p-4 rounded-xl border ${
                    response.success
                      ? "bg-green-50 border-green-200 text-green-800"
                      : "bg-red-50 border-red-200 text-red-800"
                  }`}
                >
                  <div className="flex items-center">
                    {response.success ? (
                      <CheckCircle className="w-5 h-5 mr-2" />
                    ) : (
                      <AlertCircle className="w-5 h-5 mr-2" />
                    )}
                    <span className="font-medium">{response.message}</span>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={sendNotification}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {t("sending")}
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    {t("send_notification")}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center mb-2">
                <User className="w-5 h-5 text-blue-500 mr-2" />
                <h3 className="font-semibold text-gray-900">
                  {t("single_user")}
                </h3>
              </div>
              <p className="text-gray-600 text-sm">
                {t("single_user_description")}
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center mb-2">
                <Users className="w-5 h-5 text-green-500 mr-2" />
                <h3 className="font-semibold text-gray-900">
                  {t("all_users")}
                </h3>
              </div>
              <p className="text-gray-600 text-sm">
                {t("all_users_description")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
