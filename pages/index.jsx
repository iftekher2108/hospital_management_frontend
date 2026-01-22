"use client"
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    router.push('/auth/login')
  }, [router])

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}
