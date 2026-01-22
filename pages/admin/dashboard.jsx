"use client"
import AuthLayout from "@/components/authLayout"
import getToken from "@/lib/getToken"
import { baseUrl } from "@/lib/base_url"
import { useEffect, useState } from "react"

export default function Dashboard() {
    const [stats, setStats] = useState({
        patients: 0,
        doctors: 0,
        appointments: 0,
        departments: 0,
        rooms: 0,
        medicines: 0,
        bills: 0,
        payments: 0
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            const token = getToken()
            try {
                const [patientsRes, doctorsRes, appointmentsRes, departmentsRes, roomsRes, medicinesRes, billsRes, paymentsRes] = await Promise.all([
                    fetch(`${baseUrl}/api/patients?limit=1`, { headers: { "Authorization": "Bearer " + token } }),
                    fetch(`${baseUrl}/api/doctors?limit=1`, { headers: { "Authorization": "Bearer " + token } }),
                    fetch(`${baseUrl}/api/appointments?limit=1`, { headers: { "Authorization": "Bearer " + token } }),
                    fetch(`${baseUrl}/api/departments?limit=1`, { headers: { "Authorization": "Bearer " + token } }),
                    fetch(`${baseUrl}/api/rooms?limit=1`, { headers: { "Authorization": "Bearer " + token } }),
                    fetch(`${baseUrl}/api/medicines?limit=1`, { headers: { "Authorization": "Bearer " + token } }),
                    fetch(`${baseUrl}/api/bills?limit=1`, { headers: { "Authorization": "Bearer " + token } }),
                    fetch(`${baseUrl}/api/payments?limit=1`, { headers: { "Authorization": "Bearer " + token } })
                ])

                const [patientsData, doctorsData, appointmentsData, departmentsData, roomsData, medicinesData, billsData, paymentsData] = await Promise.all([
                    patientsRes.json(),
                    doctorsRes.json(),
                    appointmentsRes.json(),
                    departmentsRes.json(),
                    roomsRes.json(),
                    medicinesRes.json(),
                    billsRes.json(),
                    paymentsRes.json()
                ])

                setStats({
                    patients: patientsData.data?.total || 0,
                    doctors: doctorsData.data?.total || 0,
                    appointments: appointmentsData.data?.total || 0,
                    departments: departmentsData.data?.total || 0,
                    rooms: roomsData.data?.total || 0,
                    medicines: medicinesData.data?.total || 0,
                    bills: billsData.data?.total || 0,
                    payments: paymentsData.data?.total || 0
                })
            } catch (error) {
                console.error("Error fetching stats:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchStats()
    }, [])

    const statCards = [
        { title: "Total Patients", value: stats.patients, icon: "fa-user-injured", color: "bg-blue-500" },
        { title: "Total Doctors", value: stats.doctors, icon: "fa-user-doctor", color: "bg-green-500" },
        { title: "Appointments", value: stats.appointments, icon: "fa-calendar-check", color: "bg-purple-500" },
        { title: "Departments", value: stats.departments, icon: "fa-building", color: "bg-orange-500" },
        { title: "Rooms", value: stats.rooms, icon: "fa-bed", color: "bg-pink-500" },
        { title: "Medicines", value: stats.medicines, icon: "fa-pills", color: "bg-red-500" },
        { title: "Bills", value: stats.bills, icon: "fa-file-invoice-dollar", color: "bg-yellow-500" },
        { title: "Payments", value: stats.payments, icon: "fa-money-bill-wave", color: "bg-teal-500" }
    ]

    if (loading) {
        return (
            <AuthLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </AuthLayout>
        )
    }

    return (
        <AuthLayout>
            <div>
                <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {statCards.map((stat, index) => (
                        <div key={index} className="card bg-base-100 shadow-xl">
                            <div className="card-body">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="card-title text-sm">{stat.title}</h2>
                                        <p className="text-3xl font-bold mt-2">{stat.value}</p>
                                    </div>
                                    <div className={`${stat.color} p-4 rounded-full`}>
                                        <i className={`fa-solid ${stat.icon} text-white text-2xl`}></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body">
                            <h2 className="card-title">Quick Actions</h2>
                            <div className="grid grid-cols-2 gap-2 mt-4">
                                <a href="/admin/patient" className="btn btn-outline btn-primary">
                                    <i className="fa-solid fa-user-injured me-2"></i>Add Patient
                                </a>
                                <a href="/admin/appointment" className="btn btn-outline btn-primary">
                                    <i className="fa-solid fa-calendar-check me-2"></i>New Appointment
                                </a>
                                <a href="/admin/doctor" className="btn btn-outline btn-primary">
                                    <i className="fa-solid fa-user-doctor me-2"></i>Add Doctor
                                </a>
                                <a href="/admin/bill" className="btn btn-outline btn-primary">
                                    <i className="fa-solid fa-file-invoice-dollar me-2"></i>Create Bill
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body">
                            <h2 className="card-title">System Information</h2>
                            <div className="mt-4 space-y-2">
                                <div className="flex justify-between">
                                    <span>System Status:</span>
                                    <span className="badge badge-success">Operational</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Last Updated:</span>
                                    <span>{new Date().toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthLayout>
    )
}
