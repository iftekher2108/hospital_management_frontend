"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isTokenValid } from "@/lib/authCheck";
import Header from "./header";
import Sidebar from "./sidebar";

export default function AuthLayout({ children }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    const checkAuth = () => {
      if (!isTokenValid()) {
        router.replace("/auth/login"); // redirect if token missing/expired
      } else {
        setLoading(false); // token valid → show children
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    // Simple spinner / loading effect
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-3">
          <div className="card p-3 shadow">
            <Sidebar />
          </div>
        </div>

        <div className="col-span-9">
          <div className="card p-3 shadow">
            {children}
          </div>
        </div>
      </div>

    </>
  );
}