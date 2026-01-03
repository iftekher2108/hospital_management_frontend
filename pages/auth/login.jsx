"use client"
import AuthCheck from "@/lib/authCheck"
import { useEffect, useState } from "react"
import { baseUrl } from "@/lib/base_url"
import { useRouter } from "next/navigation"
import GuestLayout from "@/components/guestLayout"

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [message, setMessage] = useState(null)
    const [passShow, setPassShow] = useState(false)
    const router = useRouter();
    const payload = { email, password }


    const handleLogin = async () => {
        const res = await fetch(`${baseUrl}/api/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        })
        const data = await res.json()
        if (res.ok && data.token) {
            if (typeof window !== 'undefined') {
                localStorage.setItem('token', data.token);
                router.replace("/admin/dashboard");
            }
        } else {
            setMessage(data.message || "Login failed");
        }
    }

    return (
        <GuestLayout>
            <div className="flex flex-col items-center justify-center h-screen">
                {message &&
                    <div role="alert" className="alert text-white alert-error mb-3">
                        <span>{message}</span>
                    </div>}

                <div className="card shadow w-2/6 overflow-hidden glass">
                    <div className="card-title bg-primary p-3">
                        Login
                    </div>
                    <div className="card-body">
                        <div className="form-control mb-5">
                            <label className="floating-label">
                                <input type="text" placeholder="Email" onChange={(e) => setEmail(e.target.value)} className="input input-md input-primary w-full focus:outline-0" />
                                <span className="p-1">Email</span>
                            </label>
                        </div>

                        <div className="form-control mb-5">
                            <label htmlFor="" className="floating-label">
                                <span className="p-1">Password</span>
                                <div className="relative">
                                    <input type={passShow ? "text" : "password"} onChange={(e) => setPassword(e.target.value)} className="input input-mg input-primary w-full focus:outline-0" placeholder="Password" />
                                    <i onClick={() => setPassShow(!passShow)} className={`fa-solid absolute top-[50%] right-3 z-5 -translate-y-[50%] ${passShow ? 'fa-eye' : 'fa-eye-low-vision'} `}></i>
                                </div>
                            </label>
                        </div>

                        <button onClick={() => handleLogin()} className="btn btn-primary">Login</button>

                    </div>

                </div>
            </div>
        </GuestLayout>

    )
}