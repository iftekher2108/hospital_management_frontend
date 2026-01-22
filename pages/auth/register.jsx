"use client"
import { useEffect, useState } from "react"
import { baseUrl } from "@/lib/base_url"
import { useRouter } from "next/navigation"
import GuestLayout from "@/components/guestLayout"

export default function Register() {
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    })
    const [message, setMessage] = useState(null)
    const [passShow, setPassShow] = useState(false)
    const [confirmPassShow, setConfirmPassShow] = useState(false)
    const router = useRouter()

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleRegister = async (e) => {
        e.preventDefault()
        setMessage(null)

        if (formData.password !== formData.confirmPassword) {
            setMessage("Passwords do not match")
            return
        }

        if (formData.password.length < 8) {
            setMessage("Password must be at least 8 characters")
            return
        }

        const payload = {
            name: formData.name,
            username: formData.username,
            email: formData.email,
            password: formData.password
        }

        try {
            const res = await fetch(`${baseUrl}/api/auth/register`, {
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
                setMessage(data.message || "Registration failed");
            }
        } catch (error) {
            setMessage("An error occurred. Please try again.");
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
                        Register
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleRegister}>
                            <div className="form-control mb-5">
                                <label className="floating-label">
                                    <input 
                                        type="text" 
                                        name="name"
                                        placeholder="Full Name" 
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="input input-md input-primary w-full focus:outline-0" 
                                    />
                                    <span className="p-1">Full Name</span>
                                </label>
                            </div>

                            <div className="form-control mb-5">
                                <label className="floating-label">
                                    <input 
                                        type="text" 
                                        name="username"
                                        placeholder="Username" 
                                        value={formData.username}
                                        onChange={handleChange}
                                        required
                                        className="input input-md input-primary w-full focus:outline-0" 
                                    />
                                    <span className="p-1">Username</span>
                                </label>
                            </div>

                            <div className="form-control mb-5">
                                <label className="floating-label">
                                    <input 
                                        type="email" 
                                        name="email"
                                        placeholder="Email" 
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="input input-md input-primary w-full focus:outline-0" 
                                    />
                                    <span className="p-1">Email</span>
                                </label>
                            </div>

                            <div className="form-control mb-5">
                                <label htmlFor="" className="floating-label">
                                    <span className="p-1">Password</span>
                                    <div className="relative">
                                        <input 
                                            type={passShow ? "text" : "password"} 
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                            className="input input-mg input-primary w-full focus:outline-0" 
                                            placeholder="Password" 
                                        />
                                        <i 
                                            onClick={() => setPassShow(!passShow)} 
                                            className={`fa-solid absolute top-[50%] right-3 z-5 -translate-y-[50%] cursor-pointer ${passShow ? 'fa-eye' : 'fa-eye-low-vision'} `}
                                        ></i>
                                    </div>
                                </label>
                            </div>

                            <div className="form-control mb-5">
                                <label htmlFor="" className="floating-label">
                                    <span className="p-1">Confirm Password</span>
                                    <div className="relative">
                                        <input 
                                            type={confirmPassShow ? "text" : "password"} 
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            required
                                            className="input input-mg input-primary w-full focus:outline-0" 
                                            placeholder="Confirm Password" 
                                        />
                                        <i 
                                            onClick={() => setConfirmPassShow(!confirmPassShow)} 
                                            className={`fa-solid absolute top-[50%] right-3 z-5 -translate-y-[50%] cursor-pointer ${confirmPassShow ? 'fa-eye' : 'fa-eye-low-vision'} `}
                                        ></i>
                                    </div>
                                </label>
                            </div>

                            <button type="submit" className="btn btn-primary w-full">Register</button>
                            <div className="text-center mt-3">
                                <a href="/auth/login" className="link link-primary">Already have an account? Login</a>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </GuestLayout>
    )
}