import React, { useState } from "react";
import {
  Send,
  CreditCard,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { mockUsers } from "../../data/mockData";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export const AutomaticPayments: React.FC = () => {
  const { t } = useTranslation();
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentType, setPaymentType] = useState<string>("bonus");
  const [paymentNote, setPaymentNote] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [paymentHistory, setPaymentHistory] = useState<
    Array<{
      id: string;
      users: string[];
      amount: number;
      type: string;
      note: string;
      date: string;
      status: "completed" | "failed";
    }>
  >([]);

  const handleUserSelection = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === mockUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(mockUsers.map((user) => user.id));
    }
  };

  const processPayment = async () => {
    if (selectedUsers.length === 0 || paymentAmount <= 0) {
      toast.warning("Please select users and enter a valid amount");
      return;
    }

    setIsProcessing(true);

    // Simulate API call to InterKassa
    setTimeout(() => {
      const newPayment = {
        id: `auto_${Date.now()}`,
        users: selectedUsers,
        amount: paymentAmount,
        type: paymentType,
        note: paymentNote,
        date: new Date().toISOString(),
        status:
          Math.random() > 0.1
            ? "completed"
            : ("failed" as "completed" | "failed"),
      };

      setPaymentHistory((prev) => [newPayment, ...prev]);

      if (newPayment.status === "completed") {
        toast.success(
          `Payment of $${paymentAmount} successfully sent to ${selectedUsers.length} users via InterKassa`
        );
      } else {
        toast.error("Payment failed. Please try again.");
      }

      // Reset form
      setSelectedUsers([]);
      setPaymentAmount(0);
      setPaymentNote("");
      setIsProcessing(false);
    }, 2000);
  };

  const totalAmount = paymentAmount * selectedUsers.length;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {t("automatic_payments")}
        </h2>
        <p className="text-gray-600">{t("send_payments_description")}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Send className="w-5 h-5 mr-2" />
              {t("send_payment")}
            </h3>
          </div>

          <div className="p-6 space-y-4">
            {/* Payment Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("payment_amount_per_user")}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  $
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={paymentAmount}
                  onChange={(e) =>
                    setPaymentAmount(parseFloat(e.target.value) || 0)
                  }
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Payment Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("payment_type")}
              </label>
              <select
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="bonus">{t("bonus_payment")}</option>
                <option value="refund">{t("refund")}</option>
                <option value="commission">{t("commission")}</option>
                <option value="reward">{t("reward")}</option>
              </select>
            </div>

            {/* Payment Note */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("payment_note")}
              </label>
              <textarea
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder={t("optional_note")}
              />
            </div>

            {/* Summary */}
            {selectedUsers.length > 0 && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center mb-2">
                  <CreditCard className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="font-medium text-blue-900">
                    {t("payment_summary")}
                  </span>
                </div>
                <div className="text-sm text-blue-800 space-y-1">
                  <p>
                    {t("recipients")}: {selectedUsers.length} users
                  </p>
                  <p>
                    {t("amount_per_user")}: ${paymentAmount.toFixed(2)}
                  </p>
                  <p className="font-semibold">
                    {t("total_amount")}: ${totalAmount.toFixed(2)}
                  </p>
                </div>
              </div>
            )}

            {/* Send Button */}
            <button
              onClick={processPayment}
              disabled={
                isProcessing || selectedUsers.length === 0 || paymentAmount <= 0
              }
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isProcessing ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  {t("processing_payment")}
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  {t("send_payment_interkassa")}
                </>
              )}
            </button>
          </div>
        </div>

        {/* User Selection */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                {t("select_recipients")}
              </h3>
              <button
                onClick={handleSelectAll}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                {selectedUsers.length === mockUsers.length
                  ? t("deselect_all")
                  : t("select_all")}
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {mockUsers.map((user) => (
                <div
                  key={user.id}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                    selectedUsers.includes(user.id)
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => handleUserSelection(user.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">
                        {user.phoneNumber}
                      </div>
                      <div className="text-sm text-gray-500">
                        {user.subscriptionPlan} • Balance: $
                        {user.accountBalance.toFixed(2)}
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedUsers.includes(user.id)
                          ? "border-blue-500 bg-blue-500"
                          : "border-gray-300"
                      }`}
                    >
                      {selectedUsers.includes(user.id) && (
                        <CheckCircle className="w-3 h-3 text-white" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Payment History */}
      {paymentHistory.length > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              {t("recent_payment_history")}
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {paymentHistory.slice(0, 5).map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center">
                    {payment.status === "completed" ? (
                      <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
                    )}
                    <div>
                      <div className="font-medium text-gray-900">
                        ${payment.amount.toFixed(2)} to {payment.users.length}{" "}
                        users
                      </div>
                      <div className="text-sm text-gray-500">
                        {t(payment.type)} •{" "}
                        {new Date(payment.date).toLocaleString()}
                      </div>
                      {payment.note && (
                        <div className="text-sm text-gray-600 mt-1">
                          "{payment.note}"
                        </div>
                      )}
                    </div>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      payment.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {t(payment.status)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
