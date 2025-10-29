"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isTokenValid } from "@/lib/authCheck";

export default function GuestLayout({ children }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    const check = () => {
      if (isTokenValid()) {
        router.replace("/admin/dashboard"); // redirect if already logged in
      } else {
        setLoading(false); // token invalid → show children
      }
    };

    check();
  }, [router]);

  if (loading) {
    // Customize loading effect as you like
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return <>{children}</>; // show login/register page
}