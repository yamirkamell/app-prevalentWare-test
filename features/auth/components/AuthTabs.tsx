"use client";

import { useState } from "react";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";

export function AuthTabs() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  return (
    <div className="w-full max-w-md space-y-4">
      <div className="flex border-b border-gray-200">
        <button
          type="button"
          onClick={() => setActiveTab("login")}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "login"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Iniciar Sesión
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("register")}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "register"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Registrarse
        </button>
      </div>

      {activeTab === "login" ? <LoginForm /> : <RegisterForm />}
    </div>
  );
}
