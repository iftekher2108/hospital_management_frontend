import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
export default function Index() {
  const router = useRouter();

  useEffect(()=>{
    router.push('/auth/login')
  })

  return (
    <>
    iftekher mahmud pervez
    </>
  );
}
