import { Eye, EyeOff } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(
        "https://mlm-backend.pixl.uz/authorization/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      if (!res.ok) {
        throw new Error("Login failed");
      }

      console.log(res);

      const data = await res.json();
      localStorage.setItem("token", data.token);
      navigate("/users");
    } catch (err) {
      setError("Login yoki parol noto‘g‘ri");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200 p-4">
      <form
        onSubmit={handleLogin}
        className="bg-white shadow-xl rounded-2xl px-8 py-10 w-full max-w-md space-y-6"
      >
        <div className="text-center">
          <h2 className="text-3xl font-bold text-blue-600 mb-2">
            Tizimga kirish
          </h2>
          <p className="text-sm text-gray-500">Hisobingizga kiring</p>
        </div>

        {error && <div className="text-red-500 text-sm">{error}</div>}

        <div>
          <label className="block text-gray-700 text-sm mb-1">Email</label>
          <input
            type="email"
            placeholder="email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="relative">
          <label className="block text-gray-700 text-sm mb-1">Parol</label>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[35px] text-gray-500 hover:text-gray-700"
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition duration-200"
        >
          Kirish
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
